import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CheckPermission } from '../auth/permission.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @CheckPermission('Companies', 'Add')
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @CheckPermission('Companies', 'View')
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @CheckPermission('Companies', 'View')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @CheckPermission('Companies', 'Edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @CheckPermission('Companies', 'Delete')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
