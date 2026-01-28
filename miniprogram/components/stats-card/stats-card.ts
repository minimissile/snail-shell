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
  },
})
