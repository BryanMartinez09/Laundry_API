import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaundryForm } from './entities/laundry-form.entity';
import { FormSection } from './entities/form-section.entity';
import { FormItem } from './entities/form-item.entity';
import { CatalogItem } from './entities/catalog-item.entity';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LaundryForm, FormSection, FormItem, CatalogItem])],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}
