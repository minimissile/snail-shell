// 智能门锁相关 API
import { get, post } from '../utils/request'

// 门锁信息
export interface LockInfo {
  id: string
  orderId: string
  storeId: string
  storeName: string
  roomName: string
  bedNumber: string
  lockSn: string
  password?: string
  passwordValidFrom?: string
  passwordValidTo?: string
  bluetoothKey?: string
  status: 'pending' | 'active' | 'expired'
}

// 开锁记录
export interface UnlockRecord {
  id: string
  lockId: string
  method: 'password' | 'bluetooth' | 'remote'
  success: boolean
  message?: string
  createdAt: string
}

// 获取我的门锁列表
export function getMyLocks(): Promise<LockInfo[]> {
  return get<LockInfo[]>('/smart-locks', undefined, { needAuth: true })
}

// 获取门锁详情
export function getLockDetail(lockId: string): Promise<LockInfo> {
  return get<LockInfo>(`/smart-locks/${lockId}`, undefined, { needAuth: true })
}

// 获取门锁密码
export function getLockPassword(lockId: string): Promise<{ password: string; validFrom: string; validTo: string }> {
  return get<{ password: string; validFrom: string; validTo: string }>(`/smart-locks/${lockId}/password`, undefined, {
    needAuth: true,
  })
}

// 获取蓝牙开锁密钥
export function getBluetoothKey(lockId: string): Promise<{ key: string; validTo: string }> {
  return get<{ key: string; validTo: string }>(`/smart-locks/${lockId}/bluetooth-key`, undefined, { needAuth: true })
}

// 远程开锁
export function remoteUnlock(lockId: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(`/smart-locks/${lockId}/unlock`, undefined, {
    needAuth: true,
    showLoading: true,
    loadingText: '开锁中...',
  })
}

// 获取开锁记录
export function getUnlockRecords(lockId: string): Promise<UnlockRecord[]> {
  return get<UnlockRecord[]>(`/smart-locks/${lockId}/records`, undefined, { needAuth: true })
}
