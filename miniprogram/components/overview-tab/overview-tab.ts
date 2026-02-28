// 概览Tab组件
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {
    // 亮点标签列表
    highlights: [
      { id: 'cover', name: '封面' },
      { id: 'wow', name: 'WOW亮点!' },
      { id: 'bedroom', name: '卧室' },
      { id: 'kitchen', name: '厨房' },
      { id: 'album', name: '相册', hasArrow: true },
    ],
    // 当前激活的标签索引
    activeHighlightIndex: 0,
    // 高亮背景位置和宽度 (动态计算)
    highlightLeft: 20,
    highlightWidth: 72,
  },

  lifetimes: {
    attached(this: any) {
      // 组件加载后计算第一个标签的宽度
      setTimeout(() => {
        this.updateHighlightPosition(0)
      }, 100)
    },
  },

  methods: {
    // 实拍看房
    onVideoTour(this: any) {
      this.triggerEvent('videoTour')
    },

    // 查看地图
    onViewMap(this: any) {
      this.triggerEvent('viewMap')
    },

    // 查看评价
    onViewReviews(this: any) {
      this.triggerEvent('viewReviews')
    },

    // 点击亮点标签切换
    onHighlightTap(this: any, e: any) {
      const { index } = e.currentTarget.dataset
      const { highlights } = this.data

      this.setData({ activeHighlightIndex: index })

      // 动态计算高亮背景位置和宽度
      this.updateHighlightPosition(index)

      // 触发事件通知父组件
      this.triggerEvent('highlightChange', {
        index,
        id: highlights[index].id,
        name: highlights[index].name,
      })
    },

    // 动态计算高亮背景位置和宽度
    updateHighlightPosition(this: any, index: number) {
      const query = this.createSelectorQuery()

      // 获取容器位置
      query.select('.overview-tab__highlights').boundingClientRect()
      // 获取所有标签项
      query.selectAll('.overview-tab__highlight-item').boundingClientRect()
      query.exec((res: any) => {
        const container = res[0]
        const items = res[1]

        if (container && items && items[index]) {
          const item = items[index]
          // 计算相对位置 (转换为rpx)
          const ratio = 750 / wx.getWindowInfo().windowWidth
          const left = (item.left - container.left) * ratio
          const width = item.width * ratio

          this.setData({
            highlightLeft: left, // 精确对齐
            highlightWidth: width, // 精确宽度
          })
        }
      })
    },
  },
})
