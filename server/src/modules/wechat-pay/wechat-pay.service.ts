import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { WxPayParams, CreateJsapiOrderParams, NotifyResource, PaymentResult, WxPayApiResponse } from './dto'

@Injectable()
export class WechatPayService implements OnModuleInit {
  private readonly logger = new Logger(WechatPayService.name)

  private appId: string
  private mchId: string
  private serialNo: string
  private apiV3Key: string
  private notifyUrl: string
  private privateKey: string

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.appId = this.configService.get('WECHAT_APPID', '')
    this.mchId = this.configService.get('WECHAT_PAY_MCHID', '')
    this.serialNo = this.configService.get('WECHAT_PAY_SERIAL_NO', '')
    this.apiV3Key = this.configService.get('WECHAT_PAY_API_V3_KEY', '')
    this.notifyUrl = this.configService.get('WECHAT_PAY_NOTIFY_URL', '')

    // 加载商户私钥
    const privateKeyPath = this.configService.get('WECHAT_PAY_PRIVATE_KEY_PATH', './certs/apiclient_key.pem')

    try {
      const fullPath = path.isAbsolute(privateKeyPath) ? privateKeyPath : path.join(process.cwd(), privateKeyPath)

      if (fs.existsSync(fullPath)) {
        this.privateKey = fs.readFileSync(fullPath, 'utf-8')
        this.logger.log('微信支付服务初始化成功')
      } else {
        this.logger.warn(`商户私钥文件不存在: ${fullPath}，支付功能将不可用`)
      }
    } catch (error) {
      this.logger.error('加载商户私钥失败:', error)
    }
  }

  /**
   * 检查支付服务是否可用
   */
  isAvailable(): boolean {
    return !!(this.appId && this.mchId && this.serialNo && this.apiV3Key && this.privateKey)
  }

  /**
   * JSAPI 统一下单
   */
  async createJsapiOrder(params: CreateJsapiOrderParams): Promise<WxPayParams> {
    if (!this.isAvailable()) {
      throw new Error('微信支付服务未正确配置')
    }

    const { outTradeNo, totalFee, openId, description } = params

    // 构造请求体
    const requestBody = {
      appid: this.appId,
      mchid: this.mchId,
      description,
      out_trade_no: outTradeNo,
      notify_url: this.notifyUrl,
      amount: {
        total: totalFee,
        currency: 'CNY',
      },
      payer: {
        openid: openId,
      },
    }

    const url = '/v3/pay/transactions/jsapi'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = this.generateNonceStr()
    const bodyStr = JSON.stringify(requestBody)

    // 生成签名
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, bodyStr)

    // 构造 Authorization 头
    const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.serialNo}"`

    // 调用微信 API
    const response = await fetch(`https://api.mch.weixin.qq.com${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authorization,
      },
      body: bodyStr,
    })

    const result = (await response.json()) as WxPayApiResponse

    if (!response.ok || !result.prepay_id) {
      this.logger.error('微信支付下单失败:', result)
      throw new Error(result.message || '微信支付下单失败')
    }

    // 生成小程序支付参数
    return this.generatePayParams(result.prepay_id)
  }

  /**
   * 生成小程序调起支付的参数
   */
  private generatePayParams(prepayId: string): WxPayParams {
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = this.generateNonceStr()
    const packageStr = `prepay_id=${prepayId}`

    // 构造签名串
    const signStr = `${this.appId}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`

    // 使用私钥签名
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signStr)
    const paySign = sign.sign(this.privateKey, 'base64')

    return {
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'RSA',
      paySign,
    }
  }

  /**
   * 验证回调签名
   */
  verifyNotifySignature(headers: Record<string, string>, body: string, platformCertificate?: string): boolean {
    const timestamp = headers['wechatpay-timestamp']
    const nonce = headers['wechatpay-nonce']
    const signature = headers['wechatpay-signature']

    if (!timestamp || !nonce || !signature) {
      this.logger.warn('回调请求缺少必要的签名头')
      return false
    }

    // 检查时间戳是否在 5 分钟内
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      this.logger.warn('回调时间戳超出有效范围')
      return false
    }

    // 构造验签字符串
    const signStr = `${timestamp}\n${nonce}\n${body}\n`

    // 如果没有提供平台证书，暂时跳过验签（开发阶段）
    if (!platformCertificate) {
      this.logger.warn('未配置平台证书，跳过验签')
      return true
    }

    try {
      const verify = crypto.createVerify('RSA-SHA256')
      verify.update(signStr)
      return verify.verify(platformCertificate, signature, 'base64')
    } catch (error) {
      this.logger.error('验签失败:', error)
      return false
    }
  }

  /**
   * 解密回调通知的 resource 字段
   */
  decryptNotifyResource(resource: NotifyResource): PaymentResult {
    const { ciphertext, associated_data, nonce } = resource

    // 使用 AEAD_AES_256_GCM 解密
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64')

    // 分离 authTag (最后 16 字节)
    const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16)
    const encryptedData = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16)

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.apiV3Key), Buffer.from(nonce))

    decipher.setAuthTag(authTag)
    decipher.setAAD(Buffer.from(associated_data))

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])

    return JSON.parse(decrypted.toString('utf-8'))
  }

  /**
   * 生成请求签名
   */
  private generateSignature(method: string, url: string, timestamp: string, nonceStr: string, body: string): string {
    const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`

    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signStr)
    return sign.sign(this.privateKey, 'base64')
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
