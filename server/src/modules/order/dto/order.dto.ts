import { IsString, IsOptional, IsNumber, IsDateString, IsArray, IsEnum, IsBoolean, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { PaginationDto } from '../../../common/dto'

export class CalculateOrderDto {
  @ApiProperty({ description: '门店ID' })
  @IsString()
  storeId: string

  @ApiProperty({ description: '房型ID' })
  @IsString()
  roomId: string

  @ApiProperty({ description: '床位ID列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  bedIds: string[]

  @ApiProperty({ description: '入住日期' })
  @IsDateString()
  checkInDate: string

  @ApiProperty({ description: '离店日期' })
  @IsDateString()
  checkOutDate: string

  @ApiProperty({ description: '预订方式', enum: ['day', 'hour', 'month'] })
  @IsEnum(['day', 'hour', 'month'])
  bookingMode: 'day' | 'hour' | 'month'

  @ApiPropertyOptional({ description: '开始时间 (小时订)' })
  @IsOptional()
  @IsString()
  startTime?: string

  @ApiPropertyOptional({ description: '结束时间 (小时订)' })
  @IsOptional()
  @IsString()
  endTime?: string

  @ApiPropertyOptional({ description: '月数 (月订)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  monthCount?: number

  @ApiPropertyOptional({ description: '优惠券ID' })
  @IsOptional()
  @IsString()
  couponId?: string

  @ApiPropertyOptional({ description: '使用积分数量' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  usePoints?: number

  @ApiPropertyOptional({ description: '是否使用余额' })
  @IsOptional()
  @IsBoolean()
  useBalance?: boolean
}

export class CreateOrderDto extends CalculateOrderDto {
  @ApiProperty({ description: '入住人姓名' })
  @IsString()
  guestName: string

  @ApiProperty({ description: '身份证号' })
  @IsString()
  guestIdCard: string

  @ApiProperty({ description: '联系电话' })
  @IsString()
  guestPhone: string

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string
}

export class GetOrdersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '订单状态',
    enum: ['all', 'pending_payment', 'pending_use', 'in_use', 'completed', 'cancelled', 'refunding', 'refunded'],
  })
  @IsOptional()
  @IsString()
  status?: string
}

export class PayOrderDto {
  @ApiProperty({ description: '支付方式', enum: ['wechat', 'balance'] })
  @IsEnum(['wechat', 'balance'])
  paymentMethod: 'wechat' | 'balance'
}

export class CancelOrderDto {
  @ApiPropertyOptional({ description: '取消原因' })
  @IsOptional()
  @IsString()
  reason?: string
}

export class RefundOrderDto {
  @ApiProperty({ description: '退款原因' })
  @IsString()
  reason: string

  @ApiPropertyOptional({ description: '凭证图片', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]
}
