Component({
  data: {
    x: 0, // 初始 x 位置，将在 ready 中计算
    y: 0, // 初始 y 位置，将在 ready 中计算
  },

  lifetimes: {
    ready() {
      // 获取系统信息，计算右下角位置
      const systemInfo = wx.getSystemInfoSync()
      const windowWidth = systemInfo.windowWidth
      const windowHeight = systemInfo.windowHeight

      // 按钮宽高：120rpx = 120/2 = 60px
      const buttonSize = 60
      // 右侧间距：32rpx = 16px
      const rightMargin = 16
      // 底部间距：160rpx = 80px
      const bottomMargin = 60

      // 计算初始位置（右下角）
      const x = windowWidth - buttonSize - rightMargin
      const y = windowHeight - buttonSize - bottomMargin

      this.setData({ x, y })
    },
  },

  methods: {
    onTap() {
      wx.navigateTo({
        url: '/pages/smart-lock/smart-lock',
        fail: () => {
          wx.showToast({ title: '暂无法打开智能开锁', icon: 'none' })
        },
      })
    },
  },
})
