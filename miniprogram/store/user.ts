// 用户状态管理
import { saveUserInfo, getUserInfo, clearToken, saveToken } from '../utils/auth'
import * as authApi from '../api/auth'

// 用户信息接口
export interface UserProfile {
  id: string
  openId: string
  phone?: string
  nickname: string
  avatar: string
  memberLevel: string
  points: number
  balance: number
  couponCount: number
}

// 全局用户状态
let userProfile: UserProfile | null = null
let loginPromise: Promise<UserProfile> | null = null

// 获取用户资料
export function getProfile(): UserProfile | null {
  if (!userProfile) {
    userProfile = getUserInfo()
  }
  return userProfile
}

// 设置用户资料
export function setProfile(profile: UserProfile): void {
  userProfile = profile
  saveUserInfo(profile)
}

// 清除用户资料
export function clearProfile(): void {
  userProfile = null
  clearToken()
}

// 微信登录
export async function login(): Promise<UserProfile> {
  // 防止重复登录
  if (loginPromise) {
    return loginPromise
  }

  loginPromise = new Promise(async (resolve, reject) => {
    try {
      // 获取微信登录 code
      const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((res, rej) => {
        wx.login({
          success: res,
          fail: rej,
        })
      })

      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }

      // 调用后端登录接口
      const result = await authApi.wechatLogin({ code: loginRes.code })

      // 保存 Token
      saveToken({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      })

      // 保存用户信息
      setProfile(result.user)

      resolve(result.user)
    } catch (error) {
      reject(error)
    } finally {
      loginPromise = null
    }
  })

  return loginPromise
}

// 退出登录
export function logout(): void {
  clearProfile()
  wx.showToast({
    title: '已退出登录',
    icon: 'success',
  })
}

// 检查登录状态，未登录则触发登录
export async function checkLogin(): Promise<UserProfile> {
  const profile = getProfile()
  if (profile) {
    return profile
  }
  return login()
}

// 获取手机号
export async function bindPhone(code: string): Promise<void> {
  const result = await authApi.getPhone({ code })
  const profile = getProfile()
  if (profile) {
    setProfile({ ...profile, phone: result.phone })
  }
}

export default {
  getProfile,
  setProfile,
  clearProfile,
  login,
  logout,
  checkLogin,
  bindPhone,
}
