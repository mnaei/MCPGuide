import "./utils/logger.ts";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeBaseManager } from "./knowledgebase.ts";
import { z } from "zod";

/**
 * MCP Host - Manages MCP servers
 */

let knowledgeBase = new KnowledgeBaseManager("./data");

await knowledgeBase.initialize();

// Create a new MCP server with LLM capabilities
let server = new McpServer({
  name: "mcpguide",
  version: "1.0.0"
});

// Add MCP specification resource
server.resource(
  "mcp-spec",
  new ResourceTemplate("mcp-spec://latest", { 
    list: async (extra) => {
      // This callback returns a list of resources that match this template
      return {
        resources: [{
          uri: "mcp-spec://latest",
          name: "MCP Specification",
          description: "The latest MCP specification document"
        }]
      };
    }
  }),
  async (uri) => {
    const specification = await knowledgeBase.getSpecification();
    
    return {
      contents: [{
        uri: uri.href,
        mimeType: "text/plain",
        text: JSON.stringify(specification, null, 2)
        // text: "MCP Guide Resource"
      }]
    };
  }
);

try {
  // Create and connect a transport for the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
} catch (error) {
  console.error(`Error starting server:`, error);
  throw error;
}