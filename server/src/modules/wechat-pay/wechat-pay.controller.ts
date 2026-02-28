import { Controller, Post, Req, Res, Logger, Headers, RawBodyRequest } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { WechatPayService } from './wechat-pay.service'
import { OrderService } from '../order/order.service'
import { PaymentNotifyBody } from './dto'

@ApiTags('支付')
@Controller('orders')
export class WechatPayController {
  private readonly logger = new Logger(WechatPayController.name)

  constructor(
    private readonly wechatPayService: WechatPayService,
    private readonly orderService: OrderService
  ) {}

  @Post('payment-notify')
  @ApiOperation({ summary: '微信支付回调通知' })
  @ApiExcludeEndpoint()
  async handlePaymentNotify(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    this.logger.log('收到微信支付回调通知')

    try {
      // 获取原始请求体
      const rawBody = req.rawBody?.toString('utf-8') || ''

      if (!rawBody) {
        this.logger.error('回调请求体为空')
        return res.status(400).json({ code: 'FAIL', message: '请求体为空' })
      }

      // 验证签名
      const isValid = this.wechatPayService.verifyNotifySignature(headers, rawBody)
      if (!isValid) {
        this.logger.error('回调签名验证失败')
        return res.status(401).json({ code: 'FAIL', message: '签名验证失败' })
      }

      // 解析请求体
      const notifyBody: PaymentNotifyBody = JSON.parse(rawBody)

      // 检查事件类型
      if (notifyBody.event_type !== 'TRANSACTION.SUCCESS') {
        this.logger.log(`收到非支付成功事件: ${notifyBody.event_type}`)
        return res.status(200).json({ code: 'SUCCESS', message: '成功' })
      }

      // 解密支付结果
      const paymentResult = this.wechatPayService.decryptNotifyResource(notifyBody.resource)

      this.logger.log(`支付成功: 订单号=${paymentResult.out_trade_no}, 交易号=${paymentResult.transaction_id}`)

      // 检查交易状态
      if (paymentResult.trade_state !== 'SUCCESS') {
        this.logger.warn(`交易状态异常: ${paymentResult.trade_state}`)
        return res.status(200).json({ code: 'SUCCESS', message: '成功' })
      }

      // 调用订单服务完成支付
      await this.orderService.handlePaymentNotify(
        paymentResult.out_trade_no,
        paymentResult.transaction_id,
        paymentResult.amount.total
      )

      // 返回成功响应
      return res.status(200).json({ code: 'SUCCESS', message: '成功' })
    } catch (error) {
      this.logger.error('处理支付回调失败:', error)
      return res.status(500).json({ code: 'FAIL', message: '处理失败' })
    }
  }
}
