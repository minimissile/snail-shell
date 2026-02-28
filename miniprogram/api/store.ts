// 门店相关 API
import { get } from '../utils/request'

// 门店信息
export interface StoreInfo {
  id: string
  name: string
  image: string
  images: string[]
  imageCount: number
  rating: number
  ratingText: string
  reviewCount: number
  highlightComment: string
  tags: string[]
  features: string[]
  details: string
  location: {
    address: string
    district: string
    lng: number
    lat: number
  }
  distance?: number
  price: number
  originalPrice?: number
  savedAmount: number
  memberDiscount?: string
  isFavorite?: boolean
}

// 门店详情
export interface StoreDetail extends StoreInfo {
  description: string
  notices: string[]
  facilities: string[]
  checkInTime: string
  checkOutTime: string
  deposit: number
  cancelPolicy: string
  landlord: {
    name: string
    avatar: string
    badge: string
  }
}

// 房型信息
export interface RoomInfo {
  id: string
  storeId: string
  name: string
  type: string
  bedCount: number
  price: number
  originalPrice: number
  images: string[]
  facilities: string[]
  available: number
  total: number
}

// 床位信息
export interface BedInfo {
  id: string
  roomId: string
  bedNumber: string
  status: 'available' | 'occupied' | 'reserved'
  position: string
}

// 点评信息
export interface ReviewInfo {
  id: string
  userId: string
  userName: string
  userAvatar: string
  storeId: string
  orderId: string
  rating: number
  content: string
  images: string[]
  reply?: string
  createdAt: string
}

// 搜索门店参数
export interface SearchStoresParams {
  keyword?: string
  cityCode?: string
  district?: string
  lng?: number
  lat?: number
  checkInDate?: string
  checkOutDate?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'distance' | 'price' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

// 分页响应
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 搜索门店
export function searchStores(params: SearchStoresParams): Promise<PageResult<StoreInfo>> {
  return get<PageResult<StoreInfo>>('/stores', params)
}

// 获取门店详情
export function getStoreDetail(storeId: string): Promise<StoreDetail> {
  return get<StoreDetail>(`/stores/${storeId}`, undefined, { needAuth: true })
}

// 获取门店房型列表
export function getRooms(storeId: string, params?: { checkIn?: string; checkOut?: string }): Promise<RoomInfo[]> {
  return get<RoomInfo[]>(`/stores/${storeId}/rooms`, params)
}

// 获取床位状态
export function getBeds(storeId: string, roomId: string, params?: { date?: string }): Promise<BedInfo[]> {
  return get<BedInfo[]>(`/stores/${storeId}/rooms/${roomId}/beds`, params)
}

// 获取门店点评
export function getReviews(
  storeId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PageResult<ReviewInfo>> {
  return get<PageResult<ReviewInfo>>(`/stores/${storeId}/reviews`, params)
}
