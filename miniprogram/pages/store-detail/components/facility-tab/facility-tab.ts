Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {
    serviceList: [
      { name: '免费停车位', available: true },
      { name: '付费停车位', available: false },
      { name: '行李寄存', available: true },
    ],
    basicList: [
      { name: '无线网络', available: true },
      { name: '电梯', available: false },
      { name: '窗户', available: true },
      { name: '空调-冷暖', available: false },
      { name: '暖气', available: true },
      { name: '凉衣架', available: false },
    ],
    bathroomList: [
      { name: '热水', available: true },
      { name: '独立卫浴', available: false },
      { name: '电吹风', available: true },
      { name: '洗浴用品', available: false },
      { name: '牙具', available: true },
      { name: '浴巾', available: false },
    ],
  },

  methods: {
    onViewAllFacilities() {
      this.triggerEvent('viewAll')
    },
  },
})
