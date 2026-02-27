import { get, post, put } from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  admin: {
    id: string
    username: string
    realName: string
    avatar: string | null
    roles: string[]
    permissions: string[]
  }
}

export interface AdminProfile {
  id: string
  username: string
  realName: string
  phone: string | null
  email: string | null
  avatar: string | null
  roles: string[]
  permissions: string[]
  lastLoginAt: string | null
}

export const authApi = {
  login: (data: LoginParams) => post<LoginResult>('/auth/login', data),
  getProfile: () => get<AdminProfile>('/auth/profile'),
  changePassword: (data: { oldPassword: string; newPassword: string }) => put('/auth/password', data),
}
