/**
 * 设施模块组件
 * Figma node-id: 99-1050
 */
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {
    serviceList: [
      { name: '免费停车位', icon: '/assets/figma/facility-tab/icon-facility-1.svg' },
      { name: '付费停车位', icon: '/assets/figma/facility-tab/icon-facility-1.svg' },
      { name: '行李寄存', icon: '/assets/figma/facility-tab/icon-facility-1.svg' },
    ],
    basicList: [
      { name: '无线网络', icon: '/assets/figma/facility-tab/icon-facility-2.svg' },
      { name: '电梯', icon: '/assets/figma/facility-tab/icon-facility-3.svg' },
      { name: '窗户', icon: '/assets/figma/facility-tab/icon-facility-4.svg' },
      { name: '空调-冷暖', icon: '/assets/figma/facility-tab/icon-facility-5.svg' },
      { name: '暖气', icon: '/assets/figma/facility-tab/icon-facility-6.svg' },
      { name: '凉衣架', icon: '/assets/figma/facility-tab/icon-facility-7.svg' },
    ],
    bathroomList: [
      { name: '热水', icon: '/assets/figma/facility-tab/icon-facility-8.svg' },
      { name: '独立卫浴', icon: '/assets/figma/facility-tab/icon-facility-9.svg' },
      { name: '电吹风', icon: '/assets/figma/facility-tab/icon-facility-10.svg' },
      { name: '洗浴用品', icon: '/assets/figma/facility-tab/icon-facility-11.svg' },
      { name: '牙具', icon: '/assets/figma/facility-tab/icon-facility-12.svg' },
      { name: '浴巾', icon: '/assets/figma/facility-tab/icon-facility-13.svg' },
    ],
  },

  methods: {
    /**
     * 点击“全部设施”
     */
    onViewAllFacilities(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('viewAll')
    },
  },
})
