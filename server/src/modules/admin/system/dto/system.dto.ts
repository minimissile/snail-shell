import { IsOptional, IsString, IsBoolean, IsInt, IsArray, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class UpdateHomeConfigDto {
  @ApiPropertyOptional({ description: 'Banner列表' })
  @IsOptional()
  @IsArray()
  banners?: any[]

  @ApiPropertyOptional({ description: '热门标签' })
  @IsOptional()
  @IsArray()
  hotTags?: string[]

  @ApiPropertyOptional({ description: '促销入口' })
  @IsOptional()
  @IsArray()
  promotions?: any[]
}

export class CreateCityDto {
  @ApiProperty({ description: '城市编码' })
  @IsString()
  code: string

  @ApiProperty({ description: '城市名称' })
  @IsString()
  name: string

  @ApiProperty({ description: '首字母' })
  @IsString()
  letter: string

  @ApiPropertyOptional({ description: '是否热门' })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number
}

export class UpdateCityDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() letter?: string
  @IsOptional() @IsBoolean() isHot?: boolean
  @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number
}

export class UpdateAgreementDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '内容' })
  @IsString()
  content: string

  @ApiPropertyOptional({ description: '版本号' })
  @IsOptional()
  @IsString()
  version?: string
}

export class ReplyFeedbackDto {
  @ApiProperty({ description: '回复内容' })
  @IsString()
  reply: string

  @ApiPropertyOptional({ description: '状态', enum: ['PENDING', 'PROCESSING', 'RESOLVED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'RESOLVED'])
  status?: string
}
