// 门店详情页
Page({
  data: {
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

    // 是否正在滚动到指定位置(防止滚动时触发tab切换)
    isScrollingToSection: false,

    // 收藏相关
    isFavorite: false,
    favoriteCount: 326,

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
      deposit: {
        amount: 200,
      },
      extraPerson: {
        text: '标准入住6人,不可加人',
      },
    },

    // 温馨提示
    tipText: '温馨提示：民宿不能聚会吵闹，不能做饭。因深圳天气炎热...',

    // 预订相关
    checkInDate: '11-19',
    checkOutDate: '11-20',
    currentPrice: 468,
    originalPrice: 669,
  },

  onLoad() {
    console.log('门店详情页加载')
      
    // 计算各section位置
    setTimeout(() => {
      this.calculateSectionPositions()
    }, 500)
  },

  onReady() {
    // 监听页面滚动
    this.setupScrollListener()
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
      console.log('Section位置:', positions)
    })
  },

  // 设置滚动监听
  setupScrollListener() {
    // 小程序使用onPageScroll监听页面滚动
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果没有上一页,返回首页
        wx.switchTab({
          url: '/pages/index/index',
        })
      },
    })
  },

  // 切换标签页 - TDesign Tabs 组件事件
  onTabChange(event: any) {
    const { value } = event.detail
    this.setData({
      activeTab: value,
    })

    // 滚动到对应section
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
    // 如果正在执行点击滚动,不更新tab
    if (this.data.isScrollingToSection) return
    
    const scrollTop = e.scrollTop
    const { sectionPositions } = this.data
    
    // 找到当前可视区域的section
    for (let i = 0; i < sectionPositions.length; i++) {
      const section = sectionPositions[i]
      const nextSection = sectionPositions[i + 1]

      // 如果是最后一个section或者scrollTop在当前section范围内
      if (!nextSection || scrollTop < nextSection.top - 100) {
        const newTab = section.id as
          | 'overview'
          | 'listing'
          | 'review'
          | 'feature'
          | 'facility'
          | 'landlord'
          | 'process'
          | 'cost'
        if (this.data.activeTab !== newTab) {
          this.setData({ activeTab: newTab })
        }
        break
      }
    }
  },

  // 收藏/取消收藏
  onToggleFavorite() {
    const newFavoriteState = !this.data.isFavorite
    const newCount = newFavoriteState ? this.data.favoriteCount + 1 : this.data.favoriteCount - 1

    this.setData({
      isFavorite: newFavoriteState,
      favoriteCount: newCount,
    })

    wx.showToast({
      title: newFavoriteState ? '已收藏' : '已取消收藏',
      icon: 'success',
      duration: 1500,
    })
  },

  // 微信按钮
  onOpenWechat() {
    wx.showToast({
      title: '微信功能',
      icon: 'none',
    })
  },

  // 实拍看房
  onVideoTour() {
    wx.showToast({
      title: '实拍看房',
      icon: 'none',
    })
  },

  // 查看地图
  onViewMap() {
    wx.showToast({
      title: '查看地图',
      icon: 'none',
    })
  },

  // 查看评价
  onViewReviews() {
    wx.navigateTo({
      url: '/pages/reviews/reviews',
      fail: () => {
        wx.showToast({ title: '评价页面开发中', icon: 'none' })
      },
    })
  },

  // 预订房间
  onBookRoom() {
    wx.showModal({
      title: '确认预订',
      content: `房型: 男生四人位\n价格: ¥468`,
      confirmText: '确认预订',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '预订成功', icon: 'success' })
        }
      },
    })
  },

  // 团购验券
  onCouponVerify() {
    wx.navigateTo({
      url: '/pages/coupon-verify/coupon-verify',
      fail: () => {
        wx.showToast({ title: '团购验券页面开发中', icon: 'none' })
      },
    })
  },

  // 门店储值
  onBalance() {
    wx.navigateTo({
      url: '/pages/balance/balance',
      fail: () => {
        wx.showToast({ title: '储值页面开发中', icon: 'none' })
      },
    })
  },

  // Wi-Fi连接
  onWifi() {
    wx.showToast({
      title: 'Wi-Fi连接功能',
      icon: 'none',
    })
  },

  // 查看优惠券
  onViewCoupons() {
    wx.navigateTo({
      url: '/pages/coupons/coupons',
      fail: () => {
        wx.showToast({ title: '优惠券页面开发中', icon: 'none' })
      },
    })
  },

  // 查看全部须知
  onViewAllRules() {
    wx.showToast({
      title: '查看全部须知',
      icon: 'none',
      duration: 1500,
    })
  },

  // 查看全部流程
  onViewAllProcess() {
    wx.showToast({
      title: '查看全部流程',
      icon: 'none',
      duration: 1500,
    })
  },

  // 展开查看特点全部内容
  onExpandFeature() {
    wx.showToast({
      title: '展开查看全部特点',
      icon: 'none',
      duration: 1500,
    })
  },

  // 查看全部设施
  onViewAllFacilities() {
    wx.showToast({
      title: '查看全部设施',
      icon: 'none',
      duration: 1500,
    })
  },

  // 查看全部点评
  onViewAllReviews() {
    wx.showToast({
      title: '查看全部点评',
      icon: 'none',
      duration: 1500,
    })
  },

  // 查看房东主页
  onViewLandlordPage() {
    wx.showToast({
      title: '查看房东主页',
      icon: 'none',
      duration: 1500,
    })
  },

  // 联系房东
  onContactLandlord() {
    wx.showToast({
      title: '联系房东',
      icon: 'none',
      duration: 1500,
    })
  },

  // 选择日期
  onSelectDate() {
    wx.showToast({
      title: '选择日期功能',
      icon: 'none',
      duration: 1500,
    })
  },

  // 实景选房
  onSceneSelection() {
    wx.navigateTo({
      url: '/pages/room-selection/room-selection',
    })
  },

  // 立即预订
  onBookNow() {
    const { checkInDate, checkOutDate, currentPrice } = this.data

    wx.showModal({
      title: '确认预订',
      content: `入住日期: ${checkInDate}\n离店日期: ${checkOutDate}\n总价: ¥${currentPrice}`,
      confirmText: '确认预订',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '预订成功',
            icon: 'success',
            duration: 2000,
          })
        }
      },
    })
  },
})
