import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../../prisma/prisma.service'

interface AdminJwtPayload {
  adminUserId: string
  username: string
  type: string
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
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

  async validate(payload: AdminJwtPayload) {
    if (payload.type !== 'admin-access') {
      throw new UnauthorizedException('无效的管理员令牌')
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.adminUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    })

    if (!admin || admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('管理员账号不存在或已禁用')
    }

    const roles = admin.roles.map((ur) => ur.role.code)
    const permissions = [...new Set(admin.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code)))]

    return {
      adminUserId: admin.id,
      username: admin.username,
      roles,
      permissions,
    }
  }
}
