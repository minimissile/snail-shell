import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AdminDashboardService } from './admin-dashboard.service'
import { AdminJwtAuthGuard } from '../auth/guards'

@ApiTags('管理后台-数据看板')
@Controller('admin/dashboard')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: '总览数据' })
  async getOverview() {
    return this.dashboardService.getOverview()
  }

  @Get('revenue')
  @ApiOperation({ summary: '营收趋势' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '14d', '30d'] })
  async getRevenue(@Query('range') range?: string) {
    return this.dashboardService.getRevenueStats(range)
  }

  @Get('orders')
  @ApiOperation({ summary: '订单统计' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '14d', '30d'] })
  async getOrderStats(@Query('range') range?: string) {
    return this.dashboardService.getOrderStats(range)
  }

  @Get('users')
  @ApiOperation({ summary: '用户增长' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '14d', '30d'] })
  async getUserStats(@Query('range') range?: string) {
    return this.dashboardService.getUserStats(range)
  }

  @Get('stores/ranking')
  @ApiOperation({ summary: '门店排行' })
  async getStoreRanking() {
    return this.dashboardService.getStoreRanking()
  }

  @Get('occupancy')
  @ApiOperation({ summary: '床位入住率' })
  async getOccupancy() {
    return this.dashboardService.getOccupancy()
  }
}
