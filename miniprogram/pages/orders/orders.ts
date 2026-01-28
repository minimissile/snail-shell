type OrdersTabKey = 'all' | 'toUse' | 'valid' | 'toPay' | 'refund'

type OrderCard = {
  id: string
  title: string
  sub: string
}

/**
 * 获取当前页面的 query 参数（用于从入口传入默认 Tab）
 */
function getRouteOptions(): Record<string, string> {
  try {
    const pages = getCurrentPages()
    const current = (pages[pages.length - 1] || {}) as unknown as { options?: Record<string, string> }
    return current?.options || {}
  } catch {
    return {}
  }
}

/**
 * 将入口参数映射为订单页的 TabKey
 */
function resolveInitialTabKey(raw: string): OrdersTabKey {
  const value = (raw || '').trim()
  if (value === 'pay') return 'toPay'
  if (value === 'use') return 'toUse'
  if (value === 'refund') return 'refund'
  if (value === 'valid') return 'valid'
  return 'all'
}

/**
 * 从本地缓存读取外部指定的初始 Tab（用于 switchTab 进入订单页时传参）
 */
function readInitialTabFromStorage(): OrdersTabKey | '' {
  try {
    const raw = wx.getStorageSync('orders:initialTab') as unknown as string
    if (raw) wx.removeStorageSync('orders:initialTab')
    return resolveInitialTabKey(raw || '')
  } catch {
    return ''
  }
}

Component({
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'toUse', label: '待使用' },
      { key: 'valid', label: '有效单' },
      { key: 'toPay', label: '待支付' },
      { key: 'refund', label: '退款单' },
    ] as Array<{ key: OrdersTabKey; label: string }>,
    activeKey: 'all' as OrdersTabKey,
    activeIndex: 0,
    isLoading: false,
    errorMessage: '',
    ordersByIndex: [[], [], [], [], []] as Array<OrderCard[]>,
    ordersCountByIndex: [0, 0, 0, 0, 0] as number[],
    ordersByTab: {
      all: [] as OrderCard[],
      toUse: [] as OrderCard[],
      valid: [] as OrderCard[],
      toPay: [] as OrderCard[],
      refund: [] as OrderCard[],
    } as Record<OrdersTabKey, OrderCard[]>,
  },
  lifetimes: {
    /**
     * 页面挂载时读取入口参数并同步 Tab 状态
     */
    attached() {
      const options = getRouteOptions()
      const initialKey = resolveInitialTabKey(options?.tab || '')
      const index = this.data.tabs.findIndex((t) => t.key === initialKey)
      const safeIndex = index >= 0 ? index : 0
      this.setData({
        activeKey: this.data.tabs[safeIndex].key,
        activeIndex: safeIndex,
      })
    },
  },
  pageLifetimes: {
    /**
     * 页面显示时同步外部指定的 Tab（适配原生 tabBar 的 switchTab）
     */
    show() {
      const nextKey = readInitialTabFromStorage()
      if (!nextKey) return
      const index = this.data.tabs.findIndex((t) => t.key === nextKey)
      const safeIndex = index >= 0 ? index : 0
      if (safeIndex === this.data.activeIndex && nextKey === this.data.activeKey) return
      this.setData({
        activeKey: nextKey,
        activeIndex: safeIndex,
      })
    },
  },
  methods: {
    onOpenOrderTitle() {
      wx.showToast({ title: '全部订单', icon: 'none' })
    },

    /**
     * 点击头像区域右侧菜单
     */
    onOpenHeaderMenu() {
      wx.showToast({ title: '更多操作', icon: 'none' })
    },

    onCloseTopbar() {
      wx.showToast({ title: '关闭', icon: 'none' })
    },

    /**
     * 点击顶部 Tab
     */
    onTapTab(e: WechatMiniprogram.TouchEvent) {
      const key = (e.currentTarget.dataset?.key || '') as OrdersTabKey
      if (!key || key === this.data.activeKey) return
      const index = this.data.tabs.findIndex((t) => t.key === key)
      const safeIndex = index >= 0 ? index : 0
      this.setData({
        activeKey: key,
        activeIndex: safeIndex,
      })
    },

    /**
     * 同步 swiper 切换（用户手势已禁用，但程序切换仍会触发）
     */
    onSwiperChange(e: WechatMiniprogram.SwiperChange) {
      const current = Number(e.detail?.current || 0)
      const safeIndex = Math.max(0, Math.min(this.data.tabs.length - 1, Number.isFinite(current) ? current : 0))
      const nextKey = this.data.tabs[safeIndex]?.key || 'all'
      if (nextKey === this.data.activeKey && safeIndex === this.data.activeIndex) return
      this.setData({
        activeKey: nextKey,
        activeIndex: safeIndex,
      })
    },

    /**
     * 失败重试（占位交互）
     */
    onRetry() {
      this.setData({ errorMessage: '', isLoading: false })
    },
  },
})
