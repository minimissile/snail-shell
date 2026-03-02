import request from './request'

// 设备列表
export interface SmartLockDevice {
  id: string
  deviceId: string
  name: string
  storeId: string
  storeName?: string
  roomId?: string
  roomName?: string
  macAddress?: string
  firmware?: string
  battery: number
  serviceUuid?: string
  writeUuid?: string
  notifyUuid?: string
  status: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'DISABLED'
  createdAt: string
  updatedAt: string
  _count?: {
    accessList: number
  }
}

// 创建设备
export interface CreateDeviceDto {
  deviceId: string
  name: string
  storeId: string
  roomId?: string
  macAddress?: string
  firmware?: string
  serviceUuid?: string
  writeUuid?: string
  notifyUuid?: string
}

// 更新设备
export interface UpdateDeviceDto {
  name?: string
  roomId?: string
  macAddress?: string
  firmware?: string
  battery?: number
  serviceUuid?: string
  writeUuid?: string
  notifyUuid?: string
  status?: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'DISABLED'
}

// 查询参数
export interface QueryDevicesParams {
  storeId?: string
  roomId?: string
  status?: 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'DISABLED'
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// 获取设备列表
export function getDeviceList(params: QueryDevicesParams): Promise<PaginatedResponse<SmartLockDevice>> {
  return request.get('/admin/smart-lock-devices', { params })
}

// 获取设备详情
export function getDeviceDetail(id: string): Promise<SmartLockDevice> {
  return request.get(`/admin/smart-lock-devices/${id}`)
}

// 创建设备
export function createDevice(data: CreateDeviceDto): Promise<SmartLockDevice> {
  return request.post('/admin/smart-lock-devices', data)
}

// 更新设备
export function updateDevice(id: string, data: UpdateDeviceDto): Promise<SmartLockDevice> {
  return request.put(`/admin/smart-lock-devices/${id}`, data)
}

// 删除设备
export function deleteDevice(id: string): Promise<{ success: boolean }> {
  return request.delete(`/admin/smart-lock-devices/${id}`)
}

// 为订单分配设备
export function assignDevice(orderId: string): Promise<any> {
  return request.post(`/admin/smart-lock-devices/assign/${orderId}`)
}
