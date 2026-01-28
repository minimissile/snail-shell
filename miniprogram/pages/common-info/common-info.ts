Component({
  data: {
    name: 'Dimoo',
    phone: '86-185****0306',
    idCard: '4302************118',
  },
  methods: {
    onBack() {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({ url: '/pages/me-gold/me-gold' })
        },
      })
    },
    onMenu() {
      wx.showToast({ title: '菜单', icon: 'none' })
    },
    onClose() {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({ url: '/pages/me-gold/me-gold' })
        },
      })
    },
    onOpenCard() {
      wx.showToast({ title: '常用信息', icon: 'none' })
    },
    onAddTraveler() {
      wx.showToast({ title: '添加常用旅客', icon: 'none' })
    },
  },
})
