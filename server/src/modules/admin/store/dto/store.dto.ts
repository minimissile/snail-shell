import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsEnum, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateStoreDto {
  @ApiProperty({ description: '门店名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '图片列表' })
  @IsOptional()
  @IsArray()
  images?: string[]

  @ApiPropertyOptional({ description: '视频URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string

  @ApiProperty({ description: '地址' })
  @IsString()
  @IsNotEmpty()
  address: string

  @ApiProperty({ description: '区域' })
  @IsString()
  @IsNotEmpty()
  district: string

  @ApiProperty({ description: '城市编码' })
  @IsString()
  @IsNotEmpty()
  cityCode: string

  @ApiProperty({ description: '经度' })
  @IsNumber()
  @Type(() => Number)
  longitude: number

  @ApiProperty({ description: '纬度' })
  @IsNumber()
  @Type(() => Number)
  latitude: number

  @ApiPropertyOptional({ description: '附近交通' })
  @IsOptional()
  @IsString()
  nearbyTransport?: string

  @ApiPropertyOptional({ description: '营业时间' })
  @IsOptional()
  @IsString()
  businessHours?: string

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  phone?: string
}

export class UpdateStoreDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsArray() images?: string[]
  @IsOptional() @IsString() videoUrl?: string
  @IsOptional() @IsString() address?: string
  @IsOptional() @IsString() district?: string
  @IsOptional() @IsString() cityCode?: string
  @IsOptional() @IsNumber() @Type(() => Number) longitude?: number
  @IsOptional() @IsNumber() @Type(() => Number) latitude?: number
  @IsOptional() @IsString() nearbyTransport?: string
  @IsOptional() @IsString() businessHours?: string
  @IsOptional() @IsString() phone?: string
}

export class UpdateStoreStatusDto {
  @ApiProperty({ description: '状态', enum: ['ACTIVE', 'INACTIVE', 'CLOSED'] })
  @IsEnum(['ACTIVE', 'INACTIVE', 'CLOSED'])
  status: string
}

export class CreateRoomDto {
  @ApiProperty({ description: '房型名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: '房型类型', enum: ['MALE_DORM', 'FEMALE_DORM', 'MIXED_DORM', 'PRIVATE'] })
  @IsEnum(['MALE_DORM', 'FEMALE_DORM', 'MIXED_DORM', 'PRIVATE'])
  type: string

  @ApiPropertyOptional({ description: '图片列表' })
  @IsOptional()
  @IsArray()
  images?: string[]

  @ApiProperty({ description: '床位数' })
  @IsNumber()
  @Type(() => Number)
  bedCount: number

  @ApiProperty({ description: '面积' })
  @IsNumber()
  @Type(() => Number)
  area: number

  @ApiPropertyOptional({ description: '楼层' })
  @IsOptional()
  @IsString()
  floor?: string

  @ApiProperty({ description: '基准价格' })
  @IsNumber()
  @Type(() => Number)
  price: number

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) originalPrice?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) hourPrice?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) monthPrice?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) weekendPrice?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) holidayPrice?: number

  @ApiPropertyOptional({ description: '设施特点' })
  @IsOptional()
  @IsArray()
  features?: string[]

  @ApiPropertyOptional({ description: '是否有智能门锁' })
  @IsOptional()
  @IsBoolean()
  hasSmartLock?: boolean

  @ApiPropertyOptional({ description: '自动生成床位' })
  @IsOptional()
  @IsBoolean()
  autoGenerateBeds?: boolean
}

export class UpdateRoomDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() type?: string
  @IsOptional() @IsArray() images?: string[]
  @IsOptional() @IsNumber() @Type(() => Number) bedCount?: number
  @IsOptional() @IsNumber() @Type(() => Number) area?: number
  @IsOptional() @IsString() floor?: string
  @IsOptional() @IsNumber() @Type(() => Number) price?: number
  @IsOptional() @IsNumber() @Type(() => Number) originalPrice?: number
  @IsOptional() @IsNumber() @Type(() => Number) hourPrice?: number
  @IsOptional() @IsNumber() @Type(() => Number) monthPrice?: number
  @IsOptional() @IsNumber() @Type(() => Number) weekendPrice?: number
  @IsOptional() @IsNumber() @Type(() => Number) holidayPrice?: number
  @IsOptional() @IsArray() features?: string[]
  @IsOptional() @IsBoolean() hasSmartLock?: boolean
}
