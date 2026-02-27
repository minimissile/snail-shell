import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OrderService } from './order.service'
import { CalculateOrderDto, CreateOrderDto, GetOrdersDto, PayOrderDto, CancelOrderDto, RefundOrderDto } from './dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser, ApiPagination } from '../../common/decorators'

@ApiTags('订单')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('calculate')
  @ApiOperation({ summary: '计算订单价格' })
  async calculateOrder(@CurrentUser('userId') userId: string, @Body() dto: CalculateOrderDto) {
    return this.orderService.calculateOrder(userId, dto)
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async createOrder(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId, dto)
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiPagination()
  async getOrders(@CurrentUser('userId') userId: string, @Query() dto: GetOrdersDto) {
    return this.orderService.getOrders(userId, dto)
  }

  @Get(':orderId')
  @ApiOperation({ summary: '获取订单详情' })
  async getOrderDetail(@CurrentUser('userId') userId: string, @Param('orderId') orderId: string) {
    return this.orderService.getOrderDetail(userId, orderId)
  }

  @Post(':orderId/pay')
  @ApiOperation({ summary: '支付订单' })
  async payOrder(@CurrentUser('userId') userId: string, @Param('orderId') orderId: string, @Body() dto: PayOrderDto) {
    return this.orderService.payOrder(userId, orderId, dto)
  }

  @Post(':orderId/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancelOrder(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto
  ) {
    return this.orderService.cancelOrder(userId, orderId, dto)
  }

  @Post(':orderId/refund')
  @ApiOperation({ summary: '申请退款' })
  async refundOrder(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: RefundOrderDto
  ) {
    return this.orderService.refundOrder(userId, orderId, dto)
  }
}
