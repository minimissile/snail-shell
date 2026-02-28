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
    showLoginPopup: false,
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo()
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 0,
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
      this.setData({ isEmpty: true, allCoupons: [], displayCoupons: [], showLoginPopup: true })
      return
    }

    this.setData({ isLoading: true })

    try {
      // 加载所有状态的优惠券（后端使用 available 而非 unused）
      const [unusedResult, usedResult, expiredResult] = await Promise.all([
        couponApi.getMyCoupons({ status: 'available', page: 1, pageSize: 50 }),
        couponApi.getMyCoupons({ status: 'used', page: 1, pageSize: 50 }),
        couponApi.getMyCoupons({ status: 'expired', page: 1, pageSize: 50 }),
      ])

      // 后端返回 available 状态，前端显示为 unused
      const unusedCoupons = unusedResult.list.map((c) => this.transformCoupon({ ...c, status: 'unused' }))
      const usedCoupons = usedResult.list.map((c) => this.transformCoupon(c))
      const expiredCoupons = expiredResult.list.map((c) => this.transformCoupon(c))

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
      this.setData({ isLoading: false, isEmpty: true, allCoupons: [], displayCoupons: [] })
      wx.showToast({ title: '加载优惠券失败', icon: 'none' })
    }
  },

  // 转换优惠券数据格式（适配后端返回的字段）
  transformCoupon(coupon: any): CouponItem {
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

    // 后端返回 validFrom/validTo，前端使用 startTime/endTime
    const startDate = new Date(coupon.validFrom || coupon.startTime)
    const endDate = new Date(coupon.validTo || coupon.endTime)
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    // 后端返回 amount/discountRate，前端使用 value
    const value = coupon.value ?? coupon.amount ?? (coupon.discountRate ? coupon.discountRate * 100 : 0)
    const type = coupon.type as CouponType
    const status = (coupon.status === 'available' ? 'unused' : coupon.status) as CouponStatus

    return {
      id: coupon.id,
      type,
      status,
      iconSrc: iconMap[type] || iconMap.amount,
      amount: type === 'discount' ? (value / 10).toFixed(1) : String(value),
      unit: unitMap[type] || '¥',
      title: coupon.name,
      description: coupon.description || `满${coupon.minAmount}可用`,
      validPeriod: `有效期:${formatDate(startDate)}至${formatDate(endDate)}`,
      isExpired: status === 'expired',
      isUsed: status === 'used',
    }
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

  // 登录弹窗显示状态变化
  onLoginPopupVisibleChange(e: any) {
    this.setData({ showLoginPopup: e.detail.visible })
  },

  // 登录成功
  onLoginSuccess() {
    this.setData({ showLoginPopup: false })
    wx.showToast({ title: '登录成功', icon: 'success' })
    this.loadCoupons()
  },
})
