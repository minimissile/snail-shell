// API 统一导出
export * as authApi from './auth'
export * as userApi from './user'
export * as storeApi from './store'
export * as orderApi from './order'
export * as favoriteApi from './favorite'
export * as couponApi from './coupon'
export * as balanceApi from './balance'
export * as messageApi from './message'
export * as smartLockApi from './smart-lock'
export * as commonApi from './common'
export * as paymentApi from './payment'

// 导出类型
export type { UserProfile, GuestInfo, CreateGuestParams } from './user'
export type { StoreInfo, StoreDetail, RoomInfo, BedInfo, ReviewInfo, SearchStoresParams, PageResult } from './store'
export type {
  OrderInfo,
  OrderDetail,
  OrderStatus,
  CalculateOrderParams,
  CreateOrderParams,
  GetOrdersParams,
} from './order'
export type { FavoriteInfo, FootprintInfo, FootprintGroup } from './favorite'
export type { CouponInfo, CouponTemplate, CouponStatus, CouponType } from './coupon'
export type { BalanceInfo, BalanceRecord, BalanceRecordType, RechargePackage } from './balance'
export type { MessageInfo, MessageType, UnreadCount } from './message'
export type { LockInfo, UnlockRecord } from './smart-lock'
export type { FeedbackParams, FeedbackType, CityInfo, AgreementInfo } from './common'
