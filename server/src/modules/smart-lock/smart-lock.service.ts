import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { paginate } from '../../common/dto'

@Injectable()
export class SmartLockService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取门锁信息
   */
  async getLockInfo(userId: string, orderId: string) {
    const access = await this.getAccess(userId, orderId)

    return {
      lockId: access.lockId,
      lockStatus: 'locked',
      battery: 90,
      wifiStrength: 'strong',
      validFrom: access.validFrom,
      validTo: access.validTo,
      passwords: access.passwords.map((p) => ({
        id: p.id,
        type: p.type.toLowerCase(),
        name: p.name,
        createdAt: p.createdAt,
      })),
      fingerprints: access.fingerprints.map((f) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
      })),
      cards: access.cards.map((c) => ({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
      })),
    }
  }

  /**
   * 远程开锁
   */
  async unlock(userId: string, orderId: string) {
    const access = await this.getAccess(userId, orderId)

    // 验证时效
    const now = new Date()
    if (now < access.validFrom || now > access.validTo) {
      throw new ForbiddenException('不在有效入住时间内')
    }

    // TODO: 调用门锁硬件 SDK

    // 记录开锁事件
    await this.prisma.smartLockEvent.create({
      data: {
        accessId: access.id,
        type: 'UNLOCK',
        method: 'app',
        operator: '用户',
        result: 'SUCCESS',
      },
    })

    return {
      success: true,
      message: '开锁成功',
      unlockTime: new Date(),
    }
  }

  /**
   * 远程关锁
   */
  async lock(userId: string, orderId: string) {
    const access = await this.getAccess(userId, orderId)

    // TODO: 调用门锁硬件 SDK

    await this.prisma.smartLockEvent.create({
      data: {
        accessId: access.id,
        type: 'LOCK',
        method: 'app',
        operator: '用户',
        result: 'SUCCESS',
      },
    })

    return {
      success: true,
      message: '关锁成功',
    }
  }

  /**
   * 生成临时密码
   */
  async createTempPassword(userId: string, orderId: string, validHours: number, name?: string) {
    const access = await this.getAccess(userId, orderId)

    const password = Math.floor(100000 + Math.random() * 900000).toString()
    const validFrom = new Date()
    const validTo = new Date(validFrom.getTime() + validHours * 60 * 60 * 1000)

    await this.prisma.smartLockPassword.create({
      data: {
        accessId: access.id,
        type: 'TEMPORARY',
        name: name || '临时密码',
        password,
        validFrom,
        validTo,
      },
    })

    return {
      password,
      validFrom,
      validTo,
    }
  }

  /**
   * 获取密码列表
   */
  async getPasswords(userId: string, orderId: string) {
    const access = await this.getAccess(userId, orderId)

    const passwords = await this.prisma.smartLockPassword.findMany({
      where: { accessId: access.id },
      orderBy: { createdAt: 'desc' },
    })

    return passwords.map((p) => ({
      id: p.id,
      type: p.type.toLowerCase(),
      name: p.name,
      password: p.password,
      validFrom: p.validFrom,
      validTo: p.validTo,
      createdAt: p.createdAt,
    }))
  }

  /**
   * 删除密码
   */
  async deletePassword(userId: string, orderId: string, passwordId: string) {
    const access = await this.getAccess(userId, orderId)

    await this.prisma.smartLockPassword.delete({
      where: { id: passwordId, accessId: access.id },
    })

    return { success: true }
  }

  /**
   * 获取门锁事件
   */
  async getEvents(userId: string, orderId: string, page = 1, pageSize = 10) {
    const access = await this.getAccess(userId, orderId)

    const [events, total] = await Promise.all([
      this.prisma.smartLockEvent.findMany({
        where: { accessId: access.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.smartLockEvent.count({ where: { accessId: access.id } }),
    ])

    return paginate(
      events.map((e) => ({
        id: e.id,
        type: e.type.toLowerCase(),
        method: e.method,
        operator: e.operator,
        result: e.result.toLowerCase(),
        createdAt: e.createdAt,
      })),
      total,
      page,
      pageSize
    )
  }

  /**
   * 获取访问权限（内部方法）
   */
  private async getAccess(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    })

    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    const access = await this.prisma.smartLockAccess.findUnique({
      where: { orderId },
      include: {
        passwords: true,
        fingerprints: true,
        cards: true,
      },
    })

    if (!access) {
      throw new NotFoundException('门锁权限不存在')
    }

    return access
  }
}
