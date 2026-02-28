// 门店详情页
import { storeApi, favoriteApi } from '../../api/index'
import type { StoreDetail, RoomInfo, ReviewInfo } from '../../api/store'
import { isLoggedIn } from '../../utils/auth'

Page({
  data: {
    storeId: '',
    isLoading: true,

    // 门店基础信息
    storeInfo: null as StoreDetail | null,
    rooms: [] as RoomInfo[],
    reviews: [] as ReviewInfo[],

    // 当前激活的标签页
    activeTab: 'overview' as
      | 'overview'
      | 'listing'
      | 'review'
      | 'feature'
      | 'facility'
      | 'landlord'
      | 'process'
      | 'cost',

    // 标签页列表
    tabs: [
      { id: 'overview', name: '概览' },
      { id: 'listing', name: '房源' },
      { id: 'review', name: '点评' },
      { id: 'feature', name: '特点' },
      { id: 'facility', name: '设施' },
      { id: 'landlord', name: '房东' },
      { id: 'process', name: '体验流程' },
      { id: 'cost', name: '费用须知' },
    ],

    // section位置信息
    sectionPositions: [] as Array<{ id: string; top: number; bottom: number }>,
    isScrollingToSection: false,

    // 收藏相关
    isFavorite: false,
    favoriteCount: 0,

    // 房东数据
    landlordData: {
      avatar: '/images/store-detail/snail.png',
      name: '蜗壳旗舰店',
      badge: '自然人房东｜实名验证｜1套房屋',
      rating: '暂无',
      reviewCount: 30,
      confirmRate: '100%',
    },

    // 费用须知数据
    costRules: {
      deposit: { amount: 200 },
      extraPerson: { text: '标准入住6人,不可加人' },
    },

    // 温馨提示
    tipText: '温馨提示：民宿不能聚会吵闹，不能做饭。因深圳天气炎热...',

    // 预订相关
    checkInDate: '',
    checkOutDate: '',
    currentPrice: 0,
    originalPrice: 0,
    selectedRoom: null as RoomInfo | null,

    // Header背景显示状态
    showHeaderBg: false,
    showLoginPopup: false,
  },

  onLoad(options) {
    const storeId = options.id || ''
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    this.setData({
      storeId,
      checkInDate: `${today.getMonth() + 1}-${today.getDate()}`,
      checkOutDate: `${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`,
    })

    if (storeId) {
      this.loadStoreData(storeId)
    } else {
      wx.showToast({ title: '门店ID缺失', icon: 'none' })
    }
  },

  onReady() {
    setTimeout(() => {
      this.calculateSectionPositions()
    }, 500)
  },

  // 加载门店数据
  async loadStoreData(storeId: string) {
    this.setData({ isLoading: true })

    try {
      const [storeInfo, rooms, reviewsResult] = await Promise.all([
        storeApi.getStoreDetail(storeId),
        storeApi.getRooms(storeId),
        storeApi.getReviews(storeId, { page: 1, pageSize: 5 }),
      ])

      const lowestRoom = rooms.reduce((min, room) => (room.price < min.price ? room : min), rooms[0])

      this.setData({
        storeInfo,
        rooms,
        reviews: reviewsResult.items,
        isFavorite: storeInfo.isFavorite || false,
        favoriteCount: storeInfo.reviewCount,
        currentPrice: lowestRoom?.price || 0,
        originalPrice: lowestRoom?.originalPrice || 0,
        selectedRoom: lowestRoom || null,
        landlordData: storeInfo.landlord
          ? {
              avatar: storeInfo.landlord.avatar || '/images/store-detail/snail.png',
              name: storeInfo.landlord.name,
              badge: storeInfo.landlord.badge,
              rating: '暂无',
              reviewCount: storeInfo.reviewCount,
              confirmRate: '100%',
            }
          : this.data.landlordData,
        isLoading: false,
      })
    } catch (err) {
      console.error('加载门店数据失败:', err)
      this.setData({ isLoading: false })
      wx.showToast({ title: '加载门店数据失败', icon: 'none' })
    }
  },

  // 计算各section的位置
  calculateSectionPositions() {
    const query = wx.createSelectorQuery()
    const sectionIds = ['overview', 'listing', 'review', 'feature', 'facility', 'landlord', 'process', 'cost']

    sectionIds.forEach((id) => {
      query.select(`#${id}-section`).boundingClientRect()
    })

    query.exec((res) => {
      const positions = res
        .filter((rect: any) => rect)
        .map((rect: any, index: number) => ({
          id: sectionIds[index],
          top: rect.top,
          bottom: rect.bottom,
        }))

      this.setData({ sectionPositions: positions })
    })
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      },
    })
  },

  // 切换标签页
  onTabChange(event: any) {
    const { value } = event.detail
    this.setData({ activeTab: value })
    this.scrollToSection(value)
  },

  // 滚动到指定section
  scrollToSection(sectionId: string) {
    this.setData({ isScrollingToSection: true })

    wx.pageScrollTo({
      selector: `#${sectionId}-section`,
      duration: 300,
      success: () => {
        setTimeout(() => {
          this.setData({ isScrollingToSection: false })
        }, 350)
      },
      fail: () => {
        this.setData({ isScrollingToSection: false })
      },
    })
  },

  // 监听页面滚动
  onPageScroll(e: any) {
    const scrollTop = e.scrollTop
    const shouldShowBg = scrollTop > 100

    if (this.data.showHeaderBg !== shouldShowBg) {
      this.setData({ showHeaderBg: shouldShowBg })
    }

    if (this.data.isScrollingToSection) return

    const { sectionPositions } = this.data
    for (let i = 0; i < sectionPositions.length; i++) {
      const section = sectionPositions[i]
      const nextSection = sectionPositions[i + 1]

      if (!nextSection || scrollTop < nextSection.top - 100) {
        if (this.data.activeTab !== section.id) {
          this.setData({ activeTab: section.id as any })
        }
        break
      }
    }
  },

  // 收藏/取消收藏
  async onToggleFavorite() {
    if (!isLoggedIn()) {
      this.setData({ showLoginPopup: true })
      return
    }

    const { storeId, isFavorite, favoriteCount } = this.data

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(storeId)
      } else {
        await favoriteApi.addFavorite(storeId)
      }

      this.setData({
        isFavorite: !isFavorite,
        favoriteCount: isFavorite ? favoriteCount - 1 : favoriteCount + 1,
      })

      wx.showToast({
        title: isFavorite ? '已取消收藏' : '已收藏',
        icon: 'success',
      })
    } catch (err) {
      console.error('收藏操作失败:', err)
      // 本地切换
      this.setData({
        isFavorite: !isFavorite,
        favoriteCount: isFavorite ? favoriteCount - 1 : favoriteCount + 1,
      })
    }
  },

  // 选择房型
  onSelectRoom(e: WechatMiniprogram.TouchEvent) {
    const roomId = e.currentTarget.dataset.id
    const room = this.data.rooms.find((r) => r.id === roomId)
    if (room) {
      this.setData({
        selectedRoom: room,
        currentPrice: room.price,
        originalPrice: room.originalPrice,
      })
    }
  },

  // 实景选房
  onSceneSelection() {
    wx.navigateTo({
      url: `/pages/room-selection/room-selection?storeId=${this.data.storeId}`,
    })
  },

  // 立即预订
  onBookNow() {
    const { storeId, selectedRoom, checkInDate, checkOutDate } = this.data

    if (!selectedRoom) {
      wx.showToast({ title: '请选择房型', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: `/pages/order-form/order-form?storeId=${storeId}&roomId=${selectedRoom.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}`,
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      },
    })
  },

  // 查看地图
  onViewMap() {
    const { storeInfo } = this.data
    if (!storeInfo) return

    wx.openLocation({
      latitude: storeInfo.latitude,
      longitude: storeInfo.longitude,
      name: storeInfo.name,
      address: storeInfo.address,
    })
  },

  // 拨打电话
  onCallPhone() {
    const { storeInfo } = this.data
    if (!storeInfo?.phone) return

    wx.makePhoneCall({
      phoneNumber: storeInfo.phone,
    })
  },

  // 分享
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  },

  onShareAppMessage() {
    const { storeInfo } = this.data
    return {
      title: storeInfo?.name || '蜗壳青旅',
      path: `/pages/store-detail/store-detail?id=${this.data.storeId}`,
      imageUrl: storeInfo?.images[0] || '',
    }
  },

  // 团购验券
  onCouponVerify() {
    wx.navigateTo({ url: '/pages/coupon-verify/coupon-verify' })
  },

  // 门店储值
  onBalance() {
    wx.navigateTo({ url: '/pages/balance/balance' })
  },

  // 查看优惠券
  onViewCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' })
  },

  // 其他事件处理（保持原有功能）
  onOpenWechat() {
    wx.showToast({ title: '微信功能', icon: 'none' })
  },

  onVideoTour() {
    wx.showToast({ title: '实拍看房', icon: 'none' })
  },

  onViewReviews() {
    wx.showToast({ title: '查看全部点评', icon: 'none' })
  },

  onViewAllRules() {
    wx.showToast({ title: '查看全部须知', icon: 'none' })
  },

  onViewAllProcess() {
    wx.showToast({ title: '查看全部流程', icon: 'none' })
  },

  onExpandFeature() {
    wx.showToast({ title: '展开查看全部特点', icon: 'none' })
  },

  onViewAllFacilities() {
    wx.showToast({ title: '查看全部设施', icon: 'none' })
  },

  onViewAllReviews() {
    wx.showToast({ title: '查看全部点评', icon: 'none' })
  },

  onViewLandlordPage() {
    wx.showToast({ title: '查看房东主页', icon: 'none' })
  },

  onContactLandlord() {
    this.onCallPhone()
  },

  onSelectDate() {
    wx.showToast({ title: '选择日期功能', icon: 'none' })
  },

  onWifi() {
    wx.showToast({ title: 'Wi-Fi连接功能', icon: 'none' })
  },

  // 登录弹窗显示状态变化
  onLoginPopupVisibleChange(e: any) {
    this.setData({ showLoginPopup: e.detail.visible })
  },

  // 登录成功
  onLoginSuccess() {
    this.setData({ showLoginPopup: false })
    wx.showToast({ title: '登录成功', icon: 'success' })
  },

  onBookRoom() {
    this.onBookNow()
  },
})
