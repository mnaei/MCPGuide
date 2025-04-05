import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { LATEST_PROTOCOL_VERSION } from "../../src/config/constants";

describe("MCP Client Integration Tests", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeEach(() => {
    // Initialize client with required options
    client = new Client({
      name: "test-client",
      version: "0.1"
    });
    
    // Initialize transport with required command
    transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"]
    });
  });

  afterEach(async () => {
    // Clean up transport and client
    if (transport) {
      await transport.close();
    }
    if (client) {
      await client.close();
    }
  });

  describe("Client Initialization", () => {
    it("should initialize client successfully", () => {
      expect(client).toBeInstanceOf(Client);
    });

    it("should initialize transport successfully", () => {
      expect(transport).toBeInstanceOf(StdioClientTransport);
    });

    it("should connect to transport successfully", async () => {
      await expect(client.connect(transport)).resolves.not.toThrow();
    });
  });

  describe("Basic Resource Access", () => {
    beforeEach(async () => {
      await client.connect(transport);
    });

    /**
     * Tests the basic GET request functionality of the client.
     * Verifies that the client can successfully retrieve a specific MCP specification.
     */
    it("should be able to make a basic request", async () => {
      // Make a GET request for a specific MCP specification version
      const response = await client.readResource(
        {
          uri: `mcp-spec://${LATEST_PROTOCOL_VERSION}`
        }
      );

      // Verify the response structure
      expect(response).toBeDefined();
      const result = response as any;
      expect(result.contents).toBeDefined();
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents.length).toBeGreaterThan(0);
      
      // Verify each content item has the required fields
      result.contents.forEach((content: any) => {
        expect(content.uri).toBeDefined();
        expect(content.mimeType).toBeDefined();
        expect(content.text).toBeDefined();
        expect(content.uri).toBe(`mcp-spec://${LATEST_PROTOCOL_VERSION}`);
        expect(content.mimeType).toBe('text/plain');
        expect(typeof content.text).toBe('string');
      });
    });

    /**
     * Tests the resource listing functionality of the client.
     * Verifies that the client can retrieve a list of all available MCP resources
     * and that each resource follows the expected format.
     */
    it("should be able to list all resources", async () => {
      // Make a LIST request to get all available resources
      const response = await client.listResources(
        {
          uri: "mcp-spec://" // Root URI to list all resources
        }
      );

      // Verify the response structure
      expect(response).toBeDefined();
      const result = response as any;
      expect(result.result).toBeDefined();
      expect(result.result?.resources).toBeDefined();
      expect(Array.isArray(result.result?.resources)).toBe(true);
      expect(result.result?.resources.length).toBeGreaterThan(0);
      
      // Verify each resource in the list has the required fields
      result.result?.resources.forEach((resource: any) => {
        expect(resource.uri).toBeDefined();
        expect(resource.name).toBeDefined();
        expect(resource.uri.startsWith('mcp-spec://')).toBe(true);
        expect(resource.metadata).toBeDefined();
        expect(resource.metadata.availableVersions).toBeDefined();
        expect(resource.metadata.defaultVersion).toBeDefined();
      });
    });
  });
}); 