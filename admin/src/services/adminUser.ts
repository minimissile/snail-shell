import { get, post, put, del } from './request'

export const adminUserApi = {
  getAdmins: (params?: any) => get('/admin-users', params),
  getAdmin: (id: string) => get(`/admin-users/${id}`),
  createAdmin: (data: any) => post('/admin-users', data),
  updateAdmin: (id: string, data: any) => put(`/admin-users/${id}`, data),
  deleteAdmin: (id: string) => del(`/admin-users/${id}`),
  updateAdminStatus: (id: string, status: string) => put(`/admin-users/${id}/status`, { status }),
  assignRoles: (id: string, roleIds: string[]) => put(`/admin-users/${id}/roles`, { roleIds }),
  resetPassword: (id: string) => put(`/admin-users/${id}/reset-password`),

  getRoles: () => get('/roles'),
  createRole: (data: any) => post('/roles', data),
  updateRolePermissions: (id: string, permissionIds: string[]) => put(`/roles/${id}/permissions`, { permissionIds }),

  getPermissions: () => get('/permissions'),
}
