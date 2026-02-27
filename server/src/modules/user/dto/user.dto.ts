import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../common/dto'

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string
}

export class GetPointRecordsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '类型', enum: ['earn', 'spend'] })
  @IsOptional()
  @IsEnum(['earn', 'spend'])
  type?: 'earn' | 'spend'
}
