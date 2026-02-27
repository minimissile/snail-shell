import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { BalanceService } from './balance.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('余额')
@Controller('balance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({ summary: '获取账户余额' })
  async getBalance(@CurrentUser('userId') userId: string) {
    return this.balanceService.getBalance(userId)
  }

  @Get('cashback/records')
  @ApiOperation({ summary: '获取返现明细' })
  @ApiPagination()
  async getCashbackRecords(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.balanceService.getCashbackRecords(userId, page, pageSize)
  }

  @Get('records')
  @ApiOperation({ summary: '获取余额明细' })
  @ApiPagination()
  async getBalanceRecords(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.balanceService.getBalanceRecords(userId, 'BALANCE', page, pageSize)
  }

  @Get('consumption/records')
  @ApiOperation({ summary: '获取消费金明细' })
  @ApiPagination()
  async getConsumptionRecords(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.balanceService.getBalanceRecords(userId, 'CONSUMPTION', page, pageSize)
  }

  @Post('recharge')
  @ApiOperation({ summary: '余额充值' })
  async recharge(@CurrentUser('userId') userId: string, @Body('amount') amount: number) {
    return this.balanceService.recharge(userId, amount)
  }

  @Post('cashback/withdraw')
  @ApiOperation({ summary: '返现提现' })
  async withdrawCashback(@CurrentUser('userId') userId: string, @Body('amount') amount: number) {
    return this.balanceService.withdrawCashback(userId, amount)
  }
}
