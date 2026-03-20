import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel({
  terminalOpen,
  selectedDevice,
  devices,
  onDeviceChange,
  onCommandExecute,
  commandHistory,
  bootLogs,
}) {
  const terminalRef = useRef(null);
  const termInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [inputBuffer, setInputBuffer] = useState('');

  // Initialize terminal
  useEffect(() => {
    if (!terminalOpen || !terminalRef.current || termInstanceRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#000000',
        foreground: '#00ff00',
        cursor: '#00ff00',
        black: '#000000',
        red: '#ff3333',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#00aaff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
      },
      fontSize: 11,
      fontFamily: 'Courier New, monospace',
      lineHeight: 1.5,
      rows: 20,
      cols: 100,
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    termInstanceRef.current = term;

    // Welcome message
    term.writeln('\x1b[32m=== Network Troubleshooting Terminal ===\x1b[0m');
    term.writeln('\x1b[36mConnected to ' + devices[selectedDevice]?.name + '\x1b[0m');
    term.writeln('Type "help" for available commands\n');
    term.write('$ ');

    // Command input handler
    let currentInput = '';
    term.onData((data) => {
      // Handle Enter key
      if (data === '\r') {
        term.write('\r\n');
        if (currentInput.trim()) {
          // Execute command
          onCommandExecute(selectedDevice, currentInput);
          currentInput = '';
        }
        term.write('$ ');
      }
      // Handle Backspace
      else if (data === '\x7f') {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write('\b \b');
        }
      }
      // Handle Ctrl+C
      else if (data === '\x03') {
        currentInput = '';
        term.write('^C\r\n$ ');
      }
      // Handle printable characters
      else if (data >= ' ' && data <= '~') {
        currentInput += data;
        term.write(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.error('Terminal resize error:', e);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [terminalOpen, selectedDevice, onCommandExecute, devices]);

  // Write command output to terminal
  useEffect(() => {
    const term = termInstanceRef.current;
    if (!term) return;

    const history = commandHistory[selectedDevice] || [];
    if (history.length === 0) return;

    const lastCommand = history[history.length - 1];
    term.writeln(`\x1b[32m${lastCommand.input}\x1b[0m`);
    
    if (lastCommand.success) {
      term.writeln(`\x1b[32m${lastCommand.output}\x1b[0m`);
    } else {
      term.writeln(`\x1b[33m${lastCommand.output}\x1b[0m`);
    }
    
    term.write('$ ');
  }, [commandHistory, selectedDevice]);

  if (!terminalOpen) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '200px',
        backgroundColor: '#0a0e1a',
        borderTop: '2px solid #00ff00',
        fontFamily: 'Courier New, monospace',
        flex: '0 0 auto',
      }}
    >
      {/* DEVICE SELECTOR */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(0, 20, 40, 0.6)',
          borderBottom: '1px solid #00ff00',
          flex: '0 0 auto',
          overflowX: 'auto',
          fontSize: '11px',
        }}
      >
        {['pc1', 'pc2', 'router1', 'router2', 'coreServer', 'appServer', 'dbServer', 'dcSwitch'].map(
          (dev) => (
            <button
              key={dev}
              onClick={() => {
                onDeviceChange(dev);
                const term = termInstanceRef.current;
                if (term) {
                  term.clear();
                  term.writeln('\x1b[36mConnected to ' + devices[dev]?.name + '\x1b[0m');
                  term.write('$ ');
                }
              }}
              style={{
                padding: '4px 10px',
                backgroundColor: selectedDevice === dev ? 'rgba(0, 255, 0, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                border: selectedDevice === dev ? '1px solid #00ff00' : '1px solid transparent',
                borderRadius: '3px',
                color: selectedDevice === dev ? '#00ff00' : '#aaa',
                cursor: 'pointer',
                fontFamily: 'Courier New',
                fontSize: '10px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {devices[dev]?.name || dev}
            </button>
          )
        )}
      </div>

      {/* TERMINAL */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
}
