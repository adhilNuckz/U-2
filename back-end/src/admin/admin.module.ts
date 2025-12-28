import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Container } from '../containers/entities/container.entity';
import { ContainersModule } from '../containers/containers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Container]),
    ContainersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}