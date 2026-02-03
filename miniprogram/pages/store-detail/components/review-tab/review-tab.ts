/**
 * 点评模块组件
 * Figma node-id: 98-1075
 */
Component({
  options: {
    styleIsolation: 'isolated',
  },

  properties: {},

  data: {
    tags: [
      { label: '干净卫生', count: 9 },
      { label: '附近有地铁站', count: 8 },
      { label: '位置不错', count: 5 },
    ],
    reviews: [
      {
        id: '1',
        username: '2***9',
        avatar: '/assets/figma/review-tab/avatar-1.png',
        stars: [
          '/assets/figma/review-tab/icon-star-small.svg',
          '/assets/figma/review-tab/icon-star-small.svg',
          '/assets/figma/review-tab/icon-star-half-1.svg',
          '/assets/figma/review-tab/icon-star-half-2.svg',
          '/assets/figma/review-tab/icon-star-small.svg',
        ],
        date: '2025-09-01',
        content: '#出行方便 离地铁站口很近, 交通方便, 小复式空间\n大, 我们住了四个人, 但实际可以住六个人',
      },
      {
        id: '2',
        username: '匿名用户',
        avatar: '/assets/figma/review-tab/avatar-2.png',
        stars: [
          '/assets/figma/review-tab/icon-star-small.svg',
          '/assets/figma/review-tab/icon-star-small.svg',
          '/assets/figma/review-tab/icon-star-half-1.svg',
          '/assets/figma/review-tab/icon-star-half-2.svg',
        ],
        date: '2025-06-01',
        content: '很温馨, 投影看电视很棒',
      },
      {
        id: '3',
        username: '5***3',
        avatar: '/assets/figma/review-tab/avatar-3.png',
        stars: [
          '/assets/figma/review-tab/icon-star-small.svg',
          '/assets/figma/review-tab/icon-star-small.svg',
          '/assets/figma/review-tab/icon-star-half-1.svg',
          '/assets/figma/review-tab/icon-star-half-2.svg',
          '/assets/figma/review-tab/icon-star-small.svg',
        ],
        date: '2025-05-10',
        content: '#近公交站 #房东热情 #必住民宿 地铁很近, 周边吃饭非常多。',
      },
    ],
  },

  methods: {
    /**
     * 点击"全部XX条"
     */
    onViewAllReviews(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('viewAll')
    },
  },
})
