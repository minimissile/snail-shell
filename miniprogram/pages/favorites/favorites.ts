import { favoriteApi } from '../../api/index'
import type { FavoriteInfo, FootprintGroup } from '../../api/favorite'
import { isLoggedIn } from '../../utils/auth'

interface FavoriteItem {
  id: string
  storeId: string
  title: string
  rating: number
  reviewCount: number
  location: string
  checkInDate: string
  price: number
  image: string
  tag: string
}

interface FootprintItem extends FavoriteItem {
  visitTime: string
}

interface FootprintGroupData {
  date: string
  dateText: string
  items: FootprintItem[]
}

interface TabItem {
  id: string
  label: string
}

Page({
  data: {
    statusBarHeight: 0,
    activeTab: 'favorites' as 'favorites' | 'footprints',
    tabs: [
      { id: 'favorites', label: '收藏' },
      { id: 'footprints', label: '足迹' },
    ] as TabItem[],
    todayLabel: '今天',
    favoritesList: [] as FavoriteItem[],
    footprintsList: [] as FootprintItem[],
    footprintGroups: [] as FootprintGroupData[],
    isLoading: false,
    isEmpty: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0,
    })
    this.loadFavorites()
  },

  onShow() {
    if (this.data.activeTab === 'favorites') {
      this.loadFavorites()
    } else {
      this.loadFootprints()
    }
  },

  // 加载收藏列表
  async loadFavorites() {
    if (!isLoggedIn()) {
      this.setData({ isEmpty: true, favoritesList: [] })
      return
    }

    this.setData({ isLoading: true })

    try {
      const result = await favoriteApi.getFavorites({
        page: 1,
        pageSize: this.data.pageSize,
      })

      const items = result.list.map((item) => this.transformFavoriteData(item))
      this.setData({
        favoritesList: items,
        isEmpty: items.length === 0,
        isLoading: false,
      })
    } catch (err) {
      console.error('加载收藏失败:', err)
      this.setData({ isLoading: false, isEmpty: true, favoritesList: [] })
      wx.showToast({ title: '加载收藏失败', icon: 'none' })
    }
  },

  // 加载足迹列表
  async loadFootprints() {
    if (!isLoggedIn()) {
      this.setData({ isEmpty: true, footprintsList: [], footprintGroups: [] })
      return
    }

    this.setData({ isLoading: true })

    try {
      const groups = await favoriteApi.getFootprints({
        page: 1,
        pageSize: this.data.pageSize,
      })

      const footprintGroups = groups.map((group) => ({
        date: group.date,
        dateText: group.dateText,
        items: group.items.map((item) => ({
          id: item.id,
          storeId: item.storeId,
          title: item.storeName,
          rating: 4.8,
          reviewCount: 0,
          location: item.storeAddress,
          checkInDate: '',
          price: item.lowestPrice,
          image: item.storeImage || '/assets/figma/favorites/item-1.jpg',
          tag: '',
          visitTime: item.visitTime,
        })),
      }))

      // 扁平化足迹列表
      const footprintsList = footprintGroups.flatMap((g) => g.items)

      this.setData({
        footprintGroups,
        footprintsList,
        isEmpty: footprintsList.length === 0,
        isLoading: false,
      })
    } catch (err) {
      console.error('加载足迹失败:', err)
      this.setData({ isLoading: false, isEmpty: true, footprintsList: [], footprintGroups: [] })
      wx.showToast({ title: '加载足迹失败', icon: 'none' })
    }
  },

  // 转换收藏数据格式
  transformFavoriteData(item: FavoriteInfo): FavoriteItem {
    return {
      id: item.id,
      storeId: item.storeId,
      title: item.storeName,
      rating: item.rating,
      reviewCount: 0,
      location: item.storeAddress,
      checkInDate: '',
      price: item.lowestPrice,
      image: item.storeImage || '/assets/figma/favorites/item-1.jpg',
      tag: '蜗壳精选',
    }
  },

  // 切换 Tab
  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeTab: id })

    if (id === 'favorites') {
      this.loadFavorites()
    } else {
      this.loadFootprints()
    }
  },

  // 点击卡片
  onCardTap(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    const storeId =
      this.data.activeTab === 'favorites'
        ? this.data.favoritesList.find((item) => item.id === id)?.storeId
        : this.data.footprintsList.find((item) => item.id === id)?.storeId

    wx.navigateTo({
      url: `/pages/store-detail/store-detail?id=${storeId || id}`,
    })
  },

  // 取消收藏
  async onRemoveFavorite(e: WechatMiniprogram.TouchEvent) {
    const { id, storeId } = e.currentTarget.dataset

    wx.showModal({
      title: '确认取消收藏',
      content: '确定要取消收藏此门店吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await favoriteApi.removeFavorite(storeId || id)
            const favoritesList = this.data.favoritesList.filter((item) => item.id !== id)
            this.setData({
              favoritesList,
              isEmpty: favoritesList.length === 0,
            })
            wx.showToast({ title: '已取消收藏', icon: 'success' })
          } catch (err) {
            console.error('取消收藏失败:', err)
            // 本地移除
            const favoritesList = this.data.favoritesList.filter((item) => item.id !== id)
            this.setData({ favoritesList })
          }
        }
      },
    })
  },

  // 清空足迹
  async onClearFootprints() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有足迹吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await favoriteApi.clearFootprints()
            this.setData({
              footprintsList: [],
              footprintGroups: [],
              isEmpty: true,
            })
            wx.showToast({ title: '已清空足迹', icon: 'success' })
          } catch (err) {
            console.error('清空足迹失败:', err)
          }
        }
      },
    })
  },

  onBack() {
    wx.navigateBack()
  },

  onMenu() {
    if (this.data.activeTab === 'footprints') {
      wx.showActionSheet({
        itemList: ['清空足迹'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.onClearFootprints()
          }
        },
      })
    } else {
      wx.showToast({ title: '菜单', icon: 'none' })
    }
  },
})
