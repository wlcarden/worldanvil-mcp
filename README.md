# World Anvil MCP Server

MCP (Model Context Protocol) server for integrating World Anvil API with Claude Code.

## Features

- ✅ Read user identity and profile
- ✅ List and retrieve worlds
- ✅ List and retrieve articles
- ✅ List and retrieve categories
- ✅ List and retrieve images
- 🚧 Create/update operations (coming soon)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

You need two authentication tokens from World Anvil:

- **Application Key** (`WA_APP_KEY`): Your approved application key from World Anvil dev team
- **User Auth Token** (`WA_AUTH_TOKEN`): Your personal authentication token

Get your user auth token from: https://www.worldanvil.com/api/auth/key

### 3. Configure in Claude Code

Add the following to your Claude Code MCP configuration file (`~/.config/claude/mcp_config.json` or `~/.claude/mcp_config.json`):

```json
{
  "mcpServers": {
    "worldanvil": {
      "command": "node",
      "args": ["/home/wlcarden/projects/worldanvil-mcp/index.js"],
      "env": {
        "WA_APP_KEY": "your-application-key-here",
        "WA_AUTH_TOKEN": "your-auth-token-here"
      }
    }
  }
}
```

Replace `your-application-key-here` and `your-auth-token-here` with your actual tokens.

### 4. Restart Claude Code

```bash
# Exit Claude Code and restart it to load the new MCP server
```

## Available Tools

### `worldanvil_get_identity`

Get the current authenticated user's identity and information.

**Parameters:** None

**Example:**
```javascript
worldanvil_get_identity()
```

### `worldanvil_list_worlds`

List all worlds belonging to the authenticated user.

**Parameters:** None

**Example:**
```javascript
worldanvil_list_worlds()
```

### `worldanvil_get_world`

Get details about a specific world.

**Parameters:**
- `world_id` (string, required): The ID of the world

**Example:**
```javascript
worldanvil_get_world({ world_id: "abc123" })
```

### `worldanvil_list_articles`

List articles in a specific world.

**Parameters:**
- `world_id` (string, required): The ID of the world
- `offset` (number, optional): Pagination offset
- `limit` (number, optional): Maximum number of articles to return

**Example:**
```javascript
worldanvil_list_articles({ world_id: "abc123", limit: 10 })
```

### `worldanvil_get_article`

Get a specific article by its ID.

**Parameters:**
- `article_id` (string, required): The ID of the article

**Example:**
```javascript
worldanvil_get_article({ article_id: "xyz789" })
```

### `worldanvil_list_categories`

List categories in a specific world.

**Parameters:**
- `world_id` (string, required): The ID of the world

**Example:**
```javascript
worldanvil_list_categories({ world_id: "abc123" })
```

### `worldanvil_get_category`

Get a specific category by its ID.

**Parameters:**
- `category_id` (string, required): The ID of the category

**Example:**
```javascript
worldanvil_get_category({ category_id: "cat456" })
```

### `worldanvil_list_images`

List images in a specific world.

**Parameters:**
- `world_id` (string, required): The ID of the world
- `offset` (number, optional): Pagination offset
- `limit` (number, optional): Maximum number of images to return

**Example:**
```javascript
worldanvil_list_images({ world_id: "abc123", limit: 20 })
```

## API Reference

World Anvil Boromir API Documentation: https://www.worldanvil.com/api/external/boromir/swagger-documentation

## License

MIT
