import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ContainersService } from './containers.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*', // Update in production
  },
})
export class ContainersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private containersService: ContainersService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('execute-command')
  async handleCommand(client: Socket, payload: any) {
    try {
      const { userId, containerId, command } = payload;

      const result = await this.containersService.executeCommand(
        userId,
        containerId,
        command,
      );

      client.emit('command-output', { output: result.output });
    } catch (error) {
      client.emit('command-error', { error: error.message });
    }
  }
}