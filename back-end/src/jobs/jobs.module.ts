import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { Container } from '../containers/entities/container.entity';
import { ContainersModule } from '../containers/containers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Container]), ContainersModule],
  providers: [CleanupService],
})
export class JobsModule {}