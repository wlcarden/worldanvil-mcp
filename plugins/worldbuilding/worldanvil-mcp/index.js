#!/usr/bin/env node

/**
 * World Anvil MCP Server
 *
 * Provides MCP tools for interacting with the World Anvil API from Claude Code.
 *
 * Environment variables:
 *   WA_AUTH_TOKEN - World Anvil User Authentication Token (required)
 *   WA_APP_KEY    - World Anvil Application Key (optional; required only for
 *                   direct API mode. If omitted, the server uses proxy mode
 *                   and the proxy injects the application key.)
 *
 * Changelog:
 *   v1.3.0 - Modular refactor, added Blocks/BlockFolders/Manuscripts, test infrastructure
 *   v1.2.0 - Improved template docs, better error messages, ordered list support
 *   v1.1.1 - Fixed PATCH endpoints to use query params
 *   v1.1.0 - Added automatic Markdown to BBCode conversion
 *   v1.0.1 - Added template-specific fields support, fixed world reference format
 *   v1.0.0 - Initial release with basic CRUD operations
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './src/server.js';

// Validate environment variables
// WA_APP_KEY is optional: omitting it enables proxy mode, where the proxy
// injects the application key. WA_AUTH_TOKEN is always required.
const APP_KEY = process.env.WA_APP_KEY;
const AUTH_TOKEN = process.env.WA_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error('Error: WA_AUTH_TOKEN environment variable must be set');
  process.exit(1);
}

if (!APP_KEY) {
  console.error('Info: WA_APP_KEY not set — running in proxy mode');
}

/**
 * Start the server
 */
async function main() {
  const { server } = createServer({
    appKey: APP_KEY,
    authToken: AUTH_TOKEN,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('World Anvil MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
