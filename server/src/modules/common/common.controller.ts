import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { CommonService } from './common.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators'

const imageStorage = diskStorage({
  destination: join(__dirname, '..', '..', '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + extname(file.originalname))
  },
})

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
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: imageStorage }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` }
  }
}
