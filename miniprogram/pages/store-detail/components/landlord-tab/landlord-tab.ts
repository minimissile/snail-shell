Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {
    landlordData: {
      type: Object,
      value: {
        avatar: '/images/store-detail/snail.png',
        name: '蜗壳旗舰店',
        badge: '自然人房东｜实名验证｜1套房屋',
        rating: '暂无',
        reviewCount: 30,
        confirmRate: '100%',
      },
    },
  },

  data: {},

  methods: {
    onViewLandlordPage() {
      this.triggerEvent('viewPage')
    },

    onContactLandlord() {
      this.triggerEvent('contact')
    },
  },
})
