import { IsOptional, IsString, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../../common/dto'

export class QueryUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string

  @ApiPropertyOptional({ description: '会员等级' })
  @IsOptional()
  @IsString()
  memberLevel?: string
}

export class UpdateMemberLevelDto {
  @ApiPropertyOptional({ description: '会员等级', enum: ['NORMAL', 'SILVER', 'GOLD', 'DIAMOND', 'BLACK_GOLD'] })
  @IsEnum(['NORMAL', 'SILVER', 'GOLD', 'DIAMOND', 'BLACK_GOLD'])
  memberLevel: string
}

export class AdjustPointsDto {
  @ApiPropertyOptional({ description: '调整数量（正数增加，负数减少）' })
  amount: number

  @ApiPropertyOptional({ description: '调整原因' })
  @IsString()
  reason: string
}

export class AdjustBalanceDto {
  @ApiPropertyOptional({ description: '调整金额（正数增加，负数减少）' })
  amount: number

  @ApiPropertyOptional({ description: '调整原因' })
  @IsString()
  reason: string
}
