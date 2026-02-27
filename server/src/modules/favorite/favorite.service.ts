import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { paginate } from '../../common/dto'

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取收藏列表
   */
  async getFavorites(userId: string, page = 1, pageSize = 10) {
    const where = { userId }

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        include: {
          store: {
            include: {
              rooms: {
                where: { status: 'ACTIVE' },
                orderBy: { price: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.favorite.count({ where }),
    ])

    return paginate(
      favorites.map((f) => {
        const storeImages = (f.store.images || []) as string[]
        return {
          id: f.id,
          store: {
            id: f.store.id,
            name: f.store.name,
            image: storeImages[0] || '',
            rating: Number(f.store.rating),
            reviewCount: f.store.reviewCount,
            location: f.store.district,
            price: f.store.rooms[0] ? Number(f.store.rooms[0].price) : 0,
            tag: '平台验真',
          },
          createdAt: f.createdAt,
        }
      }),
      total,
      page,
      pageSize
    )
  }

  /**
   * 添加收藏
   */
  async addFavorite(userId: string, storeId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.favorite.create({
          data: { userId, storeId },
        })
        await tx.store.update({
          where: { id: storeId },
          data: { favoriteCount: { increment: 1 } },
        })
      })
      return { success: true }
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('已收藏该门店')
      }
      throw error
    }
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: string, storeId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.favorite.delete({
        where: { userId_storeId: { userId, storeId } },
      })
      await tx.store.update({
        where: { id: storeId },
        data: { favoriteCount: { decrement: 1 } },
      })
    })
    return { success: true }
  }

  /**
   * 获取浏览足迹
   */
  async getFootprints(userId: string, date?: string, page = 1, pageSize = 10) {
    const where: any = { userId }

    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      where.viewedAt = { gte: start, lt: end }
    }

    const [footprints, total] = await Promise.all([
      this.prisma.footprint.findMany({
        where,
        include: {
          store: {
            include: {
              rooms: {
                where: { status: 'ACTIVE' },
                orderBy: { price: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { viewedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.footprint.count({ where }),
    ])

    // 按日期分组
    const grouped: Record<string, any[]> = {}
    const today = new Date().toISOString().split('T')[0]

    for (const fp of footprints) {
      const dateKey = fp.viewedAt.toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      const fpImages = (fp.store.images || []) as string[]
      grouped[dateKey].push({
        id: fp.id,
        store: {
          id: fp.store.id,
          name: fp.store.name,
          image: fpImages[0] || '',
          rating: Number(fp.store.rating),
          reviewCount: fp.store.reviewCount,
          location: fp.store.district,
          price: fp.store.rooms[0] ? Number(fp.store.rooms[0].price) : 0,
        },
        viewedAt: fp.viewedAt,
      })
    }

    const list = Object.entries(grouped).map(([dateKey, items]) => ({
      date: dateKey,
      label: dateKey === today ? '今天' : dateKey,
      items,
    }))

    return paginate(list, total, page, pageSize)
  }

  /**
   * 记录浏览
   */
  async recordFootprint(userId: string, storeId: string) {
    // 使用 upsert 避免重复记录
    await this.prisma.footprint.create({
      data: { userId, storeId },
    })
    return { success: true }
  }
}
