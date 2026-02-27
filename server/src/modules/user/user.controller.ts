import { Controller, Get, Put, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { UpdateProfileDto, GetPointRecordsDto, CreateGuestDto, UpdateGuestDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('用户')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取用户信息' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.userService.getProfile(userId)
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(@CurrentUser('userId') userId: string, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(userId, dto)
  }

  @Get('membership')
  @ApiOperation({ summary: '获取会员权益' })
  async getMembership(@CurrentUser('userId') userId: string) {
    return this.userService.getMembership(userId)
  }

  @Get('points/records')
  @ApiOperation({ summary: '获取积分明细' })
  @ApiPagination()
  async getPointRecords(@CurrentUser('userId') userId: string, @Query() dto: GetPointRecordsDto) {
    return this.userService.getPointRecords(userId, dto)
  }

  // ========== 入住人管理 ==========

  @Get('guests')
  @ApiOperation({ summary: '获取入住人列表' })
  async getGuests(@CurrentUser('userId') userId: string) {
    return this.userService.getGuests(userId)
  }

  @Post('guests')
  @ApiOperation({ summary: '添加入住人' })
  async createGuest(@CurrentUser('userId') userId: string, @Body() dto: CreateGuestDto) {
    return this.userService.createGuest(userId, dto)
  }

  @Put('guests/:guestId')
  @ApiOperation({ summary: '更新入住人' })
  async updateGuest(
    @CurrentUser('userId') userId: string,
    @Param('guestId') guestId: string,
    @Body() dto: UpdateGuestDto
  ) {
    return this.userService.updateGuest(userId, guestId, dto)
  }

  @Delete('guests/:guestId')
  @ApiOperation({ summary: '删除入住人' })
  async deleteGuest(@CurrentUser('userId') userId: string, @Param('guestId') guestId: string) {
    return this.userService.deleteGuest(userId, guestId)
  }

  @Post('guests/:guestId/default')
  @ApiOperation({ summary: '设为默认入住人' })
  async setDefaultGuest(@CurrentUser('userId') userId: string, @Param('guestId') guestId: string) {
    return this.userService.setDefaultGuest(userId, guestId)
  }
}
