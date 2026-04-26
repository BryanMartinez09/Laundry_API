import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, Request, Query, HttpCode,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CheckPermission } from '../auth/permission.decorator';
import { FormStatus } from './entities/laundry-form.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @CheckPermission('Forms', 'View')
  @Get('stats')
  getStats() {
    return this.formsService.getStats();
  }

  @CheckPermission('Forms', 'View')
  @Get('catalog')
  getCatalog() {
    return this.formsService.getCatalog();
  }

  @CheckPermission('Forms', 'Add')
  @Post()
  create(@Body() createFormDto: CreateFormDto, @Request() req) {
    return this.formsService.create(createFormDto, req.user.userId);
  }

  @CheckPermission('Forms', 'View')
  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: FormStatus,
  ) {
    return this.formsService.findAll({ companyId, startDate, endDate, employeeId, status });
  }

  @CheckPermission('Forms', 'View')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @CheckPermission('Forms', 'Edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(id, updateFormDto);
  }

  // Endpoint de aprobación — solo MANAGER/ADMIN deben llegar aquí
  @CheckPermission('Forms', 'Approve')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.formsService.approve(id, req.user.userId);
  }

  @CheckPermission('Forms', 'Delete')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }
}
