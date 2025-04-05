/**
 * MCPGuide Main Entry Point
 */
import { startMcpHost } from './core/host';
import { createLogServer } from './services/logger/listener';

// Start the log server for development
const logServer = createLogServer();

// Start the MCP host
startMcpHost().catch(error => {
  console.error('Failed to start MCP host:', error);
  process.exit(1);
}); 