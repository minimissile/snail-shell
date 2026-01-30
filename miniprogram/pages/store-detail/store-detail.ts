// 门店详情页
Page({
  data: {
    // 当前激活的标签页
    activeTab: 'cost' as 'overview' | 'listing' | 'review' | 'feature' | 'facility' | 'landlord' | 'process' | 'cost',

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

    // 收藏相关
    isFavorite: false,
    favoriteCount: 326,

    // 费用须知数据
    costRules: {
      deposit: {
        label: '押金',
        content: '¥200，下单后入住前通过平台支付，离店后\n原路退还，无纠纷不扣押',
        hasInfo: true,
      },
      extraPerson: {
        label: '加人',
        content: '标准入住6人，不可加人',
        hasInfo: false,
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

    // TODO: 根据标签页加载对应内容
    console.log('切换到标签页:', value)
  },

  // 旧的切换方法(保留兼容)
  onSwitchTab(e: any) {
    const { tab } = e.currentTarget.dataset
    this.setData({
      activeTab: tab,
    })

    // TODO: 根据标签页加载对应内容
    console.log('切换到标签页:', tab)
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

  // 打开微信
  onOpenWechat() {
    wx.showToast({
      title: '打开微信功能',
      icon: 'none',
      duration: 1500,
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
