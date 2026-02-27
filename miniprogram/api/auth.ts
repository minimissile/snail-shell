// 认证相关 API
import { post } from '../utils/request'
import type { UserProfile } from '../store/user'

// 微信登录参数
interface WechatLoginParams {
  code: string
}

// 微信登录返回
interface WechatLoginResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserProfile
}

// 获取手机号参数
interface GetPhoneParams {
  code: string
}

// 获取手机号返回
interface GetPhoneResult {
  phone: string
}

// 刷新 Token 参数
interface RefreshTokenParams {
  refreshToken: string
}

// 刷新 Token 返回
interface RefreshTokenResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// 微信登录
export function wechatLogin(params: WechatLoginParams): Promise<WechatLoginResult> {
  return post<WechatLoginResult>('/auth/wechat-login', params)
}

// 获取手机号
export function getPhone(params: GetPhoneParams): Promise<GetPhoneResult> {
  return post<GetPhoneResult>('/auth/phone', params, { needAuth: true })
}

// 刷新 Token
export function refreshToken(params: RefreshTokenParams): Promise<RefreshTokenResult> {
  return post<RefreshTokenResult>('/auth/refresh-token', params)
}
