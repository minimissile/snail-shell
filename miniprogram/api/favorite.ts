// 收藏/足迹相关 API
import { get, post, del } from '../utils/request'
import type { PageResult } from './store'

// 收藏信息
export interface FavoriteInfo {
  id: string
  storeId: string
  storeName: string
  storeImage: string
  storeAddress: string
  lowestPrice: number
  rating: number
  createdAt: string
}

// 足迹信息
export interface FootprintInfo {
  id: string
  storeId: string
  storeName: string
  storeImage: string
  storeAddress: string
  lowestPrice: number
  visitTime: string
}

// 足迹分组（按日期）
export interface FootprintGroup {
  date: string
  dateText: string
  items: FootprintInfo[]
}

// 获取收藏列表
export function getFavorites(params?: { page?: number; pageSize?: number }): Promise<PageResult<FavoriteInfo>> {
  return get<PageResult<FavoriteInfo>>('/favorites', params, { needAuth: true })
}

// 添加收藏
export function addFavorite(storeId: string): Promise<{ id: string }> {
  return post<{ id: string }>('/favorites', { storeId }, { needAuth: true })
}

// 取消收藏
export function removeFavorite(storeId: string): Promise<void> {
  return del<void>(`/favorites/${storeId}`, undefined, { needAuth: true })
}

// 检查是否已收藏
export function checkFavorite(storeId: string): Promise<{ isFavorite: boolean }> {
  return get<{ isFavorite: boolean }>(`/favorites/check/${storeId}`, undefined, { needAuth: true })
}

// 获取足迹列表
export function getFootprints(params?: { page?: number; pageSize?: number }): Promise<FootprintGroup[]> {
  return get<FootprintGroup[]>('/footprints', params, { needAuth: true })
}

// 清空足迹
export function clearFootprints(): Promise<void> {
  return del<void>('/footprints', undefined, { needAuth: true })
}
