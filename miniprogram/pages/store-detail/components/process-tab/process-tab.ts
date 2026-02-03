/**
 * 体验流程模块组件
 * Figma node-id: 107-2109
 */
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  methods: {
    /**
     * 点击“全部流程”按钮
     */
    onViewAllProcess(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('viewAll')
    },
  },
})
