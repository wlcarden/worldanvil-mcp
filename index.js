#!/usr/bin/env node

/**
 * World Anvil MCP Server
 *
 * Provides MCP tools for interacting with the World Anvil API from Claude Code.
 *
 * Environment variables:
 *   WA_APP_KEY - World Anvil Application Key
 *   WA_AUTH_TOKEN - World Anvil User Authentication Token
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import https from 'https';

// Configuration
const API_BASE = 'www.worldanvil.com';
const API_PATH = '/api/external/boromir';
const APP_KEY = process.env.WA_APP_KEY;
const AUTH_TOKEN = process.env.WA_AUTH_TOKEN;

if (!APP_KEY || !AUTH_TOKEN) {
  console.error('Error: WA_APP_KEY and WA_AUTH_TOKEN environment variables must be set');
  process.exit(1);
}

/**
 * World Anvil API Client
 */
class WorldAnvilClient {
  /**
   * Make a request to the World Anvil API
   */
  async request(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const postData = body ? JSON.stringify(body) : '';

      const options = {
        hostname: API_BASE,
        path: `${API_PATH}${endpoint}`,
        method: method,
        headers: {
          'x-application-key': APP_KEY,
          'x-auth-token': AUTH_TOKEN,
          'Accept': 'application/json',
          'User-Agent': 'WorldAnvil-MCP/1.0'
        }
      };

      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error (${res.statusCode}): ${parsed.error || data}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`API Error (${res.statusCode}): ${data}`));
            }
          }
        });
      });

      req.on('error', (e) => {
        reject(new Error(`Network Error: ${e.message}`));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * Get the current user's identity
   */
  async getIdentity() {
    return this.request('/identity');
  }

  /**
   * List user's worlds
   * Note: Uses POST method per WorldAnvil API design
   */
  async listWorlds() {
    // First get the user identity to get the user ID
    const identity = await this.getIdentity();
    const userId = identity.id;

    // Then request worlds with user ID as query parameter
    return this.request(`/user/worlds?id=${userId}`, 'POST', {});
  }

  /**
   * Get a specific world by ID
   */
  async getWorld(worldId) {
    return this.request(`/world?id=${worldId}`);
  }

  /**
   * List articles in a world
   */
  async listArticles(worldId, options = {}) {
    // Build request body with defaults from Swagger spec
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };

    // Category is optional, defaults to uncategorized ("-1") if not specified
    if (options.category !== undefined) {
      body.category = options.category;
    } else {
      body.category = { id: "-1" };
    }

    return this.request(`/world/articles?id=${worldId}`, 'POST', body);
  }

  /**
   * Get a specific article
   */
  async getArticle(articleId) {
    return this.request(`/article?id=${articleId}`);
  }

  /**
   * Create a new article
   */
  async createArticle(data) {
    return this.request('/article', 'PUT', data);
  }

  /**
   * Update an existing article
   */
  async updateArticle(articleId, data) {
    return this.request('/article', 'PATCH', { id: articleId, ...data });
  }

  /**
   * List categories in a world
   */
  async listCategories(worldId, options = {}) {
    // Build request body with defaults
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };

    return this.request(`/world/categories?id=${worldId}`, 'POST', body);
  }

  /**
   * Get a specific category
   */
  async getCategory(categoryId) {
    return this.request(`/category?id=${categoryId}`);
  }

  /**
   * Create a new category
   */
  async createCategory(data) {
    return this.request('/category', 'PUT', data);
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryId, data) {
    return this.request('/category', 'PATCH', { id: categoryId, ...data });
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId) {
    return this.request(`/category?id=${categoryId}`, 'DELETE');
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId) {
    return this.request(`/article?id=${articleId}`, 'DELETE');
  }

  /**
   * Create a new world
   */
  async createWorld(data) {
    return this.request('/world', 'PUT', data);
  }

  /**
   * Update an existing world
   */
  async updateWorld(worldId, data) {
    return this.request('/world', 'PATCH', { id: worldId, ...data });
  }

  /**
   * Delete a world
   */
  async deleteWorld(worldId) {
    return this.request(`/world?id=${worldId}`, 'DELETE');
  }

  /**
   * List images in a world
   */
  async listImages(worldId, options = {}) {
    // Build request body with defaults
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };

    return this.request(`/world/images?id=${worldId}`, 'POST', body);
  }

  // ===== NOTEBOOKS =====
  async getNotebook(notebookId) {
    return this.request(`/notebook?id=${notebookId}`);
  }

  async listNotebooks(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/world/notebooks?id=${worldId}`, 'POST', body);
  }

  async createNotebook(data) {
    return this.request('/notebook', 'PUT', data);
  }

  async updateNotebook(notebookId, data) {
    return this.request('/notebook', 'PATCH', { id: notebookId, ...data });
  }

  async deleteNotebook(notebookId) {
    return this.request(`/notebook?id=${notebookId}`, 'DELETE');
  }

  // ===== NOTE SECTIONS =====
  async getNotesection(notesectionId) {
    return this.request(`/notesection?id=${notesectionId}`);
  }

  async listNotesections(notebookId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/notebook/notesections?id=${notebookId}`, 'POST', body);
  }

  async createNotesection(data) {
    return this.request('/notesection', 'PUT', data);
  }

  async updateNotesection(notesectionId, data) {
    return this.request('/notesection', 'PATCH', { id: notesectionId, ...data });
  }

  async deleteNotesection(notesectionId) {
    return this.request(`/notesection?id=${notesectionId}`, 'DELETE');
  }

  // ===== NOTES =====
  async getNote(noteId) {
    return this.request(`/note?id=${noteId}`);
  }

  async listNotes(notesectionId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/notesection/notes?id=${notesectionId}`, 'POST', body);
  }

  async createNote(data) {
    return this.request('/note', 'PUT', data);
  }

  async updateNote(noteId, data) {
    return this.request('/note', 'PATCH', { id: noteId, ...data });
  }

  async deleteNote(noteId) {
    return this.request(`/note?id=${noteId}`, 'DELETE');
  }

  // ===== SECRETS =====
  async getSecret(secretId) {
    return this.request(`/secret?id=${secretId}`);
  }

  async listSecrets(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/world/secrets?id=${worldId}`, 'POST', body);
  }

  async createSecret(data) {
    return this.request('/secret', 'PUT', data);
  }

  async updateSecret(secretId, data) {
    return this.request('/secret', 'PATCH', { id: secretId, ...data });
  }

  async deleteSecret(secretId) {
    return this.request(`/secret?id=${secretId}`, 'DELETE');
  }

  // ===== MAPS =====
  async getMap(mapId) {
    return this.request(`/map?id=${mapId}`);
  }

  async listMaps(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/world/maps?id=${worldId}`, 'POST', body);
  }

  async createMap(data) {
    return this.request('/map', 'PUT', data);
  }

  async updateMap(mapId, data) {
    return this.request('/map', 'PATCH', { id: mapId, ...data });
  }

  async deleteMap(mapId) {
    return this.request(`/map?id=${mapId}`, 'DELETE');
  }

  // ===== MAP MARKERS =====
  async getMarker(markerId) {
    return this.request(`/marker?id=${markerId}`);
  }

  async listMarkers(mapId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/map/markers?id=${mapId}`, 'POST', body);
  }

  async createMarker(data) {
    return this.request('/marker', 'PUT', data);
  }

  async updateMarker(markerId, data) {
    return this.request('/marker', 'PATCH', { id: markerId, ...data });
  }

  async deleteMarker(markerId) {
    return this.request(`/marker?id=${markerId}`, 'DELETE');
  }

  // ===== TIMELINES =====
  async getTimeline(timelineId) {
    return this.request(`/timeline?id=${timelineId}`);
  }

  async listTimelines(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/world/timelines?id=${worldId}`, 'POST', body);
  }

  async createTimeline(data) {
    return this.request('/timeline', 'PUT', data);
  }

  async updateTimeline(timelineId, data) {
    return this.request('/timeline', 'PATCH', { id: timelineId, ...data });
  }

  async deleteTimeline(timelineId) {
    return this.request(`/timeline?id=${timelineId}`, 'DELETE');
  }

  // ===== HISTORY EVENTS =====
  async getHistory(historyId) {
    return this.request(`/history?id=${historyId}`);
  }

  async listHistories(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request(`/world/histories?id=${worldId}`, 'POST', body);
  }

  async createHistory(data) {
    return this.request('/history', 'PUT', data);
  }

  async updateHistory(historyId, data) {
    return this.request('/history', 'PATCH', { id: historyId, ...data });
  }

  async deleteHistory(historyId) {
    return this.request(`/history?id=${historyId}`, 'DELETE');
  }

  // ===== RPG SYSTEMS =====
  async getRpgSystem(rpgSystemId) {
    return this.request(`/rpgsystem?id=${rpgSystemId}`);
  }

  async listRpgSystems(options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0"
    };
    return this.request('/rpgsystems', 'POST', body);
  }
}

// Initialize the client
const client = new WorldAnvilClient();

// Create the MCP server
const server = new Server(
  {
    name: 'worldanvil-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'worldanvil_get_identity',
        description: 'Get the current authenticated user\'s identity and information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'worldanvil_list_worlds',
        description: 'List all worlds belonging to the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'worldanvil_get_world',
        description: 'Get details about a specific world by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            world_id: {
              type: 'string',
              description: 'The ID of the world to retrieve',
            },
          },
          required: ['world_id'],
        },
      },
      {
        name: 'worldanvil_list_articles',
        description: 'List articles in a specific world',
        inputSchema: {
          type: 'object',
          properties: {
            world_id: {
              type: 'string',
              description: 'The ID of the world to list articles from',
            },
            offset: {
              type: 'number',
              description: 'Pagination offset (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of articles to return (optional)',
            },
          },
          required: ['world_id'],
        },
      },
      {
        name: 'worldanvil_get_article',
        description: 'Get a specific article by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            article_id: {
              type: 'string',
              description: 'The ID of the article to retrieve',
            },
          },
          required: ['article_id'],
        },
      },
      {
        name: 'worldanvil_list_categories',
        description: 'List categories in a specific world',
        inputSchema: {
          type: 'object',
          properties: {
            world_id: {
              type: 'string',
              description: 'The ID of the world to list categories from',
            },
          },
          required: ['world_id'],
        },
      },
      {
        name: 'worldanvil_get_category',
        description: 'Get a specific category by its ID',
        inputSchema: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              description: 'The ID of the category to retrieve',
            },
          },
          required: ['category_id'],
        },
      },
      {
        name: 'worldanvil_list_images',
        description: 'List images in a specific world',
        inputSchema: {
          type: 'object',
          properties: {
            world_id: {
              type: 'string',
              description: 'The ID of the world to list images from',
            },
            offset: {
              type: 'number',
              description: 'Pagination offset (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of images to return (optional)',
            },
          },
          required: ['world_id'],
        },
      },
      {
        name: 'worldanvil_create_article',
        description: 'Create a new article in WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the article',
            },
            world_id: {
              type: 'string',
              description: 'The ID of the world to create the article in',
            },
            template: {
              type: 'string',
              description: 'The template type for the article (optional)',
            },
            content: {
              type: 'string',
              description: 'The content of the article (optional)',
            },
          },
          required: ['title', 'world_id'],
        },
      },
      {
        name: 'worldanvil_update_article',
        description: 'Update an existing article in WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            article_id: {
              type: 'string',
              description: 'The ID of the article to update',
            },
            title: {
              type: 'string',
              description: 'The new title of the article (optional)',
            },
            content: {
              type: 'string',
              description: 'The new content of the article (optional)',
            },
          },
          required: ['article_id'],
        },
      },
      {
        name: 'worldanvil_delete_article',
        description: 'Delete an article from WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            article_id: {
              type: 'string',
              description: 'The ID of the article to delete',
            },
          },
          required: ['article_id'],
        },
      },
      {
        name: 'worldanvil_create_category',
        description: 'Create a new category in WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the category',
            },
            world_id: {
              type: 'string',
              description: 'The ID of the world to create the category in',
            },
          },
          required: ['title', 'world_id'],
        },
      },
      {
        name: 'worldanvil_update_category',
        description: 'Update an existing category in WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              description: 'The ID of the category to update',
            },
            title: {
              type: 'string',
              description: 'The new title of the category (optional)',
            },
          },
          required: ['category_id'],
        },
      },
      {
        name: 'worldanvil_delete_category',
        description: 'Delete a category from WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              description: 'The ID of the category to delete',
            },
          },
          required: ['category_id'],
        },
      },
      {
        name: 'worldanvil_create_world',
        description: 'Create a new world in WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the world',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'worldanvil_update_world',
        description: 'Update an existing world in WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            world_id: {
              type: 'string',
              description: 'The ID of the world to update',
            },
            title: {
              type: 'string',
              description: 'The new title of the world (optional)',
            },
          },
          required: ['world_id'],
        },
      },
      {
        name: 'worldanvil_delete_world',
        description: 'Delete a world from WorldAnvil',
        inputSchema: {
          type: 'object',
          properties: {
            world_id: {
              type: 'string',
              description: 'The ID of the world to delete',
            },
          },
          required: ['world_id'],
        },
      },

      // NOTEBOOKS
      { name: 'worldanvil_get_notebook', description: 'Get notebook by ID', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string', description: 'Notebook ID' } }, required: ['notebook_id'] } },
      { name: 'worldanvil_list_notebooks', description: 'List notebooks in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
      { name: 'worldanvil_create_notebook', description: 'Create notebook', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] } },
      { name: 'worldanvil_update_notebook', description: 'Update notebook', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string' }, title: { type: 'string' } }, required: ['notebook_id'] } },
      { name: 'worldanvil_delete_notebook', description: 'Delete notebook', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string' } }, required: ['notebook_id'] } },

      // NOTE SECTIONS
      { name: 'worldanvil_get_notesection', description: 'Get note section by ID', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string', description: 'Note section ID' } }, required: ['notesection_id'] } },
      { name: 'worldanvil_list_notesections', description: 'List note sections in notebook', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string', description: 'Notebook ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['notebook_id'] } },
      { name: 'worldanvil_create_notesection', description: 'Create note section', inputSchema: { type: 'object', properties: { title: { type: 'string' }, notebook_id: { type: 'string' } }, required: ['title', 'notebook_id'] } },
      { name: 'worldanvil_update_notesection', description: 'Update note section', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string' }, title: { type: 'string' } }, required: ['notesection_id'] } },
      { name: 'worldanvil_delete_notesection', description: 'Delete note section', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string' } }, required: ['notesection_id'] } },

      // NOTES
      { name: 'worldanvil_get_note', description: 'Get note by ID', inputSchema: { type: 'object', properties: { note_id: { type: 'string', description: 'Note ID' } }, required: ['note_id'] } },
      { name: 'worldanvil_list_notes', description: 'List notes in section', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string', description: 'Note section ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['notesection_id'] } },
      { name: 'worldanvil_create_note', description: 'Create note', inputSchema: { type: 'object', properties: { title: { type: 'string' }, notesection_id: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'notesection_id'] } },
      { name: 'worldanvil_update_note', description: 'Update note', inputSchema: { type: 'object', properties: { note_id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['note_id'] } },
      { name: 'worldanvil_delete_note', description: 'Delete note', inputSchema: { type: 'object', properties: { note_id: { type: 'string' } }, required: ['note_id'] } },

      // SECRETS
      { name: 'worldanvil_get_secret', description: 'Get secret by ID', inputSchema: { type: 'object', properties: { secret_id: { type: 'string', description: 'Secret ID' } }, required: ['secret_id'] } },
      { name: 'worldanvil_list_secrets', description: 'List secrets in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
      { name: 'worldanvil_create_secret', description: 'Create secret', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'world_id'] } },
      { name: 'worldanvil_update_secret', description: 'Update secret', inputSchema: { type: 'object', properties: { secret_id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['secret_id'] } },
      { name: 'worldanvil_delete_secret', description: 'Delete secret', inputSchema: { type: 'object', properties: { secret_id: { type: 'string' } }, required: ['secret_id'] } },

      // MAPS
      { name: 'worldanvil_get_map', description: 'Get map by ID', inputSchema: { type: 'object', properties: { map_id: { type: 'string', description: 'Map ID' } }, required: ['map_id'] } },
      { name: 'worldanvil_list_maps', description: 'List maps in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
      { name: 'worldanvil_create_map', description: 'Create map', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] } },
      { name: 'worldanvil_update_map', description: 'Update map', inputSchema: { type: 'object', properties: { map_id: { type: 'string' }, title: { type: 'string' } }, required: ['map_id'] } },
      { name: 'worldanvil_delete_map', description: 'Delete map', inputSchema: { type: 'object', properties: { map_id: { type: 'string' } }, required: ['map_id'] } },

      // MAP MARKERS
      { name: 'worldanvil_get_marker', description: 'Get map marker by ID', inputSchema: { type: 'object', properties: { marker_id: { type: 'string', description: 'Marker ID' } }, required: ['marker_id'] } },
      { name: 'worldanvil_list_markers', description: 'List markers on map', inputSchema: { type: 'object', properties: { map_id: { type: 'string', description: 'Map ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['map_id'] } },
      { name: 'worldanvil_create_marker', description: 'Create map marker', inputSchema: { type: 'object', properties: { title: { type: 'string' }, map_id: { type: 'string' } }, required: ['title', 'map_id'] } },
      { name: 'worldanvil_update_marker', description: 'Update map marker', inputSchema: { type: 'object', properties: { marker_id: { type: 'string' }, title: { type: 'string' } }, required: ['marker_id'] } },
      { name: 'worldanvil_delete_marker', description: 'Delete map marker', inputSchema: { type: 'object', properties: { marker_id: { type: 'string' } }, required: ['marker_id'] } },

      // TIMELINES
      { name: 'worldanvil_get_timeline', description: 'Get timeline by ID', inputSchema: { type: 'object', properties: { timeline_id: { type: 'string', description: 'Timeline ID' } }, required: ['timeline_id'] } },
      { name: 'worldanvil_list_timelines', description: 'List timelines in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
      { name: 'worldanvil_create_timeline', description: 'Create timeline', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] } },
      { name: 'worldanvil_update_timeline', description: 'Update timeline', inputSchema: { type: 'object', properties: { timeline_id: { type: 'string' }, title: { type: 'string' } }, required: ['timeline_id'] } },
      { name: 'worldanvil_delete_timeline', description: 'Delete timeline', inputSchema: { type: 'object', properties: { timeline_id: { type: 'string' } }, required: ['timeline_id'] } },

      // HISTORY EVENTS
      { name: 'worldanvil_get_history', description: 'Get history event by ID', inputSchema: { type: 'object', properties: { history_id: { type: 'string', description: 'History event ID' } }, required: ['history_id'] } },
      { name: 'worldanvil_list_histories', description: 'List history events in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
      { name: 'worldanvil_create_history', description: 'Create history event', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'world_id'] } },
      { name: 'worldanvil_update_history', description: 'Update history event', inputSchema: { type: 'object', properties: { history_id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['history_id'] } },
      { name: 'worldanvil_delete_history', description: 'Delete history event', inputSchema: { type: 'object', properties: { history_id: { type: 'string' } }, required: ['history_id'] } },

      // RPG SYSTEMS
      { name: 'worldanvil_get_rpgsystem', description: 'Get RPG system by ID', inputSchema: { type: 'object', properties: { rpgsystem_id: { type: 'string', description: 'RPG system ID' } }, required: ['rpgsystem_id'] } },
      { name: 'worldanvil_list_rpgsystems', description: 'List all RPG systems', inputSchema: { type: 'object', properties: { offset: { type: 'number' }, limit: { type: 'number' } } } },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'worldanvil_get_identity': {
        const identity = await client.getIdentity();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(identity, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_list_worlds': {
        const worlds = await client.listWorlds();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(worlds, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_get_world': {
        const world = await client.getWorld(args.world_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(world, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_list_articles': {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;

        const articles = await client.listArticles(args.world_id, options);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(articles, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_get_article': {
        const article = await client.getArticle(args.article_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(article, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_list_categories': {
        const categories = await client.listCategories(args.world_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(categories, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_get_category': {
        const category = await client.getCategory(args.category_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(category, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_list_images': {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;

        const images = await client.listImages(args.world_id, options);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(images, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_create_article': {
        const data = {
          title: args.title,
          world: args.world_id,  // WorldAnvil API expects 'world' not 'world_id'
        };
        if (args.template !== undefined) data.template = args.template;
        if (args.content !== undefined) data.content = args.content;

        const result = await client.createArticle(data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_update_article': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined) data.content = args.content;

        const result = await client.updateArticle(args.article_id, data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_delete_article': {
        const result = await client.deleteArticle(args.article_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_create_category': {
        const data = {
          title: args.title,
          world: args.world_id,  // WorldAnvil API expects 'world' not 'world_id'
        };
        const result = await client.createCategory(data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_update_category': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;

        const result = await client.updateCategory(args.category_id, data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_delete_category': {
        const result = await client.deleteCategory(args.category_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_create_world': {
        const data = {
          title: args.title,
        };
        const result = await client.createWorld(data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_update_world': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;

        const result = await client.updateWorld(args.world_id, data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'worldanvil_delete_world': {
        const result = await client.deleteWorld(args.world_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // NOTEBOOKS
      case 'worldanvil_get_notebook': return { content: [{ type: 'text', text: JSON.stringify(await client.getNotebook(args.notebook_id), null, 2) }] };
      case 'worldanvil_list_notebooks': return { content: [{ type: 'text', text: JSON.stringify(await client.listNotebooks(args.world_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_notebook': return { content: [{ type: 'text', text: JSON.stringify(await client.createNotebook({ title: args.title, world: args.world_id }), null, 2) }] };
      case 'worldanvil_update_notebook': return { content: [{ type: 'text', text: JSON.stringify(await client.updateNotebook(args.notebook_id, { title: args.title }), null, 2) }] };
      case 'worldanvil_delete_notebook': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteNotebook(args.notebook_id), null, 2) }] };

      // NOTE SECTIONS
      case 'worldanvil_get_notesection': return { content: [{ type: 'text', text: JSON.stringify(await client.getNotesection(args.notesection_id), null, 2) }] };
      case 'worldanvil_list_notesections': return { content: [{ type: 'text', text: JSON.stringify(await client.listNotesections(args.notebook_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_notesection': return { content: [{ type: 'text', text: JSON.stringify(await client.createNotesection({ title: args.title, notebook: args.notebook_id }), null, 2) }] };
      case 'worldanvil_update_notesection': return { content: [{ type: 'text', text: JSON.stringify(await client.updateNotesection(args.notesection_id, { title: args.title }), null, 2) }] };
      case 'worldanvil_delete_notesection': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteNotesection(args.notesection_id), null, 2) }] };

      // NOTES
      case 'worldanvil_get_note': return { content: [{ type: 'text', text: JSON.stringify(await client.getNote(args.note_id), null, 2) }] };
      case 'worldanvil_list_notes': return { content: [{ type: 'text', text: JSON.stringify(await client.listNotes(args.notesection_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_note': return { content: [{ type: 'text', text: JSON.stringify(await client.createNote({ title: args.title, notesection: args.notesection_id, content: args.content }), null, 2) }] };
      case 'worldanvil_update_note': return { content: [{ type: 'text', text: JSON.stringify(await client.updateNote(args.note_id, { title: args.title, content: args.content }), null, 2) }] };
      case 'worldanvil_delete_note': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteNote(args.note_id), null, 2) }] };

      // SECRETS
      case 'worldanvil_get_secret': return { content: [{ type: 'text', text: JSON.stringify(await client.getSecret(args.secret_id), null, 2) }] };
      case 'worldanvil_list_secrets': return { content: [{ type: 'text', text: JSON.stringify(await client.listSecrets(args.world_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_secret': return { content: [{ type: 'text', text: JSON.stringify(await client.createSecret({ title: args.title, world: args.world_id, content: args.content }), null, 2) }] };
      case 'worldanvil_update_secret': return { content: [{ type: 'text', text: JSON.stringify(await client.updateSecret(args.secret_id, { title: args.title, content: args.content }), null, 2) }] };
      case 'worldanvil_delete_secret': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteSecret(args.secret_id), null, 2) }] };

      // MAPS
      case 'worldanvil_get_map': return { content: [{ type: 'text', text: JSON.stringify(await client.getMap(args.map_id), null, 2) }] };
      case 'worldanvil_list_maps': return { content: [{ type: 'text', text: JSON.stringify(await client.listMaps(args.world_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_map': return { content: [{ type: 'text', text: JSON.stringify(await client.createMap({ title: args.title, world: args.world_id }), null, 2) }] };
      case 'worldanvil_update_map': return { content: [{ type: 'text', text: JSON.stringify(await client.updateMap(args.map_id, { title: args.title }), null, 2) }] };
      case 'worldanvil_delete_map': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteMap(args.map_id), null, 2) }] };

      // MAP MARKERS
      case 'worldanvil_get_marker': return { content: [{ type: 'text', text: JSON.stringify(await client.getMarker(args.marker_id), null, 2) }] };
      case 'worldanvil_list_markers': return { content: [{ type: 'text', text: JSON.stringify(await client.listMarkers(args.map_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_marker': return { content: [{ type: 'text', text: JSON.stringify(await client.createMarker({ title: args.title, map: args.map_id }), null, 2) }] };
      case 'worldanvil_update_marker': return { content: [{ type: 'text', text: JSON.stringify(await client.updateMarker(args.marker_id, { title: args.title }), null, 2) }] };
      case 'worldanvil_delete_marker': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteMarker(args.marker_id), null, 2) }] };

      // TIMELINES
      case 'worldanvil_get_timeline': return { content: [{ type: 'text', text: JSON.stringify(await client.getTimeline(args.timeline_id), null, 2) }] };
      case 'worldanvil_list_timelines': return { content: [{ type: 'text', text: JSON.stringify(await client.listTimelines(args.world_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_timeline': return { content: [{ type: 'text', text: JSON.stringify(await client.createTimeline({ title: args.title, world: args.world_id }), null, 2) }] };
      case 'worldanvil_update_timeline': return { content: [{ type: 'text', text: JSON.stringify(await client.updateTimeline(args.timeline_id, { title: args.title }), null, 2) }] };
      case 'worldanvil_delete_timeline': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteTimeline(args.timeline_id), null, 2) }] };

      // HISTORY EVENTS
      case 'worldanvil_get_history': return { content: [{ type: 'text', text: JSON.stringify(await client.getHistory(args.history_id), null, 2) }] };
      case 'worldanvil_list_histories': return { content: [{ type: 'text', text: JSON.stringify(await client.listHistories(args.world_id, { offset: args.offset, limit: args.limit }), null, 2) }] };
      case 'worldanvil_create_history': return { content: [{ type: 'text', text: JSON.stringify(await client.createHistory({ title: args.title, world: args.world_id, content: args.content }), null, 2) }] };
      case 'worldanvil_update_history': return { content: [{ type: 'text', text: JSON.stringify(await client.updateHistory(args.history_id, { title: args.title, content: args.content }), null, 2) }] };
      case 'worldanvil_delete_history': return { content: [{ type: 'text', text: JSON.stringify(await client.deleteHistory(args.history_id), null, 2) }] };

      // RPG SYSTEMS
      case 'worldanvil_get_rpgsystem': return { content: [{ type: 'text', text: JSON.stringify(await client.getRpgSystem(args.rpgsystem_id), null, 2) }] };
      case 'worldanvil_list_rpgsystems': return { content: [{ type: 'text', text: JSON.stringify(await client.listRpgSystems({ offset: args.offset, limit: args.limit }), null, 2) }] };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('World Anvil MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
