import { storeApi } from '../../api/index'

Page({
  data: {
    storeId: '',
    storeName: '',
    activeFilter: 'all',
    filterTabs: [] as Array<{ key: string; name: string; count: number }>,
    albumSections: [] as Array<{ key: string; title: string; images: Array<{ id: string; url: string }> }>,
    displaySections: [] as Array<{ key: string; title: string; images: Array<{ id: string; url: string }> }>,
    allPreviewUrls: [] as string[],
    isLoading: false,
  },

  onLoad(options) {
    const storeId = options.storeId || options.id || ''
    this.setData({ storeId })

    if (storeId) {
      this.loadAlbumData(storeId)
    } else {
      wx.showToast({ title: '门店ID缺失', icon: 'none' })
    }
  },

  onReady() {
    wx.setNavigationBarTitle({ title: '门店相册' })
  },

  async loadAlbumData(storeId: string) {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })

    try {
      const storeInfo = await storeApi.getStoreDetail(storeId)
      const sections = this.buildSections(storeInfo.images || [])
      const allPreviewUrls = sections.flatMap((section) => section.images.map((image) => image.url))
      const filterTabs = [
        { key: 'all', name: '全部照片', count: allPreviewUrls.length },
        ...sections.map((section) => ({
          key: section.key,
          name: section.title,
          count: section.images.length,
        })),
      ]

      this.setData({
        storeName: storeInfo.name || '门店相册',
        filterTabs,
        albumSections: sections,
        displaySections: sections,
        allPreviewUrls,
        isLoading: false,
      })
    } catch (err) {
      console.error('加载相册数据失败:', err)
      this.setData({ isLoading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  buildSections(images: string[]) {
    const fallback = [
      '/images/store-detail/cover-image.jpg',
      '/images/store-detail/room-type-image.jpg',
      '/images/store-detail/feature-image.png',
      '/images/store-detail/map-thumbnail.png',
      '/images/store-detail/snail.png',
      '/images/store-detail/icon-store.png',
    ]
    const source = images.length > 0 ? images : fallback
    const normalized: string[] = []
    for (let i = 0; i < Math.max(source.length, 24); i++) {
      normalized.push(source[i % source.length])
    }
    const sectionDefs = [
      { key: 'exterior', title: '外景' },
      { key: 'room', title: '房型' },
      { key: 'bathroom', title: '卫浴' },
      { key: 'living', title: '大厅' },
    ]
    const sections = sectionDefs.map((item) => ({
      key: item.key,
      title: item.title,
      images: [] as Array<{ id: string; url: string }>,
    }))

    normalized.forEach((url, index) => {
      const section = sections[index % sections.length]
      section.images.push({
        id: `${section.key}-${index}`,
        url,
      })
    })

    return sections
  },

  onGoBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      },
    })
  },

  onFilterChange(e: WechatMiniprogram.TouchEvent) {
    const key = (e.currentTarget.dataset.key || 'all') as string
    const { albumSections } = this.data
    const displaySections = key === 'all' ? albumSections : albumSections.filter((section) => section.key === key)
    this.setData({
      activeFilter: key,
      displaySections,
    })
  },

  onImageTap(e: WechatMiniprogram.TouchEvent) {
    const sectionIndex = Number(e.currentTarget.dataset.sectionIndex)
    const imageIndex = Number(e.currentTarget.dataset.imageIndex)
    const { displaySections, allPreviewUrls } = this.data
    const section = displaySections[sectionIndex]
    const currentImage = section?.images?.[imageIndex]

    if (currentImage) {
      wx.previewImage({
        current: currentImage.url,
        urls: allPreviewUrls,
        fail: (err) => {
          console.error('图片预览失败:', err)
          wx.showToast({ title: '预览失败', icon: 'none' })
        },
      })
    }
  },
})
