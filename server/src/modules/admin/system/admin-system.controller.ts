import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminSystemService } from './admin-system.service'
import { AdminJwtAuthGuard, PermissionsGuard } from '../auth/guards'
import { Permissions } from '../auth/decorators'
import { UpdateHomeConfigDto, CreateCityDto, UpdateCityDto, UpdateAgreementDto } from './dto'

@ApiTags('管理后台-系统配置')
@Controller('admin/system')
@UseGuards(AdminJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSystemController {
  constructor(private readonly systemService: AdminSystemService) {}

  // ==================== 首页配置 ====================

  @Get('home-config')
  @Permissions('system:read')
  @ApiOperation({ summary: '获取首页配置' })
  async getHomeConfig() {
    return this.systemService.getHomeConfig()
  }

  @Put('home-config')
  @Permissions('system:update')
  @ApiOperation({ summary: '更新首页配置' })
  async updateHomeConfig(@Body() dto: UpdateHomeConfigDto) {
    return this.systemService.updateHomeConfig(dto)
  }

  // ==================== 城市管理 ====================

  @Get('cities')
  @Permissions('system:read')
  @ApiOperation({ summary: '城市列表' })
  async findCities() {
    return this.systemService.findCities()
  }

  @Post('cities')
  @Permissions('system:create')
  @ApiOperation({ summary: '创建城市' })
  async createCity(@Body() dto: CreateCityDto) {
    return this.systemService.createCity(dto)
  }

  @Put('cities/:id')
  @Permissions('system:update')
  @ApiOperation({ summary: '更新城市' })
  async updateCity(@Param('id') id: string, @Body() dto: UpdateCityDto) {
    return this.systemService.updateCity(id, dto)
  }

  @Delete('cities/:id')
  @Permissions('system:delete')
  @ApiOperation({ summary: '删除城市' })
  async deleteCity(@Param('id') id: string) {
    return this.systemService.deleteCity(id)
  }

  // ==================== 协议管理 ====================

  @Get('agreements')
  @Permissions('system:read')
  @ApiOperation({ summary: '协议列表' })
  async findAgreements() {
    return this.systemService.findAgreements()
  }

  @Get('agreements/:type')
  @Permissions('system:read')
  @ApiOperation({ summary: '获取协议' })
  async findAgreement(@Param('type') type: string) {
    return this.systemService.findAgreementByType(type)
  }

  @Put('agreements/:type')
  @Permissions('system:update')
  @ApiOperation({ summary: '更新协议' })
  async updateAgreement(@Param('type') type: string, @Body() dto: UpdateAgreementDto) {
    return this.systemService.updateAgreement(type, dto)
  }
}
