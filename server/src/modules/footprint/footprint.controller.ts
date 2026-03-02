import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { FootprintService } from './footprint.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'
import { GetFootprintsDto } from './dto/get-footprints.dto'

@ApiTags('足迹管理')
@Controller('footprints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FootprintController {
  constructor(private readonly footprintService: FootprintService) {}

  /**
   * 添加足迹
   */
  @Post()
  @ApiOperation({ summary: '添加足迹' })
  async addFootprint(
    @CurrentUser('userId') userId: string,
    @Body('storeId') storeId: string
  ) {
    return this.footprintService.addFootprint(userId, storeId)
  }

  /**
   * 获取足迹列表
   */
  @Get()
  @ApiOperation({ summary: '获取足迹列表' })
  @ApiPagination()
  async getFootprints(
    @CurrentUser('userId') userId: string,
    @Query() dto: GetFootprintsDto
  ) {
    return this.footprintService.getFootprints(userId, dto.page, dto.pageSize)
  }

  /**
   * 清空足迹
   */
  @Delete()
  @ApiOperation({ summary: '清空足迹' })
  async clearFootprints(@CurrentUser('userId') userId: string) {
    return this.footprintService.clearFootprints(userId)
  }

  /**
   * 删除单个足迹
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除足迹' })
  async removeFootprint(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string
  ) {
    return this.footprintService.removeFootprint(userId, id)
  }
}