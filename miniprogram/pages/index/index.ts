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
          // 已授权，直接获取位置
          this.getLocation()
        } else if (res.authSetting['scope.userLocation'] === false) {
          // 用户之前拒绝过，引导打开设置
          wx.showModal({
            title: '需要位置权限',
            content: '请在设置中开启位置权限，以便搜索附近的门店',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting()
              }
            },
          })
        } else {
          // 未授权，第一次请求会自动弹出授权框
          this.getLocation()
        }
      },
      fail: () => {
        wx.showToast({ title: '获取授权信息失败', icon: 'none' })
      },
    })
  },

  // 获取地理位置
  getLocation() {
    wx.showLoading({ title: '定位中...', mask: true })

    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('定位成功:', res)
        // 模拟逆地理编码，获取城市名称
        this.setData({
          fromCity: '当前定位城市',
          toPlace: '附近',
        })
        wx.hideLoading()
        wx.showToast({ title: '定位成功', icon: 'success' })
      },
      fail: (err) => {
        console.log('定位失败:', err)
        wx.hideLoading()

        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '定位失败',
            content: '需要您的位置权限才能搜索附近的门店',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting()
              }
            },
          })
        } else {
          wx.showToast({
            title: '定位失败，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
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

  // 生成模拟搜索结果
  generateMockResults(): SearchResult[] {
    const { toPlace } = this.data
    const results: SearchResult[] = []

    // 根据目的地生成不同的模拟数据
    if (toPlace.includes('北站')) {
      results.push(
        { id: 1, name: `${toPlace}附近酒店A`, price: 188, rating: 4.5, distance: '200m' },
        { id: 2, name: `${toPlace}快捷酒店`, price: 128, rating: 4.2, distance: '500m' },
        { id: 3, name: `${toPlace}商务酒店`, price: 268, rating: 4.7, distance: '800m' }
      )
    } else if (toPlace.includes('机场')) {
      results.push(
        { id: 1, name: `${toPlace}机场酒店`, price: 298, rating: 4.3, distance: '1.2km' },
        { id: 2, name: `${toPlace}快捷宾馆`, price: 158, rating: 4.0, distance: '2.1km' }
      )
    } else {
      results.push(
        { id: 1, name: `${toPlace}舒适酒店`, price: 168, rating: 4.4, distance: '300m' },
        { id: 2, name: `${toPlace}精品民宿`, price: 218, rating: 4.6, distance: '600m' },
        { id: 3, name: `${toPlace}经济型酒店`, price: 98, rating: 3.9, distance: '400m' },
        { id: 4, name: `${toPlace}豪华酒店`, price: 388, rating: 4.8, distance: '1.5km' }
      )
    }

    return results
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
