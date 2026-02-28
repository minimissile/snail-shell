import { Module, forwardRef } from '@nestjs/common'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { WechatPayModule } from '../wechat-pay/wechat-pay.module'

@Module({
  imports: [forwardRef(() => WechatPayModule)],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
