Component({
  data: {
    activeTab: 'me',
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
      wx.showToast({ title: '优惠券', icon: 'none' })
    },
    onTapFavorites() {
      wx.showToast({ title: '收藏浏览', icon: 'none' })
    },
    onTapPoints() {
      wx.showToast({ title: '积分', icon: 'none' })
    },
    onTapQuickAction(e: WechatMiniprogram.CustomEvent<{ key: string }>) {
      const key = e.detail?.key || ''
      wx.showToast({ title: key ? `订单：${key}` : '订单', icon: 'none' })
    },
    onTapGridItem(e: WechatMiniprogram.CustomEvent<{ key: string }>) {
      const key = e.detail?.key || ''
      wx.showToast({ title: key || '功能', icon: 'none' })
    },
    onTabChange(e: WechatMiniprogram.CustomEvent<{ key: string }>) {
      const key = e.detail?.key || ''
      wx.showToast({ title: key ? `切换：${key}` : '切换', icon: 'none' })
    },
  },
})
