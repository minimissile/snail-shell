Component({
  data: {
    avatarSrc: '/assets/figma/avatar.png',
    userName: 'Dimoo旅行家',
    greeting: '尊贵的黄金会员, 下午好',
    couponCount: 1,
  },
  methods: {
    onOpenHeaderMenu() {
      wx.showToast({ title: '菜单', icon: 'none' })
    },
    onTapBenefit(e: WechatMiniprogram.CustomEvent<{ key: string }>) {
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
    onTapQuickAction(e: WechatMiniprogram.CustomEvent<{ key: string }>) {
      const key = e.detail?.key || ''
      const tab =
        key === 'pay'
          ? 'pay'
          : key === 'use'
            ? 'use'
            : key === 'refund'
              ? 'refund'
              : 'all'
      wx.setStorageSync('orders:initialTab', tab)
      wx.switchTab({
        url: '/pages/orders/orders',
        fail: () => {
          wx.showToast({ title: '暂无法打开订单页', icon: 'none' })
        },
      })
    },
    onTapGridItem(e: WechatMiniprogram.CustomEvent<{ key: string }>) {
      const key = e.detail?.key || ''
      if (key === '常用信息') {
        wx.navigateTo({
          url: '/pages/common-info/common-info',
          fail: () => {
            wx.showToast({ title: '暂无法打开常用信息', icon: 'none' })
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
      wx.showToast({ title: key || '功能', icon: 'none' })
    },
  },
})
