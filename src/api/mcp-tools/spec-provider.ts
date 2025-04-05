import { z } from "zod";
import { KnowledgeBaseManager } from "../../core/knowledgebase";
import { AVAILABLE_VERSIONS, LATEST_PROTOCOL_VERSION } from "../../config/constants";
import { McpSpecificationArgs, mcpSpecificationSchema } from "../../types/mcp-specification";

// Define version enum with Zod
export const VersionEnum = z.enum(AVAILABLE_VERSIONS as [string, ...string[]]);

// Export the enum values for easy access
export const VERSION_OPTIONS = VersionEnum.enum;

/**
 * Handles the MCP specification tool functionality
 */
export async function handleMcpSpecificationTool(
  knowledgeBase: KnowledgeBaseManager,
  args: McpSpecificationArgs
) {
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