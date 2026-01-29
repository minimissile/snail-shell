interface RoomType {
  id: string;
  name: string;
  image: string;
  beds: string;
  capacity: number;
  area: number;
  meal: string;
  cancelPolicy: string;
  tags: string[];
  originalPrice: number;
  discountPrice: number;
  savings: number;
}

Page({
  data: {
    // 封面信息
    coverImage: '/images/store-detail/cover-image.png',
    videoPreview: '/images/store-detail/video-preview.png',
    showImageCount: '封面',
    highlights: ['WOW亮点!', '卧室', '厨房｜', '相册'],
    
    // 房屋基本信息
    title: '蜗壳精品店/深圳北大五居 家庭出游/麻将投影桌游/红山6979/过香港福田会展/山',
    shareIcon: '',
    address: '距深圳北站-深圳北站-A1出站口(东1号出站口)直线1.9公里\n龙华区, 深圳龙华区龙光玖钻北区-1A...',
    mapPreview: '/images/store-detail/map-preview.png',
    
    // 蜗壳精选标签
    selectedBadge: '蜗壳精选',
    selectedDesc: '实拍视频有保障, 入住不满意必赔',
    
    // 房屋标签
    tags: ['专业保洁', '网红INS风', '实拍看房', '免费瓶装水', '干湿分离', '5星卫生分'],
    
    // 评分信息
    rating: 5.0,
    reviewCount: 20,
    highlightComment: '室内干净整洁',
    
    // 房型信息
    roomTypes: [
      {
        id: '1',
        name: '男生四人位',
        image: '/images/store-detail/room-type-image-11b390.png',
        beds: '5居 4张1.5米大床·1张1.6米大床',
        capacity: 4,
        area: 100,
        meal: '无早餐',
        cancelPolicy: '30分钟内免费取消',
        tags: ['立即确认'],
        originalPrice: 699,
        discountPrice: 468,
        savings: 201
      }
    ] as RoomType[],
    
    // 金刚区
    serviceItems: [
      {
        id: 'coupon',
        name: '团购验券',
        desc: '折上折更优惠',
        icon: '/images/store-detail/icon-coupon.png',
        bgColor: 'linear-gradient(138deg, rgba(255, 246, 230, 1) 0%, rgba(255, 255, 255, 1) 98%)'
      },
      {
        id: 'balance',
        name: '门店储值',
        desc: '享受折上折',
        icon: '/images/store-detail/icon-balance.png',
        bgColor: 'linear-gradient(138deg, rgba(255, 251, 213, 1) 0%, rgba(255, 255, 255, 1) 98%)'
      },
      {
        id: 'wifi',
        name: '连接WI-FI',
        desc: '安全、省流',
        icon: '/images/store-detail/icon-wifi.png',
        bgColor: 'linear-gradient(138deg, rgba(229, 249, 255, 1) 0%, rgba(255, 255, 255, 1) 98%)'
      }
    ],
    
    // 入住时间
    checkInDate: '11月14日',
    checkInDay: '周五 入住',
    checkOutDate: '11月15日',
    checkOutDay: '周六 离开',
    nights: '共1晚',
    
    // 优惠券横幅
    couponAmount: '200',
    couponDesc: '连住专享券',
    
    // 底部按钮
    bookingDate: '住 11-19',
    bookingCheckout: '离 11-20',
    finalPrice: 468,
    originalPriceBottom: 669,
    
    // 收藏状态
    isFavorited: false,
    favoriteCount: 326
  },

  onLoad() {
    // 页面加载时的初始化
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 收藏切换
  onToggleFavorite() {
    this.setData({
      isFavorited: !this.data.isFavorited,
      favoriteCount: this.data.isFavorited ? this.data.favoriteCount - 1 : this.data.favoriteCount + 1
    });
    
    wx.showToast({
      title: this.data.isFavorited ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  // 查看实拍视频
  onViewVideo() {
    wx.showToast({
      title: '查看实拍视频',
      icon: 'none'
    });
  },

  // 查看亮点
  onViewHighlight(e: WechatMiniprogram.TouchEvent) {
    const highlight = e.currentTarget.dataset.highlight;
    wx.showToast({
      title: `查看${highlight}`,
      icon: 'none'
    });
  },

  // 查看地图
  onViewMap() {
    wx.showToast({
      title: '查看地图',
      icon: 'none'
    });
  },

  // 查看蜗壳精选详情
  onViewSelectedDetail() {
    wx.showToast({
      title: '查看蜗壳精选详情',
      icon: 'none'
    });
  },

  // 查看评分详情
  onViewRating() {
    wx.showToast({
      title: '查看评分详情',
      icon: 'none'
    });
  },

  // 查看房型详情
  onViewRoomDetail(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `查看房型详情 ${id}`,
      icon: 'none'
    });
  },

  // 预订房型
  onBookRoom(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `预订房型 ${id}`,
      icon: 'none'
    });
  },

  // 金刚区点击
  onServiceItemTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `${id} 功能`,
      icon: 'none'
    });
  },

  // 查看优惠券
  onViewCoupon() {
    wx.navigateTo({
      url: '/pages/coupons/coupons'
    });
  },

  // 更改入住时间
  onChangeDateTap() {
    wx.showToast({
      title: '选择入住时间',
      icon: 'none'
    });
  },

  // 实景选房
  onRealViewTap() {
    wx.showToast({
      title: '实景选房',
      icon: 'none'
    });
  },

  // 立即预订
  onBookNow() {
    wx.showToast({
      title: '立即预订',
      icon: 'none'
    });
  }
});
