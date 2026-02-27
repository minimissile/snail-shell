import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { paginate } from '../../../common/dto'
import {
  QueryStoresDto,
  CreateStoreDto,
  UpdateStoreDto,
  UpdateStoreStatusDto,
  CreateRoomDto,
  UpdateRoomDto,
} from './dto'

@Injectable()
export class AdminStoreService {
  constructor(private prisma: PrismaService) {}

  // ==================== 门店管理 ====================

  async findStores(dto: QueryStoresDto) {
    const { page = 1, pageSize = 10, keyword, cityCode, district, status } = dto
    const where: any = {}

    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { address: { contains: keyword } }]
    }
    if (cityCode) where.cityCode = cityCode
    if (district) where.district = district
    if (status) where.status = status

    const [list, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          _count: { select: { rooms: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.store.count({ where }),
    ])

    return paginate(list, total, page, pageSize)
  }

  async findStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        features: true,
        facilities: true,
        highlights: true,
        rules: true,
        costRules: { orderBy: { sortOrder: 'asc' } },
        landlord: true,
        rooms: {
          include: {
            _count: { select: { beds: true } },
          },
        },
        _count: { select: { orders: true, reviews: true, favorites: true } },
      },
    })

    if (!store) {
      throw new NotFoundException('门店不存在')
    }

    return store
  }

  async createStore(dto: CreateStoreDto) {
    return this.prisma.store.create({
      data: {
        name: dto.name,
        description: dto.description,
        images: dto.images || [],
        videoUrl: dto.videoUrl,
        address: dto.address,
        district: dto.district,
        cityCode: dto.cityCode,
        longitude: dto.longitude,
        latitude: dto.latitude,
        nearbyTransport: dto.nearbyTransport,
        businessHours: dto.businessHours || '全天营业',
        phone: dto.phone,
      },
    })
  }

  async updateStore(id: string, dto: UpdateStoreDto) {
    await this.ensureStoreExists(id)

    const data: any = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.description !== undefined) data.description = dto.description
    if (dto.images !== undefined) data.images = dto.images
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl
    if (dto.address !== undefined) data.address = dto.address
    if (dto.district !== undefined) data.district = dto.district
    if (dto.cityCode !== undefined) data.cityCode = dto.cityCode
    if (dto.longitude !== undefined) data.longitude = dto.longitude
    if (dto.latitude !== undefined) data.latitude = dto.latitude
    if (dto.nearbyTransport !== undefined) data.nearbyTransport = dto.nearbyTransport
    if (dto.businessHours !== undefined) data.businessHours = dto.businessHours
    if (dto.phone !== undefined) data.phone = dto.phone

    return this.prisma.store.update({ where: { id }, data })
  }

  async deleteStore(id: string) {
    await this.ensureStoreExists(id)

    const activeOrders = await this.prisma.order.count({
      where: {
        storeId: id,
        status: { in: ['PENDING_PAYMENT', 'PENDING_USE', 'IN_USE'] },
      },
    })

    if (activeOrders > 0) {
      throw new BadRequestException(`该门店还有 ${activeOrders} 个未完成订单，无法删除`)
    }

    await this.prisma.store.delete({ where: { id } })
    return { message: '删除成功' }
  }

  async updateStoreStatus(id: string, dto: UpdateStoreStatusDto) {
    await this.ensureStoreExists(id)
    return this.prisma.store.update({
      where: { id },
      data: { status: dto.status as any },
    })
  }

  // ==================== 房型管理 ====================

  async findRooms(storeId: string) {
    await this.ensureStoreExists(storeId)

    return this.prisma.room.findMany({
      where: { storeId },
      include: {
        beds: { orderBy: { bedNumber: 'asc' } },
        packages: true,
        _count: { select: { beds: true, orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findRoomById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true } },
        beds: { orderBy: { bedNumber: 'asc' } },
        packages: true,
      },
    })

    if (!room) {
      throw new NotFoundException('房型不存在')
    }

    return room
  }

  async createRoom(storeId: string, dto: CreateRoomDto) {
    await this.ensureStoreExists(storeId)

    const room = await this.prisma.room.create({
      data: {
        storeId,
        name: dto.name,
        type: dto.type as any,
        images: dto.images || [],
        bedCount: dto.bedCount,
        area: dto.area,
        floor: dto.floor,
        price: dto.price,
        originalPrice: dto.originalPrice,
        hourPrice: dto.hourPrice,
        monthPrice: dto.monthPrice,
        weekendPrice: dto.weekendPrice,
        holidayPrice: dto.holidayPrice,
        features: dto.features || [],
        hasSmartLock: dto.hasSmartLock ?? true,
      },
    })

    // 自动生成床位
    if (dto.autoGenerateBeds !== false && dto.bedCount > 0) {
      const positions = ['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT']
      const beds = []
      for (let i = 0; i < dto.bedCount; i++) {
        const groupIndex = Math.floor(i / 4)
        const letter = String.fromCharCode(65 + groupIndex)
        const posIndex = i % 4
        beds.push({
          roomId: room.id,
          bedNumber: `${letter}${posIndex + 1}`,
          position: positions[posIndex] as any,
          groupIndex,
        })
      }
      await this.prisma.bed.createMany({ data: beds })
    }

    return this.findRoomById(room.id)
  }

  async updateRoom(id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } })
    if (!room) throw new NotFoundException('房型不存在')

    const data: any = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.type !== undefined) data.type = dto.type
    if (dto.images !== undefined) data.images = dto.images
    if (dto.bedCount !== undefined) data.bedCount = dto.bedCount
    if (dto.area !== undefined) data.area = dto.area
    if (dto.floor !== undefined) data.floor = dto.floor
    if (dto.price !== undefined) data.price = dto.price
    if (dto.originalPrice !== undefined) data.originalPrice = dto.originalPrice
    if (dto.hourPrice !== undefined) data.hourPrice = dto.hourPrice
    if (dto.monthPrice !== undefined) data.monthPrice = dto.monthPrice
    if (dto.weekendPrice !== undefined) data.weekendPrice = dto.weekendPrice
    if (dto.holidayPrice !== undefined) data.holidayPrice = dto.holidayPrice
    if (dto.features !== undefined) data.features = dto.features
    if (dto.hasSmartLock !== undefined) data.hasSmartLock = dto.hasSmartLock

    return this.prisma.room.update({ where: { id }, data })
  }

  async deleteRoom(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } })
    if (!room) throw new NotFoundException('房型不存在')

    const activeBookings = await this.prisma.bedBooking.count({
      where: {
        bed: { roomId: id },
        status: 'ACTIVE',
      },
    })

    if (activeBookings > 0) {
      throw new BadRequestException('该房型还有活跃的预订，无法删除')
    }

    await this.prisma.room.delete({ where: { id } })
    return { message: '删除成功' }
  }

  async deleteBed(id: string) {
    const bed = await this.prisma.bed.findUnique({ where: { id } })
    if (!bed) throw new NotFoundException('床位不存在')

    const activeBookings = await this.prisma.bedBooking.count({
      where: { bedId: id, status: 'ACTIVE' },
    })

    if (activeBookings > 0) {
      throw new BadRequestException('该床位有活跃预订，无法删除')
    }

    await this.prisma.bed.delete({ where: { id } })
    return { message: '删除成功' }
  }

  private async ensureStoreExists(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } })
    if (!store) throw new NotFoundException('门店不存在')
    return store
  }
}
