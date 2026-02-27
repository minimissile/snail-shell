import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../../common/dto'

export class QueryAdminUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string
}

export class CreateAdminDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ description: '真实姓名' })
  @IsString()
  @IsNotEmpty()
  realName: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({ description: '角色ID列表' })
  @IsOptional()
  @IsArray()
  roleIds?: string[]
}

export class UpdateAdminDto {
  @IsOptional() @IsString() realName?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsString() email?: string
  @IsOptional() @IsString() avatar?: string
}

export class UpdateAdminStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'DISABLED'] })
  @IsEnum(['ACTIVE', 'DISABLED'])
  status: string
}

export class AssignRolesDto {
  @ApiProperty({ description: '角色ID列表' })
  @IsArray()
  roleIds: string[]
}

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: '角色编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '权限ID列表' })
  @IsOptional()
  @IsArray()
  permissionIds?: string[]
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ description: '权限ID列表' })
  @IsArray()
  permissionIds: string[]
}
