Page({
  data: {
    navBarHeight: 44, // 导航栏高度
    capsuleHeight: 32, // 胶囊高度
    isLocked: true, // true: 关锁状态，false: 开锁状态
    hasNotification: true, // 是否显示红点
    isAnimating: false, // 是否正在动画中
  },

  onLoad() {
    // 获取胶囊按钮信息
    const menuButton = wx.getMenuButtonBoundingClientRect()
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0

    // 胶囊高度
    const capsuleHeight = menuButton.height
    // 导航栏高度 = (胶囊上边距 - 状态栏高度) * 2 + 胶囊高度
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + capsuleHeight

    this.setData({
      navBarHeight,
      capsuleHeight,
    })
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 设置
  onSettings() {
    wx.showToast({
      title: '设置',
      icon: 'none',
    })
  },

  // 开锁/关锁切换
  onToggleLock() {
    if (this.data.isAnimating) return

    this.setData({
      isAnimating: true,
    })

    // 添加震动反馈（较强）
    wx.vibrateShort({
      type: 'heavy',
    })

    // 显示加载提示
    wx.showLoading({
      title: this.data.isLocked ? '正在开锁...' : '正在关锁...',
      mask: true,
    })

    // 模拟开锁/关锁等待时间 1.5秒
    setTimeout(() => {
      // 切换状态
      this.setData({
        isLocked: !this.data.isLocked,
      })

      // 再次震动反馈（较轻）
      wx.vibrateShort({
        type: 'light',
      })

      // 隐藏加载并显示成功提示
      wx.hideLoading()
      // wx.showToast({
      //   title: this.data.isLocked ? '已关锁 🔒' : '已开锁 🔓',
      //   icon: 'success',
      //   duration: 1500,
      // })

      // 动画结束
      setTimeout(() => {
        this.setData({
          isAnimating: false,
        })
      }, 400)
    }, 1500) // 1.5秒等待时间
  },

  // 指纹管理
  onFingerprint() {
    wx.showToast({
      title: '指纹管理',
      icon: 'none',
    })
  },

  // 密码管理
  onPassword() {
    wx.showToast({
      title: '密码管理',
      icon: 'none',
    })
  },

  // 临时密码
  onTempPassword() {
    wx.showToast({
      title: '临时密码',
      icon: 'none',
    })
  },

  // 门锁事件
  onLockEvents() {
    wx.showToast({
      title: '门锁事件',
      icon: 'none',
    })
  },

  // 门卡管理
  onCardManagement() {
    wx.showToast({
      title: '门卡管理',
      icon: 'none',
    })
  },

  // 紧急联系人
  onEmergencyContact() {
    wx.showToast({
      title: '紧急联系人',
      icon: 'none',
    })
  },
})
