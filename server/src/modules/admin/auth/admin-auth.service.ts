import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import { AdminLoginDto, ChangePasswordDto } from './dto'

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(dto: AdminLoginDto, ip?: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
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

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号已被禁用')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // 更新最后登录信息
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    })

    const roles = admin.roles.map((ur) => ur.role.code)
    const permissions = [...new Set(admin.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code)))]

    const token = await this.generateToken(admin.id, admin.username, roles)

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        realName: admin.realName,
        avatar: admin.avatar,
        roles,
        permissions,
      },
    }
  }

  async getProfile(adminUserId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
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

    if (!admin) {
      throw new UnauthorizedException('管理员不存在')
    }

    const roles = admin.roles.map((ur) => ur.role.code)
    const permissions = [...new Set(admin.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code)))]

    return {
      id: admin.id,
      username: admin.username,
      realName: admin.realName,
      phone: admin.phone,
      email: admin.email,
      avatar: admin.avatar,
      roles,
      permissions,
      lastLoginAt: admin.lastLoginAt,
    }
  }

  async changePassword(adminUserId: string, dto: ChangePasswordDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
    })

    if (!admin) {
      throw new UnauthorizedException('管理员不存在')
    }

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, admin.password)
    if (!isPasswordValid) {
      throw new BadRequestException('旧密码错误')
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.adminUser.update({
      where: { id: adminUserId },
      data: { password: hashedPassword },
    })

    return { message: '密码修改成功' }
  }

  private async generateToken(adminUserId: string, username: string, roles: string[]) {
    const payload = { adminUserId, username, roles, type: 'admin-access' }
    return this.jwtService.signAsync(payload, {
      expiresIn: '24h',
    })
  }
}
