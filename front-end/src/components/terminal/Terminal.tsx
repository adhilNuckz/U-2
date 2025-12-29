import React, { useEffect, useRef } from 'react';
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
  const currentLineRef = useRef<string>('');
  const cursorPositionRef = useRef<number>(0);
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const { user } = useAuth();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: '"Cascadia Code", Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      allowProposedApi: true,
      rows: 30,
      cols: 100,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Welcome message
    xterm.writeln('\x1b[1;32m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    xterm.writeln('\x1b[1;32m║      Welcome to /U-2/                                      ║\x1b[0m');
    xterm.writeln('\x1b[1;32m╚════════════════════════════════════════════════════════════╝\x1b[0m');
    xterm.writeln('');
    xterm.writeln('\x1b[33mType your commands directly. Press ↑/↓ for history.\x1b[0m');
    xterm.writeln('');
    
    // Initial prompt
    writePrompt(xterm);

    // Connect WebSocket
    websocketService.connect();

    // Handle command output from server
    websocketService.onCommandOutput((data) => {
      const output = (data.output || '').toString();

      // Debug: show raw output with visible control characters to the browser console
      const visible = output.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
      const containsCR = output.includes('\r');
      const containsLF = output.includes('\n');
      const tabCount = (output.match(/\t/g) || []).length;
      console.log('[Terminal] raw output sample:', visible.slice(0, 1000));
      console.log(`[Terminal] meta: len=${output.length}, tabs=${tabCount}, hasCR=${containsCR}, hasLF=${containsLF}`);
      try {
        const codes = output.slice(0, 200).split('').map((c: string) => c.charCodeAt(0));
        console.log('[Terminal] char codes:', codes);
      } catch (e) {
        // ignore
      }

      // Convert lone carriage returns (\r) into proper newlines so progress
      // style outputs don't overwrite previewed lines.
      const sanitized = output.replace(/\r(?!\n)/g, '\r\n');

      // Replace tabs with two spaces to avoid the wide tab stops causing
      // diagonal wrapping/indentation in narrow containers.
      const normalized = sanitized.replace(/\t/g, '  ');

      // Split into lines and write each line to xterm to avoid partial control sequences
      // or cursor positioning issues when writing huge buffers in one go.
      const lines = normalized.split(/\r?\n/);

      // Debug: show first few lines with visible markers
      console.log('[Terminal] first lines:', lines.slice(0, 10).map((l: any) => JSON.stringify(l)));

      // Write each line using writeln (adds newline) except when the last element is
      // an empty string because the original output ended with a newline.
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === lines.length - 1 && line === '') {
          // The output ended with a newline; just write a newline to preserve it
          xterm.write('\r\n');
        } else {
          xterm.writeln(line);
        }
      }

      currentLineRef.current = '';
      cursorPositionRef.current = 0;
      writePrompt(xterm);
    });

    // Handle command errors
    websocketService.onCommandError((data) => {
      xterm.write('\r\n\x1b[31m✗ Error: ' + data.error + '\x1b[0m\r\n');
      currentLineRef.current = '';
      cursorPositionRef.current = 0;
      writePrompt(xterm);
    });

    // Handle keyboard input
    xterm.onData((data) => {
      handleTerminalInput(xterm, data);
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
  }, [containerId, user]);

  const writePrompt = (xterm: XTerm) => {
    xterm.write('\r\n\x1b[1;36mubuntu@saas\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
  };

  const handleTerminalInput = (xterm: XTerm, data: string) => {
    const code = data.charCodeAt(0);

    // Handle Enter key (execute command)
    if (code === 13) {
      const command = currentLineRef.current.trim();
      
      if (command) {
        // Add to history
        commandHistoryRef.current.push(command);
        historyIndexRef.current = commandHistoryRef.current.length;
        
        // Execute command via WebSocket
        if (user) {
          websocketService.executeCommand(user.id, containerId, command);
        }
      } else {
        // Empty command, just show new prompt
        currentLineRef.current = '';
        cursorPositionRef.current = 0;
        writePrompt(xterm);
      }
      return;
    }

    // Handle Backspace
    if (code === 127) {
      if (cursorPositionRef.current > 0) {
        const before = currentLineRef.current.substring(0, cursorPositionRef.current - 1);
        const after = currentLineRef.current.substring(cursorPositionRef.current);
        currentLineRef.current = before + after;
        cursorPositionRef.current--;
        
        // Clear line and rewrite
        xterm.write('\b \b');
        if (after) {
          xterm.write(after + ' \b'.repeat(after.length + 1));
        }
      }
      return;
    }

    // Handle Arrow Up (previous command in history)
    if (data === '\x1b[A') {
      if (historyIndexRef.current > 0) {
        historyIndexRef.current--;
        const historicalCommand = commandHistoryRef.current[historyIndexRef.current];
        
        // Clear current line
        xterm.write('\r\x1b[K');
        xterm.write('\x1b[1;36mubuntu@saas\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
        xterm.write(historicalCommand);
        
        currentLineRef.current = historicalCommand;
        cursorPositionRef.current = historicalCommand.length;
      }
      return;
    }

    // Handle Arrow Down (next command in history)
    if (data === '\x1b[B') {
      if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
        historyIndexRef.current++;
        const historicalCommand = commandHistoryRef.current[historyIndexRef.current];
        
        // Clear current line
        xterm.write('\r\x1b[K');
        xterm.write('\x1b[1;36mubuntu@saas\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
        xterm.write(historicalCommand);
        
        currentLineRef.current = historicalCommand;
        cursorPositionRef.current = historicalCommand.length;
      } else if (historyIndexRef.current === commandHistoryRef.current.length - 1) {
        historyIndexRef.current = commandHistoryRef.current.length;
        
        // Clear current line
        xterm.write('\r\x1b[K');
        xterm.write('\x1b[1;36mubuntu@saas\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
        
        currentLineRef.current = '';
        cursorPositionRef.current = 0;
      }
      return;
    }

    // Handle Arrow Left
    if (data === '\x1b[D') {
      if (cursorPositionRef.current > 0) {
        cursorPositionRef.current--;
        xterm.write(data);
      }
      return;
    }

    // Handle Arrow Right
    if (data === '\x1b[C') {
      if (cursorPositionRef.current < currentLineRef.current.length) {
        cursorPositionRef.current++;
        xterm.write(data);
      }
      return;
    }

    // Handle Ctrl+C (cancel current command)
    if (data === '\x03') {
      xterm.write('^C');
      currentLineRef.current = '';
      cursorPositionRef.current = 0;
      historyIndexRef.current = commandHistoryRef.current.length;
      writePrompt(xterm);
      return;
    }

    // Handle Ctrl+L (clear screen)
    if (data === '\x0c') {
      xterm.clear();
      currentLineRef.current = '';
      cursorPositionRef.current = 0;
      writePrompt(xterm);
      return;
    }

    // Handle Tab (could add autocomplete later)
    if (data === '\t') {
      // For now, just ignore
      return;
    }

    // Handle printable characters
    if (code >= 32 && code < 127) {
      const before = currentLineRef.current.substring(0, cursorPositionRef.current);
      const after = currentLineRef.current.substring(cursorPositionRef.current);
      currentLineRef.current = before + data + after;
      cursorPositionRef.current++;
      
      xterm.write(data);
      if (after) {
        xterm.write(after + '\b'.repeat(after.length));
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    padding: '16px',
  };

  const terminalStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '500px',
  };

  return (
    <div style={containerStyle}>
      <div ref={terminalRef} style={terminalStyle} />
    </div>
  );
};

export default Terminal;