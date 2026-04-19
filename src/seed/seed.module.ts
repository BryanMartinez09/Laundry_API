import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Role } from '../roles/entities/role.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { CatalogItem } from '../forms/entities/catalog-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Company, User, CatalogItem])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
