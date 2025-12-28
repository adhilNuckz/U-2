import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Container, ContainerStatus } from '../containers/entities/container.entity';
import { DockerService } from '../containers/docker/docker.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(Container)
    private containersRepository: Repository<Container>,
    private dockerService: DockerService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredContainers() {
    this.logger.log('Running container cleanup job...');

    const expiredContainers = await this.containersRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
        status: ContainerStatus.RUNNING,
      },
    });

    for (const container of expiredContainers) {
      try {
        await this.dockerService.stopContainer(container.containerId);
        container.status = ContainerStatus.DELETED;
        await this.containersRepository.save(container);
        
        this.logger.log(`Cleaned up container: ${container.containerName}`);
      } catch (error) {
        this.logger.error(`Failed to cleanup container ${container.id}:`, error);
      }
    }
  }
}