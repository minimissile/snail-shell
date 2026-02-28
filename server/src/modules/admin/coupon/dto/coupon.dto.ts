import { IsOptional, IsString, IsEnum, IsNumber, IsArray, IsInt, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { PaginationDto } from '../../../../common/dto'

export class QueryCouponTemplatesDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '类型' })
  @IsOptional()
  @IsString()
  type?: string
}

export class CreateCouponTemplateDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  name: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '类型', enum: ['DISCOUNT', 'RATE', 'CASH'] })
  @IsEnum(['DISCOUNT', 'RATE', 'CASH'])
  type: string

  @ApiPropertyOptional({ description: '优惠金额' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number

  @ApiPropertyOptional({ description: '折扣率' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountRate?: number

  @ApiPropertyOptional({ description: '最低消费' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAmount?: number

  @ApiProperty({ description: '有效期类型', enum: ['FIXED', 'DAYS'] })
  @IsEnum(['FIXED', 'DAYS'])
  validType: string

  @ApiPropertyOptional({ description: '有效天数' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  validDays?: number

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  validFrom?: string

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  validTo?: string

  @ApiPropertyOptional({ description: '适用门店ID' })
  @IsOptional()
  @IsArray()
  applicableStores?: string[]

  @ApiPropertyOptional({ description: '适用房型' })
  @IsOptional()
  @IsArray()
  applicableRooms?: string[]

  @ApiPropertyOptional({ description: '总数量 (-1不限)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  totalCount?: number

  @ApiPropertyOptional({ description: '每人限领' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  perUserLimit?: number
}

export class UpdateCouponTemplateDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsNumber() @Type(() => Number) amount?: number
  @IsOptional() @IsNumber() @Type(() => Number) discountRate?: number
  @IsOptional() @IsNumber() @Type(() => Number) minAmount?: number
  @IsOptional() @IsInt() @Type(() => Number) validDays?: number
  @IsOptional() @IsDateString() validFrom?: string
  @IsOptional() @IsDateString() validTo?: string
  @IsOptional() @IsArray() applicableStores?: string[]
  @IsOptional() @IsArray() applicableRooms?: string[]
  @IsOptional() @IsInt() @Type(() => Number) totalCount?: number
  @IsOptional() @IsInt() @Type(() => Number) perUserLimit?: number
}

export class UpdateCouponStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status: string
}

export class DistributeCouponDto {
  @ApiPropertyOptional({ description: '是否发放给所有用户' })
  @IsOptional()
  allUsers?: boolean

  @ApiPropertyOptional({ description: '会员等级筛选' })
  @IsOptional()
  @IsString()
  memberLevel?: string

  @ApiPropertyOptional({ description: '指定用户ID列表' })
  @IsOptional()
  @IsArray()
  userIds?: string[]

  @ApiPropertyOptional({ description: '指定手机号列表' })
  @IsOptional()
  @IsArray()
  phones?: string[]
}
