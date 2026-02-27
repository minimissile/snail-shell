import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminUserMgmtService } from './admin-user-mgmt.service'
import { AdminJwtAuthGuard, PermissionsGuard } from '../auth/guards'
import { Permissions, CurrentAdmin, AdminPayload } from '../auth/decorators'
import {
  QueryAdminUsersDto,
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminStatusDto,
  AssignRolesDto,
  CreateRoleDto,
  UpdateRolePermissionsDto,
} from './dto'

@ApiTags('管理后台-管理员管理')
@Controller('admin')
@UseGuards(AdminJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminUserMgmtController {
  constructor(private readonly adminUserService: AdminUserMgmtService) {}

  // ==================== 管理员 ====================

  @Get('admin-users')
  @Permissions('admin:read')
  @ApiOperation({ summary: '管理员列表' })
  async findAdmins(@Query() dto: QueryAdminUsersDto) {
    return this.adminUserService.findAdmins(dto)
  }

  @Get('admin-users/:id')
  @Permissions('admin:read')
  @ApiOperation({ summary: '管理员详情' })
  async findAdminById(@Param('id') id: string) {
    return this.adminUserService.findAdminById(id)
  }

  @Post('admin-users')
  @Permissions('admin:create')
  @ApiOperation({ summary: '创建管理员' })
  async createAdmin(@Body() dto: CreateAdminDto, @CurrentAdmin() admin: AdminPayload) {
    return this.adminUserService.createAdmin(dto, admin.adminUserId)
  }

  @Put('admin-users/:id')
  @Permissions('admin:update')
  @ApiOperation({ summary: '更新管理员' })
  async updateAdmin(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminUserService.updateAdmin(id, dto)
  }

  @Delete('admin-users/:id')
  @Permissions('admin:delete')
  @ApiOperation({ summary: '删除管理员' })
  async deleteAdmin(@Param('id') id: string) {
    return this.adminUserService.deleteAdmin(id)
  }

  @Put('admin-users/:id/status')
  @Permissions('admin:update')
  @ApiOperation({ summary: '启用/禁用管理员' })
  async updateAdminStatus(@Param('id') id: string, @Body() dto: UpdateAdminStatusDto) {
    return this.adminUserService.updateAdminStatus(id, dto)
  }

  @Put('admin-users/:id/roles')
  @Permissions('admin:assign-role')
  @ApiOperation({ summary: '分配角色' })
  async assignRoles(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    return this.adminUserService.assignRoles(id, dto)
  }

  @Put('admin-users/:id/reset-password')
  @Permissions('admin:reset-password')
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Param('id') id: string) {
    return this.adminUserService.resetPassword(id)
  }

  // ==================== 角色 ====================

  @Get('roles')
  @Permissions('role:read')
  @ApiOperation({ summary: '角色列表' })
  async findRoles() {
    return this.adminUserService.findRoles()
  }

  @Post('roles')
  @Permissions('role:create')
  @ApiOperation({ summary: '创建角色' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.adminUserService.createRole(dto)
  }

  @Put('roles/:id/permissions')
  @Permissions('role:update')
  @ApiOperation({ summary: '配置角色权限' })
  async updateRolePermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.adminUserService.updateRolePermissions(id, dto)
  }

  // ==================== 权限 ====================

  @Get('permissions')
  @Permissions('role:read')
  @ApiOperation({ summary: '权限树' })
  async findPermissions() {
    return this.adminUserService.findPermissions()
  }
}
