import { Module } from '@nestjs/common'
import { AdminUserMgmtController } from './admin-user-mgmt.controller'
import { AdminUserMgmtService } from './admin-user-mgmt.service'

@Module({
  controllers: [AdminUserMgmtController],
  providers: [AdminUserMgmtService],
})
export class AdminUserMgmtModule {}
