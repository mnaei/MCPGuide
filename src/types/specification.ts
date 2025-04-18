import { z } from "zod";
import { AVAILABLE_VERSIONS, LATEST_PROTOCOL_VERSION } from "../config/repositories.ts";

// Define version enum with Zod
export const VersionEnum = z.enum(AVAILABLE_VERSIONS as [string, ...string[]]);

// Define the schema shape
export const mcpSpecificationSchema = {
  version: z.enum(AVAILABLE_VERSIONS as [string, ...string[]]).optional()
};

// Create the Zod schema object
const McpSpecificationArgsSchema = z.object(mcpSpecificationSchema);

// Derive TypeScript type from the schema
export type McpSpecificationArgs = z.infer<typeof McpSpecificationArgsSchema>; 