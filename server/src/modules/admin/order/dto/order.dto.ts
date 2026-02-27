import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../../common/dto'

export class QueryOrdersDto extends PaginationDto {
  @ApiPropertyOptional({ description: '订单号' })
  @IsOptional()
  @IsString()
  orderNo?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '门店ID' })
  @IsOptional()
  @IsString()
  storeId?: string

  @ApiPropertyOptional({ description: '订单状态' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string
}

export class HandleRefundDto {
  @ApiPropertyOptional({ description: '操作', enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: string

  @ApiPropertyOptional({ description: '拒绝原因' })
  @IsOptional()
  @IsString()
  reason?: string
}
