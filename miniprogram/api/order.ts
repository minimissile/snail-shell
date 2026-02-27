// 订单相关 API
import { get, post } from '../utils/request'
import type { PageResult } from './store'

// 订单状态
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'checkedIn'
  | 'completed'
  | 'cancelled'
  | 'refunding'
  | 'refunded'

// 订单信息
export interface OrderInfo {
  id: string
  orderNo: string
  userId: string
  storeId: string
  storeName: string
  storeImage: string
  roomId: string
  roomName: string
  bedIds: string[]
  checkIn: string
  checkOut: string
  nights: number
  guestName: string
  guestPhone: string
  totalAmount: number
  paidAmount: number
  discountAmount: number
  couponId?: string
  status: OrderStatus
  statusText: string
  paymentMethod?: string
  payTime?: string
  createdAt: string
}

// 订单详情
export interface OrderDetail extends OrderInfo {
  beds: Array<{
    id: string
    bedNumber: string
    price: number
  }>
  coupon?: {
    id: string
    name: string
    discount: number
  }
  timeline: Array<{
    status: string
    time: string
    desc: string
  }>
}

// 计算订单价格参数
export interface CalculateOrderParams {
  storeId: string
  roomId: string
  bedIds: string[]
  checkIn: string
  checkOut: string
  couponId?: string
}

// 计算订单价格结果
export interface CalculateOrderResult {
  roomPrice: number
  nights: number
  totalPrice: number
  discountAmount: number
  finalPrice: number
  couponDiscount: number
}

// 创建订单参数
export interface CreateOrderParams {
  storeId: string
  roomId: string
  bedIds: string[]
  checkIn: string
  checkOut: string
  guestName: string
  guestPhone: string
  couponId?: string
  remark?: string
}

// 获取订单列表参数
export interface GetOrdersParams {
  status?: OrderStatus | 'all'
  page?: number
  pageSize?: number
}

// 支付订单参数
export interface PayOrderParams {
  paymentMethod: 'wechat' | 'balance'
}

// 取消订单参数
export interface CancelOrderParams {
  reason?: string
}

// 申请退款参数
export interface RefundOrderParams {
  reason: string
}

// 计算订单价格
export function calculateOrder(params: CalculateOrderParams): Promise<CalculateOrderResult> {
  return post<CalculateOrderResult>('/orders/calculate', params, { needAuth: true })
}

// 创建订单
export function createOrder(params: CreateOrderParams): Promise<OrderInfo> {
  return post<OrderInfo>('/orders', params, { needAuth: true, showLoading: true, loadingText: '创建订单中...' })
}

// 获取订单列表
export function getOrders(params?: GetOrdersParams): Promise<PageResult<OrderInfo>> {
  return get<PageResult<OrderInfo>>('/orders', params, { needAuth: true })
}

// 获取订单详情
export function getOrderDetail(orderId: string): Promise<OrderDetail> {
  return get<OrderDetail>(`/orders/${orderId}`, undefined, { needAuth: true })
}

// 支付订单
export function payOrder(orderId: string, params: PayOrderParams): Promise<{ payParams?: any }> {
  return post<{ payParams?: any }>(`/orders/${orderId}/pay`, params, {
    needAuth: true,
    showLoading: true,
    loadingText: '处理中...',
  })
}

// 取消订单
export function cancelOrder(orderId: string, params?: CancelOrderParams): Promise<void> {
  return post<void>(`/orders/${orderId}/cancel`, params, { needAuth: true })
}

// 申请退款
export function refundOrder(orderId: string, params: RefundOrderParams): Promise<void> {
  return post<void>(`/orders/${orderId}/refund`, params, { needAuth: true })
}
