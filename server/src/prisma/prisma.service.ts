import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    })
  }

  async onModuleInit() {
    // 数据库未配置或不可用时，避免阻断服务启动
    if (!process.env.DATABASE_URL) {
      // eslint-disable-next-line no-console
      console.warn('[Prisma] DATABASE_URL 未配置，跳过数据库连接，部分接口将不可用')
      return
    }
    try {
      await this.$connect()
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[Prisma] 数据库连接失败：', err?.message || err)
      // 保持服务继续启动，数据库相关接口在首次调用时会抛错
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
