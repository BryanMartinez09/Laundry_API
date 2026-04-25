import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { CatalogItem } from '../forms/entities/catalog-item.entity';
import { SectionName } from '../forms/entities/form-section.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(CatalogItem)
    private readonly catalogRepo: Repository<CatalogItem>,
  ) {}

  async onModuleInit() {
    this.logger.log('🌱 Starting automatic database seeding...');
    
    try {
      const roles = await this.seedRoles();
      await this.seedCompanies();
      await this.seedUsers(roles);
      await this.seedCatalog();
      
      this.logger.log('✅ Seeding complete!');
    } catch (error) {
      this.logger.error('❌ Seeding failed:', error.stack);
    }
  }
  private async seedRoles(): Promise<Role[]> {
    const roleNames = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    const savedRoles: Role[] = [];

    const defaultPermissions = {
      ADMIN: [
        { view: 'Forms', actions: ['Mostrar', 'Agregar', 'Editar', 'Eliminar', 'Aprobar'] },
        { view: 'Reports', actions: ['Mostrar', 'Exportar', 'Ver Gráficos'] },
        { view: 'Users', actions: ['Mostrar', 'Agregar', 'Editar', 'Eliminar'] },
        { view: 'Companies', actions: ['Mostrar', 'Agregar', 'Editar', 'Eliminar'] },
        { view: 'Catalog', actions: ['Mostrar', 'Editar'] },
        { view: 'Roles', actions: ['Mostrar', 'Agregar', 'Editar', 'Eliminar'] },
        { view: 'Profile', actions: ['Mostrar', 'Editar'] }
      ],
      MANAGER: [
        { view: 'Forms', actions: ['Mostrar', 'Agregar', 'Editar', 'Aprobar'] },
        { view: 'Reports', actions: ['Mostrar', 'Exportar', 'Ver Gráficos'] },
        { view: 'Users', actions: ['Mostrar', 'Agregar'] },
        { view: 'Companies', actions: ['Mostrar'] },
        { view: 'Profile', actions: ['Mostrar', 'Editar'] }
      ],
      EMPLOYEE: [
        { view: 'Forms', actions: ['Mostrar', 'Agregar', 'Editar'] },
        { view: 'Reports', actions: ['Mostrar'] },
        { view: 'Profile', actions: ['Mostrar', 'Editar'] }
      ]
    };

    const mobilePermissions = {
      ADMIN: [
        { view: 'Forms', actions: ['View', 'Add', 'Edit', 'Delete', 'Approve'] },
        { view: 'Reports', actions: ['View', 'Export', 'Graphs'] },
        { view: 'Profile', actions: ['View', 'Edit'] }
      ],
      MANAGER: [
        { view: 'Forms', actions: ['View', 'Add', 'Edit', 'Approve'] },
        { view: 'Reports', actions: ['View', 'Export', 'Graphs'] },
        { view: 'Profile', actions: ['View', 'Edit'] }
      ],
      EMPLOYEE: [
        { view: 'Forms', actions: ['View', 'Add', 'Edit'] },
        { view: 'Reports', actions: ['View'] },
        { view: 'Profile', actions: ['View', 'Edit'] }
      ]
    };

    for (const name of roleNames) {
      let role = await this.rolesRepo.findOne({ where: { name } });
      if (!role) {
        role = this.rolesRepo.create({ 
          name,
          permissions: defaultPermissions[name] || [],
          permissions_mobile: mobilePermissions[name] || []
        });
        role = await this.rolesRepo.save(role);
        this.logger.debug(`Created role: ${name} with default permissions`);
      } else if (!role.permissions_mobile || role.permissions_mobile.length === 0) {
        // If role exists but has no mobile permissions, update it
        role.permissions = defaultPermissions[name] || [];
        role.permissions_mobile = mobilePermissions[name] || [];
        await this.rolesRepo.save(role);
        this.logger.debug(`Updated role ${name} with default mobile permissions`);
      }
      savedRoles.push(role);
    }
    return savedRoles;
  }

  private async seedCompanies() {
    let company = await this.companiesRepo.findOne({ where: { name: 'Hotel Grand Bliss' } });
    if (!company) {
      company = this.companiesRepo.create({
        name: 'Hotel Grand Bliss',
        address: '123 Luxury Ave',
        phone: '555-0101',
      });
      await this.companiesRepo.save(company);
      this.logger.debug('Created default company');
    }
  }

  private async seedUsers(roles: Role[]) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    const adminEmail = 'admin@laundry.com';
    let admin = await this.usersRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const adminRole = roles.find(r => r.name === 'ADMIN');
      admin = this.usersRepo.create({
        name: 'Super Admin',
        email: adminEmail,
        passwordHash,
        initials: 'AD',
        role: adminRole,
      });
      await this.usersRepo.save(admin);
      this.logger.debug('Created admin user');
    }

    // Seed test manager
    const managerEmail = 'manager@laundry.com';
    let manager = await this.usersRepo.findOne({ where: { email: managerEmail } });
    if (!manager) {
      const managerRole = roles.find(r => r.name === 'MANAGER');
      const managerHash = await bcrypt.hash('manager123', salt);
      manager = this.usersRepo.create({
        name: 'Gerente de Turno',
        email: managerEmail,
        passwordHash: managerHash,
        initials: 'GT',
        role: managerRole,
      });
      await this.usersRepo.save(manager);
      this.logger.debug('Created manager user');
    }

    // Seed test employee
    const empEmail = 'employee@laundry.com';
    let employee = await this.usersRepo.findOne({ where: { email: empEmail } });
    if (!employee) {
      const employeeRole = roles.find(r => r.name === 'EMPLOYEE');
      const empHash = await bcrypt.hash('employee123', salt);
      employee = this.usersRepo.create({
        name: 'Juan Perez',
        email: empEmail,
        passwordHash: empHash,
        initials: 'JP',
        role: employeeRole,
      });
      await this.usersRepo.save(employee);
    }
  }

  private async seedCatalog() {
    // Clear previous catalog to ensure sizes are correctly mapped
    const count = await this.catalogRepo.count();
    // Only refresh if empty or if we want to force update (usually we only seed if empty)
    if (count > 0) return;

    const catalogTemplate = [
      { name: 'Bath Sheets', category: SectionName.TOWELS, order: 1 },
      { name: 'Bath Towels', category: SectionName.TOWELS, order: 2 },
      { name: 'Hand Towels', category: SectionName.TOWELS, order: 3 },
      { name: 'Face Cloths', category: SectionName.TOWELS, order: 4 },
      { name: 'Washcloths', category: SectionName.TOWELS, order: 5 },
      { name: 'Kitchen Rags', category: SectionName.TOWELS, order: 6 },
      { name: 'Kitchen Linens', category: SectionName.TOWELS, order: 7 },
      { name: 'Bath Mats', category: SectionName.TOWELS, order: 8 },

      { name: 'Flat Sheet - Simple', category: SectionName.BED_SHEETS, order: 9, size: 'SIMPLE' },
      { name: 'Flat Sheet - Double', category: SectionName.BED_SHEETS, order: 10, size: 'DOUBLE' },
      { name: 'Flat Sheet - Queen', category: SectionName.BED_SHEETS, order: 11, size: 'QUEEN' },
      { name: 'Flat Sheet - King', category: SectionName.BED_SHEETS, order: 12, size: 'KING' },
      { name: 'Fitted Sheet - Simple', category: SectionName.BED_SHEETS, order: 13, size: 'SIMPLE' },
      { name: 'Fitted Sheet - Double', category: SectionName.BED_SHEETS, order: 14, size: 'DOUBLE' },
      { name: 'Fitted Sheet - Queen', category: SectionName.BED_SHEETS, order: 15, size: 'QUEEN' },
      { name: 'Fitted Sheet - King', category: SectionName.BED_SHEETS, order: 16, size: 'KING' },

      { name: 'Pillowcases - Queen', category: SectionName.COVERS, order: 17, size: 'QUEEN' },
      { name: 'Pillowcases - King', category: SectionName.COVERS, order: 18, size: 'KING' },
      { name: 'Mattress Covers', category: SectionName.COVERS, order: 19 },
      { name: 'Duvet Covers', category: SectionName.COVERS, order: 20 },
      { name: 'Duvets', category: SectionName.COVERS, order: 21 },
      { name: 'Blankets', category: SectionName.COVERS, order: 22 },
      { name: 'Bed Covers', category: SectionName.COVERS, order: 23 },
      { name: 'Decorative Pillowcases', category: SectionName.COVERS, order: 24 },
      { name: 'Bathrobes', category: SectionName.COVERS, order: 25 },
      { name: 'Pillow Protectors', category: SectionName.COVERS, order: 26 },
      { name: 'Tagging', category: SectionName.COVERS, order: 27 },
      { name: 'Other Items', category: SectionName.COVERS, order: 28 },
    ];

    for (const item of catalogTemplate) {
      const catalogItem = this.catalogRepo.create({
        name: item.name,
        category: item.category,
        displayOrder: item.order,
        size: item.size,
      });
      await this.catalogRepo.save(catalogItem);
    }
  }
}
