Component({
  data: {
    statusBarHeight: 0,
  },

  lifetimes: {
    attached(this: any) {
      // 获取系统状态栏高度
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 0,
      })
    },
  },
})
