import { get, post, put, del } from './request'

export const couponApi = {
  getTemplates: (params?: any) => get('/coupons', params),
  getTemplate: (id: string) => get(`/coupons/${id}`),
  createTemplate: (data: any) => post('/coupons', data),
  updateTemplate: (id: string, data: any) => put(`/coupons/${id}`, data),
  deleteTemplate: (id: string) => del(`/coupons/${id}`),
  updateTemplateStatus: (id: string, status: string) => put(`/coupons/${id}/status`, { status }),
  distribute: (id: string, data: any) => post(`/coupons/${id}/distribute`, data),
  getRecords: (id: string, params?: any) => get(`/coupons/${id}/records`, params),
}
