import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../prisma/prisma.service'

interface JwtPayload {
  userId: string
  openId: string
  type: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    // 只接受 access token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('无效的访问令牌')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, openId: true },
    })

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    return { userId: user.id, openId: user.openId }
  }
}
