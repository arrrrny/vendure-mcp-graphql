#!/usr/bin/env node
/**
 * Vendure GraphQL MCP Server
 * Consolidated version for both Vendure Admin and Shop APIs
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Try to load from project root .env.local
config({ path: resolve(__dirname, "../../.env.local") });

// 2. Also try to load from specific vendure-api-key.env if it exists
const apiKeyPath = resolve(__dirname, "../../vendure-api-key.env");
if (existsSync(apiKeyPath)) {
  const envConfig = config({ path: apiKeyPath });
  if (envConfig.parsed?.VENDURE_API_KEY) {
    process.env.VENDURE_API_KEY = envConfig.parsed.VENDURE_API_KEY;
  }
}

import {
  adminQuery,
  adminMutation,
  adminBatchMutation,
  getAdminSchema,
  getAdminOperations,
  shopQuery,
  shopMutation,
  shopBatchMutation,
  getShopSchema,
  getShopOperations,
} from "./src/tools/index.js";

// Singleton pattern for shared resources
class SharedResources {
  private static instance: SharedResources | null = null;
  private static initializing = false;

  private constructor() {}

  static async getInstance(): Promise<SharedResources> {
    if (this.instance) return this.instance;

    while (this.initializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.instance) return this.instance;

    this.initializing = true;
    try {
      // Initialize any shared resources here if needed
      this.instance = new SharedResources();
      return this.instance;
    } finally {
      this.initializing = false;
    }
  }
}

const server = new Server(
  {
    name: "vendure-mcp-graphql",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "admin_query",
      description: "Execute a GraphQL query on the Vendure Admin API.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The GraphQL query string" },
          variables: { type: "object", description: "Optional variables" },
        },
        required: ["query"],
      },
    },
    {
      name: "admin_mutation",
      description: "Execute a GraphQL mutation on the Vendure Admin API.",
      inputSchema: {
        type: "object",
        properties: {
          mutation: {
            type: "string",
            description: "The GraphQL mutation string",
          },
          variables: { type: "object", description: "Optional variables" },
        },
        required: ["mutation"],
      },
    },
    {
      name: "admin_batch_mutation",
      description:
        "Execute a GraphQL mutation in batch for multiple IDs on the Vendure Admin API. " +
        "Runs mutations concurrently and returns aggregated success/failure results per ID. " +
        "Use this for bulk delete, update, or any mutation that takes an ID input.",
      inputSchema: {
        type: "object",
        properties: {
          mutation: {
            type: "string",
            description:
              "The GraphQL mutation string. Must accept a variable for the ID (e.g. $id: ID!).",
          },
          ids: {
            type: "array",
            items: { type: "string" },
            description: "Array of IDs to execute the mutation for.",
          },
          variableName: {
            type: "string",
            description:
              'Name of the variable holding the ID in the mutation. Default: "id".',
          },
          extraVariables: {
            type: "object",
            description:
              "Additional variables to pass alongside each ID (e.g. { enabled: false }).",
          },
          concurrency: {
            type: "number",
            description:
              "Max number of concurrent mutations. Default: 5.",
          },
        },
        required: ["mutation", "ids"],
      },
    },
    {
      name: "get_admin_schema",
      description:
        "Fetch the full Admin API GraphQL schema introspection. (Warning: Large output)",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "list_admin_operations",
      description:
        "List all available queries and mutations for the Admin API with descriptions.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "shop_query",
      description: "Execute a GraphQL query on the Vendure Shop API.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The GraphQL query string" },
          variables: { type: "object", description: "Optional variables" },
        },
        required: ["query"],
      },
    },
    {
      name: "shop_mutation",
      description: "Execute a GraphQL mutation on the Vendure Shop API.",
      inputSchema: {
        type: "object",
        properties: {
          mutation: {
            type: "string",
            description: "The GraphQL mutation string",
          },
          variables: { type: "object", description: "Optional variables" },
        },
        required: ["mutation"],
      },
    },
    {
      name: "shop_batch_mutation",
      description:
        "Execute a GraphQL mutation in batch for multiple IDs on the Vendure Shop API. " +
        "Runs mutations concurrently and returns aggregated success/failure results per ID. " +
        "Use this for bulk delete, update, or any mutation that takes an ID input.",
      inputSchema: {
        type: "object",
        properties: {
          mutation: {
            type: "string",
            description:
              "The GraphQL mutation string. Must accept a variable for the ID (e.g. $id: ID!).",
          },
          ids: {
            type: "array",
            items: { type: "string" },
            description: "Array of IDs to execute the mutation for.",
          },
          variableName: {
            type: "string",
            description:
              'Name of the variable holding the ID in the mutation. Default: "id".',
          },
          extraVariables: {
            type: "object",
            description:
              "Additional variables to pass alongside each ID.",
          },
          concurrency: {
            type: "number",
            description:
              "Max number of concurrent mutations. Default: 5.",
          },
        },
        required: ["mutation", "ids"],
      },
    },
    {
      name: "get_shop_schema",
      description:
        "Fetch the full Shop API GraphQL schema introspection. (Warning: Large output)",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "list_shop_operations",
      description:
        "List all available queries and mutations for the Shop API with descriptions.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "admin_query":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await adminQuery(
                  args?.query as string,
                  args?.variables as Record<string, any>,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "admin_mutation":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await adminMutation(
                  args?.mutation as string,
                  args?.variables as Record<string, any>,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "admin_batch_mutation":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await adminBatchMutation(
                  args?.mutation as string,
                  args?.ids as string[],
                  (args?.variableName as string) || "id",
                  args?.extraVariables as Record<string, any>,
                  (args?.concurrency as number) || 5,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "get_admin_schema":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await getAdminSchema(), null, 2),
            },
          ],
        };
      case "list_admin_operations":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await getAdminOperations(), null, 2),
            },
          ],
        };
      case "shop_query":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await shopQuery(
                  args?.query as string,
                  args?.variables as Record<string, any>,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "shop_mutation":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await shopMutation(
                  args?.mutation as string,
                  args?.variables as Record<string, any>,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "shop_batch_mutation":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                await shopBatchMutation(
                  args?.mutation as string,
                  args?.ids as string[],
                  (args?.variableName as string) || "id",
                  args?.extraVariables as Record<string, any>,
                  (args?.concurrency as number) || 5,
                ),
                null,
                2,
              ),
            },
          ],
        };
      case "get_shop_schema":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await getShopSchema(), null, 2),
            },
          ],
        };
      case "list_shop_operations":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await getShopOperations(), null, 2),
            },
          ],
        };
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  // Initialize shared resources (singleton pattern)
  await SharedResources.getInstance();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vendure GraphQL MCP server running on stdio");
  console.error("Memory optimization: GraphQL client shared via singleton");
  console.error(
    `API Key: ${process.env.VENDURE_API_KEY ? "Present" : "Missing"}`,
  );
  console.error(`Admin URL: ${process.env.ADMIN_API_URL || "default"}`);
  console.error(`Shop URL: ${process.env.SHOP_API_URL || "default"}`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
