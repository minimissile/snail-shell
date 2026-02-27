import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis

  constructor(private configService: ConfigService) {
    const password = this.configService.get('REDIS_PASSWORD')
    const db = this.configService.get('REDIS_DB', 0)

    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: password || undefined,
      db: Number(db),
    })
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  getClient(): Redis {
    return this.client
  }

  // 字符串操作
  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  // JSON 操作
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = JSON.stringify(value)
    if (ttl) {
      await this.client.setex(key, ttl, data)
    } else {
      await this.client.set(key, data)
    }
  }

  // 过期时间
  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl)
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  // 自增
  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  // 检查存在
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }
}
