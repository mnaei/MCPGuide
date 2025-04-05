import net from "node:net";

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Creates and manages a log server that listens on the specified port.
 * @param port The port to listen on (default: 8099)
 * @returns An object with a stop method to close the server
 */
export function createLogServer(port = 8099) {
  const server = net.createServer((socket) => {
    console.log('Client connected');
    
    socket.on('data', (data) => {
      const entries = data.toString().split('\n').filter(Boolean);
      entries.forEach(entry => {
        try {
          const logEntry = JSON.parse(entry);
          const timestamp = new Date(logEntry.timestamp).toLocaleString();
          const levelColor = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            debug: '\x1b[35m'  // Magenta
          }[logEntry.level as LogLevel] || '\x1b[37m'; // White for unknown
          
          const resetColor = '\x1b[0m';
          console.log(`${timestamp} ${levelColor}[${logEntry.level.toUpperCase()}]${resetColor} ${logEntry.message}`);
        } catch (e) {
          console.log('Raw log:', data.toString());
        }
      });
    });
    
    socket.on('close', () => {
      console.log('Client disconnected');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  server.listen(port, () => {
    console.log(`Log server listening on port ${port}`);
  });
  
  return {
    stop: () => {
      server.close();
      console.log(`Log server on port ${port} stopped`);
    }
  };
} 