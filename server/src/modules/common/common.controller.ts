import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CommonService } from './common.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators'

// 可选认证
class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    return user || null
  }
}

@ApiTags('通用')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('cities')
  @ApiOperation({ summary: '获取城市列表' })
  async getCities() {
    return this.commonService.getCities()
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交反馈' })
  async submitFeedback(
    @CurrentUser('userId') userId: string,
    @Body() body: { type: string; content: string; images?: string[]; contact?: string }
  ) {
    return this.commonService.submitFeedback(userId, body.type, body.content, body.images, body.contact)
  }

  @Get('agreement/:type')
  @ApiOperation({ summary: '获取服务协议' })
  async getAgreement(@Param('type') type: string) {
    return this.commonService.getAgreement(type)
  }

  @Get('home-config')
  @ApiOperation({ summary: '获取首页配置' })
  async getHomeConfig() {
    return this.commonService.getHomeConfig()
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取文件上传地址' })
  async getUploadUrl(@Body() body: { type: string; filename: string }) {
    return this.commonService.getUploadUrl(body.type, body.filename)
  }
}
