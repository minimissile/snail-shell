import { storeApi, favoriteApi } from '../../api/index'
import type { StoreInfo, SearchStoresParams } from '../../api/store'
import { isLoggedIn } from '../../utils/auth'

interface StoreItem {
  id: string
  name: string
  image: string
  images: string[]
  promotionTag?: string
  verifiedTag?: string
  isFavorite: boolean
  imageCount: number
  totalImages: number
  rating: number
  reviewCount: number
  highlightComment: string
  features: string[]
  details: string
  price: number
  savedAmount: number
  distance?: number
}

Page({
  data: {
    city: '深圳',
    checkInDate: '',
    checkOutDate: '',
    destination: '',
    selectedLocation: '',
    storeList: [] as StoreItem[],
    isLoading: false,
    isEmpty: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    sortBy: 'distance' as 'distance' | 'price' | 'rating',
  },

  onLoad(options) {
    // 获取传递的参数
    const { destination, city, checkIn, checkOut } = options
    this.setData({
      destination: destination ? decodeURIComponent(destination) : '',
      city: city ? decodeURIComponent(city) : '深圳',
      checkInDate: checkIn ? decodeURIComponent(checkIn) : this.getTodayDate(),
      checkOutDate: checkOut ? decodeURIComponent(checkOut) : this.getTomorrowDate(),
      selectedLocation: destination ? decodeURIComponent(destination) : '',
    })

    // 加载门店列表
    this.loadStores()
  },

  // 获取今天日期
  getTodayDate(): string {
    const today = new Date()
    return `${today.getMonth() + 1}.${today.getDate()}`
  },

  // 获取明天日期
  getTomorrowDate(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getMonth() + 1}.${tomorrow.getDate()}`
  },

  // 加载门店列表
  async loadStores(isRefresh = true) {
    if (this.data.isLoading) return
    if (!isRefresh && !this.data.hasMore) return

    const page = isRefresh ? 1 : this.data.page

    this.setData({ isLoading: true })

    try {
      const params: SearchStoresParams = {
        keyword: this.data.destination,
        city: this.data.city,
        sortBy: this.data.sortBy,
        page,
        pageSize: this.data.pageSize,
      }

      const result = await storeApi.searchStores(params)

      const newList = result.items.map((store) => this.transformStoreData(store))

      this.setData({
        storeList: isRefresh ? newList : [...this.data.storeList, ...newList],
        page: page + 1,
        hasMore: result.items.length === this.data.pageSize,
        isEmpty: isRefresh && result.items.length === 0,
        isLoading: false,
      })
    } catch (err) {
      console.error('加载门店列表失败:', err)
      this.setData({ isLoading: false })

      // 如果是首次加载失败，显示空状态或使用模拟数据
      if (isRefresh) {
        this.loadMockData()
      }
    }
  },

  // 转换门店数据格式
  transformStoreData(store: StoreInfo): StoreItem {
    return {
      id: store.id,
      name: store.name,
      image: store.images[0] || '/assets/figma/favorites/item-1.jpg',
      images: store.images,
      promotionTag: store.tags[0] || '',
      verifiedTag: store.tags[1] || '',
      isFavorite: store.isFavorite || false,
      imageCount: 1,
      totalImages: store.images.length,
      rating: store.rating,
      reviewCount: store.reviewCount,
      highlightComment: store.features[0] || '',
      features: store.features.slice(0, 6),
      details: `${store.address} | ${store.distance ? `距离${store.distance}m` : ''}`,
      price: store.lowestPrice,
      savedAmount: Math.floor(store.lowestPrice * 0.1),
      distance: store.distance,
    }
  },

  // 加载模拟数据（API 未连接时使用）
  loadMockData() {
    const mockList: StoreItem[] = [
      {
        id: '1',
        name: '【蜗壳精品店】深圳北站青年旅社',
        image: '/assets/figma/favorites/item-1.jpg',
        images: ['/assets/figma/favorites/item-1.jpg'],
        promotionTag: '离店赚10倍积分',
        verifiedTag: '认证房源',
        isFavorite: false,
        imageCount: 1,
        totalImages: 55,
        rating: 5.0,
        reviewCount: 20,
        highlightComment: '房东人很热情',
        features: ['专业保洁', '网红INS风', '实拍看房', '免费瓶装水', '干湿分离', '5星卫生分'],
        details: '5居5床10-14人·整套188㎡ | 距深圳北站直线1.9公里',
        price: 180,
        savedAmount: 199,
      },
      {
        id: '2',
        name: '【蜗壳旗舰店】深圳北站青年公寓',
        image: '/assets/figma/favorites/item-1.jpg',
        images: ['/assets/figma/favorites/item-1.jpg'],
        promotionTag: '预订享限时优惠',
        verifiedTag: '蜗壳精选',
        isFavorite: false,
        imageCount: 1,
        totalImages: 40,
        rating: 5.0,
        reviewCount: 18,
        highlightComment: '房间隔音挺好',
        features: ['超赞房东', '私家花园', '实拍看房', '免费瓶装水', '干湿分离', '5星卫生分'],
        details: '5居5床10-14人·整套188㎡ | 距深圳北站直线1.9公里',
        price: 180,
        savedAmount: 199,
      },
    ]

    this.setData({
      storeList: mockList,
      isEmpty: false,
      hasMore: false,
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStores(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadStores(false)
  },

  // 清空搜索
  onClearSearch() {
    this.setData({ destination: '' })
  },

  // 排序
  onSortTap() {
    wx.showActionSheet({
      itemList: ['距离优先', '价格从低到高', '评分从高到低'],
      success: (res) => {
        const sortOptions = ['distance', 'price', 'rating'] as const
        this.setData({ sortBy: sortOptions[res.tapIndex] })
        this.loadStores(true)
      },
    })
  },

  // 位置筛选
  onLocationFilterTap() {
    wx.showToast({
      title: '位置筛选',
      icon: 'none',
    })
  },

  // 价格筛选
  onPriceFilterTap() {
    wx.showToast({
      title: '价格/人数筛选',
      icon: 'none',
    })
  },

  // 更多筛选
  onMoreFilterTap() {
    wx.showToast({
      title: '更多筛选',
      icon: 'none',
    })
  },

  // 优惠券点击
  onCouponTap() {
    wx.navigateTo({
      url: '/pages/coupons/coupons',
    })
  },

  // 房源卡片点击
  onStoreCardTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/store-detail/store-detail?id=${id}`,
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      },
    })
  },

  // 收藏切换
  async onFavoriteTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    const store = this.data.storeList.find((item) => item.id === id)
    if (!store) return

    // 检查登录状态
    if (!isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    try {
      if (store.isFavorite) {
        await favoriteApi.removeFavorite(id)
      } else {
        await favoriteApi.addFavorite(id)
      }

      const storeList = this.data.storeList.map((item) => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite }
        }
        return item
      })
      this.setData({ storeList })

      wx.showToast({
        title: store.isFavorite ? '已取消收藏' : '已收藏',
        icon: 'success',
      })
    } catch (err) {
      console.error('收藏操作失败:', err)
      // 本地切换状态作为降级
      const storeList = this.data.storeList.map((item) => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite }
        }
        return item
      })
      this.setData({ storeList })
    }
  },

  // 会员优惠点击
  onDiscountTap(e: WechatMiniprogram.TouchEvent) {
    wx.showToast({
      title: '查看会员优惠',
      icon: 'none',
    })
  },
})
