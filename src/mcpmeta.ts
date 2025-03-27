import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { REPOSITORIES, LATEST_PROTOCOL_VERSION, RepositoryInfo } from './config/repositories.ts';
import { fetchWithRetry, validateJson, ensureParentDirectoryExists } from './utils/fetch-utils.ts';

/**
 * This implementation provides LLMs with access to MCP specifications,
 * documentation, and implementations to develop MCP-based solutions.
 */

/**
 * Knowledge Base Manager - Manages access to MCP specifications and implementations
 */
class KnowledgeBaseManager {
  private basePath: string;
  private cache: Map<string, any>;
  private syncResults: Map<string, boolean>;
  
  constructor(basePath: string) {
    // Resolve relative paths to absolute paths
    this.basePath = path.isAbsolute(basePath) ? basePath : path.resolve(process.cwd(), basePath);
    this.cache = new Map();
    this.syncResults = new Map();
  }
  
  async initialize(): Promise<void> {
    await this.ensureDirectories();
    await this.syncLatestSpecifications();
  }
  
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      path.join(this.basePath, 'specifications'),
      path.join(this.basePath, 'implementations'),
      path.join(this.basePath, 'implementations/typescript-sdk'),
      path.join(this.basePath, 'implementations/python-sdk'),
      path.join(this.basePath, 'examples'),
      path.join(this.basePath, 'documentation')
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
  }
  
  async syncLatestSpecifications(): Promise<{success: boolean, failedFiles: string[]}> {
    console.log('Syncing latest MCP specifications...');
    
    // Clear previous sync results
    this.syncResults.clear();
    const failedFiles: string[] = [];
    
    // Download files in parallel with proper validation
    const downloadPromises = REPOSITORIES.flatMap(repo => 
      repo.files.map(async (file) => {
        const url = `${repo.url}${file.remotePath}`;
        const localPath = path.join(this.basePath, file.localPath);
        
        try {
          await ensureParentDirectoryExists(localPath);
          
          // Fetch file with retry logic
          const result = await fetchWithRetry(url);
          
          if (!result.success || !result.data) {
            console.error(`Failed to download ${url}: ${result.message}`);
            this.syncResults.set(localPath, false);
            if (file.required) {
              failedFiles.push(file.localPath);
            }
            return;
          }
          
          // Validate JSON files
          if (file.localPath.endsWith('.json')) {
            const validation = await validateJson(result.data);
            if (!validation.valid) {
              console.error(`Invalid JSON received from ${url}: ${validation.error}`);
              this.syncResults.set(localPath, false);
              if (file.required) {
                failedFiles.push(file.localPath);
              }
              return;
            }
          }
          
          // Save file
          await fs.writeFile(localPath, result.data);
          this.syncResults.set(localPath, true);
          console.log(`Successfully downloaded ${file.localPath}`);
          
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
          this.syncResults.set(localPath, false);
          if (file.required) {
            failedFiles.push(file.localPath);
          }
        }
      })
    );
    
    // Wait for all downloads to complete
    await Promise.all(downloadPromises);
    
    // Always write version information
    try {
      await fs.writeFile(
        path.join(this.basePath, 'specifications', 'version.json'),
        JSON.stringify({ 
          version: LATEST_PROTOCOL_VERSION, 
          lastUpdated: new Date().toISOString(),
          syncResults: Object.fromEntries(this.syncResults)
        })
      );
    } catch (error) {
      console.error('Failed to write version information:', error);
      failedFiles.push('specifications/version.json');
    }
    
    // Check if all required files were successfully downloaded
    const success = failedFiles.length === 0;
    
    console.log(`Specifications sync ${success ? 'completed successfully' : 'completed with errors'}`);
    if (!success) {
      console.error(`Failed to download required files: ${failedFiles.join(', ')}`);
    }
    
    return { success, failedFiles };
  }
  
  async getLatestProtocolVersion(): Promise<string> {
    try {
      const versionFile = await fs.readFile(
        path.join(this.basePath, 'specifications', 'version.json'),
        'utf-8'
      );
      return JSON.parse(versionFile).version;
    } catch (error) {
      console.error('Error reading protocol version:', error);
      return LATEST_PROTOCOL_VERSION;
    }
  }
  
  async getSpecification(version?: string): Promise<any | null> {
    const specVersion = version || await this.getLatestProtocolVersion();
    const cacheKey = `spec-${specVersion}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const specPath = path.join(this.basePath, 'specifications', 'schema.json');
    
    try {
      const specContent = await fs.readFile(specPath, 'utf-8');
      const validation = await validateJson(specContent);
      
      if (!validation.valid) {
        throw new Error(`Invalid JSON in specification file: ${validation.error}`);
      }
      
      const specification = JSON.parse(specContent);
      
      // Add version information
      specification.version = specVersion;
      
      this.cache.set(cacheKey, specification);
      return specification;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.error('Schema file not found');
      } else {
        console.error('Error reading specification:', error);
      }
      return null;
    }
  }
  
  // Get documentation for a specific topic
  async getDocumentation(topic: string): Promise<string | null> {
    const docPath = path.join(this.basePath, 'documentation', `${topic}.md`);
    const defaultDocPath = path.join(this.basePath, 'documentation', 'usage-guide.md');
    
    try {
      // Try to find topic-specific documentation
      const exists = await fs.access(docPath).then(() => true).catch(() => false);
      
      if (exists) {
        return await fs.readFile(docPath, 'utf-8');
      }
      
      // Fall back to default documentation
      return await fs.readFile(defaultDocPath, 'utf-8');
    } catch (error) {
      console.error(`Error retrieving documentation for ${topic}:`, error);
      return null;
    }
  }
}

/**
 * MCP Host - Manages MCP servers
 */
class McpHost {
  private servers: Map<string, McpServer>;
  private knowledgeBase: KnowledgeBaseManager;
  
  constructor(knowledgeBasePath: string) {
    this.servers = new Map();
    this.knowledgeBase = new KnowledgeBaseManager(knowledgeBasePath);
  }
  
  async initialize(): Promise<void> {
    await this.knowledgeBase.initialize();
  }
  
  async createServer(name: string): Promise<McpServer> {
    // Create a new MCP server with LLM capabilities
    const server = new McpServer({
      name,
      version: "1.0.0"
    });
    
    // Add MCP documentation resource
    server.resource(
      "mcp-docs",
      new ResourceTemplate("mcp-docs://{topic}", { list: undefined }),
      async (uri, { topic }) => {
        // Retrieve documentation from the knowledge base
        const topicStr = typeof topic === 'string' ? topic : (Array.isArray(topic) ? topic[0] : '');
        const documentation = await this.knowledgeBase.getDocumentation(topicStr) || 
          `Documentation for '${topicStr}' not found. Please try another topic.`;
        
        return {
          contents: [{
            uri: uri.href,
            text: documentation
          }]
        };
      }
    );
    
    // Add MCP specification resource
    server.resource(
      "mcp-spec",
      new ResourceTemplate("mcp-spec://{version?}", { list: undefined }),
      async (uri, { version }) => {
        const versionStr = typeof version === 'string' ? version : (Array.isArray(version) ? version[0] : undefined);
        const specification = await this.knowledgeBase.getSpecification(versionStr);
        
        if (!specification) {
          return {
            contents: [{
              uri: uri.href,
              text: `Specification for version ${version || 'latest'} not found.`
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
    
    this.servers.set(name, server);
    return server;
  }
  
  async startServer(name: string): Promise<void> {
    const server = this.servers.get(name);
    if (!server) {
      throw new Error(`Server '${name}' not found`);
    }
    
    try {
      // Create and connect a transport for the server
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.log(`Server '${name}' started with stdio transport`);
    } catch (error) {
      console.error(`Error starting server '${name}':`, error);
      throw error;
    }
  }
}

// Default export for easy importing
export default async function createMcpMetaServer(
  name: string, 
  knowledgeBasePath: string
): Promise<McpServer> {
  const host = new McpHost(knowledgeBasePath);
  await host.initialize();
  
  const server = await host.createServer(name);
  return server;
}

// Export classes for testing and advanced usage
export {
  KnowledgeBaseManager,
  McpHost,
};