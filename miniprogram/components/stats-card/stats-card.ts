Component({
  properties: {
    couponCount: {
      type: Number,
      value: 0,
    },
  },
  methods: {
    onCoupon() {
      this.triggerEvent('coupon')
    },
    onFavorites() {
      this.triggerEvent('favorites')
    },
    onPoints() {
      this.triggerEvent('points')
    },
    onTapQuickAction(e: any) {
      // 转发 quick-actions 组件的 action 事件给父组件
      this.triggerEvent('action', e.detail)
    },
  },
})
