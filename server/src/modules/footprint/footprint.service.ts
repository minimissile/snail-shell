import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { paginate } from '../../common/dto'

@Injectable()
export class FootprintService {
  constructor(private prisma: PrismaService) {}

  /**
   * 添加足迹
   */
  async addFootprint(userId: string, storeId: string) {
    // 验证门店是否存在
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException('门店不存在')
    }

    // 检查是否已存在足迹，如果存在则更新访问时间
    const existingFootprint = await this.prisma.footprint.findFirst({
      where: {
        userId,
        storeId,
      },
    })

    if (existingFootprint) {
      // 更新访问时间
      return await this.prisma.footprint.update({
        where: { id: existingFootprint.id },
        data: { viewedAt: new Date() },
      })
    }

    // 创建新足迹
    return await this.prisma.footprint.create({
      data: {
        userId,
        storeId,
      },
    })
  }

  /**
   * 获取足迹列表
   */
  async getFootprints(userId: string, page = 1, pageSize = 10) {
    const [footprints, total] = await Promise.all([
      this.prisma.footprint.findMany({
        where: { userId },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              images: true,
              rating: true,
              reviewCount: true,
            },
          },
        },
        orderBy: { viewedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.footprint.count({
        where: { userId },
      }),
    ])

    return paginate(
      footprints.map((footprint) => ({
        id: footprint.id,
        storeId: footprint.storeId,
        store: {
          id: footprint.store.id,
          name: footprint.store.name,
          address: footprint.store.address,
          images: footprint.store.images,
          rating: Number(footprint.store.rating),
          reviewCount: footprint.store.reviewCount,
        },
        viewedAt: footprint.viewedAt,
      })),
      total,
      page,
      pageSize
    )
  }

  /**
   * 清空足迹
   */
  async clearFootprints(userId: string) {
    await this.prisma.footprint.deleteMany({
      where: { userId },
    })

    return { success: true }
  }

  /**
   * 删除单个足迹
   */
  async removeFootprint(userId: string, footprintId: string) {
    const footprint = await this.prisma.footprint.findFirst({
      where: {
        id: footprintId,
        userId,
      },
    })

    if (!footprint) {
      throw new NotFoundException('足迹不存在')
    }

    await this.prisma.footprint.delete({
      where: { id: footprintId },
    })

    return { success: true }
  }
}