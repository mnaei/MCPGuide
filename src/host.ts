import "./utils/logger.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeBaseManager } from "./knowledgebase.ts";
import { LATEST_PROTOCOL_VERSION } from "./config/repositories.ts";
import { 
  McpSpecificationArgs, 
  mcpSpecificationSchema, 
  VersionEnum, 
  VERSION_OPTIONS 
} from "./types/specification.ts";

/**
 * MCP Host - Manages MCP servers
 */

let knowledgeBase = new KnowledgeBaseManager("./data");

await knowledgeBase.initialize();

// Create a new MCP server with LLM capabilities
let server = new McpServer({
  name: "mcpguide",
  version: "0.1"
});

server.tool(
  "mcp-specification",
  "Get MCP Specification for a specific version",
  mcpSpecificationSchema,
  async (args: McpSpecificationArgs, extra) => {
    // Validate version
    const parseResult = VersionEnum.safeParse(args.version || LATEST_PROTOCOL_VERSION);
    if (!parseResult.success) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid version. Available versions are: ${Object.keys(VERSION_OPTIONS).join(', ')}`
          }
        ],
        isError: true
      };
    }
    const validatedVersion = parseResult.data;
    const specification = await knowledgeBase.getSpecification(validatedVersion);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ...specification,
            version: validatedVersion
          }, null, 2)
        }
      ]
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