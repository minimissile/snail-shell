// 门店详情页面
Page({
  data: {
    // 房源信息
    propertyTitle: '蜗壳精品店/深圳北大五居 家庭出游/麻将投影桌游/红山6979/过香港福田会展/山',
    address: '距深圳北站-深圳北站-A1出站口(东1号出站口)直线1.9公里\n龙华区, 深圳龙华区龙光玖钻北区-1A...',
    
    // 标签
    tags: ['专业保洁', '网红INS风', '实拍看房', '免费瓶装水', '干湿分离', '5星卫生分'],
    
    // 评分
    rating: 5.0,
    reviewCount: 20,
    highlightComment: '室内干净整洁',
    
    // 房型信息
    roomType: '男生四人位',
    roomDetails: '5居 4张1.5米大床·1张1.6米大床 4人 整套100㎡',
    checkInRule: '无早餐 30分钟内免费取消',
    originalPrice: 699,
    currentPrice: 468,
    savedAmount: 201,
    
    // 入住时间
    checkInDate: '11月14日',
    checkInDay: '周五',
    checkOutDate: '11月15日',
    checkOutDay: '周六',
    totalNights: 1,
    
    // 金刚区
    diamondItems: [
      {
        id: 'coupon',
        title: '团购验券',
        subtitle: '折上折更优惠',
        icon: '/images/store-detail/icon-coupon.png',
        bgColor: 'linear-gradient(138deg, #FFF6E6 0%, #FFFFFF 98%)',
        circleColor1: '#FFF7E1',
        circleColor2: '#FEFCF1'
      },
      {
        id: 'balance',
        title: '门店储值',
        subtitle: '享受折上折',
        icon: '/images/store-detail/icon-store.png',
        bgColor: 'linear-gradient(138deg, #FFFBD5 0%, #FFFFFF 98%)',
        circleColor1: '#FFFBD5',
        circleColor2: '#FFFDE9'
      },
      {
        id: 'wifi',
        title: '连接WI-FI',
        subtitle: '安全、省流',
        icon: '/images/store-detail/icon-wifi.png',
        bgColor: 'linear-gradient(138deg, #E5F9FF 0%, #FFFFFF 98%)',
        circleColor1: '#E5F9FF',
        circleColor2: '#F1FCFF'
      }
    ],
    
    // 图片相关
    coverImage: '/images/store-detail/cover-image.jpg',
    roomImage: '/images/store-detail/room-image-11b390.jpg',
    videoThumbnail: '/images/store-detail/video-thumbnail.jpg',
    mapThumbnail: '/images/store-detail/map-thumbnail.jpg',
    
    // 收藏状态
    isFavorite: false,
    favoriteCount: 326
  },

  onLoad() {
    // 页面加载
  },

  // 返回上一页
  onGoBack() {
    wx.navigateBack()
  },

  // 切换收藏
  onToggleFavorite() {
    this.setData({
      isFavorite: !this.data.isFavorite
    })
    wx.showToast({
      title: this.data.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  // 查看实拍视频
  onViewVideo() {
    wx.showToast({
      title: '查看实拍视频',
      icon: 'none'
    })
  },

  // 切换图片类型
  onSwitchImageType(e: WechatMiniprogram.TouchEvent) {
    const type = e.currentTarget.dataset.type
    wx.showToast({
      title: `切换到${type}`,
      icon: 'none'
    })
  },

  // 查看精选标签详情
  onViewSelectedTag() {
    wx.showToast({
      title: '查看蜗壳精选详情',
      icon: 'none'
    })
  },

  // 查看评价
  onViewReviews() {
    wx.showToast({
      title: '查看评价',
      icon: 'none'
    })
  },

  // 查看地图
  onViewMap() {
    wx.showToast({
      title: '查看地图',
      icon: 'none'
    })
  },

  // 查看房型详情
  onViewRoomDetails() {
    wx.showToast({
      title: '查看房型详情',
      icon: 'none'
    })
  },

  // 查看优惠券
  onViewCoupon() {
    wx.showToast({
      title: '查看优惠券详情',
      icon: 'none'
    })
  },

  // 查看已省金额详情
  onViewSavedAmount() {
    wx.showToast({
      title: '查看已省¥201详情',
      icon: 'none'
    })
  },

  // 金刚区点击
  onDiamondItemTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    const titles: Record<string, string> = {
      coupon: '团购验券',
      balance: '门店储值',
      wifi: '连接WI-FI'
    }
    wx.showToast({
      title: titles[id] || '功能',
      icon: 'none'
    })
  },

  // 实景选房
  onRealSceneRoomSelection() {
    wx.showToast({
      title: '实景选房',
      icon: 'none'
    })
  },

  // 立即预订
  onBookNow() {
    wx.showToast({
      title: '立即预订',
      icon: 'none'
    })
  },

  // 修改入住时间
  onChangeDate() {
    wx.showToast({
      title: '修改入住时间',
      icon: 'none'
    })
  }
})
