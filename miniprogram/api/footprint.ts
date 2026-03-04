// 足迹相关 API
export interface FootprintItem {
  id: string
  storeId: string
  store: {
    id: string
    name: string
    address: string
    images: string[]
    rating: number
    reviewCount: number
  }
  viewedAt: string
}

// 模拟足迹数据
const mockFootprints: FootprintItem[] = [
  {
    id: 'fp001',
    storeId: 'store001',
    store: {
      id: 'store001',
      name: '深圳南山科技园青旅',
      address: '南山区科技园南区',
      images: ['/images/store-1.jpg'],
      rating: 4.8,
      reviewCount: 128,
    },
    viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fp002',
    storeId: 'store002',
    store: {
      id: 'store002',
      name: '福田CBD精品公寓',
      address: '福田区中心商务区',
      images: ['/images/store-2.jpg'],
      rating: 4.9,
      reviewCount: 256,
    },
    viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fp003',
    storeId: 'store003',
    store: {
      id: 'store003',
      name: '罗湖口岸便捷酒店',
      address: '罗湖区人民南路',
      images: ['/images/store-3.jpg'],
      rating: 4.6,
      reviewCount: 89,
    },
    viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * 添加足迹记录
 */
export const footprintApi = {
  /**
   * 添加足迹
   */
  async addFootprint(storeId: string) {
    // 这里应该调用后端 API
    // const response = await request('/footprints', 'POST', { storeId })

    // 模拟 API 调用
    console.log('添加足迹:', storeId)
    return Promise.resolve({ success: true })
  },

  /**
   * 获取足迹列表
   */
  async getFootprints(page = 1, pageSize = 10) {
    // 这里应该调用后端 API
    // const response = await request(`/footprints?page=${page}&pageSize=${pageSize}`)

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 按浏览时间倒序排列
    const sortedFootprints = [...mockFootprints].sort(
      (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
    )

    return Promise.resolve({
      items: sortedFootprints,
      total: sortedFootprints.length,
      page,
      pageSize,
    })
  },

  /**
   * 清空足迹
   */
  async clearFootprints() {
    // 这里应该调用后端 API
    // const response = await request('/footprints', 'DELETE')

    // 模拟 API 调用
    console.log('清空足迹')
    return Promise.resolve({ success: true })
  },
}
