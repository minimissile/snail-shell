import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'
import { WechatLoginDto, GetPhoneDto, RefreshTokenDto } from './dto'

interface WechatSession {
  openid: string
  session_key: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

interface WechatPhoneInfo {
  phoneNumber: string
  purePhoneNumber: string
  countryCode: string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * 微信登录
   */
  async wechatLogin(dto: WechatLoginDto) {
    // 1. 调用微信接口获取 openId
    const session = await this.getWechatSession(dto.code)

    if (session.errcode) {
      throw new UnauthorizedException(`微信登录失败: ${session.errmsg}`)
    }

    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { openId: session.openid },
    })

    const isNewUser = !user

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openId: session.openid,
          unionId: session.unionid,
        },
      })
    } else if (session.unionid && !user.unionId) {
      // 更新 unionId
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { unionId: session.unionid },
      })
    }

    // 3. 生成 token
    const tokens = await this.generateTokens(user.id, user.openId)

    // 4. 缓存 session_key (用于后续获取手机号等)
    await this.redis.set(
      `wx:session:${user.id}`,
      session.session_key,
      86400 * 7 // 7天
    )

    return {
      ...tokens,
      user: {
        id: user.id,
        openId: user.openId,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone ? this.maskPhone(user.phone) : null,
        memberLevel: user.memberLevel.toLowerCase(),
        isNewUser,
      },
    }
  }

  /**
   * 获取手机号
   */
  async getPhone(userId: string, dto: GetPhoneDto) {
    // 1. 调用微信接口获取手机号
    const phoneInfo = await this.getWechatPhoneNumber(dto.code)

    // 2. 更新用户手机号
    await this.prisma.user.update({
      where: { id: userId },
      data: { phone: phoneInfo.purePhoneNumber },
    })

    return {
      phone: phoneInfo.purePhoneNumber,
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      })

      // 检查是否是 refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('无效的刷新令牌')
      }

      // 检查用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        throw new UnauthorizedException('用户不存在')
      }

      // 生成新的 tokens
      return this.generateTokens(user.id, user.openId)
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效或已过期')
    }
  }

  /**
   * 生成 JWT tokens
   */
  private async generateTokens(userId: string, openId: string) {
    const accessPayload = { userId, openId, type: 'access' }
    const refreshPayload = { userId, openId, type: 'refresh' }

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ])

    return { token, refreshToken }
  }

  /**
   * 调用微信登录接口
   */
  private async getWechatSession(code: string): Promise<WechatSession> {
    const appId = this.configService.get('WECHAT_APPID')
    const secret = this.configService.get('WECHAT_SECRET')

    // 开发环境模拟（无真实微信配置时使用）
    if (
      process.env.NODE_ENV === 'development' &&
      (code.startsWith('dev_') || appId === 'wx_dev_appid')
    ) {
      return {
        openid: `dev_openid_${Date.now()}`,
        session_key: 'dev_session_key',
      }
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`

    const response = await fetch(url)
    const data = (await response.json()) as WechatSession

    return data
  }

  /**
   * 调用微信获取手机号接口
   */
  private async getWechatPhoneNumber(code: string): Promise<WechatPhoneInfo> {
    // 开发环境模拟
    if (process.env.NODE_ENV === 'development') {
      return {
        phoneNumber: '+8613888888888',
        purePhoneNumber: '13888888888',
        countryCode: '86',
      }
    }

    const accessToken = await this.getWechatAccessToken()
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const data = (await response.json()) as any

    if (data.errcode !== 0) {
      throw new UnauthorizedException(`获取手机号失败: ${data.errmsg}`)
    }

    return data.phone_info
  }

  /**
   * 获取微信 access_token (带缓存)
   */
  private async getWechatAccessToken(): Promise<string> {
    const cacheKey = 'wx:access_token'
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      return cached
    }

    const appId = this.configService.get('WECHAT_APPID')
    const secret = this.configService.get('WECHAT_SECRET')
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`

    const response = await fetch(url)
    const data = (await response.json()) as any

    if (data.errcode) {
      throw new Error(`获取 access_token 失败: ${data.errmsg}`)
    }

    // 缓存 access_token (提前5分钟过期)
    await this.redis.set(cacheKey, data.access_token, data.expires_in - 300)

    return data.access_token
  }

  /**
   * 手机号脱敏
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
}
