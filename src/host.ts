import "./utils/logger.ts";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeBaseManager } from "./knowledgebase.ts";
import { z } from "zod";

/**
 * MCP Host - Manages MCP servers
 */

// Define version enum with Zod
const VersionEnum = z.enum(['2025-03-26', '2024-11-05']);
type VersionType = z.infer<typeof VersionEnum>;

// Export the enum values for easy access
export const VERSION_OPTIONS = VersionEnum.enum;

let knowledgeBase = new KnowledgeBaseManager("./data");

await knowledgeBase.initialize();

// Create a new MCP server with LLM capabilities
let server = new McpServer({
  name: "mcpguide",
  version: "0.1"
});

// Add MCP specification resource
server.resource(
  "mcp-spec",
  new ResourceTemplate("mcp-spec://{version}", { 
    list: async (extra) => {

      return {
        resources: Object.keys(VERSION_OPTIONS).map(v => ({
          uri: `mcp-spec://${v}`,
          name: `MCP Specification (${v})`,
          description: `The MCP specification document for version ${v}`,
          metadata: {
            availableVersions: VERSION_OPTIONS,
            defaultVersion: "2025-03-26"
          }
        }))
      };
    }
  }),
  async (uri, { version }) => {
    // Validate version
    try {
      const validatedVersion = VersionEnum.parse(version || "2025-03-26");
      const specification = await knowledgeBase.getSpecification();
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: "text/plain",
          text: JSON.stringify({
            ...specification,
            version: validatedVersion
          }, null, 2)
        }]
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: "text/plain",
            text: `Invalid version. Available versions are: ${Object.keys(VERSION_OPTIONS).join(', ')}`
          }]
        };
      }
      throw error;
    }
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