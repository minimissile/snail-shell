import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SearchStoresDto, GetRoomsDto, GetBedsDto, GetReviewsDto } from './dto'
import { paginate } from '../../common/dto'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  /**
   * 搜索门店列表
   */
  async searchStores(dto: SearchStoresDto, userId?: string) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      cityCode,
      district,
      lng,
      lat,
      minPrice,
      maxPrice,
      sortBy = 'popularity',
      sortOrder = 'desc',
    } = dto

    // 构建查询条件
    const where: any = {
      status: 'ACTIVE',
    }

    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { address: { contains: keyword } }]
    }

    if (cityCode) {
      where.cityCode = cityCode
    }

    if (district) {
      where.district = district
    }

    // 价格筛选 (通过关联房型)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.rooms = {
        some: {
          status: 'ACTIVE',
          ...(minPrice !== undefined && { price: { gte: minPrice } }),
          ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        },
      }
    }

    // 构建排序
    let orderBy: any = {}
    switch (sortBy) {
      case 'popularity':
        orderBy = { favoriteCount: sortOrder }
        break
      case 'price':
        // 按最低房价排序需要特殊处理
        orderBy = { rating: sortOrder }
        break
      default:
        orderBy = { favoriteCount: 'desc' }
    }

    // 查询门店
    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          rooms: {
            where: { status: 'ACTIVE' },
            orderBy: { price: 'asc' },
            take: 1,
            select: {
              price: true,
              originalPrice: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.store.count({ where }),
    ])

    // 获取用户收藏状态
    let favoriteSet = new Set<string>()
    if (userId) {
      const favorites = await this.prisma.favorite.findMany({
        where: {
          userId,
          storeId: { in: stores.map((s) => s.id) },
        },
        select: { storeId: true },
      })
      favoriteSet = new Set(favorites.map((f) => f.storeId))
    }

    // 格式化返回数据
    const list = stores.map((store) => {
      const lowestRoom = store.rooms[0]
      const distance =
        lng && lat ? this.calculateDistance(Number(store.latitude), Number(store.longitude), lat, lng) : null

      const images = (store.images || []) as string[]
      return {
        id: store.id,
        name: store.name,
        image: images[0] || '',
        images: images,
        imageCount: images.length,
        rating: Number(store.rating),
        ratingText: this.getRatingText(Number(store.rating)),
        reviewCount: store.reviewCount,
        highlightComment: '位置好，干净整洁',
        tags: ['平台验真'],
        features: ['独立卫浴', '智能门锁', '24H热水'],
        details: `8人女生房 | 可住1人 | 14㎡`,
        location: {
          address: store.address,
          district: store.district,
          lng: Number(store.longitude),
          lat: Number(store.latitude),
        },
        distance,
        price: lowestRoom ? Number(lowestRoom.price) : 0,
        originalPrice: lowestRoom?.originalPrice ? Number(lowestRoom.originalPrice) : null,
        savedAmount: lowestRoom?.originalPrice ? Number(lowestRoom.originalPrice) - Number(lowestRoom.price) : 0,
        memberDiscount: '钻石会员',
        isFavorite: favoriteSet.has(store.id),
      }
    })

    return paginate(list, total, page, pageSize)
  }

  /**
   * 获取门店详情
   */
  async getStoreDetail(storeId: string, userId?: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        features: true,
        facilities: true,
        highlights: true,
        rules: true,
        costRules: { orderBy: { sortOrder: 'asc' } },
        landlord: true,
      },
    })

    if (!store) {
      throw new NotFoundException('门店不存在')
    }

    // 检查是否已收藏
    let isFavorite = false
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: { userId_storeId: { userId, storeId } },
      })
      isFavorite = !!favorite
    }

    return {
      id: store.id,
      name: store.name,
      images: store.images,
      videoUrl: store.videoUrl,
      rating: Number(store.rating),
      reviewCount: store.reviewCount,
      favoriteCount: store.favoriteCount,
      isFavorite,
      location: {
        address: store.address,
        district: store.district,
        lng: Number(store.longitude),
        lat: Number(store.latitude),
        nearbyTransport: store.nearbyTransport,
      },
      businessHours: store.businessHours,
      features: store.features.map((f) => ({
        icon: f.icon,
        name: f.name,
      })),
      facilities: store.facilities.map((f) => ({
        category: f.category,
        items: f.items,
      })),
      highlights: store.highlights.map((h) => ({
        title: h.title,
        description: h.description,
      })),
      landlord: store.landlord
        ? {
            id: store.landlord.id,
            name: store.landlord.name,
            avatar: store.landlord.avatar,
            responseRate: store.landlord.responseRate,
            responseTime: store.landlord.responseTime,
            description: store.landlord.description,
          }
        : null,
      rules: store.rules[0]
        ? {
            checkInTime: store.rules[0].checkInTime,
            checkOutTime: store.rules[0].checkOutTime,
            cancelPolicy: store.rules[0].cancelPolicy,
            notices: store.rules[0].notices,
          }
        : null,
      costRules: store.costRules.map((r) => ({
        title: r.title,
        content: r.content,
      })),
    }
  }

  /**
   * 获取门店房型列表
   */
  async getRooms(storeId: string, dto: GetRoomsDto) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException('门店不存在')
    }

    const rooms = await this.prisma.room.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
      },
      include: {
        packages: true,
        beds: {
          select: { id: true },
        },
        _count: {
          select: { beds: true },
        },
      },
      orderBy: { price: 'asc' },
    })

    // 查询每个房型的可用床位数
    const checkInDate = dto.checkInDate ? new Date(dto.checkInDate) : new Date()
    const checkOutDate = dto.checkOutDate ? new Date(dto.checkOutDate) : new Date(Date.now() + 86400000)

    const result = await Promise.all(
      rooms.map(async (room) => {
        // 查询已预订的床位
        const bookedBeds = await this.prisma.bedBooking.findMany({
          where: {
            bed: { roomId: room.id },
            status: 'ACTIVE',
            OR: [
              {
                checkInDate: { lte: checkOutDate },
                checkOutDate: { gt: checkInDate },
              },
            ],
          },
          select: { bedId: true },
        })

        const bookedBedIds = new Set(bookedBeds.map((b) => b.bedId))
        const availableBeds = room._count.beds - bookedBedIds.size
        const roomImages = (room.images || []) as string[]
        const roomFeatures = (room.features || []) as string[]

        return {
          id: room.id,
          name: room.name,
          type: room.type.toLowerCase(),
          image: roomImages[0] || '',
          images: roomImages,
          bedCount: room._count.beds,
          availableBeds,
          area: room.area,
          floor: room.floor,
          price: Number(room.price),
          originalPrice: room.originalPrice ? Number(room.originalPrice) : null,
          priceUnit: '晚',
          hourPrice: room.hourPrice ? Number(room.hourPrice) : null,
          monthPrice: room.monthPrice ? Number(room.monthPrice) : null,
          features: roomFeatures,
          packages: room.packages.map((p) => ({
            type: p.type,
            icon: p.icon,
            name: p.name,
          })),
          hasSmartLock: room.hasSmartLock,
        }
      })
    )

    return result
  }

  /**
   * 获取床位状态
   */
  async getBeds(storeId: string, roomId: string, dto: GetBedsDto) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, storeId },
      include: {
        beds: {
          orderBy: [{ groupIndex: 'asc' }, { bedNumber: 'asc' }],
        },
      },
    })

    if (!room) {
      throw new NotFoundException('房型不存在')
    }

    const checkInDate = dto.checkInDate ? new Date(dto.checkInDate) : new Date()
    const checkOutDate = dto.checkOutDate ? new Date(dto.checkOutDate) : new Date(Date.now() + 86400000)

    // 查询已预订的床位
    const bookedBeds = await this.prisma.bedBooking.findMany({
      where: {
        bed: { roomId },
        status: 'ACTIVE',
        OR: [
          {
            checkInDate: { lte: checkOutDate },
            checkOutDate: { gt: checkInDate },
          },
        ],
      },
      select: { bedId: true },
    })

    const bookedBedIds = new Set(bookedBeds.map((b) => b.bedId))

    // 按组分组床位
    const bedGroups: any[] = []
    let currentGroup: any = null

    for (const bed of room.beds) {
      if (!currentGroup || currentGroup.groupIndex !== bed.groupIndex) {
        currentGroup = {
          id: `group_${bed.groupIndex}`,
          groupIndex: bed.groupIndex,
          beds: [],
        }
        bedGroups.push(currentGroup)
      }

      currentGroup.beds.push({
        id: bed.bedNumber,
        position: bed.position.toLowerCase().replace('_', '-'),
        status: bookedBedIds.has(bed.id) ? 'unavailable' : 'available',
        price: Number(room.price),
        bedId: bed.id,
      })
    }

    return {
      roomId: room.id,
      roomName: room.name,
      bedGroups,
      priceInfo: {
        basePrice: Number(room.price),
        weekendPrice: room.weekendPrice ? Number(room.weekendPrice) : null,
        holidayPrice: room.holidayPrice ? Number(room.holidayPrice) : null,
      },
    }
  }

  /**
   * 获取门店点评
   */
  async getReviews(storeId: string, dto: GetReviewsDto) {
    const { page = 1, pageSize = 10, tag } = dto

    // 构建查询条件
    const where: any = {
      storeId,
      status: 'ACTIVE',
    }

    if (tag === '好评') {
      where.rating = { gte: 4 }
    } else if (tag === '差评') {
      where.rating = { lte: 2 }
    } else if (tag === '有图') {
      where.images = { isEmpty: false }
    }

    // 查询点评
    const [reviews, total, summary] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: { nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
      this.getReviewSummary(storeId),
    ])

    return {
      summary,
      ...paginate(
        reviews.map((r) => ({
          id: r.id,
          user: {
            nickname: r.user.nickname || '匿名用户',
            avatar: r.user.avatar,
          },
          rating: r.rating,
          content: r.content,
          images: r.images,
          roomType: r.roomType,
          stayDate: r.stayDate,
          createdAt: r.createdAt,
          reply: r.replyContent
            ? {
                content: r.replyContent,
                createdAt: r.replyAt,
              }
            : null,
        })),
        total,
        page,
        pageSize
      ),
    }
  }

  /**
   * 获取点评统计
   */
  private async getReviewSummary(storeId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { storeId, status: 'ACTIVE' },
      select: { rating: true },
    })

    const totalCount = reviews.length
    const averageRating = totalCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount : 0

    // 评分分布
    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      ratingDistribution[r.rating]++
    })

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalCount,
      ratingDistribution,
      tags: [
        { name: '位置好', count: Math.floor(totalCount * 0.5) },
        { name: '干净整洁', count: Math.floor(totalCount * 0.4) },
        { name: '服务热情', count: Math.floor(totalCount * 0.3) },
      ],
    }
  }

  /**
   * 计算两点间距离 (km)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // 地球半径 km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c * 10) / 10
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180
  }

  /**
   * 获取评分文本
   */
  private getRatingText(rating: number): string {
    if (rating >= 4.8) return '超棒'
    if (rating >= 4.5) return '很好'
    if (rating >= 4.0) return '不错'
    if (rating >= 3.0) return '一般'
    return '较差'
  }
}
