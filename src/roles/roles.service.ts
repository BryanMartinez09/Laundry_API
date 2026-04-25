import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: string) {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async updatePermissions(id: string, permissions: any) {
    const role = await this.findOne(id);
    role.permissions = permissions;
    const updated = await this.rolesRepository.save(role);
    
    this.eventsGateway.server.emit('reload_permissions');
    
    return updated;
  }

  async updateMobilePermissions(id: string, permissions: any) {
    console.log(`[RolesService] Updating Mobile Permissions for ID: ${id}`);
    console.log(`[RolesService] Permissions Payload:`, JSON.stringify(permissions, null, 2));
    
    const role = await this.findOne(id);
    role.permissions_mobile = permissions;
    const savedRole = await this.rolesRepository.save(role);
    
    console.log(`[RolesService] Saved Role Result:`, JSON.stringify(savedRole, null, 2));
    
    // Emitir evento para que la App refresque permisos automáticamente
    if (this.eventsGateway?.server) {
      this.eventsGateway.server.emit('reload_permissions');
    }
    
    return savedRole;
  }

  getAvailablePermissions() {
    const potentialPaths = [
      path.join(process.cwd(), 'src', 'roles', 'actions.json'),
      path.join(process.cwd(), 'dist', 'roles', 'actions.json'),
      path.join(__dirname, '..', 'roles', 'actions.json'),
      path.join(__dirname, 'actions.json'),
    ];

    console.log('Searching for actions.json in:', potentialPaths);

    for (const filePath of potentialPaths) {
      if (fs.existsSync(filePath)) {
        console.log('Found actions.json at:', filePath);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
      }
    }

    console.error('CRITICAL: actions.json not found in any path');
    return { view_actions: [] };
  }
}
