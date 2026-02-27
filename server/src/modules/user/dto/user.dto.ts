import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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

// ========== Guest DTOs ==========

export class CreateGuestDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  name: string

  @ApiProperty({ description: '手机号' })
  @IsString()
  phone: string

  @ApiPropertyOptional({ description: '证件类型', enum: ['ID_CARD', 'PASSPORT', 'HK_MACAO_PASS', 'TW_PASS', 'OTHER'] })
  @IsOptional()
  @IsEnum(['ID_CARD', 'PASSPORT', 'HK_MACAO_PASS', 'TW_PASS', 'OTHER'])
  idType?: string

  @ApiProperty({ description: '证件号码' })
  @IsString()
  idNumber: string

  @ApiPropertyOptional({ description: '是否设为默认' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

export class UpdateGuestDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '证件类型', enum: ['ID_CARD', 'PASSPORT', 'HK_MACAO_PASS', 'TW_PASS', 'OTHER'] })
  @IsOptional()
  @IsEnum(['ID_CARD', 'PASSPORT', 'HK_MACAO_PASS', 'TW_PASS', 'OTHER'])
  idType?: string

  @ApiPropertyOptional({ description: '证件号码' })
  @IsOptional()
  @IsString()
  idNumber?: string

  @ApiPropertyOptional({ description: '是否设为默认' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
