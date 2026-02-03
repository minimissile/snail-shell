/**
 * 费用须知模块组件
 * Figma node-id: 113-1153
 */
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {
    // 费用规则数据
    costRules: {
      type: Object,
      value: {
        deposit: {
          amount: 200,
        },
        extraPerson: {
          text: '标准入住6人，不可加人',
        },
      },
    },
  },

  methods: {
    /**
     * 点击“全部须知”按钮
     */
    onViewAllRules(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('viewAll')
    },
  },
})
