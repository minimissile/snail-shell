// 消息相关 API
import { get, post } from '../utils/request'
import type { PageResult } from './store'

// 消息类型
export type MessageType = 'system' | 'order' | 'coupon' | 'activity'

// 消息信息
export interface MessageInfo {
  id: string
  type: MessageType
  title: string
  content: string
  isRead: boolean
  extra?: {
    orderId?: string
    couponId?: string
    url?: string
  }
  createdAt: string
}

// 未读消息统计
export interface UnreadCount {
  total: number
  system: number
  order: number
  coupon: number
  activity: number
}

// 获取消息列表
export function getMessages(params?: {
  type?: MessageType
  page?: number
  pageSize?: number
}): Promise<PageResult<MessageInfo>> {
  return get<PageResult<MessageInfo>>('/messages', params, { needAuth: true })
}

// 获取未读消息数
export function getUnreadCount(): Promise<UnreadCount> {
  return get<UnreadCount>('/messages/unread', undefined, { needAuth: true })
}

// 标记消息已读
export function markAsRead(messageId: string): Promise<void> {
  return post<void>(`/messages/${messageId}/read`, undefined, { needAuth: true })
}

// 标记全部已读
export function markAllAsRead(type?: MessageType): Promise<void> {
  return post<void>('/messages/read-all', { type }, { needAuth: true })
}

// 删除消息
export function deleteMessage(messageId: string): Promise<void> {
  return post<void>(`/messages/${messageId}/delete`, undefined, { needAuth: true })
}
