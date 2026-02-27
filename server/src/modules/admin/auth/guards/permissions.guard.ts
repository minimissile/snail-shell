import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators'
import { AdminPayload } from '../decorators'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const { user } = ctx.switchToHttp().getRequest()
    const admin = user as AdminPayload

    if (!admin || !admin.permissions) {
      return false
    }

    // 超级管理员拥有所有权限
    if (admin.roles?.includes('SUPER_ADMIN')) {
      return true
    }

    return requiredPermissions.some((perm) => admin.permissions.includes(perm))
  }
}
