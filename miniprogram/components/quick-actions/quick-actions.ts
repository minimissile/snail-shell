type ActionKey = 'orders' | 'pay' | 'use' | 'refund'

Component({
  data: {
    items: [
      { key: 'orders', label: '我的订单', icon: '/assets/figma/quick-orders.svg' },
      { key: 'pay', label: '待付款', icon: '/assets/figma/quick-card.svg' },
      { key: 'use', label: '待使用', icon: '/assets/figma/quick-clock.svg' },
      { key: 'refund', label: '退款单', icon: '/assets/figma/quick-refund.svg' },
    ] as Array<{ key: ActionKey; label: string; icon: string }>,
  },
  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      const key = (e.currentTarget.dataset?.key || '') as ActionKey
      if (!key) return
      this.triggerEvent('action', { key })
    },
  },
})
