/**
 * World Anvil MCP Server - Server Factory
 *
 * Creates and configures the MCP server instance.
 */

import { createRequire } from "module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const require = createRequire(import.meta.url);
const { version: PKG_VERSION } = require("../package.json");

import { WorldAnvilClient } from "./api-client.js";
import { getToolDefinitions } from "./tools.js";
import { handleToolCall } from "./handlers.js";
import { parseToolGroups, filterTools } from "./tool-groups.js";

/**
 * Server configuration options
 * @typedef {Object} ServerConfig
 * @property {string} [appKey] - World Anvil Application Key (defaults to WA_APP_KEY env var)
 * @property {string} [authToken] - World Anvil Auth Token (defaults to WA_AUTH_TOKEN env var)
 * @property {string} [toolGroups] - Comma-separated tool groups or preset (defaults to WA_TOOL_GROUPS env var)
 * @property {string} [name='worldanvil-mcp'] - Server name
 * @property {string} [version] - Server version (defaults to package.json version)
 */

/**
 * Create and configure a World Anvil MCP server
 *
 * @param {ServerConfig} [config={}] - Server configuration
 * @returns {{ server: Server, client: WorldAnvilClient }} Server and client instances
 */
export function createServer(config = {}) {
  // Create the API client
  const client = new WorldAnvilClient({
    appKey: config.appKey,
    authToken: config.authToken,
  });

  // Parse tool group filter (env var or config)
  const enabledGroups = parseToolGroups(
    config.toolGroups || process.env.WA_TOOL_GROUPS,
  );

  // Create the MCP server
  const server = new Server(
    {
      name: config.name || "worldanvil-mcp",
      version: config.version || PKG_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register tool list handler (filtered by enabled groups)
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: filterTools(getToolDefinitions(), enabledGroups) };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(name, args || {}, client);
  });

  return { server, client };
}

/**
 * Re-export modules for testing and direct use
 */
export { WorldAnvilClient } from "./api-client.js";
export { getToolDefinitions } from "./tools.js";
export { handleToolCall } from "./handlers.js";
export { markdownToBBCode, convertFieldsToBBCode } from "./utils.js";
export { parseToolGroups, filterTools } from "./tool-groups.js";
