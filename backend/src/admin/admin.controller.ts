import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { Plan, Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('users')
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getUsers(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('users/:id/plan')
  updatePlan(@Param('id') id: string, @Body('plan') plan: string) {
    if (!['FREE', 'PRO'].includes(plan)) {
      throw new BadRequestException('Invalid plan. Must be FREE or PRO.');
    }
    return this.adminService.updateUserPlan(id, plan as Plan);
  }

  @Patch('users/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    if (!['USER', 'ADMIN'].includes(role)) {
      throw new BadRequestException('Invalid role. Must be USER or ADMIN.');
    }
    return this.adminService.updateUserRole(id, role as Role);
  }
}
