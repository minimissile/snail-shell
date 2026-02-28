import { balanceApi } from '../../api/index'
import type { BalanceInfo, BalanceRecord } from '../../api/index'

Page({
  data: {
    cashbackAmount: '0.00',
    balanceAmount: '0.00',
    consumptionAmount: '0.00',
    loading: false,
    // 余额记录
    records: [] as BalanceRecord[],
    showRecords: false,
  },

  onLoad() {
    this.fetchBalanceData()
  },

  onShow() {
    // 每次显示时刷新数据
    this.fetchBalanceData()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchBalanceData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 获取余额数据
  async fetchBalanceData() {
    this.setData({ loading: true })

    try {
      const balanceInfo = await balanceApi.getBalance()
      this.setData({
        balanceAmount: balanceInfo.balance.toFixed(2),
        cashbackAmount: (balanceInfo.totalRecharge * 0.1).toFixed(2), // 返现一般是充值的一定比例
        consumptionAmount: balanceInfo.totalConsume.toFixed(2),
      })
    } catch (error) {
      console.error('获取余额失败:', error)
      // 使用模拟数据
      this.setData({
        cashbackAmount: '0.00',
        balanceAmount: '0.00',
        consumptionAmount: '0.00',
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 点击返现卡片
  async onCashbackTap() {
    wx.showLoading({ title: '加载中...', mask: true })

    try {
      const result = await balanceApi.getBalanceRecords({ type: 'gift', pageSize: 20 })
      wx.hideLoading()

      if (result.list.length === 0) {
        wx.showToast({ title: '暂无返现记录', icon: 'none' })
        return
      }

      // 显示返现记录列表
      const recordList = result.list.map((r) => `${r.description}: +¥${r.amount.toFixed(2)}`).join('\n')

      wx.showModal({
        title: '返现记录',
        content: recordList || '暂无记录',
        showCancel: false,
      })
    } catch (error) {
      wx.hideLoading()
      console.error('获取返现记录失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 点击余额卡片
  async onBalanceTap() {
    wx.showLoading({ title: '加载中...', mask: true })

    try {
      const result = await balanceApi.getBalanceRecords({ pageSize: 20 })
      wx.hideLoading()

      if (result.list.length === 0) {
        wx.showToast({ title: '暂无余额记录', icon: 'none' })
        return
      }

      // 显示余额记录列表
      const recordList = result.list
        .map((r) => {
          const sign = r.type === 'consume' ? '-' : '+'
          return `${r.description}: ${sign}¥${Math.abs(r.amount).toFixed(2)}`
        })
        .join('\n')

      wx.showModal({
        title: '余额记录',
        content: recordList || '暂无记录',
        showCancel: false,
      })
    } catch (error) {
      wx.hideLoading()
      console.error('获取余额记录失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 点击消费金卡片
  async onConsumptionTap() {
    wx.showLoading({ title: '加载中...', mask: true })

    try {
      const result = await balanceApi.getBalanceRecords({ type: 'consume', pageSize: 20 })
      wx.hideLoading()

      if (result.list.length === 0) {
        wx.showToast({ title: '暂无消费记录', icon: 'none' })
        return
      }

      // 显示消费记录列表
      const recordList = result.list.map((r) => `${r.description}: -¥${Math.abs(r.amount).toFixed(2)}`).join('\n')

      wx.showModal({
        title: '消费记录',
        content: recordList || '暂无记录',
        showCancel: false,
      })
    } catch (error) {
      wx.hideLoading()
      console.error('获取消费记录失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 充值
  async onRecharge() {
    try {
      // 获取充值套餐
      const packages = await balanceApi.getRechargePackages()

      if (packages.length === 0) {
        wx.showToast({ title: '暂无充值套餐', icon: 'none' })
        return
      }

      // 显示充值套餐选择
      const packageNames = packages.map((p) => `¥${p.amount}${p.giftAmount > 0 ? ` (送¥${p.giftAmount})` : ''}`)

      wx.showActionSheet({
        itemList: packageNames,
        success: async (res) => {
          const selectedPackage = packages[res.tapIndex]
          wx.showLoading({ title: '处理中...', mask: true })

          try {
            const result = await balanceApi.recharge(selectedPackage.id)
            wx.hideLoading()

            // 调用微信支付
            if (result.payParams) {
              wx.requestPayment({
                ...result.payParams,
                success: () => {
                  wx.showToast({ title: '充值成功', icon: 'success' })
                  this.fetchBalanceData()
                },
                fail: (err) => {
                  if (err.errMsg !== 'requestPayment:fail cancel') {
                    wx.showToast({ title: '支付失败', icon: 'none' })
                  }
                },
              })
            }
          } catch (error) {
            wx.hideLoading()
            console.error('充值失败:', error)
            wx.showToast({ title: '充值失败', icon: 'none' })
          }
        },
      })
    } catch (error) {
      console.error('获取充值套餐失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
})
