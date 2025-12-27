import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import websocketService from '../../services/websocket.service';
import { useAuth } from '../../context/AuthContext';

interface TerminalProps {
  containerId: string;
}

const Terminal: React.FC<TerminalProps> = ({ containerId }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [command, setCommand] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Welcome message
    xterm.writeln('Welcome to Ubuntu SaaS Terminal');
    xterm.writeln('Type your commands and press Enter');
    xterm.writeln('-----------------------------------');
    xterm.write('\r\n$ ');

    // Connect WebSocket
    websocketService.connect();

    // Handle command output
    websocketService.onCommandOutput((data) => {
      xterm.write('\r\n' + data.output);
      xterm.write('\r\n$ ');
    });

    websocketService.onCommandError((data) => {
      xterm.write('\r\n\x1b[31mError: ' + data.error + '\x1b[0m');
      xterm.write('\r\n$ ');
    });

    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      websocketService.disconnect();
      xterm.dispose();
    };
  }, []);

  const executeCommand = (cmd: string) => {
    if (!cmd.trim() || !user) return;

    xtermRef.current?.write(cmd);
    websocketService.executeCommand(user.id, containerId, cmd);
    setCommand('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={terminalRef}
        className="flex-1 p-4 bg-gray-900 rounded-lg"
        style={{ height: '500px' }}
      />
      
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type command here and press Enter"
          className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => executeCommand(command)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
        >
          Execute
        </button>
      </div>
    </div>
  );
};

export default Terminal;