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
    searchResults: [],
    hasSearched: false,
  },

  onLoad() {
    // 页面加载时的初始化逻辑
    this.initDate()
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

  methods: {
    onClearToPlace() {
      if (!this.data.toPlace) return
      this.setData({ toPlace: '' })
    },

    onUseMyLocation() {
      wx.showToast({ title: '定位中', icon: 'loading', duration: 1000 })
      // 模拟获取定位
      setTimeout(() => {
        this.setData({ fromCity: '当前定位城市' })
        wx.showToast({ title: '定位成功', icon: 'success' })
      }, 1000)
    },

    onOpenPeoplePicker() {
      wx.showActionSheet({
        itemList: ['1人', '2人', '3人', '4人'],
        success: (res) => {
          const peopleCount = parseInt(res.tapIndex) + 1
          wx.showToast({ title: `已选择${peopleCount}人`, icon: 'none' })
        },
        fail: () => {
          wx.showToast({ title: '取消选择', icon: 'none' })
        },
      })
    },

    onOpenPricePicker() {
      wx.showActionSheet({
        itemList: ['不限', '100-200元', '200-300元', '300元以上'],
        success: (res) => {
          const priceRanges = ['不限', '100-200元', '200-300元', '300元以上']
          wx.showToast({ title: `已选择${priceRanges[res.tapIndex]}`, icon: 'none' })
        },
        fail: () => {
          wx.showToast({ title: '取消选择', icon: 'none' })
        },
      })
    },

    onSearch() {
      if (this.data.isSearching) return
      if (!this.data.toPlace.trim()) {
        wx.showToast({ title: '请输入目的地', icon: 'none' })
        return
      }

      this.setData({
        isSearching: true,
        hasSearched: false,
        searchResults: [],
      })

      wx.showLoading({ title: '搜索中...' })

      // 模拟搜索请求
      setTimeout(() => {
        const mockResults = this.generateMockResults()
        this.setData({
          isSearching: false,
          hasSearched: true,
          searchResults: mockResults,
        })
        wx.hideLoading()

        if (mockResults.length > 0) {
          wx.showToast({ title: `找到${mockResults.length}个结果`, icon: 'success' })
        } else {
          wx.showToast({ title: '暂无搜索结果', icon: 'none' })
        }
      }, 1500)
    },

    // 生成模拟搜索结果
    generateMockResults() {
      const { toPlace } = this.data
      const results = []

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

    onGoSelectRoom(e) {
      const { item } = e.currentTarget.dataset
      if (item) {
        wx.navigateTo({
          url: `/pages/room-detail/room-detail?id=${item.id}&name=${item.name}&price=${item.price}`,
        })
      } else {
        wx.showToast({ title: '去选房', icon: 'none' })
      }
    },

    // 重新搜索
    onResetSearch() {
      this.setData({
        toPlace: '',
        hasSearched: false,
        searchResults: [],
      })
    },
  },
})
