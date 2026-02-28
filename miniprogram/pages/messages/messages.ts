import * as paymentApi from '../../api/payment'
import { isLoggedIn } from '../../utils/auth'

Page({
  data: {
    // 测试支付金额（单位：分）
    testAmount: '1',
    // 支付状态
    isPaying: false,
    // 登录弹窗
    showLoginPopup: false,
    // 最近支付结果
    lastPayResult: '',
  },

  onLoad() {},

  // 输入测试金额
  onAmountInput(e: WechatMiniprogram.Input) {
    this.setData({ testAmount: e.detail.value })
  },

  // 发起测试支付
  async onTestPayment() {
    const { testAmount, isPaying } = this.data

    if (isPaying) return

    // 验证金额
    const amount = parseInt(testAmount, 10)
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }

    // 检查登录状态
    if (!isLoggedIn()) {
      this.setData({ showLoginPopup: true })
      return
    }

    this.setData({ isPaying: true, lastPayResult: '' })

    try {
      // 1. 调用后端创建支付订单，获取支付参数
      const result = await paymentApi.createTestPayment(amount)

      // 2. 调用微信支付
      wx.requestPayment({
        timeStamp: result.payParams.timeStamp,
        nonceStr: result.payParams.nonceStr,
        package: result.payParams.package,
        signType: result.payParams.signType,
        paySign: result.payParams.paySign,
        success: () => {
          this.setData({
            lastPayResult: '支付成功',
            isPaying: false,
          })
          wx.showToast({ title: '支付成功', icon: 'success' })
        },
        fail: (err) => {
          console.error('支付失败:', err)
          const errorMsg = err.errMsg === 'requestPayment:fail cancel' ? '用户取消支付' : '支付失败'
          this.setData({
            lastPayResult: errorMsg,
            isPaying: false,
          })
          if (err.errMsg !== 'requestPayment:fail cancel') {
            wx.showToast({ title: '支付失败', icon: 'none' })
          }
        },
      })
    } catch (err: any) {
      console.error('创建支付订单失败:', err)
      this.setData({
        lastPayResult: `创建订单失败: ${err.message || '未知错误'}`,
        isPaying: false,
      })
      wx.showToast({ title: '创建支付订单失败', icon: 'none' })
    }
  },

  // 登录弹窗显示状态变化
  onLoginPopupVisibleChange(e: any) {
    this.setData({ showLoginPopup: e.detail.visible })
  },

  // 登录成功
  onLoginSuccess() {
    this.setData({ showLoginPopup: false })
    wx.showToast({ title: '登录成功', icon: 'success' })
  },
})
