// 概览Tab组件
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {},

  methods: {
    // 实拍看房
    onVideoTour() {
      this.triggerEvent('videoTour')
    },

    // 查看地图
    onViewMap() {
      this.triggerEvent('viewMap')
    },

    // 查看评价
    onViewReviews() {
      this.triggerEvent('viewReviews')
    },
  },
})
