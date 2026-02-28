/**
 * 微信小程序支付参数 (返回给前端调用 wx.requestPayment)
 */
export interface WxPayParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'RSA'
  paySign: string
}

/**
 * 统一下单请求参数
 */
export interface CreateJsapiOrderParams {
  outTradeNo: string
  totalFee: number
  openId: string
  description: string
}

/**
 * 微信回调通知的加密数据
 */
export interface NotifyResource {
  original_type: string
  algorithm: string
  ciphertext: string
  associated_data: string
  nonce: string
}

/**
 * 微信回调通知请求体
 */
export interface PaymentNotifyBody {
  id: string
  create_time: string
  resource_type: string
  event_type: string
  summary: string
  resource: NotifyResource
}

/**
 * 解密后的支付结果
 */
export interface PaymentResult {
  appid: string
  mchid: string
  out_trade_no: string
  transaction_id: string
  trade_type: string
  trade_state: string
  trade_state_desc: string
  bank_type: string
  attach: string
  success_time: string
  payer: {
    openid: string
  }
  amount: {
    total: number
    payer_total: number
    currency: string
    payer_currency: string
  }
}

/**
 * 微信支付 API 响应
 */
export interface WxPayApiResponse {
  prepay_id?: string
  code?: string
  message?: string
}
