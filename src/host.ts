import "mcps-logger/console";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeBaseManager } from "./knowledgebase.ts";
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
  new ResourceTemplate("mcp-spec://latest", { list: undefined }),
  async (uri) => {
    const specification = await knowledgeBase.getSpecification();
    
    if (!specification) {
      return {
        contents: [{
          uri: uri.href,
          text: `Latest specification not found.`
        }]
      };
    }
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(specification, null, 2)
      }]
    };
  }
);

try {
  // Create and connect a transport for the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log(`Server started with stdio transport`);
} catch (error) {
  console.error(`Error starting server:`, error);
  throw error;
}