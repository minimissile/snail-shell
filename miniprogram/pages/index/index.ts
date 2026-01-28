Component({
  data: {
    fromCity: '深圳',
    toPlace: '深圳北站',
    checkInDateMain: '11月14日',
    checkInDateSub: '今天',
    checkOutDateMain: '11月15日',
    checkOutDateSub: '明天',
    nights: 1,
    isSearching: false,
  },
  methods: {
    onClearToPlace() {
      if (!this.data.toPlace) return
      this.setData({ toPlace: '' })
    },
    onUseMyLocation() {
      wx.showToast({ title: '定位中', icon: 'loading', duration: 800 })
    },
    onOpenPeoplePicker() {
      wx.showToast({ title: '暂未开放', icon: 'none' })
    },
    onOpenPricePicker() {
      wx.showToast({ title: '暂未开放', icon: 'none' })
    },
    onSearch() {
      if (this.data.isSearching) return
      this.setData({ isSearching: true })
      wx.showToast({ title: '开始搜索', icon: 'none', duration: 800 })
      setTimeout(() => {
        this.setData({ isSearching: false })
      }, 800)
    },
    onGoSelectRoom() {
      wx.showToast({ title: '去选房', icon: 'none' })
    },
  },
})
