Component({
  properties: {
    greeting: {
      type: String,
      value: '',
    },
  },
  methods: {
    onBenefit(e: WechatMiniprogram.TouchEvent) {
      const key = (e.currentTarget.dataset?.key || '') as string
      this.triggerEvent('benefit', { key })
    },
  },
})
