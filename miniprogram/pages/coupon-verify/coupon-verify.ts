Page({
  data: {
    storeName: '蜗壳精选民治店',
    distance: '310m',
  },

  onLoad() {
    // 页面加载时获取门店信息
    this.getStoreInfo()
  },

  // 获取门店信息
  getStoreInfo() {
    // TODO: 从服务器获取门店数据
    this.setData({
      storeName: '蜗壳精选民治店',
      distance: '310m',
    })
  },

  // 更换门店
  onChangeStore() {
    wx.showToast({
      title: '更换门店',
      icon: 'none',
    })
    // TODO: 跳转到门店选择页面
  },

  // 识图验券
  onImageRecognition() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // TODO: 调用图片识别接口
        wx.showLoading({ title: '识别中...' })

        // 模拟识别过程
        setTimeout(() => {
          wx.hideLoading()
          wx.showToast({
            title: '识别成功',
            icon: 'success',
          })
          // TODO: 跳转到验券结果页
        }, 1500)
      },
      fail: () => {
        wx.showToast({
          title: '取消选择',
          icon: 'none',
        })
      },
    })
  },
})
