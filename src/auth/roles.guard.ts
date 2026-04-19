import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<{view: string, action: string}>('permission', context.getHandler());
    
    // If no permission metadata is set, allow access (or default to denied if strict)
    if (!requiredPermission) {
      return true; 
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: No user role found');
    }

    // Admin override
    if (user.role.toUpperCase() === 'ADMIN' || user.email === 'admin@laundry.com') {
      return true;
    }

    // Role-based permissions check
    // Note: The user object in the request comes from JwtStrategy.
    // We need to ensure the permissions are available here.
    // In our current setup, user.role is just the name (string).
    // We might need to fetch the full role with permissions if the token is small.
    // To keep it efficient, we can trust the token if we include the permissions there,
    // but for now, we'll implement a name-based fallback or suggest a more robust check.

    const permissions = user.permissions || [];
    const viewPermission = permissions.find(p => p.view === requiredPermission.view);
    
    if (!viewPermission) {
      throw new ForbiddenException(`Access denied: Missing permission for ${requiredPermission.view}`);
    }

    if (!viewPermission.actions.includes(requiredPermission.action)) {
      throw new ForbiddenException(`Access denied: Missing action ${requiredPermission.action} for ${requiredPermission.view}`);
    }

    return true;
  }
}
