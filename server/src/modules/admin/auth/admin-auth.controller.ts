import { Controller, Post, Get, Put, Body, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'
import { AdminAuthService } from './admin-auth.service'
import { AdminLoginDto, ChangePasswordDto } from './dto'
import { AdminJwtAuthGuard } from './guards'
import { CurrentAdmin, AdminPayload } from './decorators'

@ApiTags('管理后台-认证')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string)
    return this.adminAuthService.login(dto, ip)
  }

  @Get('profile')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员信息' })
  async getProfile(@CurrentAdmin() admin: AdminPayload) {
    return this.adminAuthService.getProfile(admin.adminUserId)
  }

  @Put('password')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  async changePassword(@CurrentAdmin() admin: AdminPayload, @Body() dto: ChangePasswordDto) {
    return this.adminAuthService.changePassword(admin.adminUserId, dto)
  }
}
