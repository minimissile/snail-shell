// 优惠券相关 API
import { get, post } from '../utils/request'
import type { PageResult } from './store'

// 优惠券状态
export type CouponStatus = 'unused' | 'used' | 'expired'

// 优惠券类型
export type CouponType = 'discount' | 'amount' | 'gift'

// 优惠券信息
export interface CouponInfo {
  id: string
  templateId: string
  name: string
  type: CouponType
  value: number
  minAmount: number
  description: string
  status: CouponStatus
  startTime: string
  endTime: string
  applicableStores: string[]
  usedTime?: string
  usedOrderId?: string
}

// 可领取优惠券
export interface CouponTemplate {
  id: string
  name: string
  type: CouponType
  value: number
  minAmount: number
  description: string
  validDays: number
  remaining: number
  isReceived: boolean
}

// 获取我的优惠券
export function getMyCoupons(params?: {
  status?: CouponStatus
  page?: number
  pageSize?: number
}): Promise<PageResult<CouponInfo>> {
  return get<PageResult<CouponInfo>>('/coupons', params, { needAuth: true })
}

// 获取可领取优惠券列表
export function getAvailableCoupons(): Promise<CouponTemplate[]> {
  return get<CouponTemplate[]>('/coupons/templates', undefined, { needAuth: true })
}

// 领取优惠券
export function receiveCoupon(templateId: string): Promise<CouponInfo> {
  return post<CouponInfo>(`/coupons/receive/${templateId}`, undefined, { needAuth: true })
}

// 获取订单可用优惠券
export function getOrderCoupons(params: { storeId: string; amount: number }): Promise<CouponInfo[]> {
  return get<CouponInfo[]>('/coupons/available', params, { needAuth: true })
}

// 核销优惠券（团购验券）
export function verifyCoupon(couponId: string, params: { storeId: string; verifyCode: string }): Promise<void> {
  return post<void>(`/coupons/${couponId}/verify`, params, { needAuth: true })
}
