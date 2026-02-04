type GridKey =
  | '常用信息'
  | '余额'
  | '实名认证'
  | '智能门锁'
  | '团购验券'
  | '省钱秘籍'
  | '联系客服'
  | '用户服务协议'
  | '我要反馈'
  | '添加福利官'
  | '附近门店'
  | '门店详情'
  | '订单填写'
  | '实景选房'

Component({
  data: {
    items: [
      { key: '常用信息', label: '常用信息', icon: '/assets/figma/grid-user-rectangle.svg' },
      { key: '余额', label: '余额', icon: '/assets/figma/grid-wallet.svg' },
      { key: '实名认证', label: '实名认证', icon: '/assets/figma/grid-shield-user.svg' },
      // { key: '智能门锁', label: '智能门锁', icon: '/assets/figma/smart-lock/icon-lock-keyhole.svg' },
      // { key: '团购验券', label: '团购验券', icon: '/assets/figma/grid-book-open-text.svg' },
      { key: '省钱秘籍', label: '省钱秘籍', icon: '/assets/figma/grid-book-open-text.svg' },
      { key: '联系客服', label: '联系客服', icon: '/assets/figma/grid-headset.svg' },
      { key: '用户服务协议', label: '用户服务协议', icon: '/assets/figma/grid-folders-check.svg' },
      { key: '我要反馈', label: '我要反馈', icon: '/assets/figma/grid-file-pen.svg' },
      { key: '添加福利官', label: '添加福利官', icon: '/assets/figma/grid-messages-dots.svg' },
      // { key: '附近门店', label: '附近门店', icon: '/assets/figma/grid-book-open-text.svg' },
      { key: '门店详情', label: '门店详情', icon: '/assets/figma/grid-book-open-text.svg' },
      // { key: '订单填写', label: '订单填写', icon: '/assets/figma/grid-book-open-text.svg' },
      // { key: '实景选房', label: '实景选房', icon: '/assets/figma/grid-book-open-text.svg' },
    ] as Array<{ key: GridKey; label: string; icon: string }>,
  },
  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      const key = (e.currentTarget.dataset?.key || '') as GridKey
      if (!key) return
      this.triggerEvent('item', { key })
    },
  },
})
