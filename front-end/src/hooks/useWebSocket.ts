import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import websocketService from '../services/websocket.service';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = websocketService.connect();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const executeCommand = (userId: number, containerId: string, command: string) => {
    if (socketRef.current) {
      websocketService.executeCommand(userId, containerId, command);
    }
  };

  const onCommandOutput = (callback: (data: any) => void) => {
    websocketService.onCommandOutput(callback);
  };

  const onCommandError = (callback: (data: any) => void) => {
    websocketService.onCommandError(callback);
  };

  return {
    connected,
    executeCommand,
    onCommandOutput,
    onCommandError,
  };
};