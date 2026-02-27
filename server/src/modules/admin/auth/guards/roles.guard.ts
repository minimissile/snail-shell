import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators'
import { AdminPayload } from '../decorators'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const { user } = ctx.switchToHttp().getRequest()
    const admin = user as AdminPayload

    if (!admin || !admin.roles) {
      return false
    }

    // 超级管理员拥有所有权限
    if (admin.roles.includes('SUPER_ADMIN')) {
      return true
    }

    return requiredRoles.some((role) => admin.roles.includes(role))
  }
}
