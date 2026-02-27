import { Module } from '@nestjs/common'
import { AdminStoreController } from './admin-store.controller'
import { AdminStoreService } from './admin-store.service'

@Module({
  controllers: [AdminStoreController],
  providers: [AdminStoreService],
})
export class AdminStoreModule {}
