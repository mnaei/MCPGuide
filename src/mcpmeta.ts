#!/usr/bin/env node

import { program } from 'commander';
import { McpHost } from './mcphost.ts';

program
  .name('mcpmeta')
  .description('MCP implementation for LLMs')
  .version('1.0.0');

program
  .command('start')
  .description('Start an MCP server')
  .option('-n, --name <name>', 'Server name', 'mcpmeta-server')
  .option('-p, --path <path>', 'Knowledge base path', './data')
  .action(async (options) => {
    try {
      const host = new McpHost(options.path);
      await host.initialize();
      
      console.log(`Starting server ${options.name}...`);
      await host.createAndStartServer(options.name);
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('Sync latest specifications')
  .option('-p, --path <path>', 'Knowledge base path', './data')
  .action(async (options) => {
    try {
      const host = new McpHost(options.path);
      await host.initialize();
      console.log('Sync complete.');
    } catch (error) {
      console.error('Error syncing specifications:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}