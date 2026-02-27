import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { FavoriteService } from './favorite.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('收藏/足迹')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get('favorites')
  @ApiOperation({ summary: '获取收藏列表' })
  @ApiPagination()
  async getFavorites(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.favoriteService.getFavorites(userId, page, pageSize)
  }

  @Post('favorites')
  @ApiOperation({ summary: '添加收藏' })
  async addFavorite(@CurrentUser('userId') userId: string, @Body('storeId') storeId: string) {
    return this.favoriteService.addFavorite(userId, storeId)
  }

  @Delete('favorites/:storeId')
  @ApiOperation({ summary: '取消收藏' })
  async removeFavorite(@CurrentUser('userId') userId: string, @Param('storeId') storeId: string) {
    return this.favoriteService.removeFavorite(userId, storeId)
  }

  @Get('footprints')
  @ApiOperation({ summary: '获取浏览足迹' })
  @ApiPagination()
  async getFootprints(
    @CurrentUser('userId') userId: string,
    @Query('date') date?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.favoriteService.getFootprints(userId, date, page, pageSize)
  }

  @Post('footprints')
  @ApiOperation({ summary: '记录浏览' })
  async recordFootprint(@CurrentUser('userId') userId: string, @Body('storeId') storeId: string) {
    return this.favoriteService.recordFootprint(userId, storeId)
  }
}
