// 支付相关 API
import { post } from '../utils/request'

// 微信支付参数接口
export interface WxPayParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'MD5' | 'HMAC-SHA256' | 'RSA'
  paySign: string
}

// 创建测试支付订单结果
export interface CreateTestPaymentResult {
  orderId: string
  payParams: WxPayParams
}

// 创建测试支付订单
export function createTestPayment(amount: number): Promise<CreateTestPaymentResult> {
  return post<CreateTestPaymentResult>(
    '/payment/test',
    { amount },
    { needAuth: true, showLoading: true, loadingText: '创建支付订单中...' }
  )
}

// 查询支付结果
export function queryPaymentResult(orderId: string): Promise<{ status: 'success' | 'pending' | 'failed' }> {
  return post<{ status: 'success' | 'pending' | 'failed' }>(`/payment/query/${orderId}`, undefined, { needAuth: true })
}
