// 订单状态
export const ORDER_STATUS_MAP: Record<string, { text: string; color: string }> = {
  PENDING_PAYMENT: { text: '待支付', color: 'orange' },
  PENDING_USE: { text: '待使用', color: 'blue' },
  IN_USE: { text: '使用中', color: 'green' },
  COMPLETED: { text: '已完成', color: 'default' },
  CANCELLED: { text: '已取消', color: 'default' },
  REFUNDING: { text: '退款中', color: 'red' },
  REFUNDED: { text: '已退款', color: 'default' },
}

// 会员等级
export const MEMBER_LEVEL_MAP: Record<string, { text: string; color: string }> = {
  NORMAL: { text: '普通会员', color: 'default' },
  SILVER: { text: '银卡会员', color: '#C0C0C0' },
  GOLD: { text: '金卡会员', color: '#FFD700' },
  DIAMOND: { text: '钻石会员', color: '#00CED1' },
  BLACK_GOLD: { text: '黑金会员', color: '#1a1a1a' },
}

// 门店状态
export const STORE_STATUS_MAP: Record<string, { text: string; color: string }> = {
  ACTIVE: { text: '营业中', color: 'green' },
  INACTIVE: { text: '暂停营业', color: 'orange' },
  CLOSED: { text: '已关闭', color: 'red' },
}

// 房型类型
export const ROOM_TYPE_MAP: Record<string, string> = {
  MALE_DORM: '男生房',
  FEMALE_DORM: '女生房',
  MIXED_DORM: '混合房',
  PRIVATE: '独立房间',
}

// 优惠券类型
export const COUPON_TYPE_MAP: Record<string, string> = {
  DISCOUNT: '满减券',
  RATE: '折扣券',
  CASH: '现金券',
}
