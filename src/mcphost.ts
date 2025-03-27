import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeBaseManager } from "./knowledgebase.ts";
/**
 * MCP Host - Manages MCP servers
 */
class McpHost {
    private server: McpServer | null;
    private knowledgeBase: KnowledgeBaseManager;
    
    constructor(knowledgeBasePath: string) {
      this.server = null;
      this.knowledgeBase = new KnowledgeBaseManager(knowledgeBasePath);
    }
    
    async initialize(): Promise<void> {
      await this.knowledgeBase.initialize();
    }
    
    async createAndStartServer(name: string): Promise<McpServer> {
      // Create a new MCP server with LLM capabilities
      this.server = new McpServer({
        name,
        version: "1.0.0"
      });
      
      // Add MCP specification resource
      this.server.resource(
        "mcp-spec",
        new ResourceTemplate("mcp-spec://latest", { list: undefined }),
        async (uri) => {
          const specification = await this.knowledgeBase.getSpecification();
          
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
        await this.server.connect(transport);
        console.log(`Server started with stdio transport`);
      } catch (error) {
        console.error(`Error starting server:`, error);
        throw error;
      }
      
      return this.server;
    }
  }

// Export classes for testing and advanced usage
export {
  McpHost,
};