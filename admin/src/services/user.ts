import { get, put } from './request'

export const userApi = {
  getUsers: (params?: any) => get('/users', params),
  getUser: (id: string) => get(`/users/${id}`),
  updateMemberLevel: (id: string, memberLevel: string) => put(`/users/${id}/member-level`, { memberLevel }),
  adjustPoints: (id: string, data: { amount: number; reason: string }) => put(`/users/${id}/points`, data),
  adjustBalance: (id: string, data: { amount: number; reason: string }) => put(`/users/${id}/balance`, data),
}
