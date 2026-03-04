// 门店相册页
import type { StoreDetail } from '../../api/store'

Page({
  data: {
    // 门店信息
    storeId: '',
    storeInfo: null as StoreDetail | null,

    // 相册数据
    albumImages: [] as Array<{ url: string; id: string; category?: string }>,
    page: 1,
    pageSize: 30,
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
  },

  onLoad(options) {
    const storeId = options.id || ''
    this.setData({ storeId })

    if (storeId) {
      this.loadAlbumData(storeId)
    } else {
      wx.showToast({ title: '门店ID缺失', icon: 'none' })
    }
  },

  onReady() {
    // 设置标题
    wx.setNavigationBarTitle({ title: '门店相册' })
  },

  // 加载相册数据
  async loadAlbumData(storeId: string, isRefresh = false) {
    if (this.data.isLoading || (!isRefresh && !this.data.hasMore)) return

    const { page, pageSize } = this.data
    const isLoadingMore = !isRefresh

    this.setData({ isLoading: !isRefresh, isLoadingMore })

    try {
      // 模拟API调用，实际项目中替换为真实的API调用
      const mockImages = this.generateMockImages(page, pageSize)

      this.setData({
        albumImages: isRefresh ? mockImages : [...this.data.albumImages, ...mockImages],
        page: page + 1,
        hasMore: mockImages.length >= pageSize,
        isLoading: false,
        isLoadingMore: false,
      })
    } catch (err) {
      console.error('加载相册数据失败:', err)
      this.setData({ isLoading: false, isLoadingMore: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 生成模拟图片数据
  generateMockImages(page: number, pageSize: number) {
    const images = []
    const totalImages = 50 // 模拟总图片数
    const startIndex = (page - 1) * pageSize

    for (let i = 0; i < pageSize && startIndex + i < totalImages; i++) {
      const imageIndex = startIndex + i
      images.push({
        url: `https://picsum.photos/seed/snail-${imageIndex}/400/400.jpg`,
        id: `album-${imageIndex}`,
        category: imageIndex % 3 === 0 ? 'cover' : imageIndex % 3 === 1 ? 'room' : 'facility',
      })
    }
    return images
  },

  // 滚动到底部加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoadingMore) {
      this.loadAlbumData(this.data.storeId)
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadAlbumData(this.data.storeId, true)
    wx.stopPullDownRefresh()
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      },
    })
  },

  // 点击图片
  onImageTap(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset
    const { albumImages } = this.data

    if (index >= 0 && index < albumImages.length) {
      const currentImage = albumImages[index]

      // 预览图片
      wx.previewImage({
        current: currentImage.url,
        urls: albumImages.map((img) => img.url),
        success: () => {
          console.log('图片预览成功')
        },
        fail: (err) => {
          console.error('图片预览失败:', err)
          wx.showToast({ title: '预览失败', icon: 'none' })
        },
      })
    }
  },

  // 长按图片（显示菜单）
  onImageLongPress(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset
    const { albumImages } = this.data

    if (index >= 0 && index < albumImages.length) {
      const currentImage = albumImages[index]

      wx.showActionSheet({
        itemList: ['保存图片', '分享图片'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 保存图片
            this.saveImage(currentImage.url)
          } else if (res.tapIndex === 1) {
            // 分享图片
            this.shareImage(currentImage.url)
          }
        },
        fail: (err) => {
          console.error('操作菜单显示失败:', err)
        },
      })
    }
  },

  // 保存图片到相册
  async saveImage(url: string) {
    try {
      const res = await wx.downloadFile({
        url,
        success: (downloadRes) => {
          if (downloadRes.tempFilePath) {
            wx.saveImageToPhotosAlbum({
              filePath: downloadRes.tempFilePath,
              success: () => {
                wx.showToast({ title: '保存成功', icon: 'success' })
              },
              fail: (err) => {
                console.error('保存图片失败:', err)
                wx.showToast({ title: '保存失败', icon: 'none' })
              },
            })
          }
        },
        fail: (err) => {
          console.error('下载图片失败:', err)
          wx.showToast({ title: '下载失败', icon: 'none' })
        },
      })
    } catch (err) {
      console.error('保存图片异常:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 分享图片
  shareImage(url: string) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage'],
      success: () => {
        console.log('分享菜单显示成功')
      },
      fail: (err) => {
        console.error('显示分享菜单失败:', err)
      },
    })
  },
})
