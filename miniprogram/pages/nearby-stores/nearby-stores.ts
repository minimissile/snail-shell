interface StoreItem {
  id: string;
  name: string;
  image: string;
  promotionTag?: string;
  verifiedTag?: string;
  isFavorite: boolean;
  imageCount: number;
  totalImages: number;
  rating: number;
  reviewCount: number;
  highlightComment: string;
  features: string[];
  details: string;
  price: number;
  savedAmount: number;
}

Page({
  data: {
    city: '深圳',
    checkInDate: '11.14',
    checkOutDate: '11.15',
    destination: '深圳北站',
    selectedLocation: '深圳北站',
    storeList: [
      {
        id: '1',
        name: '【蜗壳精品店】深圳北站青年旅社',
        image: '/images/nearby-stores/store-item-image-1.jpg',
        promotionTag: '离店赚10倍积分',
        verifiedTag: '认证房源',
        isFavorite: false,
        imageCount: 1,
        totalImages: 55,
        rating: 5.0,
        reviewCount: 20,
        highlightComment: '房东人很热情',
        features: ['专业保洁', '网红INS风', '实拍看房', '免费瓶装水', '干湿分离', '5星卫生分'],
        details: '5居5床10-14人·整套188㎡ | 距深圳北站直线1.9公里',
        price: 180,
        savedAmount: 199
      },
      {
        id: '2',
        name: '【蜗壳旗舰店】深圳北站青年公寓',
        image: '/images/nearby-stores/store-item-image-2.jpg',
        promotionTag: '预订享限时优惠',
        verifiedTag: '蜗壳精选',
        isFavorite: false,
        imageCount: 1,
        totalImages: 40,
        rating: 5.0,
        reviewCount: 18,
        highlightComment: '房间隔音挺好',
        features: ['超赞房东', '私家花园', '实拍看房', '免费瓶装水', '干湿分离', '5星卫生分'],
        details: '5居5床10-14人·整套188㎡ | 距深圳北站直线1.9公里',
        price: 180,
        savedAmount: 199
      }
    ] as StoreItem[]
  },

  onLoad() {
    // 页面加载
  },

  // 清空搜索
  onClearSearch() {
    this.setData({
      destination: ''
    });
  },

  // 排序
  onSortTap() {
    wx.showToast({
      title: '排序选项',
      icon: 'none'
    });
  },

  // 位置筛选
  onLocationFilterTap() {
    wx.showToast({
      title: '位置筛选',
      icon: 'none'
    });
  },

  // 价格筛选
  onPriceFilterTap() {
    wx.showToast({
      title: '价格/人数筛选',
      icon: 'none'
    });
  },

  // 更多筛选
  onMoreFilterTap() {
    wx.showToast({
      title: '更多筛选',
      icon: 'none'
    });
  },

  // 优惠券点击
  onCouponTap() {
    wx.showToast({
      title: '查看优惠券',
      icon: 'none'
    });
  },

  // 房源卡片点击
  onStoreCardTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `查看房源 ${id}`,
      icon: 'none'
    });
    // TODO: 跳转到房源详情页
  },

  // 收藏切换
  onFavoriteTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id;
    const storeList = this.data.storeList.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    this.setData({ storeList });
    
    wx.showToast({
      title: storeList.find(item => item.id === id)?.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  // 会员优惠点击
  onDiscountTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看会员优惠',
      icon: 'none'
    });
  }
});
