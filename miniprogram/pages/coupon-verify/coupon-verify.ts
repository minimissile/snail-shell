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

  // 识图验券（扫码验券）
  onImageRecognition() {
    wx.scanCode({
      onlyFromCamera: false, // 允许从相册选择二维码图片
      scanType: ['qrCode', 'barCode'], // 支持二维码和条形码
      success: (res) => {
        console.log('扫码成功，结果：', res)
        const { result, scanType, charSet, path } = res

        // 显示加载提示
        wx.showLoading({ title: '验证中...' })

        // TODO: 调用后端接口验证券码
        // 这里先模拟验证过程，实际应该调用后端API验证result中的券码
        setTimeout(() => {
          wx.hideLoading()

          // 临时显示扫码结果（开发调试用）
          console.log('券码内容:', result)
          console.log('扫码类型:', scanType)

          wx.showToast({
            title: '验证成功',
            icon: 'success',
          })

          // TODO: 根据验证结果跳转到验券结果页或显示验证信息
          // wx.navigateTo({
          //   url: `/pages/verify-result/verify-result?code=${result}`
          // })
        }, 1000)
      },
      fail: (err) => {
        console.log('扫码失败或取消：', err)

        // 用户取消扫码
        if (err.errMsg.includes('cancel')) {
          wx.showToast({
            title: '已取消扫码',
            icon: 'none',
            duration: 2000,
          })
        } else {
          // 其他错误
          wx.showToast({
            title: '扫码失败，请重试',
            icon: 'none',
            duration: 2000,
          })
        }
      },
    })
  },
})
