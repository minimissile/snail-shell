import { orderApi } from '../../api/index'
import type { OrderInfo, OrderStatus, GetOrdersParams } from '../../api/order'
import { isLoggedIn } from '../../utils/auth'

type OrdersTabKey = 'all' | 'toUse' | 'valid' | 'toPay' | 'refund'

type OrderCard = {
  id: string
  orderNo: string
  storeName: string
  status: string
  statusKey: OrderStatus
  statusColor?: string
  image: string
  quantity: number
  amount: string
  countdown?: string
  checkIn: string
  checkOut: string
}

// Tab 映射到 API status
const TAB_TO_STATUS: Record<OrdersTabKey, OrderStatus | 'all'> = {
  all: 'all',
  toUse: 'confirmed',
  valid: 'paid',
  toPay: 'pending',
  refund: 'refunding',
}

// 订单状态映射
const STATUS_TEXT: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  confirmed: '待使用',
  checkedIn: '入住中',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
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
 * 从本地缓存读取外部指定的初始 Tab
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
    scrollLeft: 0,
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
    page: 1,
    pageSize: 10,
    hasMore: true,
  },

  onLoad(options: Record<string, string>) {
    const initialKey = resolveInitialTabKey(options?.tab || '')
    const index = this.data.tabs.findIndex((t: any) => t.key === initialKey)
    const safeIndex = index >= 0 ? index : 0
    this.setData({
      activeKey: this.data.tabs[safeIndex].key,
      activeIndex: safeIndex,
    })
    this.loadOrders()
  },

  onReady() {
    console.log('[Orders] onReady')
  },

  onShow() {
    const nextKey = readInitialTabFromStorage()
    if (nextKey && nextKey !== this.data.activeKey) {
      const index = this.data.tabs.findIndex((t: any) => t.key === nextKey)
      const safeIndex = index >= 0 ? index : 0
      this.setData({
        activeKey: nextKey,
        activeIndex: safeIndex,
      })
      this.loadOrders()
    }
  },

  // 加载订单列表
  async loadOrders(isRefresh = true) {
    if (!isLoggedIn()) {
      this.setData({
        ordersByIndex: [[], [], [], [], []],
        ordersCountByIndex: [0, 0, 0, 0, 0],
      })
      return
    }

    if (this.data.isLoading) return
    if (!isRefresh && !this.data.hasMore) return

    this.setData({ isLoading: true })

    try {
      const status = TAB_TO_STATUS[this.data.activeKey]
      const params: GetOrdersParams = {
        status: status === 'all' ? undefined : status,
        page: isRefresh ? 1 : this.data.page,
        pageSize: this.data.pageSize,
      }

      const result = await orderApi.getOrders(params)
      const newOrders = result.items.map((order) => this.transformOrderData(order))

      // 更新当前 tab 的订单列表
      const currentKey = this.data.activeKey
      const currentIndex = this.data.activeIndex

      const ordersByTab = { ...this.data.ordersByTab }
      ordersByTab[currentKey] = isRefresh ? newOrders : [...ordersByTab[currentKey], ...newOrders]

      const ordersByIndex = [...this.data.ordersByIndex]
      ordersByIndex[currentIndex] = ordersByTab[currentKey]

      const ordersCountByIndex = [...this.data.ordersCountByIndex]
      ordersCountByIndex[currentIndex] = ordersByTab[currentKey].length

      this.setData({
        ordersByTab,
        ordersByIndex,
        ordersCountByIndex,
        page: (isRefresh ? 1 : this.data.page) + 1,
        hasMore: result.items.length === this.data.pageSize,
        isLoading: false,
      })
    } catch (err) {
      console.error('加载订单失败:', err)
      this.setData({ isLoading: false })
      wx.showToast({ title: '加载订单失败', icon: 'none' })
    }
  },

  // 转换订单数据格式
  transformOrderData(order: OrderInfo): OrderCard {
    return {
      id: order.id,
      orderNo: order.orderNo,
      storeName: order.storeName,
      status: order.statusText || STATUS_TEXT[order.status],
      statusKey: order.status,
      image: order.storeImage || '/images/orders/order-room.png',
      quantity: order.bedIds.length || 1,
      amount: order.totalAmount.toFixed(2),
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      countdown: order.status === 'pending' ? '30:00' : undefined,
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadOrders(false)
  },

  onOpenOrderTitle() {
    wx.showToast({ title: '全部订单', icon: 'none' })
  },

  onOpenHeaderMenu() {
    wx.showToast({ title: '更多操作', icon: 'none' })
  },

  onCloseTopbar() {
    wx.showToast({ title: '关闭', icon: 'none' })
  },

  onTapTab(e: WechatMiniprogram.TouchEvent) {
    const index = Number(e.currentTarget.dataset?.index || 0)
    const safeIndex = Math.max(0, Math.min(this.data.tabs.length - 1, index))
    if (safeIndex === this.data.activeIndex) return
    this.setData(
      {
        activeIndex: safeIndex,
        activeKey: this.data.tabs[safeIndex].key,
        page: 1,
        hasMore: true,
      },
      () => {
        this.scrollTabIntoView(safeIndex)
        this.loadOrders(true)
      }
    )
  },

  scrollTabIntoView(index: number) {
    const query = this.createSelectorQuery()
    query.select('.tabs__scroll').boundingClientRect()
    query.selectAll('.tabs__btn').boundingClientRect()
    query.exec((res: any) => {
      if (!res || !res[0] || !res[1] || !res[1][index]) return
      const scrollView = res[0]
      const buttons = res[1]
      const targetButton = buttons[index]
      const buttonCenter = targetButton.left - scrollView.left + targetButton.width / 2
      const screenCenter = scrollView.width / 2
      const scrollLeft = buttonCenter - screenCenter
      this.setData({ scrollLeft: Math.max(0, scrollLeft) })
    })
  },

  // 点击订单卡片
  onTapOrderCard(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset?.id
    if (!id) return
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`,
      fail: () => {
        wx.showToast({ title: '订单详情页开发中', icon: 'none' })
      },
    })
  },

  // 支付订单
  async onPayOrder(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset?.id
    if (!id) return

    try {
      const result = await orderApi.payOrder(id, { paymentMethod: 'wechat' })
      if (result.payParams) {
        // 调用微信支付
        wx.requestPayment({
          ...result.payParams,
          success: () => {
            wx.showToast({ title: '支付成功', icon: 'success' })
            this.loadOrders(true)
          },
          fail: () => {
            wx.showToast({ title: '支付取消', icon: 'none' })
          },
        })
      } else {
        wx.showToast({ title: '支付成功', icon: 'success' })
        this.loadOrders(true)
      }
    } catch (err) {
      console.error('支付失败:', err)
    }
  },

  // 取消订单
  async onCancelOrder(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset?.id
    if (!id) return

    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderApi.cancelOrder(id)
            wx.showToast({ title: '已取消', icon: 'success' })
            this.loadOrders(true)
          } catch (err) {
            console.error('取消订单失败:', err)
          }
        }
      },
    })
  },

  onRetry() {
    this.setData({ errorMessage: '', isLoading: false })
    this.loadOrders(true)
  },
})
