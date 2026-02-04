Page({
  data: {
    avatarSrc: '/assets/figma/avatar.jpg',
    userName: 'Dimoo旅行家',
    greeting: '尊贵的大众会员, 下午好',
    couponCount: 1,
    memberType: 'general', // 'gold' | 'general'
  },

  onLoad() {
    // 页面加载时的初始化逻辑
  },

  onOpenHeaderMenu() {
    // 切换会员类型用于测试
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
    wx.showToast({ title: '积分', icon: 'none' })
  },

  onTapQuickAction(e: any) {
    const key = e.detail?.key || ''
    // 映射关系：orders/pay/use/refund -> all/toPay/toUse/refund
    let tab: string
    if (key === 'pay') {
      tab = 'pay' // 待付款
    } else if (key === 'use') {
      tab = 'use' // 待使用
    } else if (key === 'refund') {
      tab = 'refund' // 退款单
    } else {
      tab = 'all' // 我的订单 -> 全部
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
    console.log('onTapGridItem called with key:', key) // 添加调试日志

    if (key === '常用信息') {
      wx.navigateTo({
        url: '/pages/common-info/common-info',
        fail: () => {
          wx.showToast({ title: '暂无法打开常用信息', icon: 'none' })
        },
      })
      return
    }
    if (key === '余额') {
      wx.navigateTo({
        url: '/pages/balance/balance',
        fail: () => {
          wx.showToast({ title: '暂无法打开余额页面', icon: 'none' })
        },
      })
      return
    }
    if (key === '智能门锁') {
      wx.navigateTo({
        url: '/pages/smart-lock/smart-lock',
        fail: () => {
          wx.showToast({ title: '暂无法打开智能门锁', icon: 'none' })
        },
      })
      return
    }
    if (key === '团购验券') {
      wx.navigateTo({
        url: '/pages/coupon-verify/coupon-verify',
        fail: () => {
          wx.showToast({ title: '暂无法打开团购验券', icon: 'none' })
        },
      })
      return
    }
    if (key === '我要反馈') {
      wx.navigateTo({
        url: '/pages/feedback/feedback',
        fail: () => {
          wx.showToast({ title: '暂无法打开反馈页面', icon: 'none' })
        },
      })
      return
    }
    if (key === '用户服务协议') {
      wx.navigateTo({
        url: '/pages/service-agreement/service-agreement',
        fail: () => {
          wx.showToast({ title: '暂无法打开服务协议', icon: 'none' })
        },
      })
      return
    }
    if (key === '附近门店') {
      wx.navigateTo({
        url: '/pages/nearby-stores/nearby-stores',
        fail: () => {
          wx.showToast({ title: '暂无法打开附近门店', icon: 'none' })
        },
      })
      return
    }
    if (key === '门店详情') {
      wx.navigateTo({
        url: '/pages/nearby-stores/nearby-stores',
        fail: () => {
          wx.showToast({ title: '暂无法打开门店详情', icon: 'none' })
        },
      })
      return
    }
    if (key === '订单填写') {
      wx.navigateTo({
        url: '/pages/order-form/order-form',
        fail: () => {
          wx.showToast({ title: '暂无法打开订单填写', icon: 'none' })
        },
      })
      return
    }
    if (key === '实景选房') {
      wx.navigateTo({
        url: '/pages/room-selection/room-selection',
        fail: () => {
          wx.showToast({ title: '暂无法打开实景选房', icon: 'none' })
        },
      })
      return
    }
    wx.showToast({ title: key || '功能', icon: 'none' })
  },
})
