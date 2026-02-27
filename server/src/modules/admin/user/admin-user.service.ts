import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { paginate } from '../../../common/dto'
import { QueryUsersDto, UpdateMemberLevelDto, AdjustPointsDto, AdjustBalanceDto } from './dto'

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService) {}

  async findUsers(dto: QueryUsersDto) {
    const { page = 1, pageSize = 10, phone, nickname, memberLevel } = dto
    const where: any = {}

    if (phone) where.phone = { contains: phone }
    if (nickname) where.nickname = { contains: nickname }
    if (memberLevel) where.memberLevel = memberLevel

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          nickname: true,
          avatar: true,
          phone: true,
          memberLevel: true,
          points: true,
          balance: true,
          cashback: true,
          consumption: true,
          createdAt: true,
          _count: { select: { orders: true, coupons: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ])

    return paginate(list, total, page, pageSize)
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        guests: true,
        _count: {
          select: {
            orders: true,
            coupons: true,
            favorites: true,
            reviews: true,
          },
        },
      },
    })

    if (!user) throw new NotFoundException('用户不存在')

    // 消费统计
    const orderStats = await this.prisma.order.aggregate({
      where: {
        userId: id,
        status: { in: ['COMPLETED', 'IN_USE', 'PENDING_USE'] },
      },
      _sum: { finalPrice: true },
      _count: true,
    })

    return {
      ...user,
      stats: {
        totalOrders: orderStats._count,
        totalSpent: orderStats._sum.finalPrice?.toNumber() || 0,
      },
    }
  }

  async updateMemberLevel(id: string, dto: UpdateMemberLevelDto) {
    await this.ensureUserExists(id)
    return this.prisma.user.update({
      where: { id },
      data: { memberLevel: dto.memberLevel as any },
    })
  }

  async adjustPoints(id: string, dto: AdjustPointsDto) {
    const user = await this.ensureUserExists(id)
    const newPoints = user.points + dto.amount

    if (newPoints < 0) {
      throw new BadRequestException('积分不能为负数')
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { points: newPoints },
      }),
      this.prisma.pointRecord.create({
        data: {
          userId: id,
          type: dto.amount > 0 ? 'EARN' : 'SPEND',
          amount: dto.amount,
          balance: newPoints,
          description: `管理员调整: ${dto.reason}`,
        },
      }),
    ])

    return { message: '积分调整成功', points: newPoints }
  }

  async adjustBalance(id: string, dto: AdjustBalanceDto) {
    const user = await this.ensureUserExists(id)
    const newBalance = user.balance.toNumber() + dto.amount

    if (newBalance < 0) {
      throw new BadRequestException('余额不能为负数')
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { balance: newBalance },
      }),
      this.prisma.balanceRecord.create({
        data: {
          userId: id,
          type: dto.amount > 0 ? 'REWARD' : 'SPEND',
          balanceType: 'BALANCE',
          amount: dto.amount,
          balance: newBalance,
          description: `管理员调整: ${dto.reason}`,
        },
      }),
    ])

    return { message: '余额调整成功', balance: newBalance }
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('用户不存在')
    return user
  }
}
