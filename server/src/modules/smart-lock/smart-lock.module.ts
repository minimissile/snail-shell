import { Module } from '@nestjs/common'
import { SmartLockController } from './smart-lock.controller'
import { SmartLockService } from './smart-lock.service'

@Module({
  controllers: [SmartLockController],
  providers: [SmartLockService],
  exports: [SmartLockService],
})
export class SmartLockModule {}
