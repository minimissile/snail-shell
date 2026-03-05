import { Module } from '@nestjs/common'
import { FootprintController } from './footprint.controller'
import { FootprintService } from './footprint.service'

/**
 * 足迹模块
 */
@Module({
  controllers: [FootprintController],
  providers: [FootprintService],
})
export class FootprintModule {}
