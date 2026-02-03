/**
 * 门店详情页底部预订组件
 *
 * 功能：
 * 1. 显示入住/离店日期，点击可选择日期
 * 2. 实景选房按钮，跳转到选房页面
 * 3. 立即预订按钮，显示价格并发起预订
 *
 * @author AI开发专家
 */
Component({
  options: {
    // 样式隔离，确保组件样式不受外部影响
    styleIsolation: 'isolated',
  },

  /**
   * 组件属性
   */
  properties: {
    // 入住日期，格式：“住 MM-DD”
    checkinDate: {
      type: String,
      value: '住 11-19',
    },

    // 离店日期，格式：“离 MM-DD”
    checkoutDate: {
      type: String,
      value: '离 11-20',
    },

    // 当前价格（元）
    currentPrice: {
      type: Number,
      value: 468,
    },

    // 原价（元）
    originalPrice: {
      type: Number,
      value: 669,
    },
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 选择日期
     * 触发 selectDate 事件，父组件监听后打开日期选择器
     */
    onSelectDate(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('selectDate')
    },

    /**
     * 实景选房
     * 触发 sceneSelection 事件，父组件监听后跳转到选房页面
     */
    onSceneSelection(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('sceneSelection')
    },

    /**
     * 立即预订
     * 触发 bookNow 事件，父组件监听后发起预订流程
     */
    onBookNow(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('bookNow')
    },
  },
})
