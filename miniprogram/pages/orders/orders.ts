type OrdersTabKey = 'all' | 'toUse' | 'valid' | 'toPay' | 'refund'

type OrderCard = {
  id: string
  storeName: string
  status: string
  statusColor?: string
  image: string
  quantity: number
  amount: string
  countdown?: string
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

Page({
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
    scrollLeft: 0, // tabs滚动位置
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

  /**
   * 页面加载时读取入口参数并同步 Tab 状态
   */
  onLoad(options: Record<string, string>) {
    const initialKey = resolveInitialTabKey(options?.tab || '')
    const index = this.data.tabs.findIndex((t: any) => t.key === initialKey)
    const safeIndex = index >= 0 ? index : 0
    this.setData({
      activeKey: this.data.tabs[safeIndex].key,
      activeIndex: safeIndex,
    })
    // 立即加载数据，确保在真机上也能正常显示
    this.loadMockData()
  },

  /**
   * 页面初次渲染完成后加载数据
   */
  onReady() {
    console.log('[Orders] onReady 被调用')
    // 加载模拟数据
    this.loadMockData()
  },

  /**
   * 页面显示时同步外部指定的 Tab（适配原生 tabBar 的 switchTab）
   */
  onShow() {
    console.log('[Orders] onShow 被调用, 当前数据:', {
      ordersCountByIndex: this.data.ordersCountByIndex,
      activeIndex: this.data.activeIndex,
    })

    // 确保数据已加载（解决真机上的显示问题）
    if (this.data.ordersCountByIndex[0] === 0) {
      console.log('[Orders] 检测到数据未加载,重新加载')
      this.loadMockData()
    }

    const nextKey = readInitialTabFromStorage()
    if (!nextKey) return
    const index = this.data.tabs.findIndex((t: any) => t.key === nextKey)
    const safeIndex = index >= 0 ? index : 0
    if (safeIndex === this.data.activeIndex && nextKey === this.data.activeKey) return
    this.setData({
      activeKey: nextKey,
      activeIndex: safeIndex,
    })
  },

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
    const index = Number(e.currentTarget.dataset?.index || 0)
    const safeIndex = Math.max(0, Math.min(this.data.tabs.length - 1, index))
    if (safeIndex === this.data.activeIndex) return
    this.setData({
      activeIndex: safeIndex,
      activeKey: this.data.tabs[safeIndex].key,
    }, () => {
      // 滚动到选中的tab居中位置
      this.scrollTabIntoView(safeIndex)
    })
  },

  /**
   * 滚动到指定tab居中位置
   */
  scrollTabIntoView(index: number) {
    const query = this.createSelectorQuery()
    query.select('.tabs__scroll').boundingClientRect()
    query.selectAll('.tabs__btn').boundingClientRect()
    query.exec((res: any) => {
      if (!res || !res[0] || !res[1] || !res[1][index]) return

      const scrollView = res[0]
      const buttons = res[1]
      const targetButton = buttons[index]

      // 计算目标tab的中心位置
      const buttonCenter = targetButton.left - scrollView.left + targetButton.width / 2
      // 计算屏幕中心位置
      const screenCenter = scrollView.width / 2
      // 计算需要滚动的距离
      const scrollLeft = buttonCenter - screenCenter

      // 执行滚动
      this.setData({
        scrollLeft: Math.max(0, scrollLeft),
      })
    })
  },



  /**
   * 失败重试（占位交互）
   */
  onRetry() {
    this.setData({ errorMessage: '', isLoading: false })
  },

  /**
   * 加载模拟数据
   */
  loadMockData() {
    const mockOrders: OrderCard[] = [
      {
        id: '1',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待评价',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
      {
        id: '2',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待使用',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
      {
        id: '3',
        storeName: '蜗壳精选公寓（民治店）',
        status: '退款成功',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
    ]

    const toPayOrders: OrderCard[] = [
      {
        id: '4',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待支付，剩余30:00',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
        countdown: '30:00',
      },
      {
        id: '5',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待支付，剩余30:00',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
        countdown: '30:00',
      },
    ]

    const toUseOrders: OrderCard[] = [
      {
        id: '6',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待使用',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
      {
        id: '7',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待使用',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
    ]

    const validOrders: OrderCard[] = [
      {
        id: '8',
        storeName: '蜗壳精选公寓（民治店）',
        status: '待使用',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
    ]

    const refundOrders: OrderCard[] = [
      {
        id: '9',
        storeName: '蜗壳精选公寓（民治店）',
        status: '退款成功',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
      {
        id: '10',
        storeName: '蜗壳精选公寓（民治店）',
        status: '退款成功',
        image: '/images/orders/order-room.png',
        quantity: 1,
        amount: '300.00',
      },
    ]

    this.setData({
      ordersByIndex: [mockOrders, toUseOrders, validOrders, toPayOrders, refundOrders],
      ordersCountByIndex: [
        mockOrders.length,
        toUseOrders.length,
        validOrders.length,
        toPayOrders.length,
        refundOrders.length,
      ],
      'ordersByTab.all': mockOrders,
      'ordersByTab.toUse': toUseOrders,
      'ordersByTab.valid': validOrders,
      'ordersByTab.toPay': toPayOrders,
      'ordersByTab.refund': refundOrders,
    })

    // 调试日志:确认数据加载
    console.log('[Orders] 数据加载完成:', {
      ordersByIndex: this.data.ordersByIndex.map((arr: any[]) => arr.length),
      ordersCountByIndex: this.data.ordersCountByIndex,
      activeIndex: this.data.activeIndex,
      activeKey: this.data.activeKey,
    })
  },
})
