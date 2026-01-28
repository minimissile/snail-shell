type TabKey = 'home' | 'favorite' | 'order' | 'message' | 'me'

Component({
  properties: {
    active: {
      type: String,
      value: 'me',
    },
  },
  data: {
    items: [
      { key: 'home', label: '首页', icon: '/assets/figma/tab-home.svg' },
      { key: 'favorite', label: '收藏', icon: '/assets/figma/tab-favorite.svg' },
      { key: 'order', label: '订单', icon: '/assets/figma/tab-order.svg' },
      { key: 'message', label: '消息', icon: '/assets/figma/tab-message.svg' },
      { key: 'me', label: '我的', icon: '/assets/figma/tab-me.svg' },
    ] as Array<{ key: TabKey; label: string; icon: string }>,
  },
  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      const key = (e.currentTarget.dataset?.key || '') as TabKey
      if (!key) return
      this.triggerEvent('change', { key })
    },
  },
})
