/**
 * Custom logger utility that only shows logs in development mode and sends them to the log server
 */

import net from "node:net";

const isDevelopment = process.env.NODE_ENV !== 'production';
let socket: net.Socket | null = null;
let isConnected = false;
let logQueue: Array<{level: string, args: any[]}> = [];

// Connect to the log server
if (isDevelopment) {
  socket = net.connect({ port: 8099 });

  socket.on('connect', () => {
    isConnected = true;
    // Process any queued logs
    while (logQueue.length > 0) {
      const {level, args} = logQueue.shift()!;
      sendToServer(level, ...args);
    }
  });

  socket.on('error', (err) => {
    isConnected = false;
  });

  socket.on('close', () => {
    isConnected = false;
  });
}

/**
 * Send log entry to the server
 */
const sendToServer = (level: string, ...args: any[]) => {
  if (!isConnected) {
    // Queue the log if not connected
    logQueue.push({level, args});
    return;
  }

  if (socket && isConnected) {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString()
    };
    
    socket.write(JSON.stringify(logEntry) + '\n');
  }
};

/**
 * Override console.log to only show logs in development mode
 */
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  if (isDevelopment) {
    sendToServer('info', ...args);
  }
};

/**
 * Override console.error to only show errors in development mode
 */
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (isDevelopment) {
    sendToServer('error', ...args);
  }
};

/**
 * Override console.warn to only show warnings in development mode
 */
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (isDevelopment) {
    sendToServer('warn', ...args);
  }
};

/**
 * Override console.info to only show info in development mode
 */
const originalConsoleInfo = console.info;
console.info = (...args: any[]) => {
  if (isDevelopment) {
    sendToServer('info', ...args);
  }
};

/**
 * Override console.debug to only show debug messages in development mode
 */
const originalConsoleDebug = console.debug;
console.debug = (...args: any[]) => {
  if (isDevelopment) {
    sendToServer('debug', ...args);
  }
};

// Export the original console methods in case they're needed
export const originalConsole = {
  log: originalConsoleLog,
  error: originalConsoleError,
  warn: originalConsoleWarn,
  info: originalConsoleInfo,
  debug: originalConsoleDebug
}; 