import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录 code' })
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  code: string
}

export class GetPhoneDto {
  @ApiProperty({ description: '手机号获取 code' })
  @IsString()
  @IsNotEmpty({ message: 'code不能为空' })
  code: string
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  @IsNotEmpty({ message: 'refreshToken不能为空' })
  refreshToken: string
}
