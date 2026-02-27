import { get, put, post } from './request'
import instance from './request'

export const orderApi = {
  getOrders: (params?: any) => get('/orders', params),
  getOrder: (id: string) => get(`/orders/${id}`),
  handleRefund: (id: string, data: { action: string; reason?: string }) => put(`/orders/${id}/refund`, data),
  exportOrders: (data?: any) => instance({ method: 'POST', url: '/orders/export', data, responseType: 'blob' }),
}
