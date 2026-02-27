import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { getToken, removeToken } from '@/utils/auth'

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

const instance: AxiosInstance = axios.create({
  baseURL: '/v1/admin',
  timeout: 30000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 文件下载直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }

    const res = response.data as ApiResponse

    if (res.code !== 0) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }

    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const msg = error.response?.data?.message || error.message || '网络错误'
    message.error(msg)
    return Promise.reject(error)
  }
)

export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return instance(config) as any
}

export function get<T = any>(url: string, params?: any): Promise<T> {
  return request<T>({ method: 'GET', url, params })
}

export function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ method: 'POST', url, data })
}

export function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ method: 'PUT', url, data })
}

export function del<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ method: 'DELETE', url, data })
}

export default instance
