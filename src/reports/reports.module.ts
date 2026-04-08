import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { LaundryForm } from '../forms/entities/laundry-form.entity';
import { FormItem } from '../forms/entities/form-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LaundryForm, FormItem])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
