import { userApi, messageApi } from '../../api/index'
import { isLoggedIn } from '../../utils/auth'
import { getProfile, setProfile } from '../../store/user'
import type { UserProfile } from '../../store/user'

Page({
  data: {
    isLoggedIn: false,
    avatarSrc: '/assets/figma/avatar.jpg',
    userName: '点击登录',
    greeting: '登录后享受更多权益',
    couponCount: 0,
    memberType: 'general' as 'gold' | 'general',
    points: 0,
    balance: 0,
    showLoginPopup: false,
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
    if (isLoggedIn()) {
      this.loadUserData()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const loggedIn = isLoggedIn()
    if (loggedIn) {
      const profile = getProfile()
      if (profile) {
        this.updateUserDisplay(profile)
      }
    } else {
      this.setData({
        isLoggedIn: false,
        userName: '点击登录',
        greeting: '登录后享受更多权益',
        avatarSrc: '/assets/figma/avatar.jpg',
        couponCount: 0,
        points: 0,
        balance: 0,
      })
    }
  },

  // 加载用户数据
  async loadUserData() {
    try {
      const [profile, unread] = await Promise.all([
        userApi.getProfile().catch(() => null),
        messageApi.getUnreadCount().catch(() => ({ total: 0 })),
      ])

      if (profile) {
        setProfile(profile)
        this.updateUserDisplay(profile)
      }

      // 设置 tabBar 消息数量
      if (unread.total > 0) {
        wx.setTabBarBadge({
          index: 3,
          text: unread.total > 99 ? '99+' : String(unread.total),
        })
      } else {
        wx.removeTabBarBadge({ index: 3 })
      }
    } catch (err) {
      console.error('加载用户数据失败:', err)
    }
  },

  // 更新用户显示信息
  updateUserDisplay(profile: UserProfile) {
    const hour = new Date().getHours()
    let timeGreeting = '你好'
    if (hour < 6) timeGreeting = '凌晨好'
    else if (hour < 12) timeGreeting = '上午好'
    else if (hour < 14) timeGreeting = '中午好'
    else if (hour < 18) timeGreeting = '下午好'
    else timeGreeting = '晚上好'

    const memberText = profile.memberLevel === 'gold' ? '黄金会员' : '大众会员'

    this.setData({
      isLoggedIn: true,
      userName: profile.nickname || '蜗壳用户',
      avatarSrc: profile.avatar || '/assets/figma/avatar.jpg',
      greeting: `尊贵的${memberText}, ${timeGreeting}`,
      memberType: profile.memberLevel === 'gold' ? 'gold' : 'general',
      points: profile.points || 0,
      balance: profile.balance || 0,
      couponCount: profile.couponCount || 0,
    })
  },

  // 点击头像/登录区域
  async onOpenHeaderMenu() {
    if (!isLoggedIn()) {
      this.setData({ showLoginPopup: true })
      return
    }

    // 已登录，切换会员类型用于测试
    const currentType = this.data.memberType
    const newType = currentType === 'gold' ? 'general' : 'gold'
    const newGreeting = newType === 'gold' ? '尊贵的黄金会员, 下午好' : '尊贵的大众会员, 下午好'

    this.setData({
      memberType: newType,
      greeting: newGreeting,
    })

    wx.showToast({
      title: newType === 'gold' ? '切换到黄金会员' : '切换到大众会员',
      icon: 'none',
    })
  },

  onTapBenefit(e: any) {
    const key = e.detail?.key || ''
    wx.showToast({ title: key ? `权益：${key}` : '权益', icon: 'none' })
  },

  onTapCoupon() {
    wx.navigateTo({
      url: '/pages/coupons/coupons',
      fail: () => {
        wx.showToast({ title: '暂无法打开优惠券页面', icon: 'none' })
      },
    })
  },

  onTapFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites',
      fail: () => {
        wx.showToast({ title: '暂无法打开收藏页面', icon: 'none' })
      },
    })
  },

  onTapPoints() {
    wx.showToast({ title: `积分：${this.data.points}`, icon: 'none' })
  },

  onTapQuickAction(e: any) {
    const key = e.detail?.key || ''
    let tab: string
    if (key === 'pay') {
      tab = 'pay'
    } else if (key === 'use') {
      tab = 'use'
    } else if (key === 'refund') {
      tab = 'refund'
    } else {
      tab = 'all'
    }

    wx.setStorageSync('orders:initialTab', tab)
    wx.switchTab({
      url: '/pages/orders/orders',
      fail: () => {
        wx.showToast({ title: '暂无法打开订单页', icon: 'none' })
      },
    })
  },

  onTapGridItem(e: any) {
    const key = e.detail?.key || ''
    console.log('onTapGridItem called with key:', key)

    const routes: Record<string, string> = {
      常用信息: '/pages/common-info/common-info',
      余额: '/pages/balance/balance',
      智能门锁: '/pages/smart-lock/smart-lock',
      团购验券: '/pages/coupon-verify/coupon-verify',
      我要反馈: '/pages/feedback/feedback',
      用户服务协议: '/pages/service-agreement/service-agreement',
      附近门店: '/pages/nearby-stores/nearby-stores',
      门店详情: '/pages/nearby-stores/nearby-stores',
      订单填写: '/pages/order-form/order-form',
      实景选房: '/pages/room-selection/room-selection',
    }

    const url = routes[key]
    if (url) {
      wx.navigateTo({
        url,
        fail: () => {
          wx.showToast({ title: `暂无法打开${key}`, icon: 'none' })
        },
      })
      return
    }

    wx.showToast({ title: key || '功能', icon: 'none' })
  },

  // 登录弹窗显示状态变化
  onLoginPopupVisibleChange(e: any) {
    this.setData({ showLoginPopup: e.detail.visible })
  },

  // 登录成功
  onLoginSuccess(e: any) {
    this.setData({ showLoginPopup: false })
    const profile = e.detail?.userProfile
    if (profile) {
      this.updateUserDisplay(profile)
    }
    this.loadUserData()
    wx.showToast({ title: '登录成功', icon: 'success' })
  },
})
