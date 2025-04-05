import { z } from "zod";

// Define the schema shape
export const mcpSpecificationSchema = {
  version: z.string().optional()
};

// Create the Zod schema object
export const McpSpecificationArgsSchema = z.object(mcpSpecificationSchema);

// Derive TypeScript type from the schema
export type McpSpecificationArgs = z.infer<typeof McpSpecificationArgsSchema>; 