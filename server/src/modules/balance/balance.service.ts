import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { paginate } from '../../common/dto'

@Injectable()
export class BalanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取账户余额
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, cashback: true, consumption: true, points: true },
    })

    return {
      cashback: user ? Number(user.cashback) : 0,
      balance: user ? Number(user.balance) : 0,
      consumption: user ? Number(user.consumption) : 0,
      points: user ? user.points : 0,
    }
  }

  /**
   * 获取返现明细
   */
  async getCashbackRecords(userId: string, page = 1, pageSize = 10) {
    return this.getBalanceRecords(userId, 'CASHBACK', page, pageSize)
  }

  /**
   * 获取余额明细
   */
  async getBalanceRecords(userId: string, balanceType: string, page = 1, pageSize = 10) {
    const where: any = { userId }
    if (balanceType) {
      where.balanceType = balanceType
    }

    const [records, total, user] = await Promise.all([
      this.prisma.balanceRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.balanceRecord.count({ where }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true, cashback: true, consumption: true },
      }),
    ])

    let currentBalance = 0
    if (balanceType === 'CASHBACK') {
      currentBalance = user ? Number(user.cashback) : 0
    } else if (balanceType === 'BALANCE') {
      currentBalance = user ? Number(user.balance) : 0
    } else if (balanceType === 'CONSUMPTION') {
      currentBalance = user ? Number(user.consumption) : 0
    }

    return {
      balance: currentBalance,
      ...paginate(
        records.map((r) => ({
          id: r.id,
          type: r.type.toLowerCase(),
          amount: Number(r.amount),
          balance: Number(r.balance),
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
   * 余额充值
   */
  async recharge(userId: string, amount: number) {
    // 计算赠送金额 (模拟: 充100送10)
    const giftAmount = Math.floor(amount / 100) * 10

    // TODO: 调用微信支付

    return {
      orderId: `recharge_${Date.now()}`,
      amount,
      giftAmount,
      paymentParams: {
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: 'mock_nonce',
        package: 'prepay_id=mock_prepay_id',
        signType: 'RSA',
        paySign: 'mock_sign',
      },
    }
  }

  /**
   * 返现提现
   */
  async withdrawCashback(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || Number(user.cashback) < amount) {
      throw new Error('返现余额不足')
    }

    // 执行提现
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { cashback: { decrement: amount } },
      })

      await tx.balanceRecord.create({
        data: {
          userId,
          type: 'WITHDRAW',
          balanceType: 'CASHBACK',
          amount: -amount,
          balance: Number(user.cashback) - amount,
          description: '返现提现',
        },
      })
    })

    return {
      success: true,
      message: '提现申请已提交，预计1-3个工作日到账',
    }
  }
}
