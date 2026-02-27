import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { CouponService } from './coupon.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('优惠券')
@Controller('coupons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  @ApiOperation({ summary: '获取优惠券列表' })
  @ApiPagination()
  @ApiQuery({ name: 'status', required: false, enum: ['available', 'used', 'expired'] })
  async getCoupons(
    @CurrentUser('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.couponService.getCoupons(userId, status, page, pageSize)
  }

  @Post(':templateId/claim')
  @ApiOperation({ summary: '领取优惠券' })
  async claimCoupon(@CurrentUser('userId') userId: string, @Param('templateId') templateId: string) {
    return this.couponService.claimCoupon(userId, templateId)
  }

  @Get('available')
  @ApiOperation({ summary: '获取可用优惠券（下单时）' })
  async getAvailableCoupons(
    @CurrentUser('userId') userId: string,
    @Query('storeId') storeId: string,
    @Query('roomId') roomId: string,
    @Query('amount') amount: number
  ) {
    return this.couponService.getAvailableCoupons(userId, storeId, roomId, amount)
  }

  @Post('verify')
  @ApiOperation({ summary: '团购券核销' })
  async verifyCoupon(@Body() body: { storeId: string; qrCode: string; source: string }) {
    return this.couponService.verifyCoupon(body.storeId, body.qrCode, body.source)
  }
}
