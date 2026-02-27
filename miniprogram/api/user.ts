// 用户相关 API
import { get, post, put, del } from '../utils/request'

// 用户资料
export interface UserProfile {
  id: string
  openId: string
  phone?: string
  nickname: string
  avatar: string
  memberLevel: string
  points: number
  balance: number
  couponCount: number
}

// 入住人信息
export interface GuestInfo {
  id: string
  name: string
  phone: string
  idType: string
  idNumber: string
  isDefault: boolean
}

// 创建入住人参数
export interface CreateGuestParams {
  name: string
  phone: string
  idType?: string
  idNumber: string
  isDefault?: boolean
}

// 获取用户资料
export function getProfile(): Promise<UserProfile> {
  return get<UserProfile>('/user/profile', undefined, { needAuth: true })
}

// 更新用户资料
export function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return put<UserProfile>('/user/profile', data, { needAuth: true })
}

// 获取入住人列表
export function getGuests(): Promise<GuestInfo[]> {
  return get<GuestInfo[]>('/user/guests', undefined, { needAuth: true })
}

// 创建入住人
export function createGuest(data: CreateGuestParams): Promise<GuestInfo> {
  return post<GuestInfo>('/user/guests', data, { needAuth: true })
}

// 更新入住人
export function updateGuest(guestId: string, data: Partial<CreateGuestParams>): Promise<GuestInfo> {
  return put<GuestInfo>(`/user/guests/${guestId}`, data, { needAuth: true })
}

// 删除入住人
export function deleteGuest(guestId: string): Promise<void> {
  return del<void>(`/user/guests/${guestId}`, undefined, { needAuth: true })
}

// 设为默认入住人
export function setDefaultGuest(guestId: string): Promise<void> {
  return post<void>(`/user/guests/${guestId}/default`, undefined, { needAuth: true })
}
