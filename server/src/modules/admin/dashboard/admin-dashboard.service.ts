import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayOrders, todayRevenue, totalUsers, totalStores, pendingRefunds] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { in: ['PENDING_USE', 'IN_USE', 'COMPLETED'] },
        },
        _sum: { finalPrice: true },
      }),
      this.prisma.user.count(),
      this.prisma.store.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count({
        where: { refundStatus: 'PENDING' },
      }),
    ])

    return {
      todayOrders,
      todayRevenue: todayRevenue._sum.finalPrice?.toNumber() || 0,
      totalUsers,
      totalStores,
      pendingRefunds,
    }
  }

  async getRevenueStats(range: string = '7d') {
    const days = range === '30d' ? 30 : range === '14d' ? 14 : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PENDING_USE', 'IN_USE', 'COMPLETED'] },
      },
      select: { createdAt: true, finalPrice: true },
    })

    const revenueMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      revenueMap.set(date.toISOString().split('T')[0], 0)
    }

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const current = revenueMap.get(dateKey) || 0
      revenueMap.set(dateKey, current + order.finalPrice.toNumber())
    })

    return Array.from(revenueMap.entries()).map(([date, value]) => ({
      date,
      value,
    }))
  }

  async getOrderStats(range: string = '7d') {
    const days = range === '30d' ? 30 : range === '14d' ? 14 : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true },
    })

    const orderMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      orderMap.set(date.toISOString().split('T')[0], 0)
    }

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const current = orderMap.get(dateKey) || 0
      orderMap.set(dateKey, current + 1)
    })

    return Array.from(orderMap.entries()).map(([date, value]) => ({
      date,
      value,
    }))
  }

  async getUserStats(range: string = '30d') {
    const days = range === '30d' ? 30 : range === '14d' ? 14 : 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    })

    const userMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      userMap.set(date.toISOString().split('T')[0], 0)
    }

    users.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split('T')[0]
      const current = userMap.get(dateKey) || 0
      userMap.set(dateKey, current + 1)
    })

    return Array.from(userMap.entries()).map(([date, value]) => ({
      date,
      value,
    }))
  }

  async getStoreRanking() {
    const stores = await this.prisma.store.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        _count: { select: { orders: true } },
      },
      orderBy: { orders: { _count: 'desc' } },
      take: 10,
    })

    return stores.map((store, index) => ({
      rank: index + 1,
      id: store.id,
      name: store.name,
      orderCount: store._count.orders,
    }))
  }

  async getOccupancy() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [totalBeds, bookedBeds] = await Promise.all([
      this.prisma.bed.count({
        where: { room: { status: 'ACTIVE', store: { status: 'ACTIVE' } } },
      }),
      this.prisma.bedBooking.count({
        where: {
          status: 'ACTIVE',
          checkInDate: { lte: today },
          checkOutDate: { gt: today },
        },
      }),
    ])

    return {
      totalBeds,
      bookedBeds,
      occupancyRate: totalBeds > 0 ? Math.round((bookedBeds / totalBeds) * 10000) / 100 : 0,
    }
  }
}
