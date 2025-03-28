#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Test client to demonstrate MCP functionality
 */
async function main() {
  console.log("Starting MCP test client...");

  try {
    // Create a test server to see if things are working
    const server = new McpServer({
      name: "MCPGuide Test Server",
      version: "0.1.0"
    });

    // Add a test resource
    server.resource(
      "test-resource",
      "test://hello-world",
      async (uri) => {
        return {
          contents: [{
            uri: uri.href,
            text: "Hello, world! This is a test MCP resource."
          }]
        };
      }
    );

    // Connect via stdio
    const transport = new StdioServerTransport();
    console.log("Connecting server to stdio transport...");
    await server.connect(transport);
    console.log("Connected!");
    
    // The server is now connected and will respond to messages
    console.log("Server is running. Press Ctrl+C to exit.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});