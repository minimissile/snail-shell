import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { UpdateProfileDto, GetPointRecordsDto } from './dto'
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
}
