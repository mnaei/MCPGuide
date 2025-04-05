import "../services/logger/logger";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeBaseManager } from "./knowledgebase";
import { mcpSpecificationSchema } from "../types/mcp-specification";
import { handleMcpSpecificationTool } from "../api/mcp-tools/spec-provider";

/**
 * MCP Host - Manages MCP servers
 */
export async function startMcpHost() {
  let knowledgeBase = new KnowledgeBaseManager("./data");
  await knowledgeBase.initialize();

  // Create a new MCP server with LLM capabilities
  let server = new McpServer({
    name: "mcpguide",
    version: "0.1"
  });

  // Register tools
  server.tool(
    "mcp-specification",
    "Get MCP Specification for a specific version",
    mcpSpecificationSchema,
    async (args, extra) => {
      return handleMcpSpecificationTool(knowledgeBase, args);
    }
  );

  try {
    // Create and connect a transport for the server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    return { server, transport };
  } catch (error) {
    console.error(`Error starting server:`, error);
    throw error;
  }
} 