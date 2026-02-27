// app.ts
import { isLoggedIn, getAccessToken } from './utils/auth'
import { getProfile, login } from './store/user'
import type { UserProfile } from './store/user'

// 全局数据接口
interface GlobalData {
  userInfo: UserProfile | null
  isLoggedIn: boolean
}

App<IAppOption>({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
  } as GlobalData,

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus()

    // 获取系统信息
    this.getSystemInfo()
  },

  // 检查登录状态
  checkLoginStatus() {
    if (isLoggedIn()) {
      const userInfo = getProfile()
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      console.log('用户已登录:', userInfo?.nickname)
    } else {
      this.globalData.isLoggedIn = false
      this.globalData.userInfo = null
      console.log('用户未登录')
    }
  },

  // 获取系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      console.log('系统信息:', {
        platform: systemInfo.platform,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion,
      })
    } catch (err) {
      console.error('获取系统信息失败:', err)
    }
  },

  // 全局登录方法
  async login(): Promise<UserProfile> {
    try {
      const userInfo = await login()
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      return userInfo
    } catch (err) {
      console.error('登录失败:', err)
      throw err
    }
  },

  // 全局登出方法
  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
  },
})
