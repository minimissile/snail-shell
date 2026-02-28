import { get, post, put, del } from './request'

export const systemApi = {
  getHomeConfig: () => get('/system/home-config'),
  updateHomeConfig: (data: any) => put('/system/home-config', data),

  getCities: () => get('/system/cities'),
  createCity: (data: any) => post('/system/cities', data),
  updateCity: (id: string, data: any) => put(`/system/cities/${id}`, data),
  deleteCity: (id: string) => del(`/system/cities/${id}`),

  getAgreements: () => get('/system/agreements'),
  getAgreement: (type: string) => get(`/system/agreements/${type}`),
  updateAgreement: (type: string, data: any) => put(`/system/agreements/${type}`, data),

  getFeedbacks: (params?: any) => get('/system/feedbacks', params),
  replyFeedback: (id: string, data: any) => put(`/system/feedbacks/${id}/reply`, data),
}
