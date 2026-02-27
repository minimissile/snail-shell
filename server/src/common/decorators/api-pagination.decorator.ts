import { applyDecorators } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'

export function ApiPagination() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: '页码' }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, description: '每页数量' })
  )
}
