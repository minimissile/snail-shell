import { IsString, IsOptional, IsNumber, IsDateString, IsArray, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { PaginationDto } from '../../../common/dto'

export class SearchStoresDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '城市编码' })
  @IsOptional()
  @IsString()
  cityCode?: string

  @ApiPropertyOptional({ description: '区域' })
  @IsOptional()
  @IsString()
  district?: string

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number

  @ApiPropertyOptional({ description: '入住日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  checkInDate?: string

  @ApiPropertyOptional({ description: '离店日期 YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string

  @ApiPropertyOptional({ description: '入住人数' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  guestCount?: number

  @ApiPropertyOptional({ description: '床位数' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bedCount?: number

  @ApiPropertyOptional({ description: '最低价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number

  @ApiPropertyOptional({ description: '最高价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number

  @ApiPropertyOptional({ description: '排序字段', enum: ['popularity', 'distance', 'price'] })
  @IsOptional()
  @IsEnum(['popularity', 'distance', 'price'])
  sortBy?: 'popularity' | 'distance' | 'price'

  @ApiPropertyOptional({ description: '排序方向', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'

  @ApiPropertyOptional({ description: '标签筛选', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

export class GetRoomsDto {
  @ApiPropertyOptional({ description: '入住日期' })
  @IsOptional()
  @IsDateString()
  checkInDate?: string

  @ApiPropertyOptional({ description: '离店日期' })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string

  @ApiPropertyOptional({ description: '预订方式', enum: ['day', 'hour', 'month'] })
  @IsOptional()
  @IsEnum(['day', 'hour', 'month'])
  bookingMode?: 'day' | 'hour' | 'month'
}

export class GetBedsDto {
  @ApiPropertyOptional({ description: '入住日期' })
  @IsOptional()
  @IsDateString()
  checkInDate?: string

  @ApiPropertyOptional({ description: '离店日期' })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string

  @ApiPropertyOptional({ description: '预订方式', enum: ['day', 'hour', 'month'] })
  @IsOptional()
  @IsEnum(['day', 'hour', 'month'])
  bookingMode?: 'day' | 'hour' | 'month'

  @ApiPropertyOptional({ description: '开始时间 (小时订)' })
  @IsOptional()
  @IsString()
  startTime?: string

  @ApiPropertyOptional({ description: '结束时间 (小时订)' })
  @IsOptional()
  @IsString()
  endTime?: string
}

export class GetReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '筛选标签', enum: ['好评', '差评', '有图'] })
  @IsOptional()
  @IsString()
  tag?: string
}
