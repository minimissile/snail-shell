import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminCouponService } from './admin-coupon.service'
import { AdminJwtAuthGuard, PermissionsGuard } from '../auth/guards'
import { Permissions } from '../auth/decorators'
import {
  QueryCouponTemplatesDto,
  CreateCouponTemplateDto,
  UpdateCouponTemplateDto,
  UpdateCouponStatusDto,
  DistributeCouponDto,
} from './dto'

@ApiTags('管理后台-优惠券管理')
@Controller('admin/coupons')
@UseGuards(AdminJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminCouponController {
  constructor(private readonly couponService: AdminCouponService) {}

  @Get()
  @Permissions('coupon:read')
  @ApiOperation({ summary: '优惠券模板列表' })
  async findTemplates(@Query() dto: QueryCouponTemplatesDto) {
    return this.couponService.findTemplates(dto)
  }

  @Get(':id')
  @Permissions('coupon:read')
  @ApiOperation({ summary: '优惠券模板详情' })
  async findTemplateById(@Param('id') id: string) {
    return this.couponService.findTemplateById(id)
  }

  @Post()
  @Permissions('coupon:create')
  @ApiOperation({ summary: '创建优惠券模板' })
  async createTemplate(@Body() dto: CreateCouponTemplateDto) {
    return this.couponService.createTemplate(dto)
  }

  @Put(':id')
  @Permissions('coupon:update')
  @ApiOperation({ summary: '更新优惠券模板' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateCouponTemplateDto) {
    return this.couponService.updateTemplate(id, dto)
  }

  @Delete(':id')
  @Permissions('coupon:delete')
  @ApiOperation({ summary: '删除优惠券模板' })
  async deleteTemplate(@Param('id') id: string) {
    return this.couponService.deleteTemplate(id)
  }

  @Put(':id/status')
  @Permissions('coupon:update')
  @ApiOperation({ summary: '启用/停用模板' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateCouponStatusDto) {
    return this.couponService.updateTemplateStatus(id, dto)
  }

  @Post(':id/distribute')
  @Permissions('coupon:distribute')
  @ApiOperation({ summary: '批量发放优惠券' })
  async distribute(@Param('id') id: string, @Body() dto: DistributeCouponDto) {
    return this.couponService.distribute(id, dto)
  }

  @Get(':id/records')
  @Permissions('coupon:read')
  @ApiOperation({ summary: '发放记录' })
  async findRecords(@Param('id') id: string, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.couponService.findRecords(id, page, pageSize)
  }
}
