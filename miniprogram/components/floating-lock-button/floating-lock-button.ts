Component({
  data: {
    x: 0,
    y: 0,
    show: false, // 控制显示，避免位置计算前的动画
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
  },

  lifetimes: {
    ready(this: any) {
      // 获取窗口信息，计算右下角位置
      const windowInfo = wx.getWindowInfo()
      const windowWidth = windowInfo.windowWidth
      const windowHeight = windowInfo.windowHeight

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
    onTouchStart(this: any, e: WechatMiniprogram.TouchEvent) {
      // 记录触摸开始位置和时间
      this.setData({
        touchStartX: e.touches[0].pageX,
        touchStartY: e.touches[0].pageY,
        touchStartTime: Date.now(),
      })
    },

    onTouchEnd(this: any, e: WechatMiniprogram.TouchEvent) {
      const data = this.data
      const touchEndX = e.changedTouches[0].pageX
      const touchEndY = e.changedTouches[0].pageY
      const touchEndTime = Date.now()

      // 计算移动距离和时间
      const moveX = Math.abs(touchEndX - data.touchStartX)
      const moveY = Math.abs(touchEndY - data.touchStartY)
      const moveTime = touchEndTime - data.touchStartTime

      // 如果移动距离小于10px且时间小于300ms，认为是点击
      if (moveX < 10 && moveY < 10 && moveTime < 300) {
        this.onTap()
      }
    },

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
