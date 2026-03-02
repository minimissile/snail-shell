import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

// 核心模块
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'

// 公共模块
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

// 业务模块
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { StoreModule } from './modules/store/store.module'
import { OrderModule } from './modules/order/order.module'
import { CouponModule } from './modules/coupon/coupon.module'
import { FavoriteModule } from './modules/favorite/favorite.module'
import { SmartLockModule } from './modules/smart-lock/smart-lock.module'
import { BalanceModule } from './modules/balance/balance.module'
import { MessageModule } from './modules/message/message.module'
import { CommonModule } from './modules/common/common.module'
import { FootprintModule } from './modules/footprint/footprint.module'

// 管理后台模块
import { AdminModule } from './modules/admin/admin.module'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 核心模块
    PrismaModule,
    RedisModule,

    // 业务模块
    AuthModule,
    UserModule,
    StoreModule,
    OrderModule,
    CouponModule,
    FavoriteModule,
    SmartLockModule,
    BalanceModule,
    MessageModule,
    CommonModule,

    // 管理后台模块
    AdminModule,
  ],
  providers: [
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // 全局响应转换拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
