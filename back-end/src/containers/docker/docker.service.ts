import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Docker = require('dockerode');

@Injectable()
export class DockerService {
  private docker: Docker;

constructor(private configService: ConfigService) {
  const dockerHost = this.configService.get('DOCKER_HOST');
  
  // Parse the Docker host URL
  const url = new URL(dockerHost);
  
  // Connect to remote Docker host (Server 2)
  this.docker = new Docker({
    host: url.hostname,
    port: parseInt(url.port) || 2375,
  });
}

  async createContainer(userId: number): Promise<any> {
    try {
      const containerName = `ubuntu-${userId}-${Date.now()}`;
      
      const container = await this.docker.createContainer({
        Image: 'ubuntu:22.04',
        name: containerName,
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        HostConfig: {
          Memory: 150 * 1024 * 1024, // 150MB
          MemorySwap: 150 * 1024 * 1024, // No swap
          NanoCpus: 300000000, // 0.3 CPU
          PidsLimit: 100,
          Ulimits: [
            {
              Name: 'nofile',
              Soft: 64,
              Hard: 64,
            },
          ],
          NetworkMode: 'none', // No network access
          SecurityOpt: ['no-new-privileges'],
          CapDrop: ['ALL'],
          ReadonlyRootfs: false,
        },
      });

      await container.start();

      return {
        containerId: container.id,
        containerName: containerName,
      };
    } catch (error) {
      console.error('Docker container creation error:', error);
      throw new InternalServerErrorException('Failed to create container');
    }
  }

  async executeCommand(containerId: string, command: string): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);

      const exec = await container.exec({
        Cmd: ['/bin/bash', '-c', command],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ hijack: true, stdin: false });

      // The stream returned by Docker exec in non-TTY mode uses a multiplexed
      // binary format: an 8-byte header (1 byte stream type, 3 bytes zero, 4
      // bytes payload length big-endian) followed by the payload. If we don't
      // demultiplex, the terminal receives those header bytes which appear as
      // control characters and cause the diagonal/collapsed layout you saw.
      return new Promise((resolve, reject) => {
        let buffers: Buffer[] = [];
        let output = '';

        stream.on('data', (chunk: any) => {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          buffers.push(buf);

          let combined = Buffer.concat(buffers);

          // Parse and strip multiplexed headers if present
          while (combined.length > 0) {
            // If there is at least an 8-byte header and the first byte looks
            // like a Docker multiplex stream frame (0=stdin,1=stdout,2=stderr)
            if (combined.length >= 8 && (combined[0] === 0 || combined[0] === 1 || combined[0] === 2)) {
              const payloadLen = combined.readUInt32BE(4);
              if (combined.length >= 8 + payloadLen) {
                const payload = combined.slice(8, 8 + payloadLen);
                output += payload.toString('utf8');
                combined = combined.slice(8 + payloadLen);
              } else {
                // Wait for more data
                break;
              }
            } else {
              // Not a multiplexed frame: append everything and clear buffer
              output += combined.toString('utf8');
              combined = Buffer.alloc(0);
            }
          }

          buffers = combined.length ? [combined] : [];
        });

        stream.on('end', () => {
          resolve(output);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      throw new InternalServerErrorException('Command execution failed');
    }
  }

  async stopContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      await container.remove();
    } catch (error) {
      console.error('Error stopping container:', error);
    }
  }

  async getContainerStats(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });
      return stats;
    } catch (error) {
      return null;
    }
  }
}