import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { CheckPermission } from '../auth/permission.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @CheckPermission('Users', 'Agregar')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUserDto.password, salt);
    
    return this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash: hash,
      initials: createUserDto.initials,
      role: { id: createUserDto.roleId } as any
    });
  }

  @UseGuards(JwtAuthGuard)
  @CheckPermission('Users', 'Mostrar')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updateData: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      initials: updateUserDto.initials,
    };
    
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    if (updateUserDto.roleId) {
      updateData.role = { id: updateUserDto.roleId };
    }
    
    return this.usersService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
