import { Module } from '@nestjs/common'
import { AdminCouponController } from './admin-coupon.controller'
import { AdminCouponService } from './admin-coupon.service'

@Module({
  controllers: [AdminCouponController],
  providers: [AdminCouponService],
})
export class AdminCouponModule {}
