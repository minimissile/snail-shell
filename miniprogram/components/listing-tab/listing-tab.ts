// 房源Tab组件
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {},

  methods: {
    // 预订房间
    onBookRoom() {
      this.triggerEvent('bookRoom')
    },

    // 团购验券
    onCouponVerify() {
      this.triggerEvent('couponVerify')
    },

    // 门店储值
    onBalance() {
      this.triggerEvent('balance')
    },

    // Wi-Fi连接
    onWifi() {
      this.triggerEvent('wifi')
    },

    // 选择日期
    onSelectDate() {
      this.triggerEvent('selectDate')
    },

    // 查看优惠券
    onViewCoupons() {
      this.triggerEvent('viewCoupons')
    },
  },
})
