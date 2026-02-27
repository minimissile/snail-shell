import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { paginate } from '../../../common/dto'
import * as bcrypt from 'bcryptjs'
import {
  QueryAdminUsersDto,
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminStatusDto,
  AssignRolesDto,
  CreateRoleDto,
  UpdateRolePermissionsDto,
} from './dto'

@Injectable()
export class AdminUserMgmtService {
  constructor(private prisma: PrismaService) {}

  // ==================== 管理员管理 ====================

  async findAdmins(dto: QueryAdminUsersDto) {
    const { page = 1, pageSize = 10, keyword, status } = dto
    const where: any = {}

    if (keyword) {
      where.OR = [{ username: { contains: keyword } }, { realName: { contains: keyword } }]
    }
    if (status) where.status = status

    const [list, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        select: {
          id: true,
          username: true,
          realName: true,
          phone: true,
          email: true,
          avatar: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          roles: {
            include: { role: { select: { id: true, name: true, code: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.adminUser.count({ where }),
    ])

    const formatted = list.map((admin) => ({
      ...admin,
      roles: admin.roles.map((ur) => ur.role),
    }))

    return paginate(formatted, total, page, pageSize)
  }

  async findAdminById(id: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        realName: true,
        phone: true,
        email: true,
        avatar: true,
        status: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        roles: {
          include: { role: { select: { id: true, name: true, code: true } } },
        },
      },
    })
    if (!admin) throw new NotFoundException('管理员不存在')
    return { ...admin, roles: admin.roles.map((ur) => ur.role) }
  }

  async createAdmin(dto: CreateAdminDto, createdBy?: string) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
    })
    if (existing) throw new BadRequestException('用户名已存在')

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const admin = await this.prisma.adminUser.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        realName: dto.realName,
        phone: dto.phone,
        email: dto.email,
        createdBy,
      },
    })

    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.prisma.adminUserRole.createMany({
        data: dto.roleIds.map((roleId) => ({
          userId: admin.id,
          roleId,
        })),
      })
    }

    return this.findAdminById(admin.id)
  }

  async updateAdmin(id: string, dto: UpdateAdminDto) {
    await this.ensureAdminExists(id)

    const data: any = {}
    if (dto.realName !== undefined) data.realName = dto.realName
    if (dto.phone !== undefined) data.phone = dto.phone
    if (dto.email !== undefined) data.email = dto.email
    if (dto.avatar !== undefined) data.avatar = dto.avatar

    await this.prisma.adminUser.update({ where: { id }, data })
    return this.findAdminById(id)
  }

  async deleteAdmin(id: string) {
    const admin = await this.ensureAdminExists(id)

    // 检查是否有 SUPER_ADMIN 角色
    const roles = await this.prisma.adminUserRole.findMany({
      where: { userId: id },
      include: { role: true },
    })
    if (roles.some((r) => r.role.code === 'SUPER_ADMIN')) {
      throw new BadRequestException('无法删除超级管理员')
    }

    await this.prisma.adminUser.delete({ where: { id } })
    return { message: '删除成功' }
  }

  async updateAdminStatus(id: string, dto: UpdateAdminStatusDto) {
    await this.ensureAdminExists(id)
    return this.prisma.adminUser.update({
      where: { id },
      data: { status: dto.status as any },
    })
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    await this.ensureAdminExists(id)

    await this.prisma.$transaction([
      this.prisma.adminUserRole.deleteMany({ where: { userId: id } }),
      this.prisma.adminUserRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
      }),
    ])

    return this.findAdminById(id)
  }

  async resetPassword(id: string) {
    await this.ensureAdminExists(id)
    const hashedPassword = await bcrypt.hash('123456', 10)
    await this.prisma.adminUser.update({
      where: { id },
      data: { password: hashedPassword },
    })
    return { message: '密码已重置为 123456' }
  }

  // ==================== 角色管理 ====================

  async findRoles() {
    return this.prisma.adminRole.findMany({
      include: {
        _count: { select: { users: true } },
        permissions: {
          include: { permission: { select: { id: true, name: true, code: true, module: true } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async createRole(dto: CreateRoleDto) {
    const role = await this.prisma.adminRole.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
    })

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.prisma.adminRolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      })
    }

    return role
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.adminRole.findUnique({ where: { id: roleId } })
    if (!role) throw new NotFoundException('角色不存在')

    if (role.code === 'SUPER_ADMIN') {
      throw new BadRequestException('无法修改超级管理员角色的权限')
    }

    await this.prisma.$transaction([
      this.prisma.adminRolePermission.deleteMany({ where: { roleId } }),
      this.prisma.adminRolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({ roleId, permissionId })),
      }),
    ])

    return { message: '权限更新成功' }
  }

  async findPermissions() {
    const permissions = await this.prisma.adminPermission.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    // 按模块分组
    const grouped: Record<string, any[]> = {}
    permissions.forEach((p) => {
      if (!grouped[p.module]) grouped[p.module] = []
      grouped[p.module].push(p)
    })

    return {
      list: permissions,
      grouped,
    }
  }

  private async ensureAdminExists(id: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id } })
    if (!admin) throw new NotFoundException('管理员不存在')
    return admin
  }
}
