import { ConfigService } from '@nestjs/config';

export interface DockerConfig {
  host: string;
  port: number;
  containerConfig: {
    maxLifetime: number;
    memoryLimit: string;
    cpuLimit: number;
    maxContainersPerUser: number;
  };
}

export const getDockerConfig = (
  configService: ConfigService,
): DockerConfig => {
  const dockerHost = configService.get<string>('DOCKER_HOST', 'http://localhost:2375');
  const url = new URL(dockerHost);

  return {
    host: url.hostname,
    port: parseInt(url.port) || 2375,
    containerConfig: {
      maxLifetime: configService.get<number>('CONTAINER_MAX_LIFETIME', 1800),
      memoryLimit: configService.get<string>('CONTAINER_MEMORY_LIMIT', '150m'),
      cpuLimit: configService.get<number>('CONTAINER_CPU_LIMIT', 0.3),
      maxContainersPerUser: configService.get<number>('MAX_CONTAINERS_PER_USER', 1),
    },
  };
};