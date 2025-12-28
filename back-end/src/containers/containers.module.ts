import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainersGateway } from './containers.gateway';
import { ContainersController } from './containers.controller';
import { ContainersService } from './containers.service';
import { DockerService } from './docker/docker.service';
import { CommandFilterService } from './docker/command-filter.service';
import { Container } from './entities/container.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Container])],
  controllers: [ContainersController],
  providers: [
    ContainersService,
    ContainersGateway,
    DockerService,
    CommandFilterService,
  ],
  exports: [ContainersService, DockerService],
})
export class ContainersModule {}