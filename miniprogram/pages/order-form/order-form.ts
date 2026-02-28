// 订单填写页面
import { storeApi, orderApi, couponApi, userApi } from '../../api/index'
import type { RoomInfo, StoreDetail } from '../../api/store'
import type { CouponInfo, CalculateOrderResult } from '../../api/order'
import type { GuestInfo } from '../../api/user'
import { isLoggedIn } from '../../utils/auth'

Page({
  data: {
    // 系统信息
    statusBarHeight: 0,

    // 参数
    storeId: '',
    roomId: '',
    bedIds: [] as string[],

    // 门店和房型信息
    storeInfo: null as StoreDetail | null,
    roomInfo: null as RoomInfo | null,

    // 显示信息
    roomType: '',
    roomDesc: '',
    roomImage: '',

    // 套餐信息
    packages: [] as Array<{ type: string; icon: string; name: string }>,

    // 入住时间
    checkInDate: '',
    checkOutDate: '',
    checkInDateText: '',
    checkOutDateText: '',
    nights: 1,
    cancelPolicy: '入住前24小时可免费取消',

    // 床位数量
    bedCount: 1,
    maxBedCount: 8,

    // 住客信息
    guestName: '',
    guestPhone: '',
    guestIdType: '身份证',
    guestIdNumber: '',
    guests: [] as GuestInfo[],
    selectedGuest: null as GuestInfo | null,

    // 优惠券
    availableCoupons: [] as CouponInfo[],
    selectedCoupon: null as CouponInfo | null,
    showCouponPopup: false,

    // 价格信息
    priceDetail: null as CalculateOrderResult | null,
    totalPrice: 0,
    originalPrice: 0,
    discountAmount: 0,
    couponDiscount: 0,

    // 备注
    remark: '',

    // 提交状态
    isSubmitting: false,
    showLoginPopup: false,
  },

  onLoad(options) {
    const { storeId, roomId, bedIds, checkIn, checkOut } = options
    const windowInfo = wx.getWindowInfo()

    // 解析日期
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const checkInDate = checkIn || `${today.getMonth() + 1}-${today.getDate()}`
    const checkOutDate = checkOut || `${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`

    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 0,
      storeId: storeId || '',
      roomId: roomId || '',
      bedIds: bedIds ? bedIds.split(',') : [],
      checkInDate,
      checkOutDate,
      checkInDateText: this.formatDateText(checkInDate),
      checkOutDateText: this.formatDateText(checkOutDate),
    })

    this.loadData()
  },

  // 格式化日期显示
  formatDateText(dateStr: string): string {
    const [month, day] = dateStr.split('-').map(Number)
    const date = new Date()
    date.setMonth(month - 1)
    date.setDate(day)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${month}月${day}日 ${weekDays[date.getDay()]}`
  },

  // 加载数据
  async loadData() {
    try {
      const { storeId, roomId } = this.data

      if (!storeId || !roomId) {
        wx.showToast({ title: '参数缺失', icon: 'none' })
        return
      }

      // 并行加载数据
      const [storeInfo, rooms, guests] = await Promise.all([
        storeApi.getStoreDetail(storeId).catch(() => null),
        storeApi.getRooms(storeId).catch(() => []),
        isLoggedIn() ? userApi.getGuests().catch(() => []) : Promise.resolve([]),
      ])

      const roomInfo = rooms.find((r) => r.id === roomId) || null

      this.setData({
        storeInfo,
        roomInfo,
        roomType: roomInfo?.name || '',
        roomDesc: `${roomInfo?.bedCount || 0}床位 | ${roomInfo?.facilities?.join(' ') || ''}`,
        roomImage: roomInfo?.images[0] || '/assets/figma/order-form/room-thumbnail.png',
        guests,
        selectedGuest: guests.find((g) => g.isDefault) || guests[0] || null,
        maxBedCount: roomInfo?.bedCount || 8,
      })

      // 如果有默认入住人，填充信息
      const defaultGuest = guests.find((g) => g.isDefault) || guests[0]
      if (defaultGuest) {
        this.setData({
          guestName: defaultGuest.name,
          guestPhone: defaultGuest.phone,
          guestIdNumber: defaultGuest.idNumber,
        })
      }

      // 计算价格
      this.calculatePrice()

      // 加载可用优惠券
      this.loadAvailableCoupons()
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({ title: '加载数据失败', icon: 'none' })
    }
  },

  // 计算价格
  async calculatePrice() {
    const { storeId, roomId, bedIds, bedCount, checkInDate, checkOutDate, selectedCoupon } = this.data

    if (!storeId || !roomId) return

    try {
      const result = await orderApi.calculateOrder({
        storeId,
        roomId,
        bedIds: bedIds.length > 0 ? bedIds : Array(bedCount).fill(''),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        couponId: selectedCoupon?.id,
      })

      this.setData({
        priceDetail: result,
        totalPrice: result.finalPrice,
        originalPrice: result.totalPrice,
        discountAmount: result.discountAmount,
        couponDiscount: result.couponDiscount,
        nights: result.nights,
      })
    } catch (err) {
      console.error('计算价格失败:', err)
      // 使用房型价格作为默认
      const { roomInfo, bedCount } = this.data
      if (roomInfo) {
        this.setData({
          totalPrice: roomInfo.price * bedCount,
          originalPrice: roomInfo.originalPrice * bedCount,
          discountAmount: (roomInfo.originalPrice - roomInfo.price) * bedCount,
        })
      }
    }
  },

  // 加载可用优惠券
  async loadAvailableCoupons() {
    if (!isLoggedIn()) return

    try {
      const { storeId, totalPrice } = this.data
      const coupons = await couponApi.getOrderCoupons({
        storeId,
        amount: totalPrice,
      })
      this.setData({ availableCoupons: coupons })
    } catch (err) {
      console.error('加载优惠券失败:', err)
    }
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack()
  },

  // 修改入住时间
  onChangeDate() {
    wx.showToast({ title: '日期选择功能开发中', icon: 'none' })
  },

  // 减少床位数量
  onDecreaseBed() {
    if (this.data.bedCount > 1) {
      this.setData({ bedCount: this.data.bedCount - 1 })
      this.calculatePrice()
    }
  },

  // 增加床位数量
  onIncreaseBed() {
    if (this.data.bedCount < this.data.maxBedCount) {
      this.setData({ bedCount: this.data.bedCount + 1 })
      this.calculatePrice()
    }
  },

  // 输入住客姓名
  onInputGuestName(e: WechatMiniprogram.Input) {
    this.setData({ guestName: e.detail.value })
  },

  // 输入手机号
  onInputPhone(e: WechatMiniprogram.Input) {
    this.setData({ guestPhone: e.detail.value })
  },

  // 输入身份证号
  onInputIdCard(e: WechatMiniprogram.Input) {
    this.setData({ guestIdNumber: e.detail.value })
  },

  // 选择常用入住人
  onSelectGuest() {
    const { guests } = this.data
    if (guests.length === 0) {
      wx.showToast({ title: '暂无常用入住人', icon: 'none' })
      return
    }

    wx.showActionSheet({
      itemList: guests.map((g) => `${g.name} (${g.phone})`),
      success: (res) => {
        const guest = guests[res.tapIndex]
        this.setData({
          selectedGuest: guest,
          guestName: guest.name,
          guestPhone: guest.phone,
          guestIdNumber: guest.idNumber,
        })
      },
    })
  },

  // 打开优惠券选择
  onOpenCouponPopup() {
    this.setData({ showCouponPopup: true })
  },

  // 关闭优惠券弹窗
  onCloseCouponPopup() {
    this.setData({ showCouponPopup: false })
  },

  // 选择优惠券
  onSelectCoupon(e: WechatMiniprogram.TouchEvent) {
    const couponId = e.currentTarget.dataset.id
    const coupon = this.data.availableCoupons.find((c) => c.id === couponId) || null

    this.setData({
      selectedCoupon: coupon,
      showCouponPopup: false,
    })

    this.calculatePrice()
  },

  // 不使用优惠券
  onClearCoupon() {
    this.setData({
      selectedCoupon: null,
      showCouponPopup: false,
    })
    this.calculatePrice()
  },

  // 输入备注
  onInputRemark(e: WechatMiniprogram.Input) {
    this.setData({ remark: e.detail.value })
  },

  // 查看全部须知
  onViewAllRules() {
    wx.showToast({ title: '查看全部须知', icon: 'none' })
  },

  // 查看优惠详情
  onViewDiscountDetail() {
    wx.showToast({ title: '查看优惠详情', icon: 'none' })
  },

  // 查看价格明细
  onViewPriceDetail() {
    const { priceDetail, nights } = this.data
    if (!priceDetail) return

    wx.showModal({
      title: '价格明细',
      content: `房费: ¥${priceDetail.roomPrice} x ${nights}晚\n总价: ¥${priceDetail.totalPrice}\n优惠: -¥${priceDetail.discountAmount}\n券抵扣: -¥${priceDetail.couponDiscount}\n实付: ¥${priceDetail.finalPrice}`,
      showCancel: false,
    })
  },

  // 提交订单
  async onSubmitOrder() {
    const { guestName, guestPhone, guestIdNumber, isSubmitting } = this.data

    if (isSubmitting) return

    // 验证必填信息
    if (!guestName) {
      wx.showToast({ title: '请填写住客姓名', icon: 'none' })
      return
    }

    if (!guestPhone) {
      wx.showToast({ title: '请填写手机号', icon: 'none' })
      return
    }

    if (!isLoggedIn()) {
      this.setData({ showLoginPopup: true })
      return
    }

    this.setData({ isSubmitting: true })

    try {
      const { storeId, roomId, bedIds, bedCount, checkInDate, checkOutDate, selectedCoupon, remark } = this.data

      const order = await orderApi.createOrder({
        storeId,
        roomId,
        bedIds: bedIds.length > 0 ? bedIds : Array(bedCount).fill(''),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestName,
        guestPhone,
        couponId: selectedCoupon?.id,
        remark,
      })

      wx.showToast({ title: '订单创建成功', icon: 'success' })

      // 跳转到订单详情或支付
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/orders/orders?tab=pay`,
          fail: () => {
            wx.switchTab({ url: '/pages/orders/orders' })
          },
        })
      }, 1500)
    } catch (err) {
      console.error('创建订单失败:', err)
      wx.showToast({ title: '订单创建失败', icon: 'none' })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  // 登录弹窗显示状态变化
  onLoginPopupVisibleChange(e: any) {
    this.setData({ showLoginPopup: e.detail.visible })
  },

  // 登录成功
  onLoginSuccess() {
    this.setData({ showLoginPopup: false })
    wx.showToast({ title: '登录成功', icon: 'success' })
  },
})
