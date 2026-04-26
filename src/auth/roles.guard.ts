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
    const roleName = user.role?.name || user.role; // Handle both object and string
    if (roleName.toUpperCase() === 'ADMIN' || user.email === 'admin@laundry.com') {
      return true;
    }

    // Role-based permissions check
    // We get both set of permissions from the fresh user object
    const permissions = user.role?.permissions || user.permissions || [];
    const permissionsMobile = user.role?.permissions_mobile || user.permissions_mobile || [];
    
    // Check in both (for compatibility between web/mobile requests)
    const allPermissions = [...permissions, ...permissionsMobile];
    const viewPermission = allPermissions.find(p => p.view === requiredPermission.view);
    
    if (!viewPermission) {
      throw new ForbiddenException(`Access denied: Missing permission for ${requiredPermission.view}`);
    }

    if (!viewPermission.actions.includes(requiredPermission.action)) {
      throw new ForbiddenException(`Access denied: Missing action ${requiredPermission.action} for ${requiredPermission.view}`);
    }

    return true;
  }
}
