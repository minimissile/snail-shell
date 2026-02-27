import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminStoreService } from './admin-store.service'
import { AdminJwtAuthGuard } from '../auth/guards'
import { PermissionsGuard } from '../auth/guards'
import { Permissions } from '../auth/decorators'
import {
  QueryStoresDto,
  CreateStoreDto,
  UpdateStoreDto,
  UpdateStoreStatusDto,
  CreateRoomDto,
  UpdateRoomDto,
} from './dto'

@ApiTags('管理后台-门店管理')
@Controller('admin')
@UseGuards(AdminJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminStoreController {
  constructor(private readonly storeService: AdminStoreService) {}

  // ==================== 门店 ====================

  @Get('stores')
  @Permissions('store:read')
  @ApiOperation({ summary: '门店列表' })
  async findStores(@Query() dto: QueryStoresDto) {
    return this.storeService.findStores(dto)
  }

  @Get('stores/:id')
  @Permissions('store:read')
  @ApiOperation({ summary: '门店详情' })
  async findStoreById(@Param('id') id: string) {
    return this.storeService.findStoreById(id)
  }

  @Post('stores')
  @Permissions('store:create')
  @ApiOperation({ summary: '创建门店' })
  async createStore(@Body() dto: CreateStoreDto) {
    return this.storeService.createStore(dto)
  }

  @Put('stores/:id')
  @Permissions('store:update')
  @ApiOperation({ summary: '更新门店' })
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.updateStore(id, dto)
  }

  @Delete('stores/:id')
  @Permissions('store:delete')
  @ApiOperation({ summary: '删除门店' })
  async deleteStore(@Param('id') id: string) {
    return this.storeService.deleteStore(id)
  }

  @Put('stores/:id/status')
  @Permissions('store:update')
  @ApiOperation({ summary: '更改门店状态' })
  async updateStoreStatus(@Param('id') id: string, @Body() dto: UpdateStoreStatusDto) {
    return this.storeService.updateStoreStatus(id, dto)
  }

  // ==================== 房型 ====================

  @Get('stores/:storeId/rooms')
  @Permissions('room:read')
  @ApiOperation({ summary: '房型列表' })
  async findRooms(@Param('storeId') storeId: string) {
    return this.storeService.findRooms(storeId)
  }

  @Get('rooms/:id')
  @Permissions('room:read')
  @ApiOperation({ summary: '房型详情' })
  async findRoomById(@Param('id') id: string) {
    return this.storeService.findRoomById(id)
  }

  @Post('stores/:storeId/rooms')
  @Permissions('room:create')
  @ApiOperation({ summary: '创建房型' })
  async createRoom(@Param('storeId') storeId: string, @Body() dto: CreateRoomDto) {
    return this.storeService.createRoom(storeId, dto)
  }

  @Put('rooms/:id')
  @Permissions('room:update')
  @ApiOperation({ summary: '更新房型' })
  async updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.storeService.updateRoom(id, dto)
  }

  @Delete('rooms/:id')
  @Permissions('room:delete')
  @ApiOperation({ summary: '删除房型' })
  async deleteRoom(@Param('id') id: string) {
    return this.storeService.deleteRoom(id)
  }

  // ==================== 床位 ====================

  @Delete('beds/:id')
  @Permissions('room:delete')
  @ApiOperation({ summary: '删除床位' })
  async deleteBed(@Param('id') id: string) {
    return this.storeService.deleteBed(id)
  }
}
