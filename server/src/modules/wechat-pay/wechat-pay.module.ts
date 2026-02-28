import { Module, forwardRef } from '@nestjs/common'
import { WechatPayService } from './wechat-pay.service'
import { WechatPayController } from './wechat-pay.controller'
import { OrderModule } from '../order/order.module'

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [WechatPayController],
  providers: [WechatPayService],
  exports: [WechatPayService],
})
export class WechatPayModule {}
