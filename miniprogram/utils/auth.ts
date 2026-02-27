// Token 管理工具
import { STORAGE_KEYS } from '../config/index'

// Token 信息接口
interface TokenInfo {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// 保存 Token
export function saveToken(tokenInfo: TokenInfo): void {
  const { accessToken, refreshToken, expiresIn } = tokenInfo
  const expireTime = Date.now() + expiresIn * 1000

  wx.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  wx.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  wx.setStorageSync(STORAGE_KEYS.TOKEN_EXPIRE_TIME, expireTime)
}

// 获取 Access Token
export function getAccessToken(): string {
  return wx.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN) || ''
}

// 获取 Refresh Token
export function getRefreshToken(): string {
  return wx.getStorageSync(STORAGE_KEYS.REFRESH_TOKEN) || ''
}

// 检查 Token 是否过期
export function isTokenExpired(): boolean {
  const expireTime = wx.getStorageSync(STORAGE_KEYS.TOKEN_EXPIRE_TIME)
  if (!expireTime) return true
  // 提前 5 分钟判定为过期，预留刷新时间
  return Date.now() > expireTime - 5 * 60 * 1000
}

// 检查是否已登录
export function isLoggedIn(): boolean {
  const token = getAccessToken()
  return !!token && !isTokenExpired()
}

// 清除 Token
export function clearToken(): void {
  wx.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN)
  wx.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN)
  wx.removeStorageSync(STORAGE_KEYS.TOKEN_EXPIRE_TIME)
  wx.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

// 保存用户信息
export function saveUserInfo(userInfo: any): void {
  wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo)
}

// 获取用户信息
export function getUserInfo(): any {
  return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null
}
