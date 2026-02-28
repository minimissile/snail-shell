Component({
  data: {
    statusBarHeight: 0,
  },

  lifetimes: {
    attached(this: any) {
      // 获取窗口信息中的状态栏高度
      const windowInfo = wx.getWindowInfo()
      this.setData({
        statusBarHeight: windowInfo.statusBarHeight || 0,
      })
    },
  },
})
