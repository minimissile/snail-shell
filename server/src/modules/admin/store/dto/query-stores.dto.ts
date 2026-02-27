import { IsOptional, IsString, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../../common/dto'

export class QueryStoresDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
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

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE', 'CLOSED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'CLOSED'])
  status?: string
}
