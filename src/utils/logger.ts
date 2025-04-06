/**
 * Custom logger utility that only shows logs in development mode and writes them to a log file
 */

import fs from "node:fs";
import path from "node:path";

const isDevelopment = process.env.NODE_ENV !== 'production';
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// Create logs directory if it doesn't exist
if (isDevelopment) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
}

/**
 * Write log entry to file
 */
const writeToFile = (level: string, ...args: any[]) => {
  if (!isDevelopment) return;

  try {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString()
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (err) {
    // Use original console methods to avoid infinite loops
    originalConsole.error('Failed to write to log file:', err);
  }
};

/**
 * Override console.log to only show logs in development mode
 */
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  if (isDevelopment) {
    writeToFile('info', ...args);
  }
};

/**
 * Override console.error to only show errors in development mode
 */
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (isDevelopment) {
    writeToFile('error', ...args);
  }
};

/**
 * Override console.warn to only show warnings in development mode
 */
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (isDevelopment) {
    writeToFile('warn', ...args);
  }
};

/**
 * Override console.info to only show info in development mode
 */
const originalConsoleInfo = console.info;
console.info = (...args: any[]) => {
  if (isDevelopment) {
    writeToFile('info', ...args);
  }
};

/**
 * Override console.debug to only show debug messages in development mode
 */
const originalConsoleDebug = console.debug;
console.debug = (...args: any[]) => {
  if (isDevelopment) {
    writeToFile('debug', ...args);
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

// Test file to verify logging functionality

console.log('This is a test log message');
console.info('This is a test info message');
console.warn('This is a test warning message');
console.error('This is a test error message');
console.debug('This is a test debug message');

// Test with objects
console.log('Testing with objects:', { 
  name: 'test',
  value: 123,
  nested: { foo: 'bar' }
});

// Test with multiple arguments
console.info('Multiple arguments:', 'arg1', 'arg2', { obj: 'test' });

// Test with error objects
console.error('Testing error object:', new Error('Test error')); 