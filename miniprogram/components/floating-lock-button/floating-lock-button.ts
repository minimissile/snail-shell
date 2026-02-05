Component({
  data: {
    x: 0,
    y: 0,
    show: false, // 控制显示，避免位置计算前的动画
  },

  lifetimes: {
    ready(this: any) {
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

      // 设置位置并显示
      this.setData({ x, y, show: true })
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
