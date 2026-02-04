// 订单填写页面
Page({
  data: {
    // 房源信息
    roomType: '男生四人位',
    roomInfo: '整套88㎡ | 1居1床1卫1厅 | 宜住2人',
    roomImage: '/assets/figma/order-form/room-thumbnail.png',

    // 套餐信息
    packages: [
      {
        type: 'food',
        icon: '食',
        name: 'Luscious云端观景自助下午茶 1份+小稻田辣椒炒肉13...',
      },
      {
        type: 'gift',
        icon: '享',
        name: '【国潮礼遇】EVECRYSTAL天然紫晶手链 1份+【安耳...',
      },
    ],

    // 入住时间
    checkInDate: '11月21日 周五',
    checkOutDate: '11月22日 周六',
    nights: 1,
    cancelPolicy: '11月21日18:00前可免费取消',

    // 房间数量
    roomCount: 1,
    maxRoomCount: 4,

    // 住客信息
    guestName: '',
    idCard: '',
    phone: '18638828351',
    countryCode: '+86',

    // 优惠信息
    orderDiscount: 500,
    promotionDiscount: 368,
    vipDiscount: 132,

    // 价格信息
    totalPrice: 376,
    savedAmount: 500,
    remainingRooms: 9,
  },

  onLoad() {
    // 页面加载
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack()
  },

  // 查看全部须知
  onViewAllRules() {
    wx.showToast({
      title: '查看全部须知',
      icon: 'none',
    })
  },

  // 修改入住时间
  onChangeDate() {
    wx.showToast({
      title: '修改入住时间',
      icon: 'none',
    })
  },

  // 减少房间数量
  onDecreaseRoom() {
    if (this.data.roomCount > 1) {
      this.setData({
        roomCount: this.data.roomCount - 1,
      })
    }
  },

  // 增加房间数量
  onIncreaseRoom() {
    if (this.data.roomCount < this.data.maxRoomCount) {
      this.setData({
        roomCount: this.data.roomCount + 1,
      })
    }
  },

  // 输入住客姓名
  onInputGuestName(e: WechatMiniprogram.Input) {
    this.setData({
      guestName: e.detail.value,
    })
  },

  // 输入身份证号
  onInputIdCard(e: WechatMiniprogram.Input) {
    this.setData({
      idCard: e.detail.value,
    })
  },

  // 拨打电话
  onCallPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
      fail: () => {
        wx.showToast({
          title: '无法拨打电话',
          icon: 'none',
        })
      },
    })
  },

  // 查看优惠详情
  onViewDiscountDetail() {
    wx.showToast({
      title: '查看优惠详情',
      icon: 'none',
    })
  },

  // 查看价格明细
  onViewPriceDetail() {
    wx.showToast({
      title: '查看价格明细',
      icon: 'none',
    })
  },

  // 提交订单
  onSubmitOrder() {
    // 验证必填信息
    if (!this.data.guestName) {
      wx.showToast({
        title: '请填写住客姓名',
        icon: 'none',
      })
      return
    }

    if (!this.data.idCard) {
      wx.showToast({
        title: '请填写证件号码',
        icon: 'none',
      })
      return
    }

    // 提交订单
    wx.showToast({
      title: '提交订单成功',
      icon: 'success',
    })
  },
})
