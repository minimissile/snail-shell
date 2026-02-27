import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { paginate, PaginationDto } from '../../common/dto'

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户优惠券列表
   */
  async getCoupons(userId: string, status?: string, page = 1, pageSize = 10) {
    const where: any = { userId }

    if (status === 'available') {
      where.status = 'AVAILABLE'
      where.validTo = { gte: new Date() }
    } else if (status === 'used') {
      where.status = 'USED'
    } else if (status === 'expired') {
      where.OR = [{ status: 'EXPIRED' }, { status: 'AVAILABLE', validTo: { lt: new Date() } }]
    }

    // 获取各状态数量
    const [available, used, expired] = await Promise.all([
      this.prisma.userCoupon.count({
        where: { userId, status: 'AVAILABLE', validTo: { gte: new Date() } },
      }),
      this.prisma.userCoupon.count({ where: { userId, status: 'USED' } }),
      this.prisma.userCoupon.count({
        where: {
          userId,
          OR: [{ status: 'EXPIRED' }, { status: 'AVAILABLE', validTo: { lt: new Date() } }],
        },
      }),
    ])

    const [coupons, total] = await Promise.all([
      this.prisma.userCoupon.findMany({
        where,
        include: { template: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.userCoupon.count({ where }),
    ])

    return {
      counts: { available, used, expired },
      ...paginate(
        coupons.map((c) => ({
          id: c.id,
          type: c.template.type.toLowerCase(),
          name: c.template.name,
          description: c.template.description,
          amount: c.template.amount ? Number(c.template.amount) : null,
          minAmount: Number(c.template.minAmount),
          discountRate: c.template.discountRate ? Number(c.template.discountRate) : null,
          validFrom: c.validFrom.toISOString().split('T')[0],
          validTo: c.validTo.toISOString().split('T')[0],
          status: c.status.toLowerCase(),
        })),
        total,
        page,
        pageSize
      ),
    }
  }

  /**
   * 领取优惠券
   */
  async claimCoupon(userId: string, templateId: string) {
    const template = await this.prisma.couponTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template || template.status !== 'ACTIVE') {
      throw new NotFoundException('优惠券不存在或已失效')
    }

    // 检查领取限制
    const claimedCount = await this.prisma.userCoupon.count({
      where: { userId, templateId },
    })

    if (claimedCount >= template.perUserLimit) {
      throw new BadRequestException('已达到领取上限')
    }

    // 检查总数量
    if (template.totalCount !== -1) {
      const totalClaimed = await this.prisma.userCoupon.count({
        where: { templateId },
      })
      if (totalClaimed >= template.totalCount) {
        throw new BadRequestException('优惠券已领完')
      }
    }

    // 计算有效期
    let validFrom: Date
    let validTo: Date

    if (template.validType === 'FIXED') {
      validFrom = template.validFrom!
      validTo = template.validTo!
    } else {
      validFrom = new Date()
      validTo = new Date()
      validTo.setDate(validTo.getDate() + (template.validDays || 30))
    }

    // 创建用户优惠券
    const coupon = await this.prisma.userCoupon.create({
      data: {
        userId,
        templateId,
        validFrom,
        validTo,
      },
      include: { template: true },
    })

    return {
      couponId: coupon.id,
      name: coupon.template.name,
      amount: coupon.template.amount ? Number(coupon.template.amount) : null,
      validTo: coupon.validTo.toISOString().split('T')[0],
    }
  }

  /**
   * 获取可用优惠券（下单时）
   */
  async getAvailableCoupons(userId: string, storeId: string, roomId: string, amount: number) {
    const coupons = await this.prisma.userCoupon.findMany({
      where: {
        userId,
        status: 'AVAILABLE',
        validTo: { gte: new Date() },
      },
      include: { template: true },
    })

    const available: any[] = []
    const unavailable: any[] = []

    for (const coupon of coupons) {
      const template = coupon.template
      const applicableStores = (template.applicableStores || []) as string[]

      // 检查适用门店
      if (applicableStores.length > 0 && !applicableStores.includes(storeId)) {
        unavailable.push({
          id: coupon.id,
          name: template.name,
          reason: '不适用于该门店',
        })
        continue
      }

      // 检查最低消费
      if (amount < Number(template.minAmount)) {
        unavailable.push({
          id: coupon.id,
          name: template.name,
          reason: '未满足最低消费金额',
        })
        continue
      }

      // 计算优惠金额
      let discountAmount = 0
      if (template.type === 'DISCOUNT') {
        discountAmount = Number(template.amount)
      } else if (template.type === 'RATE' && template.discountRate) {
        discountAmount = Math.floor(amount * (1 - Number(template.discountRate)))
      } else {
        discountAmount = Number(template.amount)
      }

      available.push({
        id: coupon.id,
        name: template.name,
        amount: template.amount ? Number(template.amount) : null,
        discountAmount,
      })
    }

    return { available, unavailable }
  }

  /**
   * 团购券核销
   */
  async verifyCoupon(storeId: string, qrCode: string, source: string) {
    // 模拟核销逻辑
    // 实际需要对接美团/抖音/大众点评 API
    return {
      verified: true,
      couponInfo: {
        name: '单人床位1晚',
        originalPrice: 98,
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: 1,
      },
      storeDiscount: 10,
      finalPrice: 0,
      message: '核销成功，可直接入住',
    }
  }
}
