interface FavoriteItem {
  id: string
  title: string
  rating: number
  reviewCount: number
  location: string
  checkInDate: string
  price: number
  image: string
  tag: string
}

interface TabItem {
  id: string
  label: string
}

Page({
  data: {
    statusBarHeight: 0,
    activeTab: 'favorites', // 'favorites' | 'footprints'
    tabs: [
      { id: 'favorites', label: '收藏' },
      { id: 'footprints', label: '足迹' },
    ] as TabItem[],
    todayLabel: '今天',
    favoritesList: [
      {
        id: '1',
        title: '不如野·奢·林时有事Forest设计师度假民宿(喀纳斯景区店)',
        rating: 4.8,
        reviewCount: 358,
        location: '阿勒泰地区 · 近哈纳斯新村 · 喀纳斯风景区',
        checkInDate: '01-27至01-28入住',
        price: 330,
        image: '/assets/figma/favorites/item-1.jpg',
        tag: '蜗壳精选',
      },
      {
        id: '2',
        title: '不如野·奢·林时有事Forest设计师度假民宿(喀纳斯景区店)',
        rating: 4.8,
        reviewCount: 358,
        location: '阿勒泰地区 · 近哈纳斯新村 · 喀纳斯风景区',
        checkInDate: '01-27至01-28入住',
        price: 330,
        image: '/assets/figma/favorites/item-1.jpg',
        tag: '蜗壳精选',
      },
      {
        id: '3',
        title: '不如野·奢·林时有事Forest设计师度假民宿(喀纳斯景区店)',
        rating: 4.8,
        reviewCount: 358,
        location: '阿勒泰地区 · 近哈纳斯新村 · 喀纳斯风景区',
        checkInDate: '01-27至01-28入住',
        price: 330,
        image: '/assets/figma/favorites/item-1.jpg',
        tag: '蜗壳精选',
      },
    ] as FavoriteItem[],
    footprintsList: [] as FavoriteItem[],
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0,
      footprintsList: this.data.favoritesList, // 足迹使用相同数据演示
    })
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    this.setData({
      activeTab: id,
    })
  },

  onCardTap(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    console.log('点击了收藏项', id)
    wx.showToast({
      title: '查看详情',
      icon: 'none',
    })
  },

  onBack() {
    wx.navigateBack()
  },

  onMenu() {
    wx.showToast({
      title: '菜单',
      icon: 'none',
    })
  },
})
