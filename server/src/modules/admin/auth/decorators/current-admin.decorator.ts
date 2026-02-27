import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface AdminPayload {
  adminUserId: string
  username: string
  roles: string[]
  permissions: string[]
}

export const CurrentAdmin = createParamDecorator((data: keyof AdminPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const admin = request.user as AdminPayload

  if (!admin) {
    return null
  }

  return data ? admin[data] : admin
})
