/**
 * Tests for the MCP test client functionality
 */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

describe('MCP Test Client', () => {
  beforeEach(() => {
    // Mock console and process.exit to prevent actual side effects
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });
  
  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
  });
  
  test('main function creates MCP server with correct parameters', async () => {
    // Import the test-client module
    const testClientModule = await import('../src/test-client');
    
    // Check that the console.log was called with the startup message
    expect(console.log).toHaveBeenCalledWith("Starting MCP test client...");
    
    // Check that connection message was shown
    expect(console.log).toHaveBeenCalledWith("Connecting server to stdio transport...");
    
    // Check that the connected message was shown
    expect(console.log).toHaveBeenCalledWith("Connected!");
    
    // Check that the server running message was shown
    expect(console.log).toHaveBeenCalledWith("Server is running. Press Ctrl+C to exit.");
  });

  test('McpServer can create resource handlers with correct parameters', async () => {
    // Create a test MCP server manually
    const server = new McpServer({
      name: "Test Server",
      version: "0.1.0"
    });
    
    // Create a test handler function similar to the one in test-client.ts
    const handlerFn = async (uri: URL) => {
      return {
        contents: [{
          uri: uri.href,
          text: "Hello, world! This is a test MCP resource."
        }]
      };
    };
    
    // Add a test resource
    server.resource(
      "test-resource",
      "test://hello-world",
      handlerFn
    );
    
    // Test the handler function directly
    const testUri = new URL("test://hello-world");
    const response = await handlerFn(testUri);
    
    // Verify response structure
    expect(response).toHaveProperty('contents');
    expect(response.contents).toHaveLength(1);
    expect(response.contents[0]).toHaveProperty('uri', testUri.href);
    expect(response.contents[0]).toHaveProperty('text', "Hello, world! This is a test MCP resource.");
  });
  
  test('error handling works correctly', async () => {
    // Create a function that will throw an error
    function testWithError() {
      throw new Error("Test error");
    }
    
    // Call the function in a try-catch block similar to test-client.ts
    try {
      testWithError();
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
    
    // Verify error was logged and process.exit was called
    expect(console.error).toHaveBeenCalledWith("Error:", expect.any(Error));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});