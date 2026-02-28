import { get, post, put, del, request } from './request'

export const storeApi = {
  getStores: (params?: any) => get('/stores', params),
  getStore: (id: string) => get(`/stores/${id}`),
  createStore: (data: any) => post('/stores', data),
  updateStore: (id: string, data: any) => put(`/stores/${id}`, data),
  deleteStore: (id: string) => del(`/stores/${id}`),
  updateStoreStatus: (id: string, status: string) => put(`/stores/${id}/status`, { status }),

  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ url: string }>({
      method: 'POST',
      url: '/upload/image',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getRooms: (storeId: string) => get(`/stores/${storeId}/rooms`),
  getRoom: (id: string) => get(`/rooms/${id}`),
  createRoom: (storeId: string, data: any) => post(`/stores/${storeId}/rooms`, data),
  updateRoom: (id: string, data: any) => put(`/rooms/${id}`, data),
  deleteRoom: (id: string) => del(`/rooms/${id}`),
  deleteBed: (id: string) => del(`/beds/${id}`),
}
