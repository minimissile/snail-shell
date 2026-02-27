import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { paginate } from '../../common/dto'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取消息列表
   */
  async getMessages(userId: string, type?: string, page = 1, pageSize = 10) {
    const where: any = { userId }
    if (type) {
      where.type = type.toUpperCase()
    }

    const [messages, total, unreadCount] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({ where }),
      this.prisma.message.count({ where: { userId, isRead: false } }),
    ])

    return {
      unreadCount,
      ...paginate(
        messages.map((m) => ({
          id: m.id,
          type: m.type.toLowerCase(),
          title: m.title,
          content: m.content,
          orderId: m.orderId,
          isRead: m.isRead,
          createdAt: m.createdAt,
        })),
        total,
        page,
        pageSize
      ),
    }
  }

  /**
   * 获取未读消息数
   */
  async getUnreadCount(userId: string) {
    const [total, system, order, promotion] = await Promise.all([
      this.prisma.message.count({ where: { userId, isRead: false } }),
      this.prisma.message.count({ where: { userId, isRead: false, type: 'SYSTEM' } }),
      this.prisma.message.count({ where: { userId, isRead: false, type: 'ORDER' } }),
      this.prisma.message.count({ where: { userId, isRead: false, type: 'PROMOTION' } }),
    ])

    return { total, system, order, promotion }
  }

  /**
   * 标记消息已读
   */
  async markAsRead(userId: string, messageId: string) {
    await this.prisma.message.updateMany({
      where: { id: messageId, userId },
      data: { isRead: true },
    })
    return { success: true }
  }

  /**
   * 标记全部已读
   */
  async markAllAsRead(userId: string) {
    await this.prisma.message.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return { success: true }
  }
}
