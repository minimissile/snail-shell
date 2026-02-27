import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Response } from 'express'
import { AdminOrderService } from './admin-order.service'
import { AdminJwtAuthGuard, PermissionsGuard } from '../auth/guards'
import { Permissions } from '../auth/decorators'
import { QueryOrdersDto, HandleRefundDto } from './dto'

@ApiTags('管理后台-订单管理')
@Controller('admin/orders')
@UseGuards(AdminJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminOrderController {
  constructor(private readonly orderService: AdminOrderService) {}

  @Get()
  @Permissions('order:read')
  @ApiOperation({ summary: '订单列表' })
  async findOrders(@Query() dto: QueryOrdersDto) {
    return this.orderService.findOrders(dto)
  }

  @Get(':id')
  @Permissions('order:read')
  @ApiOperation({ summary: '订单详情' })
  async findOrderById(@Param('id') id: string) {
    return this.orderService.findOrderById(id)
  }

  @Put(':id/refund')
  @Permissions('order:refund')
  @ApiOperation({ summary: '处理退款' })
  async handleRefund(@Param('id') id: string, @Body() dto: HandleRefundDto) {
    return this.orderService.handleRefund(id, dto)
  }

  @Post('export')
  @Permissions('order:export')
  @ApiOperation({ summary: '导出订单' })
  async exportOrders(@Body() dto: QueryOrdersDto, @Res() res: Response) {
    const orders = await this.orderService.exportOrders(dto)

    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('订单列表')

    worksheet.columns = [
      { header: '订单号', key: 'orderNo', width: 22 },
      { header: '门店', key: 'storeName', width: 25 },
      { header: '入住人', key: 'guestName', width: 12 },
      { header: '手机号', key: 'guestPhone', width: 15 },
      { header: '入住日期', key: 'checkInDate', width: 14 },
      { header: '离店日期', key: 'checkOutDate', width: 14 },
      { header: '晚数', key: 'nights', width: 8 },
      { header: '房费', key: 'roomPrice', width: 10 },
      { header: '实付金额', key: 'finalPrice', width: 10 },
      { header: '状态', key: 'status', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 20 },
    ]

    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: '待支付',
      PENDING_USE: '待使用',
      IN_USE: '使用中',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
      REFUNDING: '退款中',
      REFUNDED: '已退款',
    }

    orders.forEach((order: any) => {
      worksheet.addRow({
        orderNo: order.orderNo,
        storeName: order.store?.name,
        guestName: order.guestName,
        guestPhone: order.guestPhone,
        checkInDate: order.checkInDate?.toISOString().split('T')[0],
        checkOutDate: order.checkOutDate?.toISOString().split('T')[0],
        nights: order.nights,
        roomPrice: order.roomPrice?.toNumber(),
        finalPrice: order.finalPrice?.toNumber(),
        status: statusMap[order.status] || order.status,
        createdAt: order.createdAt?.toISOString().replace('T', ' ').split('.')[0],
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.xlsx`)

    await workbook.xlsx.write(res)
    res.end()
  }
}
