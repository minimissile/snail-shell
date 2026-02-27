import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SmartLockService } from './smart-lock.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('智能门锁')
@Controller('smart-lock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmartLockController {
  constructor(private readonly smartLockService: SmartLockService) {}

  @Get(':orderId')
  @ApiOperation({ summary: '获取门锁信息' })
  async getLockInfo(@CurrentUser('userId') userId: string, @Param('orderId') orderId: string) {
    return this.smartLockService.getLockInfo(userId, orderId)
  }

  @Post(':orderId/unlock')
  @ApiOperation({ summary: '远程开锁' })
  async unlock(@CurrentUser('userId') userId: string, @Param('orderId') orderId: string) {
    return this.smartLockService.unlock(userId, orderId)
  }

  @Post(':orderId/lock')
  @ApiOperation({ summary: '远程关锁' })
  async lock(@CurrentUser('userId') userId: string, @Param('orderId') orderId: string) {
    return this.smartLockService.lock(userId, orderId)
  }

  @Post(':orderId/temp-password')
  @ApiOperation({ summary: '生成临时密码' })
  async createTempPassword(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body() body: { validHours: number; name?: string }
  ) {
    return this.smartLockService.createTempPassword(userId, orderId, body.validHours, body.name)
  }

  @Get(':orderId/passwords')
  @ApiOperation({ summary: '获取密码列表' })
  async getPasswords(@CurrentUser('userId') userId: string, @Param('orderId') orderId: string) {
    return this.smartLockService.getPasswords(userId, orderId)
  }

  @Delete(':orderId/passwords/:passwordId')
  @ApiOperation({ summary: '删除密码' })
  async deletePassword(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Param('passwordId') passwordId: string
  ) {
    return this.smartLockService.deletePassword(userId, orderId, passwordId)
  }

  @Get(':orderId/events')
  @ApiOperation({ summary: '获取门锁事件' })
  @ApiPagination()
  async getEvents(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.smartLockService.getEvents(userId, orderId, page, pageSize)
  }
}
