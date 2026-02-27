import { get } from './request'

export const dashboardApi = {
  getOverview: () => get('/dashboard/overview'),
  getRevenue: (range?: string) => get('/dashboard/revenue', { range }),
  getOrderStats: (range?: string) => get('/dashboard/orders', { range }),
  getUserStats: (range?: string) => get('/dashboard/users', { range }),
  getStoreRanking: () => get('/dashboard/stores/ranking'),
  getOccupancy: () => get('/dashboard/occupancy'),
}
