import { storeApi, favoriteApi } from '../../api/index'
import type { RoomInfo, BedInfo } from '../../api/index'

// 床位显示数据
interface BedDisplayItem {
  id: string
  status: 'available' | 'selected' | 'unavailable'
  price: number
}

interface BedGroup {
  id: string
  position: { x: number; y: number }
  beds: BedDisplayItem[]
}

Page({
  data: {
    // 页面参数
    storeId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',

    // 当前预订方式: 'day' | 'hour' | 'month'
    bookingMode: 'day' as 'day' | 'hour' | 'month',

    // 门店信息
    storeName: '',
    businessHours: '营业时间 00:00-24:00',

    // 预订日期
    startDate: '',
    startDayOfWeek: '',
    endDate: '',
    endDayOfWeek: '',

    // 按小时预订 - 时段信息
    startTime: '14:00',
    endTime: '16:00',

    // 按月预订 - 月份信息
    monthCount: '1个月',
    monthEndDate: '',

    // 已选信息
    selectedDays: '1天',
    selectedHours: '2.0小时',
    selectedMonths: '1个月',

    // 床位图例
    legendItems: [
      { color: '#F97316', label: '当前已选' },
      { color: '#F2E9AE', label: '可选' },
      { color: '#999999', label: '不可选' },
    ],

    // 床位数据
    bedGroups: [] as BedGroup[],

    // 已选床位列表
    selectedBeds: [] as { id: string; price: number }[],

    // 房型信息
    roomInfo: null as RoomInfo | null,
    roomType: '',
    roomDate: '',
    currentDay: '今天',
    unitPrice: 0,

    // 智能门锁提示
    smartLockTip: '配备智能门锁, 入住更安心',

    // 提示信息
    bookingTip: '可提前7天预定，最长可预定7天',

    // 价格信息
    totalPrice: 0,
    originalPrice: 0,

    // 收藏
    isFavorite: false,
    favoriteCount: 0,

    // 加载状态
    loading: true,
  },

  onLoad(options) {
    const { storeId, roomId, checkIn, checkOut, storeName } = options
    if (!storeId || !roomId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      return
    }

    // 解析日期
    const startDate = checkIn || this.formatDate(new Date())
    const endDate = checkOut || this.formatDate(new Date(Date.now() + 86400000))

    this.setData({
      storeId,
      roomId,
      checkIn: startDate,
      checkOut: endDate,
      startDate,
      endDate,
      storeName: storeName ? decodeURIComponent(storeName) : '',
      startDayOfWeek: this.getDayOfWeek(startDate),
      endDayOfWeek: this.getDayOfWeek(endDate),
    })

    this.loadData()
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true })

    try {
      const { storeId, roomId, checkIn } = this.data
      // 并行加载房型和床位数据
      const [rooms, beds] = await Promise.all([
        storeApi.getRooms(storeId, { checkIn, checkOut: this.data.checkOut }),
        storeApi.getBeds(storeId, roomId, { date: checkIn }),
      ])

      // 找到当前房型
      const roomInfo = rooms.find((r) => r.id === roomId)
      if (roomInfo) {
        this.setData({
          roomInfo,
          roomType: roomInfo.name,
          unitPrice: roomInfo.price,
        })
      }

      // 转换床位数据为显示格式
      this.transformBeds(beds, roomInfo?.price || 88)

      // 计算天数
      this.calculateDays()
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({ title: '加载数据失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 转换床位数据
  transformBeds(beds: BedInfo[], price: number) {
    // 按位置分组床位，每组4个
    const groups: BedGroup[] = []
    const positions = [
      { id: 'B', x: 12, y: 16 },
      { id: 'B2', x: 12, y: 124 },
      { id: 'B3', x: 12, y: 232 },
      { id: 'A', x: 172, y: 16 },
      { id: 'A2', x: 172, y: 124 },
      { id: 'A3', x: 172, y: 232 },
    ]

    for (let i = 0; i < positions.length; i++) {
      const groupBeds: BedDisplayItem[] = []
      for (let j = 0; j < 4; j++) {
        const bedIndex = i * 4 + j
        const bed = beds[bedIndex]
        if (bed) {
          groupBeds.push({
            id: bed.bedNumber,
            status: bed.status === 'available' ? 'available' : 'unavailable',
            price,
          })
        } else {
          // 如果没有足够的床位数据，补充模拟数据
          groupBeds.push({
            id: `${positions[i].id}${String(j + 1).padStart(2, '0')}`,
            status: 'available',
            price,
          })
        }
      }
      groups.push({
        id: positions[i].id,
        position: { x: positions[i].x, y: positions[i].y },
        beds: groupBeds,
      })
    }

    this.setData({ bedGroups: groups })
  },

  // 计算天数
  calculateDays() {
    const { startDate, endDate } = this.data
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))

    this.setData({
      selectedDays: `${days}天`,
      roomDate: `${this.formatDisplayDate(startDate)} - ${this.formatDisplayDate(endDate)}`,
    })

    this.updatePrice()
  },

  // 更新价格
  updatePrice() {
    const { selectedBeds, unitPrice, startDate, endDate } = this.data
    if (selectedBeds.length === 0) {
      this.setData({ totalPrice: 0, originalPrice: 0 })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))

    const totalPrice = selectedBeds.length * unitPrice * days
    const originalPrice = Math.round(totalPrice * 1.2)

    this.setData({ totalPrice, originalPrice })
  },

  // 格式化日期
  formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  // 格式化显示日期
  formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  // 获取星期几
  getDayOfWeek(dateStr: string): string {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const date = new Date(dateStr)
    return days[date.getDay()]
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack()
  },

  // 切换收藏
  async onToggleFavorite() {
    const { storeId, isFavorite, favoriteCount } = this.data

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(storeId)
        this.setData({
          isFavorite: false,
          favoriteCount: Math.max(0, favoriteCount - 1),
        })
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        await favoriteApi.addFavorite(storeId)
        this.setData({
          isFavorite: true,
          favoriteCount: favoriteCount + 1,
        })
        wx.showToast({ title: '收藏成功', icon: 'success' })
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 分享
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  },

  onShareAppMessage() {
    const { storeId, roomId, storeName, roomType } = this.data
    return {
      title: `${storeName} - ${roomType}`,
      path: `/pages/room-selection/room-selection?storeId=${storeId}&roomId=${roomId}`,
    }
  },

  // 切换预订方式
  onSwitchBookingMode(e: any) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      bookingMode: mode,
    })
  },

  // 查看预订方式说明
  onViewBookingInfo() {
    wx.showModal({
      title: '预订方式说明',
      content: '按天：适合多日入住\n按小时：适合短时休息\n按月：适合长期入住，享更多优惠',
      showCancel: false,
    })
  },

  // 修改开始日期
  onChangeStartDate() {
    const today = this.formatDate(new Date())
    wx.showToast({ title: '选择入住日期', icon: 'none' })
  },

  // 修改结束日期
  onChangeEndDate() {
    wx.showToast({ title: '选择离店日期', icon: 'none' })
  },

  // 修改开始时间（按小时）
  onChangeStartTime() {
    wx.showToast({ title: '选择开始时间', icon: 'none' })
  },

  // 修改结束时间（按小时）
  onChangeEndTime() {
    wx.showToast({ title: '选择结束时间', icon: 'none' })
  },

  // 修改月份（按月）
  onChangeMonth() {
    wx.showToast({ title: '选择月数', icon: 'none' })
  },

  // 查看已选信息说明
  onViewSelectedInfo() {
    const { selectedBeds, selectedDays } = this.data
    wx.showModal({
      title: '已选信息',
      content: `已选床位：${selectedBeds.length}个\n入住时长：${selectedDays}`,
      showCancel: false,
    })
  },

  // 查看价格说明
  onViewPriceInfo() {
    const { unitPrice, selectedBeds, selectedDays } = this.data
    wx.showModal({
      title: '价格说明',
      content: `单价：¥${unitPrice}/床/天\n床位数：${selectedBeds.length}\n天数：${selectedDays}`,
      showCancel: false,
    })
  },

  // 选择/取消选择床位
  onToggleBed(e: any) {
    const { group, bed } = e.currentTarget.dataset
    const bedGroups = this.data.bedGroups
    const selectedBed = bedGroups[group].beds[bed]

    if (selectedBed.status === 'unavailable') {
      wx.showToast({ title: '该床位不可选', icon: 'none' })
      return
    }

    // 切换选中状态
    selectedBed.status = selectedBed.status === 'selected' ? 'available' : 'selected'

    // 更新已选床位列表
    const selectedBeds: { id: string; price: number }[] = []
    for (const g of bedGroups) {
      for (const b of g.beds) {
        if (b.status === 'selected') {
          selectedBeds.push({ id: b.id, price: b.price })
        }
      }
    }

    this.setData({ bedGroups, selectedBeds })
    this.updatePrice()
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
    const selectedBeds = this.data.selectedBeds.filter((b) => b.id !== bedId)

    this.setData({ bedGroups, selectedBeds })
    this.updatePrice()
  },

  // 切换房型
  onSwitchRoomType() {
    wx.showToast({ title: '切换房型', icon: 'none' })
  },

  // 播放语音介绍
  onPlayAudio() {
    wx.showToast({ title: '播放语音介绍', icon: 'none' })
  },

  // 立即预订
  onBookNow() {
    const { selectedBeds, storeId, roomId, checkIn, checkOut, storeName, roomType } = this.data

    if (selectedBeds.length === 0) {
      wx.showToast({ title: '请先选择床位', icon: 'none' })
      return
    }

    // 跳转到订单填写页面，传递床位信息
    const bedIds = selectedBeds.map((b) => b.id).join(',')
    wx.navigateTo({
      url: `/pages/order-form/order-form?storeId=${storeId}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&storeName=${encodeURIComponent(storeName)}&roomType=${encodeURIComponent(roomType)}&bedIds=${bedIds}`,
    })
  },
})
