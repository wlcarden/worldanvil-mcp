# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo. The actual MCP server package lives at `plugins/worldbuilding/worldanvil-mcp/`. All development commands run from that subdirectory.

```
plugins/worldbuilding/worldanvil-mcp/   ← main package (npm: worldanvil-mcp)
  index.js                              ← entry point, starts stdio transport
  src/
    server.js                           ← MCP server factory
    tools.js                            ← tool schema definitions (90+ tools)
    handlers.js                         ← tool call dispatch (switch on tool name)
    api-client.js                       ← WorldAnvilClient HTTP wrapper
    utils.js                            ← Markdown→BBCode conversion
  test/                                 ← vitest tests
  cloudflare-worker/                    ← optional proxy deployment (Wrangler)
  CLAUDE.md                             ← worldbuilding guidance for MCP users (not devs)
```

## Commands

All commands run from `plugins/worldbuilding/worldanvil-mcp/`:

```bash
npm start            # run the MCP server
npm run dev          # run with --watch (auto-restart on changes)
npm test             # run all tests
npm run test:watch   # run tests in watch mode
npm run test:coverage  # run tests with coverage report
```

To run a single test file:
```bash
npx vitest run test/utils.test.js
```

Tests load credentials from `.env` in the package directory (use `dotenv`). Integration tests hit the real WorldAnvil API and require `WA_AUTH_TOKEN` to be set.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `WA_AUTH_TOKEN` | Always | User's WorldAnvil auth token |
| `WA_APP_KEY` | Optional | Direct API mode; if omitted, uses default public proxy |
| `WA_PROXY_URL` | Optional | Custom Cloudflare Worker proxy URL |
| `WA_TOOL_GROUPS` | Optional | Comma-separated tool groups or preset to load (default: all). Groups: core, content, images, campaign, maps, timeline, blocks, manuscripts, canvas, variables, social, rpg. Presets: all, standard, worldbuilding, writing, gamemaster |

## Architecture

**Two API modes**, selected at startup:
- **Direct mode**: `WA_APP_KEY` set → calls `www.worldanvil.com/api/external/boromir` with both `x-application-key` and `x-auth-token` headers
- **Proxy mode**: no `WA_APP_KEY` → routes through a Cloudflare Worker that injects the app key; only `x-auth-token` is sent by the client

**Request flow**: `index.js` → `createServer()` in `server.js` → registers two MCP handlers (list tools, call tool) → `handleToolCall()` in `handlers.js` dispatches by tool name → `WorldAnvilClient` methods in `api-client.js`.

**Adding a new tool** requires changes in three files:
1. `tools.js` — add the JSON schema definition
2. `handlers.js` — add a `case` in the switch statement
3. `api-client.js` — add the HTTP method on `WorldAnvilClient`

**Markdown→BBCode**: Article `content` fields and other text fields are automatically converted via `markdownToBBCode()` in `utils.js`. The function is called in handlers before sending to the API. WorldAnvil does not render Markdown natively.

**Known API quirks** (discovered through testing, documented in `api-client.js`):
- Swagger shows `/variable_collection` but the live API uses `/variablecollection`
- Variable creation requires nested `{ id: ... }` objects despite Swagger showing flat fields
- List endpoints use `POST` with a body (not `GET` with query params)
- Rate limiting: space API calls ~750ms apart to avoid Cloudflare 429s

## Cloudflare Worker Proxy

`cloudflare-worker/` contains a Wrangler project for self-hosting the proxy. Deploy with `wrangler deploy` from that directory, then set the `WA_APP_KEY` Cloudflare secret. Users point `WA_PROXY_URL` at the deployed worker URL.
