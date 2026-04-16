import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, Request, Query, HttpCode,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FormStatus } from './entities/laundry-form.entity';

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get('stats')
  getStats() {
    return this.formsService.getStats();
  }

  @Get('catalog')
  getCatalog() {
    return this.formsService.getCatalog();
  }

  @Post()
  create(@Body() createFormDto: CreateFormDto, @Request() req) {
    return this.formsService.create(createFormDto, req.user.userId);
  }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(id, updateFormDto);
  }

  // Endpoint de aprobación — solo MANAGER/ADMIN deben llegar aquí
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.formsService.approve(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }
}
