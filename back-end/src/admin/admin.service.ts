import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Container, ContainerStatus } from '../containers/entities/container.entity';
import { DockerService } from '../containers/docker/docker.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Container)
    private containersRepository: Repository<Container>,
    private dockerService: DockerService,
  ) {}

  async getSystemHealth() {
    const totalUsers = await this.usersRepository.count();
    const activeContainers = await this.containersRepository.count({
      where: { status: ContainerStatus.RUNNING },
    });

    const containers = await this.containersRepository.find({
      where: { status: ContainerStatus.RUNNING },
      relations: ['user'],
    });

    // Get stats for each container
    const containerStats = await Promise.all(
      containers.map(async (container) => {
        const stats = await this.dockerService.getContainerStats(
          container.containerId,
        );
        
        let cpuPercent = 0;
        let memoryUsage = 0;
        let memoryLimit = 0;

        if (stats) {
          // Calculate CPU percentage
          const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                          stats.precpu_stats.cpu_usage.total_usage;
          const systemDelta = stats.cpu_stats.system_cpu_usage - 
                             stats.precpu_stats.system_cpu_usage;
          const numberCpus = stats.cpu_stats.online_cpus;
          
          if (systemDelta > 0 && cpuDelta > 0) {
            cpuPercent = (cpuDelta / systemDelta) * numberCpus * 100;
          }

          memoryUsage = stats.memory_stats.usage;
          memoryLimit = stats.memory_stats.limit;
        }

        return {
          id: container.id,
          containerName: container.containerName,
          userEmail: container.user.email,
          userId: container.userId,
          createdAt: container.createdAt,
          expiresAt: container.expiresAt,
          cpuPercent: cpuPercent.toFixed(2),
          memoryUsageMB: (memoryUsage / 1024 / 1024).toFixed(2),
          memoryLimitMB: (memoryLimit / 1024 / 1024).toFixed(2),
        };
      }),
    );

    return {
      totalUsers,
      activeContainers,
      containers: containerStats,
    };
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'isAdmin', 'createdAt'],
      relations: ['containers'],
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      activeContainers: user.containers.filter(
        (c) => c.status === ContainerStatus.RUNNING,
      ).length,
      totalContainers: user.containers.length,
    }));
  }

  async forceDeleteContainer(containerId: string) {
    const container = await this.containersRepository.findOne({
      where: { containerId },
    });

    if (!container) {
      throw new Error('Container not found');
    }

    await this.dockerService.stopContainer(containerId);
    container.status = ContainerStatus.DELETED;
    await this.containersRepository.save(container);

    return { message: 'Container force deleted' };
  }

  async deleteUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['containers'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete all user's containers
    for (const container of user.containers) {
      if (container.status === ContainerStatus.RUNNING) {
        await this.dockerService.stopContainer(container.containerId);
      }
    }

    await this.usersRepository.remove(user);
    return { message: 'User deleted' };
  }
}