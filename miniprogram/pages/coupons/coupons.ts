interface CouponItem {
  id: string;
  type: 'cashback' | 'discount' | 'package';
  category: 'all' | 'homestay' | 'hotel' | 'snail' | 'selection';
  iconSrc: string;
  amount: string;
  unit: string;
  title: string;
  description: string;
  validPeriod: string;
}

interface TabItem {
  id: string;
  label: string;
  count: number;
}

Page({
  data: {
    statusBarHeight: 0,
    activeTab: 'all',
    tabs: [
      { id: 'all', label: '全部', count: 10 },
      { id: 'homestay', label: '民宿', count: 3 },
      { id: 'hotel', label: '酒店', count: 2 },
      { id: 'snail', label: '蜗壳', count: 2 },
      { id: 'selection', label: '精选', count: 1 }
    ] as TabItem[],
    coupons: [
      {
        id: '1',
        type: 'cashback',
        category: 'homestay',
        iconSrc: '/assets/figma/coupons/coupon-icon-homestay.svg',
        amount: '40',
        unit: '¥',
        title: '民宿拼团券',
        description: '优惠后阶梯返现，最高返¥40',
        validPeriod: '有效期:2026-01-27至2026-01-27'
      },
      {
        id: '2',
        type: 'discount',
        category: 'selection',
        iconSrc: '/assets/figma/coupons/coupon-icon-selection.svg',
        amount: '9.8',
        unit: '折',
        title: '精选民宿优惠券',
        description: '优惠后满¥1使用。9.8折优惠券...',
        validPeriod: '有效期:2026-01-27至2026-01-27'
      },
      {
        id: '3',
        type: 'package',
        category: 'hotel',
        iconSrc: '/assets/figma/coupons/coupon-icon-hotel.svg',
        amount: '30',
        unit: '¥',
        title: '日游酒套优惠券',
        description: '满20-2元, 满99-5元, 满399-...',
        validPeriod: '有效期:2026-01-27至2026-01-27'
      }
    ] as CouponItem[]
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
    });
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      activeTab: id
    });
  },

  onUseCoupon(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '去使用',
      icon: 'none'
    });
  },

  onMenu() {
    wx.showToast({
      title: '菜单',
      icon: 'none'
    });
  }
});
