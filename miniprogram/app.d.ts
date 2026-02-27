// 小程序全局类型定义
import type { UserProfile } from './store/user'

// App 全局数据接口
interface GlobalData {
  userInfo: UserProfile | null
  isLoggedIn: boolean
}

// App 配置选项
interface IAppOption {
  globalData: GlobalData
  login(): Promise<UserProfile>
  logout(): void
}
