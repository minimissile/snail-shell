import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { paginate } from '../../../common/dto'
import {
  QueryCouponTemplatesDto,
  CreateCouponTemplateDto,
  UpdateCouponTemplateDto,
  UpdateCouponStatusDto,
  DistributeCouponDto,
} from './dto'

@Injectable()
export class AdminCouponService {
  constructor(private prisma: PrismaService) {}

  async findTemplates(dto: QueryCouponTemplatesDto) {
    const { page = 1, pageSize = 10, status, type } = dto
    const where: any = {}

    if (status) where.status = status
    if (type) where.type = type

    const [list, total] = await Promise.all([
      this.prisma.couponTemplate.findMany({
        where,
        include: { _count: { select: { userCoupons: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.couponTemplate.count({ where }),
    ])

    return paginate(list, total, page, pageSize)
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.couponTemplate.findUnique({
      where: { id },
      include: { _count: { select: { userCoupons: true } } },
    })
    if (!template) throw new NotFoundException('优惠券模板不存在')
    return template
  }

  async createTemplate(dto: CreateCouponTemplateDto) {
    return this.prisma.couponTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type as any,
        amount: dto.amount,
        discountRate: dto.discountRate,
        minAmount: dto.minAmount || 0,
        validType: dto.validType as any,
        validDays: dto.validDays,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
        applicableStores: dto.applicableStores || [],
        applicableRooms: dto.applicableRooms || [],
        totalCount: dto.totalCount ?? -1,
        perUserLimit: dto.perUserLimit ?? 1,
      },
    })
  }

  async updateTemplate(id: string, dto: UpdateCouponTemplateDto) {
    await this.findTemplateById(id)

    const data: any = {}
    if (dto.name !== undefined) data.name = dto.name
    if (dto.description !== undefined) data.description = dto.description
    if (dto.amount !== undefined) data.amount = dto.amount
    if (dto.discountRate !== undefined) data.discountRate = dto.discountRate
    if (dto.minAmount !== undefined) data.minAmount = dto.minAmount
    if (dto.validDays !== undefined) data.validDays = dto.validDays
    if (dto.validFrom !== undefined) data.validFrom = new Date(dto.validFrom)
    if (dto.validTo !== undefined) data.validTo = new Date(dto.validTo)
    if (dto.applicableStores !== undefined) data.applicableStores = dto.applicableStores
    if (dto.applicableRooms !== undefined) data.applicableRooms = dto.applicableRooms
    if (dto.totalCount !== undefined) data.totalCount = dto.totalCount
    if (dto.perUserLimit !== undefined) data.perUserLimit = dto.perUserLimit

    return this.prisma.couponTemplate.update({ where: { id }, data })
  }

  async deleteTemplate(id: string) {
    await this.findTemplateById(id)
    const usedCount = await this.prisma.userCoupon.count({
      where: { templateId: id, status: 'USED' },
    })
    if (usedCount > 0) {
      throw new BadRequestException('该模板已有用户使用，无法删除')
    }
    await this.prisma.couponTemplate.delete({ where: { id } })
    return { message: '删除成功' }
  }

  async updateTemplateStatus(id: string, dto: UpdateCouponStatusDto) {
    await this.findTemplateById(id)
    return this.prisma.couponTemplate.update({
      where: { id },
      data: { status: dto.status as any },
    })
  }

  async distribute(id: string, dto: DistributeCouponDto) {
    const template = await this.findTemplateById(id)
    if (template.status !== 'ACTIVE') {
      throw new BadRequestException('优惠券模板未启用')
    }

    // 确定目标用户
    const userWhere: any = {}
    if (dto.userIds && dto.userIds.length > 0) {
      userWhere.id = { in: dto.userIds }
    } else if (dto.memberLevel) {
      userWhere.memberLevel = dto.memberLevel
    }

    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    })

    if (users.length === 0) {
      throw new BadRequestException('没有符合条件的用户')
    }

    // 计算有效期
    const now = new Date()
    let validFrom: Date
    let validTo: Date

    if (template.validType === 'FIXED') {
      validFrom = template.validFrom || now
      validTo = template.validTo || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    } else {
      validFrom = now
      validTo = new Date(now.getTime() + (template.validDays || 30) * 24 * 60 * 60 * 1000)
    }

    // 批量创建
    const data = users.map((user) => ({
      userId: user.id,
      templateId: id,
      validFrom,
      validTo,
    }))

    const result = await this.prisma.userCoupon.createMany({ data })
    return { message: `成功发放 ${result.count} 张优惠券` }
  }

  async findRecords(id: string, page: number = 1, pageSize: number = 10) {
    const [list, total] = await Promise.all([
      this.prisma.userCoupon.findMany({
        where: { templateId: id },
        include: {
          user: { select: { id: true, nickname: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.userCoupon.count({ where: { templateId: id } }),
    ])

    return paginate(list, total, page, pageSize)
  }
}
