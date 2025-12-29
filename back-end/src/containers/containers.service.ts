import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Container, ContainerStatus } from './entities/container.entity';
import { DockerService } from './docker/docker.service';
import { CommandFilterService } from './docker/command-filter.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(Container)
    private containersRepository: Repository<Container>,
    private dockerService: DockerService,
    private commandFilterService: CommandFilterService,
    private configService: ConfigService,
  ) {}

  async createContainer(userId: number) {
    // Check if user already has an active container
    const existingContainer = await this.containersRepository.findOne({
      where: {
        userId,
        status: ContainerStatus.RUNNING,
      },
    });

    if (existingContainer) {
      throw new BadRequestException('You already have an active container');
    }

    // Create Docker container
    const { containerId, containerName } =
      await this.dockerService.createContainer(userId);

    // Calculate expiration time (30 minutes)
    const lifetime = 900 ;
    const expiresAt = new Date(Date.now() + (lifetime * 1000)); // Convert seconds to milliseconds
    if (lifetime === undefined) {
  throw new Error('CONTAINER_MAX_LIFETIME is not defined');
}
    expiresAt.setSeconds(expiresAt.getSeconds() + lifetime);

    // Save to database
    const container = this.containersRepository.create({
      userId,
      containerId,
      containerName,
      expiresAt,
      status: ContainerStatus.RUNNING,
    });

    await this.containersRepository.save(container);

    return {
      id: container.id,
      containerId: container.containerId,
      expiresAt: container.expiresAt,
    };
  }

  async executeCommand(userId: number, containerId: string, command: string) {
    // Verify container belongs to user
    const container = await this.containersRepository.findOne({
      where: {
        containerId,
        userId,
        status: ContainerStatus.RUNNING,
      },
    });

    if (!container) {
      throw new NotFoundException('Container not found or not accessible');
    }

    // Filter dangerous commands
    const safeCommand = this.commandFilterService.filterCommand(command);

    // Execute command
    const output = await this.dockerService.executeCommand(
      containerId,
      safeCommand,
    );

    return { output };
  }

  async getUserContainer(userId: number) {
    return this.containersRepository.findOne({
      where: {
        userId,
        status: ContainerStatus.RUNNING,
      },
    });
  }

  async deleteContainer(userId: number) {
    const container = await this.getUserContainer(userId);

    if (!container) {
      throw new NotFoundException('No active container found');
    }

    // Stop Docker container
    await this.dockerService.stopContainer(container.containerId);

    // Update database
    container.status = ContainerStatus.DELETED;
    await this.containersRepository.save(container);

    return { message: 'Container deleted successfully' };
  }
}