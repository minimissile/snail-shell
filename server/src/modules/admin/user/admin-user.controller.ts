import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminUserService } from './admin-user.service'
import { AdminJwtAuthGuard, PermissionsGuard } from '../auth/guards'
import { Permissions } from '../auth/decorators'
import { QueryUsersDto, UpdateMemberLevelDto, AdjustPointsDto, AdjustBalanceDto } from './dto'

@ApiTags('管理后台-用户管理')
@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly userService: AdminUserService) {}

  @Get()
  @Permissions('user:read')
  @ApiOperation({ summary: '用户列表' })
  async findUsers(@Query() dto: QueryUsersDto) {
    return this.userService.findUsers(dto)
  }

  @Get(':id')
  @Permissions('user:read')
  @ApiOperation({ summary: '用户详情' })
  async findUserById(@Param('id') id: string) {
    return this.userService.findUserById(id)
  }

  @Put(':id/member-level')
  @Permissions('user:manage')
  @ApiOperation({ summary: '调整会员等级' })
  async updateMemberLevel(@Param('id') id: string, @Body() dto: UpdateMemberLevelDto) {
    return this.userService.updateMemberLevel(id, dto)
  }

  @Put(':id/points')
  @Permissions('user:manage')
  @ApiOperation({ summary: '调整积分' })
  async adjustPoints(@Param('id') id: string, @Body() dto: AdjustPointsDto) {
    return this.userService.adjustPoints(id, dto)
  }

  @Put(':id/balance')
  @Permissions('user:manage')
  @ApiOperation({ summary: '调整余额' })
  async adjustBalance(@Param('id') id: string, @Body() dto: AdjustBalanceDto) {
    return this.userService.adjustBalance(id, dto)
  }
}
