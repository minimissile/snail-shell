import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { paginate } from '../../../common/dto'
import { QueryOrdersDto, HandleRefundDto } from './dto'

@Injectable()
export class AdminOrderService {
  constructor(private prisma: PrismaService) {}

  async findOrders(dto: QueryOrdersDto) {
    const { page = 1, pageSize = 10, orderNo, phone, storeId, status, startDate, endDate } = dto
    const where: any = {}

    if (orderNo) where.orderNo = { contains: orderNo }
    if (phone) where.guestPhone = { contains: phone }
    if (storeId) where.storeId = storeId
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        where.createdAt.lt = end
      }
    }

    const [list, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          store: { select: { id: true, name: true } },
          user: { select: { id: true, nickname: true, phone: true } },
          items: {
            include: {
              room: { select: { id: true, name: true, type: true } },
              bed: { select: { id: true, bedNumber: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ])

    return paginate(list, total, page, pageSize)
  }

  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true, address: true, phone: true } },
        user: { select: { id: true, nickname: true, phone: true, avatar: true } },
        items: {
          include: {
            room: { select: { id: true, name: true, type: true } },
            bed: { select: { id: true, bedNumber: true } },
          },
        },
        discounts: true,
        coupon: {
          include: { template: { select: { name: true, type: true } } },
        },
      },
    })

    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    return order
  }

  async handleRefund(id: string, dto: HandleRefundDto) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order) throw new NotFoundException('订单不存在')

    if (order.refundStatus !== 'PENDING') {
      throw new BadRequestException('该订单退款状态不是待处理')
    }

    if (dto.action === 'approve') {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: {
            refundStatus: 'APPROVED',
            status: 'REFUNDED',
            refundAt: new Date(),
          },
        })

        // 取消相关床位预订
        await tx.bedBooking.updateMany({
          where: { orderId: id, status: 'ACTIVE' },
          data: { status: 'CANCELLED' },
        })
      })

      return { message: '退款已批准' }
    } else {
      await this.prisma.order.update({
        where: { id },
        data: {
          refundStatus: 'REJECTED',
          status: 'PENDING_USE',
          refundReason: dto.reason,
        },
      })

      return { message: '退款已拒绝' }
    }
  }

  async exportOrders(dto: QueryOrdersDto) {
    const { orderNo, phone, storeId, status, startDate, endDate } = dto
    const where: any = {}

    if (orderNo) where.orderNo = { contains: orderNo }
    if (phone) where.guestPhone = { contains: phone }
    if (storeId) where.storeId = storeId
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        where.createdAt.lt = end
      }
    }

    return this.prisma.order.findMany({
      where,
      include: {
        store: { select: { name: true } },
        user: { select: { nickname: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })
  }
}
