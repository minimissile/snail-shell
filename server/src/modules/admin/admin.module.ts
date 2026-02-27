import { Module } from '@nestjs/common'
import { AdminAuthModule } from './auth/admin-auth.module'
import { AdminDashboardModule } from './dashboard/admin-dashboard.module'
import { AdminStoreModule } from './store/admin-store.module'
import { AdminOrderModule } from './order/admin-order.module'
import { AdminUserModule } from './user/admin-user.module'
import { AdminCouponModule } from './coupon/admin-coupon.module'
import { AdminSystemModule } from './system/admin-system.module'
import { AdminUserMgmtModule } from './admin-user/admin-user-mgmt.module'

@Module({
  imports: [
    AdminAuthModule,
    AdminDashboardModule,
    AdminStoreModule,
    AdminOrderModule,
    AdminUserModule,
    AdminCouponModule,
    AdminSystemModule,
    AdminUserMgmtModule,
  ],
})
export class AdminModule {}
