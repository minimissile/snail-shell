// API 请求封装
import { BASE_URL, API_TIMEOUT } from '../config/index'
import { getAccessToken, getRefreshToken, saveToken, clearToken, isTokenExpired } from './auth'

// 请求配置接口
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
  showError?: boolean
  needAuth?: boolean
}

// 响应数据接口
interface ResponseData<T = any> {
  code: number
  data: T
  message: string
}

// 是否正在刷新 Token
let isRefreshing = false
// 等待刷新 Token 的请求队列
let requestQueue: Array<() => void> = []

// 刷新 Token
async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    return false
  }

  try {
    const res = await new Promise<WechatMiniprogram.RequestSuccessCallbackResult>((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/auth/refresh-token`,
        method: 'POST',
        data: { refreshToken: refreshTokenValue },
        success: resolve,
        fail: reject,
      })
    })

    const data = res.data as ResponseData
    if (data.code === 0 && data.data) {
      saveToken(data.data)
      return true
    }
    return false
  } catch {
    return false
  }
}

// 处理 Token 刷新
async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      requestQueue.push(() => resolve(true))
    })
  }

  isRefreshing = true
  const success = await refreshToken()
  isRefreshing = false

  if (success) {
    requestQueue.forEach((callback) => callback())
    requestQueue = []
    return true
  } else {
    requestQueue = []
    clearToken()
    return false
  }
}

// 跳转登录
function redirectToLogin(): void {
  clearToken()
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    success: () => {
      // 可以跳转到登录页或触发登录弹窗
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage) {
        currentPage.setData?.({ showLoginPopup: true })
      }
    },
  })
}

// 主请求方法
export function request<T = any>(config: RequestConfig): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    loadingText = '加载中...',
    showError = true,
    needAuth = false,
  } = config

  return new Promise((resolve, reject) => {
    // 显示 loading
    if (showLoading) {
      wx.showLoading({ title: loadingText, mask: true })
    }

    // 过滤 undefined/null 值，防止 wx.request 将其序列化为字符串
    let requestData = data
    if (data && typeof data === 'object' && method === 'GET') {
      requestData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
      )
    }

    // 构建请求头
    const requestHeader: Record<string, string> = {
      'Content-Type': 'application/json',
      ...header,
    }

    // 需要认证时添加 Token
    if (needAuth) {
      const token = getAccessToken()
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`
      }
    }

    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data: requestData,
      header: requestHeader,
      timeout: API_TIMEOUT,
      success: async (res) => {
        if (showLoading) {
          wx.hideLoading()
        }

        const statusCode = res.statusCode
        const responseData = res.data as ResponseData<T>

        // 处理 401 未授权
        if (statusCode === 401 && needAuth) {
          if (isTokenExpired()) {
            const refreshSuccess = await handleTokenRefresh()
            if (refreshSuccess) {
              // 重试请求
              try {
                const retryResult = await request<T>(config)
                resolve(retryResult)
              } catch (err) {
                reject(err)
              }
              return
            }
          }
          redirectToLogin()
          reject(new Error('登录已过期'))
          return
        }

        // 请求成功
        if (statusCode >= 200 && statusCode < 300) {
          if (responseData.code === 0) {
            resolve(responseData.data)
          } else {
            if (showError) {
              wx.showToast({
                title: responseData.message || '请求失败',
                icon: 'none',
              })
            }
            reject(new Error(responseData.message || '请求失败'))
          }
        } else {
          if (showError) {
            wx.showToast({
              title: `请求错误: ${statusCode}`,
              icon: 'none',
            })
          }
          reject(new Error(`请求错误: ${statusCode}`))
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading()
        }
        if (showError) {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none',
          })
        }
        reject(err)
      },
    })
  })
}

// GET 请求
export function get<T = any>(url: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'GET', data, ...options })
}

// POST 请求
export function post<T = any>(url: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...options })
}

// PUT 请求
export function put<T = any>(url: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...options })
}

// DELETE 请求
export function del<T = any>(url: string, data?: any, options?: Partial<RequestConfig>): Promise<T> {
  return request<T>({ url, method: 'DELETE', data, ...options })
}

export default request
