import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CheckPermission } from '../auth/permission.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @CheckPermission('Roles', 'Agregar')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('Roles', 'Mostrar')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('available-permissions')
  getAvailablePermissions() {
    return this.rolesService.getAvailablePermissions();
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('Roles', 'Editar')
  @Patch(':id/permissions')
  updatePermissions(@Param('id') id: string, @Body() permissions: any) {
    return this.rolesService.updatePermissions(id, permissions);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('Roles', 'Editar')
  @Patch(':id/permissions-mobile')
  updateMobilePermissions(@Param('id') id: string, @Body() permissions: any) {
    return this.rolesService.updateMobilePermissions(id, permissions);
  }
}
