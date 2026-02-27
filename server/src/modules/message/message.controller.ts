import { Controller, Get, Put, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MessageService } from './message.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('消息')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: '获取消息列表' })
  @ApiPagination()
  async getMessages(
    @CurrentUser('userId') userId: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return this.messageService.getMessages(userId, type, page, pageSize)
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数' })
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    return this.messageService.getUnreadCount(userId)
  }

  @Put(':messageId/read')
  @ApiOperation({ summary: '标记消息已读' })
  async markAsRead(@CurrentUser('userId') userId: string, @Param('messageId') messageId: string) {
    return this.messageService.markAsRead(userId, messageId)
  }

  @Put('read-all')
  @ApiOperation({ summary: '标记全部已读' })
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.messageService.markAllAsRead(userId)
  }
}
