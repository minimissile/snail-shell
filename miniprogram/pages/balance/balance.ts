Page({
  data: {
    cashbackAmount: '0.00',
    balanceAmount: '0.00',
    consumptionAmount: '0.00'
  },

  onLoad() {
    // 页面加载时可以从服务器获取真实余额数据
    this.fetchBalanceData();
  },

  // 获取余额数据
  fetchBalanceData() {
    // TODO: 从服务器获取真实数据
    // 示例数据
    this.setData({
      cashbackAmount: '0.00',
      balanceAmount: '0.00',
      consumptionAmount: '0.00'
    });
  },

  // 点击返现卡片
  onCashbackTap() {
    wx.showToast({
      title: '返现详情',
      icon: 'none'
    });
    // TODO: 跳转到返现详情页
  },

  // 点击余额卡片
  onBalanceTap() {
    wx.showToast({
      title: '余额详情',
      icon: 'none'
    });
    // TODO: 跳转到余额详情页
  },

  // 点击消费金卡片
  onConsumptionTap() {
    wx.showToast({
      title: '消费金详情',
      icon: 'none'
    });
    // TODO: 跳转到消费金详情页
  }
});
