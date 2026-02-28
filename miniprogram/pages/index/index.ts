interface SearchResult {
  id: number
  name: string
  price: number
  rating: number
  distance: string
}

Page({
  data: {
    fromCity: '深圳',
    toPlace: '深圳北站',
    checkInDateMain: '11月14日',
    checkInDateSub: '今天',
    checkOutDateMain: '11月15日',
    checkOutDateSub: '明天',
    nights: 1,
    isSearching: false,
    searchResults: [] as SearchResult[],
    hasSearched: false,
  },

  onLoad() {
    // 页面加载时的初始化逻辑
    this.initDate()
  },

  // 阻止header区域点击事件传递
  onHeaderTap() {
    // 阻止事件冒泡，不做任何操作
  },

  // 初始化日期数据
  initDate() {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = `${today.getMonth() + 1}月${today.getDate()}日`
    const tomorrowStr = `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日`

    this.setData({
      checkInDateMain: todayStr,
      checkInDateSub: '今天',
      checkOutDateMain: tomorrowStr,
      checkOutDateSub: '明天',
    })
  },

  onClearToPlace() {
    if (!this.data.toPlace) return
    this.setData({ toPlace: '' })
  },

  // 输入目的地
  onInputDestination(e: any) {
    this.setData({
      toPlace: e.detail.value,
    })
  },

  // 输入框聚焦
  onInputFocus() {
    // 可以在这里显示搜索历史或热门目的地
    console.log('输入框聚焦')
  },

  // 输入框失焦
  onInputBlur() {
    console.log('输入框失焦')
  },

  // 选择城市
  onSelectCity() {
    wx.showActionSheet({
      itemList: ['深圳', '广州', '上海', '北京', '杭州'],
      success: (res) => {
        const cities = ['深圳', '广州', '上海', '北京', '杭州']
        this.setData({ fromCity: cities[res.tapIndex] })
      },
    })
  },

  // 快捷标签点击
  onChipTap(e: any) {
    const place = e.currentTarget.dataset.place
    if (place) {
      this.setData({ toPlace: place })
    }
  },

  // 积分当钱花点击
  onPointsTap() {
    wx.showToast({
      title: '积分功能开发中',
      icon: 'none',
    })
    // TODO: 跳转到积分页面
  },

  onUseMyLocation() {
    console.log('===== 点击了我的位置按钮 =====')

    // 先检查授权状态
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          // 已授权，直接打开地图选点
          this.openLocationPicker()
        } else if (res.authSetting['scope.userLocation'] === false) {
          // 用户之前拒绝过，引导打开设置
          wx.showModal({
            title: '需要位置权限',
            content: '请在设置中开启位置权限，以便选择位置',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting()
              }
            },
          })
        } else {
          // 未授权，第一次请求会自动弹出授权框
          this.openLocationPicker()
        }
      },
      fail: () => {
        wx.showToast({ title: '获取授权信息失败', icon: 'none' })
      },
    })
  },

  // 打开地图选点
  openLocationPicker() {
    wx.chooseLocation({
      success: (res) => {
        console.log('选点成功:', res)
        // 将选择的位置名称填充到目的地输入框
        const locationName = res.name || res.address || ''
        if (locationName) {
          this.setData({
            toPlace: locationName,
          })
          wx.showToast({ title: '已选择位置', icon: 'success' })
        }
      },
      fail: (err) => {
        console.log('选点失败或取消:', err)
        // 用户取消选择不提示错误
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          if (err.errMsg.includes('auth deny')) {
            wx.showModal({
              title: '需要位置权限',
              content: '请在设置中开启位置权限，以便选择位置',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              },
            })
          } else {
            wx.showToast({
              title: '选择位置失败',
              icon: 'none',
            })
          }
        }
      },
    })
  },

  // 打开日期选择器
  onOpenDatePicker() {
    wx.showToast({
      title: '日期选择器开发中',
      icon: 'none',
    })
    // TODO: 实现日期选择器
  },

  onOpenPeoplePicker() {
    wx.showActionSheet({
      itemList: ['1人 1床', '2人 1床', '2人 2床', '3人 2床', '4人 2床', '4人 4床'],
      success: (res) => {
        const options = ['1人 1床', '2人 1床', '2人 2床', '3人 2床', '4人 2床', '4人 4床']
        wx.showToast({ title: `已选择${options[res.tapIndex]}`, icon: 'none' })
      },
    })
  },

  onOpenPricePicker() {
    wx.showActionSheet({
      itemList: ['不限', '100元以下', '100-200元', '200-300元', '300-500元', '500元以上'],
      success: (res) => {
        const priceRanges = ['不限', '100元以下', '100-200元', '200-300元', '300-500元', '500元以上']
        wx.showToast({ title: `已选择${priceRanges[res.tapIndex]}`, icon: 'none' })
      },
    })
  },

  onSearch() {
    if (this.data.isSearching) return
    if (!this.data.toPlace.trim()) {
      wx.showToast({ title: '请输入目的地', icon: 'none' })
      return
    }

    // 直接跳转到附近门店页面，传递搜索参数
    wx.navigateTo({
      url: `/pages/nearby-stores/nearby-stores?destination=${encodeURIComponent(this.data.toPlace)}&city=${encodeURIComponent(this.data.fromCity)}&checkIn=${encodeURIComponent(this.data.checkInDateMain)}&checkOut=${encodeURIComponent(this.data.checkOutDateMain)}`,
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      },
    })
  },

  onGoSelectRoom() {
    // 跳转到附近门店页面（附近房源）
    wx.navigateTo({
      url: '/pages/nearby-stores/nearby-stores',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      },
    })
  },

  // 跳转到团购验券页面
  onGoGroupBuy() {
    wx.navigateTo({
      url: '/pages/coupon-verify/coupon-verify',
    })
  },

  // 重新搜索
  onResetSearch() {
    this.setData({
      toPlace: '',
      hasSearched: false,
      searchResults: [],
    })
  },
})
