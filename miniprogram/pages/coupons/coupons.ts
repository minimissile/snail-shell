import { couponApi } from '../../api/index'
import type { CouponInfo, CouponStatus, CouponType } from '../../api/coupon'
import { isLoggedIn } from '../../utils/auth'

interface CouponItem {
  id: string
  type: CouponType
  status: CouponStatus
  iconSrc: string
  amount: string
  unit: string
  title: string
  description: string
  validPeriod: string
  isExpired: boolean
  isUsed: boolean
}

interface TabItem {
  id: CouponStatus | 'all'
  label: string
  count: number
}

Page({
  data: {
    statusBarHeight: 0,
    activeTab: 'all' as CouponStatus | 'all',
    isLoading: false,
    isEmpty: false,
    tabs: [
      { id: 'all', label: '全部', count: 0 },
      { id: 'unused', label: '可用', count: 0 },
      { id: 'used', label: '已使用', count: 0 },
      { id: 'expired', label: '已过期', count: 0 },
    ] as TabItem[],
    allCoupons: [] as CouponItem[],
    displayCoupons: [] as CouponItem[],
    page: 1,
    pageSize: 20,
    hasMore: true,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0,
    })
    this.loadCoupons()
  },

  onShow() {
    // 刷新优惠券列表
    if (isLoggedIn()) {
      this.loadCoupons()
    }
  },

  // 加载优惠券列表
  async loadCoupons() {
    if (!isLoggedIn()) {
      this.loadMockData()
      return
    }

    this.setData({ isLoading: true })

    try {
      // 加载所有状态的优惠券
      const [unusedResult, usedResult, expiredResult] = await Promise.all([
        couponApi.getMyCoupons({ status: 'unused', page: 1, pageSize: 50 }),
        couponApi.getMyCoupons({ status: 'used', page: 1, pageSize: 50 }),
        couponApi.getMyCoupons({ status: 'expired', page: 1, pageSize: 50 }),
      ])

      const unusedCoupons = unusedResult.items.map((c) => this.transformCoupon(c))
      const usedCoupons = usedResult.items.map((c) => this.transformCoupon(c))
      const expiredCoupons = expiredResult.items.map((c) => this.transformCoupon(c))

      const allCoupons = [...unusedCoupons, ...usedCoupons, ...expiredCoupons]

      // 更新 tabs 计数
      const tabs = this.data.tabs.map((tab) => {
        if (tab.id === 'all') return { ...tab, count: allCoupons.length }
        if (tab.id === 'unused') return { ...tab, count: unusedCoupons.length }
        if (tab.id === 'used') return { ...tab, count: usedCoupons.length }
        if (tab.id === 'expired') return { ...tab, count: expiredCoupons.length }
        return tab
      })

      this.setData({
        allCoupons,
        tabs,
        isEmpty: allCoupons.length === 0,
        isLoading: false,
      })

      this.filterCoupons()
    } catch (err) {
      console.error('加载优惠券失败:', err)
      this.setData({ isLoading: false })
      this.loadMockData()
    }
  },

  // 转换优惠券数据格式
  transformCoupon(coupon: CouponInfo): CouponItem {
    const iconMap: Record<CouponType, string> = {
      discount: '/assets/figma/coupons/coupon-icon-selection.svg',
      amount: '/assets/figma/coupons/coupon-icon-homestay.svg',
      gift: '/assets/figma/coupons/coupon-icon-hotel.svg',
    }

    const unitMap: Record<CouponType, string> = {
      discount: '折',
      amount: '¥',
      gift: '份',
    }

    const startDate = new Date(coupon.startTime)
    const endDate = new Date(coupon.endTime)
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    return {
      id: coupon.id,
      type: coupon.type,
      status: coupon.status,
      iconSrc: iconMap[coupon.type] || iconMap.amount,
      amount: coupon.type === 'discount' ? (coupon.value / 10).toFixed(1) : String(coupon.value),
      unit: unitMap[coupon.type] || '¥',
      title: coupon.name,
      description: coupon.description || `满${coupon.minAmount}可用`,
      validPeriod: `有效期:${formatDate(startDate)}至${formatDate(endDate)}`,
      isExpired: coupon.status === 'expired',
      isUsed: coupon.status === 'used',
    }
  },

  // 加载模拟数据
  loadMockData() {
    const mockCoupons: CouponItem[] = [
      {
        id: '1',
        type: 'amount',
        status: 'unused',
        iconSrc: '/assets/figma/coupons/coupon-icon-homestay.svg',
        amount: '20',
        unit: '¥',
        title: '新人专享券',
        description: '满100可用',
        validPeriod: '有效期:2024-02-27至2024-03-27',
        isExpired: false,
        isUsed: false,
      },
      {
        id: '2',
        type: 'discount',
        status: 'unused',
        iconSrc: '/assets/figma/coupons/coupon-icon-selection.svg',
        amount: '9.5',
        unit: '折',
        title: '会员专享折扣券',
        description: '全场通用',
        validPeriod: '有效期:2024-02-27至2024-04-27',
        isExpired: false,
        isUsed: false,
      },
      {
        id: '3',
        type: 'amount',
        status: 'used',
        iconSrc: '/assets/figma/coupons/coupon-icon-hotel.svg',
        amount: '30',
        unit: '¥',
        title: '限时优惠券',
        description: '满200可用',
        validPeriod: '有效期:2024-01-27至2024-02-27',
        isExpired: false,
        isUsed: true,
      },
    ]

    const tabs = this.data.tabs.map((tab) => {
      if (tab.id === 'all') return { ...tab, count: mockCoupons.length }
      if (tab.id === 'unused') return { ...tab, count: mockCoupons.filter((c) => c.status === 'unused').length }
      if (tab.id === 'used') return { ...tab, count: mockCoupons.filter((c) => c.status === 'used').length }
      if (tab.id === 'expired') return { ...tab, count: mockCoupons.filter((c) => c.status === 'expired').length }
      return tab
    })

    this.setData({
      allCoupons: mockCoupons,
      displayCoupons: mockCoupons,
      tabs,
      isEmpty: false,
    })
  },

  // 根据当前 tab 过滤优惠券
  filterCoupons() {
    const { activeTab, allCoupons } = this.data

    let displayCoupons: CouponItem[]
    if (activeTab === 'all') {
      displayCoupons = allCoupons
    } else {
      displayCoupons = allCoupons.filter((c) => c.status === activeTab)
    }

    this.setData({
      displayCoupons,
      isEmpty: displayCoupons.length === 0,
    })
  },

  // 切换 Tab
  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeTab: id })
    this.filterCoupons()
  },

  // 使用优惠券
  onUseCoupon(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    const coupon = this.data.allCoupons.find((c) => c.id === id)

    if (!coupon) return

    if (coupon.isUsed || coupon.isExpired) {
      wx.showToast({ title: '该优惠券不可用', icon: 'none' })
      return
    }

    // 跳转到门店列表使用优惠券
    wx.navigateTo({
      url: '/pages/nearby-stores/nearby-stores',
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCoupons().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 返回
  onGoBack() {
    wx.navigateBack()
  },

  // 菜单
  onMenu() {
    wx.showActionSheet({
      itemList: ['领取新优惠券', '优惠券使用规则'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({ title: '暂无可领取的优惠券', icon: 'none' })
        } else {
          wx.showModal({
            title: '优惠券使用规则',
            content:
              '1. 优惠券需在有效期内使用\n2. 每张优惠券仅限使用一次\n3. 部分优惠券有最低消费限制\n4. 优惠券不可转让、不可兑现',
            showCancel: false,
          })
        }
      },
    })
  },
})
