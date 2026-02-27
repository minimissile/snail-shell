import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateProfileDto, GetPointRecordsDto } from './dto'
import { paginate } from '../../common/dto'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户信息
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        memberLevel: true,
        memberExpireAt: true,
        points: true,
        balance: true,
        cashback: true,
        consumption: true,
        createdAt: true,
        _count: {
          select: {
            coupons: { where: { status: 'AVAILABLE' } },
            favorites: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone ? this.maskPhone(user.phone) : null,
      memberLevel: user.memberLevel.toLowerCase(),
      memberExpireAt: user.memberExpireAt,
      points: user.points,
      couponCount: user._count.coupons,
      favoriteCount: user._count.favorites,
      createdAt: user.createdAt,
    }
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.nickname && { nickname: dto.nickname }),
        ...(dto.avatar && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        nickname: true,
        avatar: true,
      },
    })

    return user
  }

  /**
   * 获取会员权益
   */
  async getMembership(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        memberLevel: true,
        memberExpireAt: true,
        points: true,
      },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const levelConfig = this.getMemberLevelConfig(user.memberLevel)
    const nextLevelConfig = this.getNextLevelConfig(user.memberLevel)

    return {
      level: user.memberLevel.toLowerCase(),
      levelName: levelConfig.name,
      expireAt: user.memberExpireAt,
      benefits: levelConfig.benefits,
      nextLevel: nextLevelConfig
        ? {
            name: nextLevelConfig.name,
            requiredPoints: nextLevelConfig.requiredPoints,
            currentPoints: user.points,
          }
        : null,
    }
  }

  /**
   * 获取积分明细
   */
  async getPointRecords(userId: string, dto: GetPointRecordsDto) {
    const { page = 1, pageSize = 10, type } = dto

    const where: any = { userId }
    if (type) {
      where.type = type.toUpperCase()
    }

    const [records, total, user] = await Promise.all([
      this.prisma.pointRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.pointRecord.count({ where }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      }),
    ])

    return {
      balance: user?.points || 0,
      ...paginate(
        records.map((r) => ({
          id: r.id,
          type: r.type.toLowerCase(),
          amount: r.amount,
          description: r.description,
          orderId: r.orderId,
          createdAt: r.createdAt,
        })),
        total,
        page,
        pageSize
      ),
    }
  }

  /**
   * 获取会员等级配置
   */
  private getMemberLevelConfig(level: string) {
    const configs: Record<string, any> = {
      NORMAL: {
        name: '普通会员',
        benefits: [
          { name: '房费折扣', value: '无' },
          { name: '积分加倍', value: '1倍' },
        ],
      },
      SILVER: {
        name: '银卡会员',
        benefits: [
          { name: '房费折扣', value: '9.8折' },
          { name: '积分加倍', value: '1.2倍' },
        ],
      },
      GOLD: {
        name: '金卡会员',
        benefits: [
          { name: '房费折扣', value: '9.5折' },
          { name: '积分加倍', value: '1.5倍' },
        ],
      },
      DIAMOND: {
        name: '钻石会员',
        benefits: [
          { name: '房费折扣', value: '9折' },
          { name: '积分加倍', value: '2倍' },
          { name: '专属客服', value: '是' },
        ],
      },
      BLACK_GOLD: {
        name: '黑金会员',
        benefits: [
          { name: '房费折扣', value: '8.5折' },
          { name: '积分加倍', value: '3倍' },
          { name: '专属客服', value: '是' },
          { name: '免费升房', value: '是' },
        ],
      },
    }

    return configs[level] || configs.NORMAL
  }

  /**
   * 获取下一等级配置
   */
  private getNextLevelConfig(currentLevel: string) {
    const levelOrder = ['NORMAL', 'SILVER', 'GOLD', 'DIAMOND', 'BLACK_GOLD']
    const currentIndex = levelOrder.indexOf(currentLevel)

    if (currentIndex === -1 || currentIndex === levelOrder.length - 1) {
      return null
    }

    const nextLevel = levelOrder[currentIndex + 1]
    const requiredPoints: Record<string, number> = {
      SILVER: 500,
      GOLD: 2000,
      DIAMOND: 5000,
      BLACK_GOLD: 10000,
    }

    return {
      name: this.getMemberLevelConfig(nextLevel).name,
      requiredPoints: requiredPoints[nextLevel],
    }
  }

  /**
   * 手机号脱敏
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
}
