import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(import.meta.env.VITE_WS_URL, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  executeCommand(userId: number, containerId: string, command: string) {
    if (this.socket) {
      this.socket.emit('execute-command', { userId, containerId, command });
    }
  }

  onCommandOutput(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('command-output', callback);
    }
  }

  onCommandError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('command-error', callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new WebSocketService();