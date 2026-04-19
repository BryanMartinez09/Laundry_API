import { SetMetadata } from '@nestjs/common';

export const CheckPermission = (view: string, action: string) => 
  SetMetadata('permission', { view, action });
