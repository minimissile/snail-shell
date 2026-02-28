// 余额相关 API
import { get, post } from '../utils/request'
import type { PageResult } from './store'

// 余额记录类型
export type BalanceRecordType = 'recharge' | 'consume' | 'refund' | 'gift'

// 余额信息
export interface BalanceInfo {
  balance: number
  cashback: number
  consumption: number
  points: number
}

// 余额记录
export interface BalanceRecord {
  id: string
  type: BalanceRecordType
  amount: number
  balance: number
  description: string
  orderId?: string
  createdAt: string
}

// 充值套餐
export interface RechargePackage {
  id: string
  amount: number
  giftAmount: number
  description: string
}

// 获取余额信息
export function getBalance(): Promise<BalanceInfo> {
  return get<BalanceInfo>('/balance', undefined, { needAuth: true })
}

// 获取余额记录
export function getBalanceRecords(params?: {
  type?: BalanceRecordType
  page?: number
  pageSize?: number
}): Promise<PageResult<BalanceRecord>> {
  return get<PageResult<BalanceRecord>>('/balance/records', params, { needAuth: true })
}

// 获取充值套餐
export function getRechargePackages(): Promise<RechargePackage[]> {
  return get<RechargePackage[]>('/balance/packages', undefined, { needAuth: true })
}

// 充值
export function recharge(packageId: string): Promise<{ payParams: any }> {
  return post<{ payParams: any }>(
    '/balance/recharge',
    { packageId },
    { needAuth: true, showLoading: true, loadingText: '处理中...' }
  )
}
