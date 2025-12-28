import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContainersService } from './containers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('containers')
@UseGuards(JwtAuthGuard)
export class ContainersController {
  constructor(private containersService: ContainersService) {}

  @Post()
  async createContainer(@Request() req) {
    return this.containersService.createContainer(req.user.id);
  }

  @Get()
  async getUserContainer(@Request() req) {
    return this.containersService.getUserContainer(req.user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteContainer(@Request() req) {
    return this.containersService.deleteContainer(req.user.id);
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  async executeCommand(@Request() req, @Body() body: any) {
    return this.containersService.executeCommand(
      req.user.id,
      body.containerId,
      body.command,
    );
  }
}