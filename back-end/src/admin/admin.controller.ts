import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('containers/:containerId')
  @HttpCode(HttpStatus.OK)
  async forceDeleteContainer(@Param('containerId') containerId: string) {
    return this.adminService.forceDeleteContainer(containerId);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(parseInt(userId));
  }
}