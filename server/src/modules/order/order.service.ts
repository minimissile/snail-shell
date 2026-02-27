import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'
import { CalculateOrderDto, CreateOrderDto, GetOrdersDto, PayOrderDto, CancelOrderDto, RefundOrderDto } from './dto'
import { paginate } from '../../common/dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  /**
   * 计算订单价格
   */
  async calculateOrder(userId: string, dto: CalculateOrderDto) {
    const { storeId, roomId, bedIds, checkInDate, checkOutDate, bookingMode } = dto

    // 验证房型和床位
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, storeId, status: 'ACTIVE' },
    })

    if (!room) {
      throw new NotFoundException('房型不存在')
    }

    // 验证床位是否可用
    await this.validateBedAvailability(roomId, bedIds, checkInDate, checkOutDate)

    // 计算天数
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      throw new BadRequestException('入住日期必须早于离店日期')
    }

    // 计算房费
    const pricePerBed = Number(room.price)
    const roomPrice = pricePerBed * bedIds.length * nights

    // 计算优惠
    const discounts = []
    let totalDiscount = 0

    // 促销优惠 (模拟)
    const promotionDiscount = Math.floor(roomPrice * 0.1)
    if (promotionDiscount > 0) {
      discounts.push({ name: '促销优惠', amount: promotionDiscount })
      totalDiscount += promotionDiscount
    }

    // 会员优惠
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { memberLevel: true, points: true, balance: true },
    })

    const memberDiscount = this.calculateMemberDiscount(user?.memberLevel || 'NORMAL', roomPrice - totalDiscount)
    if (memberDiscount > 0) {
      discounts.push({ name: '会员折扣', amount: memberDiscount })
      totalDiscount += memberDiscount
    }

    // 优惠券
    let couponDiscount = 0
    if (dto.couponId) {
      const coupon = await this.prisma.userCoupon.findFirst({
        where: {
          id: dto.couponId,
          userId,
          status: 'AVAILABLE',
          validTo: { gte: new Date() },
        },
        include: { template: true },
      })

      if (coupon) {
        const afterPromotion = roomPrice - totalDiscount
        if (afterPromotion >= Number(coupon.template.minAmount)) {
          if (coupon.template.type === 'DISCOUNT') {
            couponDiscount = Number(coupon.template.amount)
          } else if (coupon.template.type === 'RATE' && coupon.template.discountRate) {
            couponDiscount = Math.floor(afterPromotion * (1 - Number(coupon.template.discountRate)))
          }
          discounts.push({ name: '优惠券', amount: couponDiscount })
          totalDiscount += couponDiscount
        }
      }
    }

    // 积分抵扣
    let pointsDeduction = 0
    if (dto.usePoints && dto.usePoints > 0 && user) {
      const maxPoints = Math.min(dto.usePoints, user.points)
      pointsDeduction = Math.floor(maxPoints / 10) // 10积分 = 1元
      if (pointsDeduction > roomPrice - totalDiscount) {
        pointsDeduction = roomPrice - totalDiscount
      }
    }

    // 余额抵扣
    let balanceDeduction = 0
    if (dto.useBalance && user) {
      const remaining = roomPrice - totalDiscount - pointsDeduction
      balanceDeduction = Math.min(Number(user.balance), remaining)
    }

    const finalPrice = roomPrice - totalDiscount - pointsDeduction - balanceDeduction

    return {
      roomPrice,
      nights,
      pricePerNight: pricePerBed * bedIds.length,
      discounts,
      totalDiscount,
      pointsDeduction,
      balanceDeduction,
      finalPrice: Math.max(0, finalPrice),
      savedAmount: totalDiscount + pointsDeduction + balanceDeduction,
      earnPoints: Math.floor(finalPrice / 10), // 消费10元得1积分
    }
  }

  /**
   * 创建订单
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    // 先计算价格
    const priceInfo = await this.calculateOrder(userId, dto)

    // 验证床位可用性 (使用分布式锁防止超卖)
    const lockKey = `order:lock:${dto.bedIds.sort().join(',')}`
    const locked = await this.redis.set(lockKey, '1', 30)

    try {
      await this.validateBedAvailability(dto.roomId, dto.bedIds, dto.checkInDate, dto.checkOutDate)

      // 生成订单号
      const orderNo = this.generateOrderNo()

      // 计算天数
      const checkIn = new Date(dto.checkInDate)
      const checkOut = new Date(dto.checkOutDate)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      // 创建订单
      const order = await this.prisma.$transaction(async (tx) => {
        // 创建订单主记录
        const newOrder = await tx.order.create({
          data: {
            orderNo,
            userId,
            storeId: dto.storeId,
            bookingMode: dto.bookingMode.toUpperCase() as any,
            checkInDate: new Date(dto.checkInDate),
            checkOutDate: new Date(dto.checkOutDate),
            nights,
            guestName: dto.guestName,
            guestPhone: dto.guestPhone,
            guestIdCard: dto.guestIdCard,
            roomPrice: priceInfo.roomPrice,
            totalDiscount: priceInfo.totalDiscount,
            pointsDeduction: priceInfo.pointsDeduction,
            balanceDeduction: priceInfo.balanceDeduction,
            finalPrice: priceInfo.finalPrice,
            earnPoints: priceInfo.earnPoints,
            couponId: dto.couponId,
            remark: dto.remark,
            status: 'PENDING_PAYMENT',
            expireAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟后过期
          },
        })

        // 创建订单项
        const beds = await tx.bed.findMany({
          where: { id: { in: dto.bedIds } },
        })

        await tx.orderItem.createMany({
          data: beds.map((bed) => ({
            orderId: newOrder.id,
            roomId: dto.roomId,
            bedId: bed.id,
            price: priceInfo.roomPrice / dto.bedIds.length / nights,
          })),
        })

        // 创建床位预订记录
        await tx.bedBooking.createMany({
          data: beds.map((bed) => ({
            bedId: bed.id,
            orderId: newOrder.id,
            bookingMode: dto.bookingMode.toUpperCase() as any,
            checkInDate: new Date(dto.checkInDate),
            checkOutDate: new Date(dto.checkOutDate),
            status: 'ACTIVE',
          })),
        })

        // 创建优惠明细
        if (priceInfo.discounts.length > 0) {
          await tx.orderDiscount.createMany({
            data: priceInfo.discounts.map((d) => ({
              orderId: newOrder.id,
              name: d.name,
              type: d.name.includes('促销') ? 'PROMOTION' : d.name.includes('会员') ? 'MEMBER' : 'COUPON',
              amount: d.amount,
            })),
          })
        }

        // 锁定优惠券
        if (dto.couponId) {
          await tx.userCoupon.update({
            where: { id: dto.couponId },
            data: { status: 'USED', usedAt: new Date() },
          })
        }

        return newOrder
      })

      return {
        orderId: order.id,
        orderNo: order.orderNo,
        status: 'pending_payment',
        totalPrice: priceInfo.finalPrice,
        expireAt: order.expireAt,
        paymentParams: null, // 待调用支付接口
      }
    } finally {
      await this.redis.del(lockKey)
    }
  }

  /**
   * 获取订单列表
   */
  async getOrders(userId: string, dto: GetOrdersDto) {
    const { page = 1, pageSize = 10, status } = dto

    const where: any = { userId }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          store: {
            select: { id: true, name: true, images: true },
          },
          items: {
            include: {
              room: { select: { id: true, name: true, images: true } },
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ])

    const list = orders.map((order) => {
      const room = order.items[0]?.room
      let countdown: string | null = null

      if (order.status === 'PENDING_PAYMENT' && order.expireAt) {
        const remaining = order.expireAt.getTime() - Date.now()
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          countdown = `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      }

      return {
        id: order.id,
        orderNo: order.orderNo,
        status: order.status.toLowerCase(),
        statusText: this.getStatusText(order.status),
        statusColor: this.getStatusColor(order.status),
        store: {
          id: order.store.id,
          name: order.store.name,
          image: ((order.store.images || []) as string[])[0] || '',
        },
        room: room
          ? {
              id: room.id,
              name: room.name,
              image: ((room.images || []) as string[])[0] || '',
            }
          : null,
        bedCount: order.items.length,
        checkInDate: order.checkInDate.toISOString().split('T')[0],
        checkOutDate: order.checkOutDate.toISOString().split('T')[0],
        nights: order.nights,
        totalPrice: Number(order.finalPrice),
        countdown,
        createdAt: order.createdAt,
      }
    })

    return paginate(list, total, page, pageSize)
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        store: true,
        items: {
          include: {
            room: true,
            bed: true,
          },
        },
        discounts: true,
        smartLockAccess: {
          include: {
            passwords: { where: { type: 'PERMANENT' }, take: 1 },
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    const room = order.items[0]?.room
    const smartLock = order.smartLockAccess

    return {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status.toLowerCase(),
      statusText: this.getStatusText(order.status),
      store: {
        id: order.store.id,
        name: order.store.name,
        image: ((order.store.images || []) as string[])[0] || '',
        address: order.store.address,
        phone: order.store.phone,
      },
      room: room
        ? {
            id: room.id,
            name: room.name,
            image: ((room.images || []) as string[])[0] || '',
            bedIds: order.items.map((i) => i.bed.bedNumber),
          }
        : null,
      booking: {
        mode: order.bookingMode.toLowerCase(),
        checkInDate: order.checkInDate.toISOString().split('T')[0],
        checkOutDate: order.checkOutDate.toISOString().split('T')[0],
        nights: order.nights,
        checkInTime: '14:00后',
        checkOutTime: '12:00前',
      },
      guest: {
        name: order.guestName,
        phone: this.maskPhone(order.guestPhone),
        idCard: this.maskIdCard(order.guestIdCard),
      },
      price: {
        roomPrice: Number(order.roomPrice),
        discounts: order.discounts.map((d) => ({
          name: d.name,
          amount: Number(d.amount),
        })),
        totalDiscount: Number(order.totalDiscount),
        pointsDeduction: Number(order.pointsDeduction),
        finalPrice: Number(order.finalPrice),
      },
      payment: order.paidAt
        ? {
            method: order.paymentMethod?.toLowerCase(),
            transactionId: order.transactionId,
            paidAt: order.paidAt,
          }
        : null,
      cancelPolicy: '入住前24小时免费取消',
      smartLock: smartLock
        ? {
            enabled: true,
            password: smartLock.passwords[0]?.password || null,
            validFrom: smartLock.validFrom,
            validTo: smartLock.validTo,
          }
        : null,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    }
  }

  /**
   * 支付订单
   */
  async payOrder(userId: string, orderId: string, dto: PayOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, status: 'PENDING_PAYMENT' },
    })

    if (!order) {
      throw new NotFoundException('订单不存在或已支付')
    }

    if (order.expireAt && order.expireAt < new Date()) {
      throw new BadRequestException('订单已过期')
    }

    if (dto.paymentMethod === 'wechat') {
      // TODO: 调用微信支付
      // 返回支付参数
      return {
        paymentParams: {
          timeStamp: String(Math.floor(Date.now() / 1000)),
          nonceStr: uuidv4().replace(/-/g, ''),
          package: 'prepay_id=mock_prepay_id',
          signType: 'RSA',
          paySign: 'mock_sign',
        },
      }
    } else {
      // 余额支付
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || Number(user.balance) < Number(order.finalPrice)) {
        throw new BadRequestException('余额不足')
      }

      // 执行支付
      await this.completePayment(order.id, 'BALANCE', null)

      return { paymentParams: null }
    }
  }

  /**
   * 完成支付 (内部调用或支付回调)
   */
  async completePayment(orderId: string, paymentMethod: 'WECHAT' | 'BALANCE', transactionId: string | null) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { room: true } } },
      })

      if (!order || order.status !== 'PENDING_PAYMENT') {
        throw new BadRequestException('订单状态异常')
      }

      // 更新订单状态
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PENDING_USE',
          paymentMethod,
          transactionId,
          paidAt: new Date(),
        },
      })

      // 扣减余额/积分
      if (Number(order.balanceDeduction) > 0 || Number(order.pointsDeduction) > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            balance: { decrement: order.balanceDeduction },
            points: { decrement: Math.floor(Number(order.pointsDeduction) * 10) },
          },
        })
      }

      // 创建智能门锁访问权限
      const hasSmartLock = order.items[0]?.room?.hasSmartLock
      if (hasSmartLock) {
        await tx.smartLockAccess.create({
          data: {
            orderId: order.id,
            validFrom: order.checkInDate,
            validTo: order.checkOutDate,
            passwords: {
              create: {
                type: 'PERMANENT',
                name: '入住密码',
                password: this.generateLockPassword(),
              },
            },
          },
        })
      }
    })
  }

  /**
   * 取消订单
   */
  async cancelOrder(userId: string, orderId: string, dto: CancelOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: { in: ['PENDING_PAYMENT', 'PENDING_USE'] },
      },
    })

    if (!order) {
      throw new NotFoundException('订单不存在或无法取消')
    }

    await this.prisma.$transaction(async (tx) => {
      // 更新订单状态
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      })

      // 释放床位
      await tx.bedBooking.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED' },
      })

      // 释放优惠券
      if (order.couponId) {
        await tx.userCoupon.update({
          where: { id: order.couponId },
          data: { status: 'AVAILABLE', usedAt: null },
        })
      }

      // 如果已支付，需要退款
      if (order.status === 'PENDING_USE') {
        // TODO: 调用退款逻辑
      }
    })

    return { success: true }
  }

  /**
   * 申请退款
   */
  async refundOrder(userId: string, orderId: string, dto: RefundOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'PENDING_USE',
      },
    })

    if (!order) {
      throw new NotFoundException('订单不存在或无法退款')
    }

    // 更新订单状态
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDING',
        refundStatus: 'PENDING',
        refundReason: dto.reason,
        refundAmount: order.finalPrice,
      },
    })

    return {
      refundId: `refund_${orderId}`,
      refundAmount: Number(order.finalPrice),
      refundStatus: 'pending',
      estimatedTime: '1-3个工作日',
    }
  }

  /**
   * 验证床位可用性
   */
  private async validateBedAvailability(roomId: string, bedIds: string[], checkInDate: string, checkOutDate: string) {
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    // 查找冲突的预订
    const conflictBookings = await this.prisma.bedBooking.findMany({
      where: {
        bed: {
          roomId,
          id: { in: bedIds },
        },
        status: 'ACTIVE',
        OR: [
          {
            checkInDate: { lte: checkOut },
            checkOutDate: { gt: checkIn },
          },
        ],
      },
    })

    if (conflictBookings.length > 0) {
      throw new ConflictException('所选床位已被预订，请选择其他床位')
    }
  }

  /**
   * 计算会员折扣
   */
  private calculateMemberDiscount(level: string, amount: number): number {
    const rates: Record<string, number> = {
      NORMAL: 0,
      SILVER: 0.02,
      GOLD: 0.05,
      DIAMOND: 0.1,
      BLACK_GOLD: 0.15,
    }
    return Math.floor(amount * (rates[level] || 0))
  }

  /**
   * 生成订单号
   */
  private generateOrderNo(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    return `WK${dateStr}${random}`
  }

  /**
   * 生成门锁密码
   */
  private generateLockPassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: string): string {
    const texts: Record<string, string> = {
      PENDING_PAYMENT: '待支付',
      PENDING_USE: '待使用',
      IN_USE: '使用中',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
      REFUNDING: '退款中',
      REFUNDED: '已退款',
    }
    return texts[status] || status
  }

  /**
   * 获取状态颜色
   */
  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING_PAYMENT: '#F97316',
      PENDING_USE: '#10B981',
      IN_USE: '#3B82F6',
      COMPLETED: '#6B7280',
      CANCELLED: '#6B7280',
      REFUNDING: '#F59E0B',
      REFUNDED: '#6B7280',
    }
    return colors[status] || '#6B7280'
  }

  /**
   * 手机号脱敏
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  /**
   * 身份证脱敏
   */
  private maskIdCard(idCard: string | null): string | null {
    if (!idCard || idCard.length < 10) return idCard
    return idCard.replace(/^(.{3}).*(.{4})$/, '$1***********$2')
  }
}
