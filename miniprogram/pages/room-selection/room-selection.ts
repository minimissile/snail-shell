Page({
  data: {
    // 当前预订方式: 'day' | 'hour' | 'month'
    bookingMode: 'day' as 'day' | 'hour' | 'month',
    
    // 门店信息
    storeName: '民治店',
    businessHours: '营业时间 00:00-24:00',
    
    // 预订日期
    startDate: '2026-01-20',
    startDayOfWeek: '周二',
    endDate: '2026-01-20',
    endDayOfWeek: '周二',
    
    // 按小时预订 - 时段信息
    startTime: '14:50',
    endTime: '16:50',
    
    // 按月预订 - 月份信息
    monthCount: '2个月',
    monthEndDate: '2026-03-20',
    
    // 已选信息
    selectedDays: '1天',
    selectedHours: '2.0小时',
    selectedMonths: '2个月',
    
    // 床位图例
    legendItems: [
      { color: '#F97316', label: '当前已选' },
      { color: '#F2E9AE', label: '可选' },
      { color: '#999999', label: '不可选' }
    ],
    
    // 床位数据 - 6组床位，每组4个床位
    bedGroups: [
      {
        id: 'B',
        position: { x: 12, y: 16 },
        beds: [
          { id: 'B01', status: 'selected', price: 88 }, // 当前已选
          { id: 'B02', status: 'available', price: 88 },
          { id: 'B03', status: 'selected', price: 88 }, // 当前已选
          { id: 'B04', status: 'available', price: 88 }
        ]
      },
      {
        id: 'B2',
        position: { x: 12, y: 124 },
        beds: [
          { id: 'B05', status: 'available', price: 88 },
          { id: 'B06', status: 'available', price: 88 },
          { id: 'B07', status: 'available', price: 88 },
          { id: 'B08', status: 'available', price: 88 }
        ]
      },
      {
        id: 'B3',
        position: { x: 12, y: 232 },
        beds: [
          { id: 'B09', status: 'available', price: 88 },
          { id: 'B10', status: 'available', price: 88 },
          { id: 'B11', status: 'available', price: 88 },
          { id: 'B12', status: 'available', price: 88 }
        ]
      },
      {
        id: 'A',
        position: { x: 172, y: 16 },
        beds: [
          { id: 'A01', status: 'available', price: 88 },
          { id: 'A02', status: 'available', price: 88 },
          { id: 'A03', status: 'available', price: 88 },
          { id: 'A04', status: 'available', price: 88 }
        ]
      },
      {
        id: 'A2',
        position: { x: 172, y: 124 },
        beds: [
          { id: 'A05', status: 'available', price: 88 },
          { id: 'A06', status: 'available', price: 88 },
          { id: 'A07', status: 'available', price: 88 },
          { id: 'A08', status: 'available', price: 88 }
        ]
      },
      {
        id: 'A3',
        position: { x: 172, y: 232 },
        beds: [
          { id: 'A09', status: 'available', price: 88 },
          { id: 'A10', status: 'unavailable', price: 88 }, // 不可选
          { id: 'A11', status: 'available', price: 88 },
          { id: 'A12', status: 'available', price: 88 }
        ]
      }
    ],
    
    // 已选床位列表（用于取消选房状态）
    selectedBeds: [
      { id: 'B01', price: 88 },
      { id: 'B03', price: 88 }
    ],
    
    // 房型信息
    roomType: '男生四人位',
    roomDate: '1月20日 18:20-20:08',
    currentDay: '今天',
    
    // 智能门锁提示
    smartLockTip: '配备智能门锁, 入住更安心',
    
    // 提示信息
    bookingTip: '可提前7天预定，最长可预定7天',
    
    // 价格信息
    totalPrice: 148,
    originalPrice: 176,
    
    // 收藏数
    favoriteCount: 326
  },

  onLoad() {
    // 页面加载
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack()
  },

  // 打开微信
  onOpenWechat() {
    wx.showToast({
      title: '打开微信功能',
      icon: 'none'
    })
  },

  // 切换收藏
  onToggleFavorite() {
    wx.showToast({
      title: '收藏功能',
      icon: 'none'
    })
  },

  // 切换预订方式
  onSwitchBookingMode(e: any) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      bookingMode: mode
    })
  },

  // 查看预订方式说明
  onViewBookingInfo() {
    wx.showToast({
      title: '预订方式说明',
      icon: 'none'
    })
  },

  // 修改开始日期
  onChangeStartDate() {
    wx.showToast({
      title: '选择开始日期',
      icon: 'none'
    })
  },

  // 修改结束日期
  onChangeEndDate() {
    wx.showToast({
      title: '选择结束日期',
      icon: 'none'
    })
  },

  // 修改开始时间（按小时）
  onChangeStartTime() {
    wx.showToast({
      title: '选择开始时间',
      icon: 'none'
    })
  },

  // 修改结束时间（按小时）
  onChangeEndTime() {
    wx.showToast({
      title: '选择结束时间',
      icon: 'none'
    })
  },

  // 修改月份（按月）
  onChangeMonth() {
    wx.showToast({
      title: '选择月份',
      icon: 'none'
    })
  },

  // 查看已选信息说明
  onViewSelectedInfo() {
    wx.showToast({
      title: '已选信息说明',
      icon: 'none'
    })
  },

  // 查看价格说明
  onViewPriceInfo() {
    wx.showToast({
      title: '价格说明',
      icon: 'none'
    })
  },

  // 选择/取消选择床位
  onToggleBed(e: any) {
    const { groupIndex, bedIndex } = e.currentTarget.dataset
    const bedGroups = this.data.bedGroups
    const bed = bedGroups[groupIndex].beds[bedIndex]
    
    if (bed.status === 'unavailable') {
      wx.showToast({
        title: '该床位不可选',
        icon: 'none'
      })
      return
    }
    
    // 切换选中状态
    bed.status = bed.status === 'selected' ? 'available' : 'selected'
    
    // 更新已选床位列表
    const selectedBeds = []
    for (const group of bedGroups) {
      for (const b of group.beds) {
        if (b.status === 'selected') {
          selectedBeds.push({ id: b.id, price: b.price })
        }
      }
    }
    
    this.setData({
      bedGroups,
      selectedBeds
    })
  },

  // 取消床位选择
  onCancelBed(e: any) {
    const bedId = e.currentTarget.dataset.bedId
    const bedGroups = this.data.bedGroups
    
    // 找到并取消选择
    for (const group of bedGroups) {
      for (const bed of group.beds) {
        if (bed.id === bedId && bed.status === 'selected') {
          bed.status = 'available'
        }
      }
    }
    
    // 更新已选床位列表
    const selectedBeds = this.data.selectedBeds.filter(b => b.id !== bedId)
    
    this.setData({
      bedGroups,
      selectedBeds
    })
  },

  // 切换房型
  onSwitchRoomType() {
    wx.showToast({
      title: '切换房型',
      icon: 'none'
    })
  },

  // 播放语音介绍
  onPlayAudio() {
    wx.showToast({
      title: '播放语音介绍',
      icon: 'none'
    })
  },

  // 立即预订
  onBookNow() {
    const { selectedBeds } = this.data
    
    if (selectedBeds.length === 0) {
      wx.showToast({
        title: '请先选择床位',
        icon: 'none'
      })
      return
    }
    
    wx.showToast({
      title: `预订 ${selectedBeds.length} 个床位`,
      icon: 'success'
    })
  }
})
