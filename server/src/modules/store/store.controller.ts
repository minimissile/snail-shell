import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { StoreService } from './store.service'
import { SearchStoresDto, GetRoomsDto, GetBedsDto, GetReviewsDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

// 可选认证守卫
class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    return user || null
  }
}

@ApiTags('门店')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '搜索门店列表' })
  @ApiPagination()
  async searchStores(@Query() dto: SearchStoresDto, @CurrentUser('userId') userId?: string) {
    return this.storeService.searchStores(dto, userId)
  }

  @Get(':storeId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取门店详情' })
  async getStoreDetail(@Param('storeId') storeId: string, @CurrentUser('userId') userId?: string) {
    return this.storeService.getStoreDetail(storeId, userId)
  }

  @Get(':storeId/rooms')
  @ApiOperation({ summary: '获取门店房型列表' })
  async getRooms(@Param('storeId') storeId: string, @Query() dto: GetRoomsDto) {
    return this.storeService.getRooms(storeId, dto)
  }

  @Get(':storeId/rooms/:roomId/beds')
  @ApiOperation({ summary: '获取床位状态' })
  async getBeds(@Param('storeId') storeId: string, @Param('roomId') roomId: string, @Query() dto: GetBedsDto) {
    return this.storeService.getBeds(storeId, roomId, dto)
  }

  @Get(':storeId/reviews')
  @ApiOperation({ summary: '获取门店点评' })
  @ApiPagination()
  async getReviews(@Param('storeId') storeId: string, @Query() dto: GetReviewsDto) {
    return this.storeService.getReviews(storeId, dto)
  }
}
