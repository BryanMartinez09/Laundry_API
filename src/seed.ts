import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { Role } from './roles/entities/role.entity';
import { Company } from './companies/entities/company.entity';
import { User } from './users/entities/user.entity';
import { CatalogItem } from './forms/entities/catalog-item.entity';
import { SectionName } from './forms/entities/form-section.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const rolesRepository: Repository<Role> = app.get('RoleRepository');
  const companiesRepository: Repository<Company> = app.get('CompanyRepository');
  const usersRepository: Repository<User> = app.get('UserRepository');
  const catalogRepository: Repository<CatalogItem> = app.get('CatalogItemRepository');

  console.log('🌱 Seeding roles...');
  const roleNames = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
  const savedRoles: Role[] = [];
  
  for (const name of roleNames) {
    let role = await rolesRepository.findOne({ where: { name } });
    if (!role) {
      role = rolesRepository.create({ name });
      role = await rolesRepository.save(role);
      console.log(`Created role: ${name}`);
    }
    savedRoles.push(role);
  }

  console.log('🌱 Seeding a test company...');
  let company = await companiesRepository.findOne({ where: { name: 'Hotel Grand Bliss' } });
  if (!company) {
    company = companiesRepository.create({
      name: 'Hotel Grand Bliss',
      address: '123 Luxury Ave',
      phone: '555-0101',
    });
    company = await companiesRepository.save(company);
    console.log('Created company: Hotel Grand Bliss');
  }

  console.log('🌱 Seeding a manager user...');
  const managerEmail = 'manager@laundry.com';
  let manager = await usersRepository.findOne({ where: { email: managerEmail } });
  if (!manager) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('manager123', salt);
    const managerRole = savedRoles.find(r => r.name === 'MANAGER');
    
    manager = usersRepository.create({
      name: 'Gerente de Turno',
      email: managerEmail,
      passwordHash,
      initials: 'GT',
      role: managerRole,
    });
    await usersRepository.save(manager);
    console.log('Created manager: manager@laundry.com / manager123');
  }

  console.log('🌱 Seeding an employee user...');
  const employeeEmail = 'employee@laundry.com';
  let employee = await usersRepository.findOne({ where: { email: employeeEmail } });
  if (!employee) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('employee123', salt);
    const employeeRole = savedRoles.find(r => r.name === 'EMPLOYEE');
    
    employee = usersRepository.create({
      name: 'Juan Perez',
      email: employeeEmail,
      passwordHash,
      initials: 'JP',
      role: employeeRole,
    });
    await usersRepository.save(employee);
    console.log('Created employee: employee@laundry.com / employee123');
  }

  console.log('🌱 Seeding laundry item catalog...');
  // Limpiar catálogo previo para asegurar los nuevos nombres en español
  await catalogRepository.clear();
  
  const catalogTemplate = [
    { name: 'Towels', category: SectionName.TOWELS, order: 1 },
    { name: 'Bath Mats', category: SectionName.TOWELS, order: 2 },
    { name: 'Kitchen Cloths', category: SectionName.TOWELS, order: 3 },
    { name: 'Bed Sheets Single', category: SectionName.BED_SHEETS, order: 4 },
    { name: 'Bed Sheets Double', category: SectionName.BED_SHEETS, order: 5 },
    { name: 'Bed Sheets Queen', category: SectionName.BED_SHEETS, order: 6 },
    { name: 'Bed Sheets King', category: SectionName.BED_SHEETS, order: 7 },
    { name: 'Pillow Cases', category: SectionName.COVERS, order: 8 },
    { name: 'Piqués / Bedspreads', category: SectionName.COVERS, order: 9 },
    { name: 'Blankets / Duvets', category: SectionName.COVERS, order: 10 },
  ];

  for (const item of catalogTemplate) {
    let catalogItem = await catalogRepository.findOne({ where: { name: item.name } });
    if (!catalogItem) {
      catalogItem = catalogRepository.create({
        name: item.name,
        category: item.category,
        displayOrder: item.order,
      });
      await catalogRepository.save(catalogItem);
      console.log(`Created catalog item: ${item.name}`);
    }
  }

  console.log('✅ Seeding complete!');
  await app.close();
}

bootstrap();
