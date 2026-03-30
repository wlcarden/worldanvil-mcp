/**
 * World Anvil MCP Server - API Client
 *
 * HTTP client for World Anvil Boromir API.
 */

import https from "https";

// Configuration defaults
const DEFAULT_API_BASE = "www.worldanvil.com";
const DEFAULT_API_PATH = "/api/external/boromir";
const DEFAULT_PROXY_URL = "https://worldanvil-proxy.onrender.com";

/**
 * World Anvil API Client
 *
 * Provides methods for all World Anvil Boromir API endpoints.
 * Supports two modes:
 *   - Direct mode: Uses appKey + authToken to call WorldAnvil directly
 *   - Proxy mode: Uses proxyUrl + authToken, proxy injects appKey
 */
export class WorldAnvilClient {
  /**
   * Create a new World Anvil API client
   *
   * @param {Object} config - Client configuration
   * @param {string} [config.appKey] - World Anvil Application Key (optional if using proxyUrl)
   * @param {string} config.authToken - World Anvil User Authentication Token (always required)
   * @param {string} [config.proxyUrl] - Cloudflare Worker proxy URL (optional, used if appKey not provided)
   * @param {string} [config.apiBase] - API hostname (default: www.worldanvil.com, auto-set in proxy mode)
   * @param {string} [config.apiPath] - API path prefix (default: /api/external/boromir, empty in proxy mode)
   */
  constructor(config = {}) {
    this.authToken = config.authToken || process.env.WA_AUTH_TOKEN;

    // Check for authToken first - always required
    if (!this.authToken) {
      throw new Error("WA_AUTH_TOKEN is required");
    }

    // Determine mode: direct (with appKey) or proxy (with proxyUrl)
    const appKey = config.appKey || process.env.WA_APP_KEY;
    const proxyUrl = config.proxyUrl || process.env.WA_PROXY_URL;

    if (appKey) {
      // Direct mode - use appKey, ignore proxyUrl if both provided
      this.appKey = appKey;
      this.proxyUrl = undefined;
      this.apiBase = config.apiBase || DEFAULT_API_BASE;
      this.apiPath = config.apiPath || DEFAULT_API_PATH;
    } else if (proxyUrl) {
      // Proxy mode - parse proxyUrl, proxy will inject appKey
      this.appKey = undefined;
      // Normalize URL: strip trailing slash
      const normalizedUrl = proxyUrl.replace(/\/$/, "");
      this.proxyUrl = normalizedUrl;

      // Parse proxy URL to extract hostname
      try {
        const parsed = new URL(normalizedUrl);
        this.apiBase = parsed.hostname;
        // Proxy handles the /api/external/boromir path prefix
        this.apiPath = "";
        // Store protocol for request (http vs https)
        this.useHttps = parsed.protocol === "https:";
      } catch (e) {
        throw new Error(`Invalid WA_PROXY_URL: ${proxyUrl}`);
      }
    } else {
      // Neither appKey nor custom proxyUrl - use default proxy
      this.appKey = undefined;
      this.proxyUrl = DEFAULT_PROXY_URL;

      // Parse default proxy URL
      const parsed = new URL(DEFAULT_PROXY_URL);
      this.apiBase = parsed.hostname;
      this.apiPath = "";
      this.useHttps = parsed.protocol === "https:";
    }
  }

  /**
   * Make a request to the World Anvil API
   *
   * @param {string} endpoint - API endpoint path
   * @param {string} [method='GET'] - HTTP method
   * @param {Object} [body=null] - Request body for POST/PUT/PATCH
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, method = "GET", body = null) {
    return new Promise((resolve, reject) => {
      const postData = body ? JSON.stringify(body) : "";

      // Build headers - only include x-application-key in direct mode
      const headers = {
        "x-auth-token": this.authToken,
        Accept: "application/json",
        "User-Agent": "WorldAnvil-MCP/1.0",
      };

      // Only add app key header in direct mode (proxy injects it)
      if (this.appKey) {
        headers["x-application-key"] = this.appKey;
      }

      const options = {
        hostname: this.apiBase,
        path: `${this.apiPath}${endpoint}`,
        method: method,
        headers: headers,
        timeout: 30000,
      };

      if (method === "POST" || method === "PUT" || method === "PATCH") {
        options.headers["Content-Type"] = "application/json";
        options.headers["Content-Length"] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              // Properly serialize error objects for debugging
              const errorMsg = parsed.error
                ? typeof parsed.error === "object"
                  ? JSON.stringify(parsed.error)
                  : parsed.error
                : typeof parsed === "object"
                  ? JSON.stringify(parsed)
                  : data;
              reject(new Error(`API Error (${res.statusCode}): ${errorMsg}`));
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

      req.on("error", (e) => {
        reject(new Error(`Network Error: ${e.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout: no response within 30000ms"));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  // ===== IDENTITY =====

  /**
   * Get the current user's identity
   */
  async getIdentity() {
    return this.request("/identity");
  }

  // ===== WORLDS =====

  /**
   * List user's worlds
   * Note: Uses POST method per WorldAnvil API design
   */
  async listWorlds() {
    // First get the user identity to get the user ID
    const identity = await this.getIdentity();
    const userId = identity.id;

    // Then request worlds with user ID as query parameter
    return this.request(`/user/worlds?id=${userId}`, "POST", {});
  }

  /**
   * Get a specific world by ID
   * Uses granularity=2 for full data with all relationships
   */
  async getWorld(worldId) {
    return this.request(`/world?id=${worldId}&granularity=2`);
  }

  /**
   * Create a new world
   */
  async createWorld(data) {
    return this.request("/world", "PUT", data);
  }

  /**
   * Update an existing world
   */
  async updateWorld(worldId, data) {
    return this.request(`/world?id=${worldId}`, "PATCH", data);
  }

  /**
   * Delete a world
   */
  async deleteWorld(worldId) {
    return this.request(`/world?id=${worldId}`, "DELETE");
  }

  // ===== ARTICLES =====

  /**
   * List articles in a world
   */
  async listArticles(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };

    if (options.category !== undefined) {
      body.category = options.category;
    } else {
      body.category = { id: "-1" };
    }

    return this.request(`/world/articles?id=${worldId}`, "POST", body);
  }

  /**
   * Get a specific article
   * Uses granularity=2 to get full content including vignette (content field)
   */
  async getArticle(articleId) {
    return this.request(`/article?id=${articleId}&granularity=2`);
  }

  /**
   * Create a new article
   */
  async createArticle(data) {
    return this.request("/article", "PUT", data);
  }

  /**
   * Update an existing article
   */
  async updateArticle(articleId, data) {
    return this.request(`/article?id=${articleId}`, "PATCH", data);
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId) {
    return this.request(`/article?id=${articleId}`, "DELETE");
  }

  // ===== CATEGORIES =====

  /**
   * List categories in a world
   */
  async listCategories(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };

    return this.request(`/world/categories?id=${worldId}`, "POST", body);
  }

  /**
   * Get a specific category
   * Uses granularity=2 for full data with all relationships
   */
  async getCategory(categoryId) {
    return this.request(`/category?id=${categoryId}&granularity=2`);
  }

  /**
   * Create a new category
   */
  async createCategory(data) {
    return this.request("/category", "PUT", data);
  }

  /**
   * Update an existing category
   */
  async updateCategory(categoryId, data) {
    return this.request(`/category?id=${categoryId}`, "PATCH", data);
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId) {
    return this.request(`/category?id=${categoryId}`, "DELETE");
  }

  // ===== IMAGES =====

  /**
   * List images in a world
   */
  async listImages(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };

    return this.request(`/world/images?id=${worldId}`, "POST", body);
  }

  // ===== NOTEBOOKS =====

  async getNotebook(notebookId) {
    return this.request(`/notebook?id=${notebookId}&granularity=2`);
  }

  async listNotebooks(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/notebooks?id=${worldId}`, "POST", body);
  }

  async createNotebook(data) {
    return this.request("/notebook", "PUT", data);
  }

  async updateNotebook(notebookId, data) {
    return this.request(`/notebook?id=${notebookId}`, "PATCH", data);
  }

  async deleteNotebook(notebookId) {
    return this.request(`/notebook?id=${notebookId}`, "DELETE");
  }

  // ===== NOTE SECTIONS =====

  async getNotesection(notesectionId) {
    return this.request(`/notesection?id=${notesectionId}&granularity=2`);
  }

  async listNotesections(notebookId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/notebook/notesections?id=${notebookId}`,
      "POST",
      body,
    );
  }

  async createNotesection(data) {
    return this.request("/notesection", "PUT", data);
  }

  async updateNotesection(notesectionId, data) {
    return this.request(`/notesection?id=${notesectionId}`, "PATCH", data);
  }

  async deleteNotesection(notesectionId) {
    return this.request(`/notesection?id=${notesectionId}`, "DELETE");
  }

  // ===== NOTES =====

  async getNote(noteId) {
    return this.request(`/note?id=${noteId}&granularity=2`);
  }

  async listNotes(notesectionId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/notesection/notes?id=${notesectionId}`, "POST", body);
  }

  async createNote(data) {
    return this.request("/note", "PUT", data);
  }

  async updateNote(noteId, data) {
    return this.request(`/note?id=${noteId}`, "PATCH", data);
  }

  async deleteNote(noteId) {
    return this.request(`/note?id=${noteId}`, "DELETE");
  }

  // ===== SECRETS =====

  async getSecret(secretId) {
    return this.request(`/secret?id=${secretId}&granularity=2`);
  }

  async listSecrets(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/secrets?id=${worldId}`, "POST", body);
  }

  async createSecret(data) {
    return this.request("/secret", "PUT", data);
  }

  async updateSecret(secretId, data) {
    return this.request(`/secret?id=${secretId}`, "PATCH", data);
  }

  async deleteSecret(secretId) {
    return this.request(`/secret?id=${secretId}`, "DELETE");
  }

  // ===== MAPS =====

  async getMap(mapId) {
    return this.request(`/map?id=${mapId}&granularity=2`);
  }

  async listMaps(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/maps?id=${worldId}`, "POST", body);
  }

  async createMap(data) {
    return this.request("/map", "PUT", data);
  }

  async updateMap(mapId, data) {
    return this.request(`/map?id=${mapId}`, "PATCH", data);
  }

  async deleteMap(mapId) {
    return this.request(`/map?id=${mapId}`, "DELETE");
  }

  // ===== MAP MARKERS =====

  async getMarker(markerId) {
    return this.request(`/marker?id=${markerId}&granularity=2`);
  }

  async listMarkers(mapId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/map/markers?id=${mapId}`, "POST", body);
  }

  async createMarker(data) {
    return this.request("/marker", "PUT", data);
  }

  async updateMarker(markerId, data) {
    return this.request(`/marker?id=${markerId}`, "PATCH", data);
  }

  async deleteMarker(markerId) {
    return this.request(`/marker?id=${markerId}`, "DELETE");
  }

  // ===== TIMELINES =====

  async getTimeline(timelineId) {
    return this.request(`/timeline?id=${timelineId}&granularity=2`);
  }

  async listTimelines(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/timelines?id=${worldId}`, "POST", body);
  }

  async createTimeline(data) {
    return this.request("/timeline", "PUT", data);
  }

  async updateTimeline(timelineId, data) {
    return this.request(`/timeline?id=${timelineId}`, "PATCH", data);
  }

  async deleteTimeline(timelineId) {
    return this.request(`/timeline?id=${timelineId}`, "DELETE");
  }

  // ===== HISTORY EVENTS =====

  async getHistory(historyId) {
    return this.request(`/history?id=${historyId}&granularity=2`);
  }

  async listHistories(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/histories?id=${worldId}`, "POST", body);
  }

  async createHistory(data) {
    return this.request("/history", "PUT", data);
  }

  async updateHistory(historyId, data) {
    return this.request(`/history?id=${historyId}`, "PATCH", data);
  }

  async deleteHistory(historyId) {
    return this.request(`/history?id=${historyId}`, "DELETE");
  }

  // ===== RPG SYSTEMS =====

  async getRpgSystem(rpgSystemId) {
    return this.request(`/rpgsystem?id=${rpgSystemId}`);
  }

  async listRpgSystems(options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request("/rpgsystems", "POST", body);
  }

  // ===== BLOCKS & BLOCK FOLDERS =====

  async getBlock(blockId) {
    return this.request(`/block?id=${blockId}&granularity=2`);
  }

  async listBlocks(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/blocks?id=${worldId}`, "POST", body);
  }

  async listBlocksInFolder(blockFolderId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/blockfolder/blocks?id=${blockFolderId}`,
      "POST",
      body,
    );
  }

  async createBlock(data) {
    return this.request("/block", "PUT", data);
  }

  async updateBlock(blockId, data) {
    return this.request(`/block?id=${blockId}`, "PATCH", data);
  }

  async deleteBlock(blockId) {
    return this.request(`/block?id=${blockId}`, "DELETE");
  }

  async getBlockFolder(blockFolderId) {
    return this.request(`/blockfolder?id=${blockFolderId}&granularity=2`);
  }

  async listBlockFolders(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/blockfolders?id=${worldId}`, "POST", body);
  }

  async createBlockFolder(data) {
    return this.request("/blockfolder", "PUT", data);
  }

  async updateBlockFolder(blockFolderId, data) {
    return this.request(`/blockfolder?id=${blockFolderId}`, "PATCH", data);
  }

  async deleteBlockFolder(blockFolderId) {
    return this.request(`/blockfolder?id=${blockFolderId}`, "DELETE");
  }

  // ===== BLOCK TEMPLATES =====

  async getBlockTemplate(templateId) {
    return this.request(`/blocktemplate?id=${templateId}&granularity=2`);
  }

  async listBlockTemplates(userId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/user/blocktemplates?id=${userId}`, "POST", body);
  }

  async createBlockTemplate(data) {
    return this.request("/blocktemplate", "PUT", data);
  }

  async updateBlockTemplate(templateId, data) {
    return this.request(`/blocktemplate?id=${templateId}`, "PATCH", data);
  }

  async deleteBlockTemplate(templateId) {
    return this.request(`/blocktemplate?id=${templateId}`, "DELETE");
  }

  // ===== BLOCK TEMPLATE PARTS =====

  async getBlockTemplatePart(partId) {
    return this.request(`/blocktemplatepart?id=${partId}&granularity=2`);
  }

  async listBlockTemplateParts(templateId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/blocktemplate/blocktemplateparts?id=${templateId}`,
      "POST",
      body,
    );
  }

  async createBlockTemplatePart(data) {
    return this.request("/blocktemplatepart", "PUT", data);
  }

  async updateBlockTemplatePart(partId, data) {
    return this.request(`/blocktemplatepart?id=${partId}`, "PATCH", data);
  }

  async deleteBlockTemplatePart(partId) {
    return this.request(`/blocktemplatepart?id=${partId}`, "DELETE");
  }

  // ===== MANUSCRIPTS =====

  async getManuscript(manuscriptId) {
    return this.request(`/manuscript?id=${manuscriptId}&granularity=2`);
  }

  async listManuscripts(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/manuscripts?id=${worldId}`, "POST", body);
  }

  async createManuscript(data) {
    return this.request("/manuscript", "PUT", data);
  }

  async updateManuscript(manuscriptId, data) {
    return this.request(`/manuscript?id=${manuscriptId}`, "PATCH", data);
  }

  async deleteManuscript(manuscriptId) {
    return this.request(`/manuscript?id=${manuscriptId}`, "DELETE");
  }

  // ===== CANVAS (Visual Boards) =====

  async getCanvas(canvasId) {
    return this.request(`/canvas?id=${canvasId}&granularity=2`);
  }

  async listCanvases(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/canvases?id=${worldId}`, "POST", body);
  }

  async createCanvas(data) {
    return this.request("/canvas", "PUT", data);
  }

  async updateCanvas(canvasId, data) {
    return this.request(`/canvas?id=${canvasId}`, "PATCH", data);
  }

  async deleteCanvas(canvasId) {
    return this.request(`/canvas?id=${canvasId}`, "DELETE");
  }

  // ===== SUBSCRIBER GROUPS =====

  async getSubscriberGroup(subscriberGroupId) {
    return this.request(
      `/subscribergroup?id=${subscriberGroupId}&granularity=2`,
    );
  }

  async listSubscriberGroups(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/world/subscribergroups?id=${worldId}`, "POST", body);
  }

  async createSubscriberGroup(data) {
    return this.request("/subscribergroup", "PUT", data);
  }

  async updateSubscriberGroup(subscriberGroupId, data) {
    return this.request(
      `/subscribergroup?id=${subscriberGroupId}`,
      "PATCH",
      data,
    );
  }

  async deleteSubscriberGroup(subscriberGroupId) {
    return this.request(`/subscribergroup?id=${subscriberGroupId}`, "DELETE");
  }

  // ===== VARIABLE COLLECTIONS =====
  // Note: Swagger shows /variable_collection but API uses /variablecollection

  async getVariableCollection(collectionId, granularity = 2) {
    return this.request(
      `/variablecollection?id=${collectionId}&granularity=${granularity}`,
    );
  }

  async listVariableCollections(worldId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/world/variablecollections?id=${worldId}`,
      "POST",
      body,
    );
  }

  async createVariableCollection(data) {
    return this.request("/variablecollection", "PUT", data);
  }

  async updateVariableCollection(collectionId, data) {
    return this.request(
      `/variablecollection?id=${collectionId}`,
      "PATCH",
      data,
    );
  }

  async deleteVariableCollection(collectionId) {
    return this.request(`/variablecollection?id=${collectionId}`, "DELETE");
  }

  // ===== VARIABLES =====

  async getVariable(variableId, granularity = 2) {
    return this.request(
      `/variable?id=${variableId}&granularity=${granularity}`,
    );
  }

  async listVariables(collectionId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    // Swagger shows /variable_collection/variables but API may use /variablecollection/variables
    return this.request(
      `/variablecollection/variables?id=${collectionId}`,
      "POST",
      body,
    );
  }

  async createVariable(data) {
    return this.request("/variable", "PUT", data);
  }

  async updateVariable(variableId, data) {
    return this.request(`/variable?id=${variableId}`, "PATCH", data);
  }

  async deleteVariable(variableId) {
    return this.request(`/variable?id=${variableId}`, "DELETE");
  }

  // ===== MAP LAYERS =====

  async getLayer(layerId) {
    return this.request(`/layer?id=${layerId}&granularity=2`);
  }

  async listLayers(mapId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/map/layers?id=${mapId}`, "POST", body);
  }

  async createLayer(data) {
    return this.request("/layer", "PUT", data);
  }

  async updateLayer(layerId, data) {
    return this.request(`/layer?id=${layerId}`, "PATCH", data);
  }

  async deleteLayer(layerId) {
    return this.request(`/layer?id=${layerId}`, "DELETE");
  }

  // ===== MARKER GROUPS =====

  async getMarkerGroup(markerGroupId) {
    return this.request(`/markergroup?id=${markerGroupId}&granularity=2`);
  }

  async listMarkerGroups(mapId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(`/map/markergroups?id=${mapId}`, "POST", body);
  }

  async listMarkersInGroup(markerGroupId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/markergroup/markers?id=${markerGroupId}`,
      "POST",
      body,
    );
  }

  async createMarkerGroup(data) {
    return this.request("/markergroup", "PUT", data);
  }

  async updateMarkerGroup(markerGroupId, data) {
    return this.request(`/markergroup?id=${markerGroupId}`, "PATCH", data);
  }

  async deleteMarkerGroup(markerGroupId) {
    return this.request(`/markergroup?id=${markerGroupId}`, "DELETE");
  }

  // ===== MARKER TYPES =====

  async getMarkerType(markerTypeId) {
    return this.request(`/markertype?id=${markerTypeId}&granularity=2`);
  }

  async listMarkerTypes(options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request("/markertypes", "POST", body);
  }

  async createMarkerType(data) {
    return this.request("/markertype", "PUT", data);
  }

  async updateMarkerType(markerTypeId, data) {
    return this.request(`/markertype?id=${markerTypeId}`, "PATCH", data);
  }

  async deleteMarkerType(markerTypeId) {
    return this.request(`/markertype?id=${markerTypeId}`, "DELETE");
  }

  // ===== USERS =====

  async getUser(userId) {
    return this.request(`/user?id=${userId}&granularity=2`);
  }

  async updateUser(userId, data) {
    return this.request(`/user?id=${userId}`, "PATCH", data);
  }

  // ===== IMAGES (single resource) =====

  async getImage(imageId) {
    return this.request(`/image?id=${imageId}&granularity=2`);
  }

  async updateImage(imageId, data) {
    return this.request(`/image?id=${imageId}`, "PATCH", data);
  }

  async deleteImage(imageId) {
    return this.request(`/image?id=${imageId}`, "DELETE");
  }

  // ===== MANUSCRIPT VERSIONS =====
  // Note: Swagger shows /manuscript_version with underscore

  async getManuscriptVersion(versionId) {
    return this.request(`/manuscript_version?id=${versionId}&granularity=2`);
  }

  async listManuscriptVersions(manuscriptId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript/manuscript_versions?id=${manuscriptId}`,
      "POST",
      body,
    );
  }

  async createManuscriptVersion(data) {
    return this.request("/manuscript_version", "PUT", data);
  }

  async updateManuscriptVersion(versionId, data) {
    return this.request(`/manuscript_version?id=${versionId}`, "PATCH", data);
  }

  async deleteManuscriptVersion(versionId) {
    return this.request(`/manuscript_version?id=${versionId}`, "DELETE");
  }

  // ===== MANUSCRIPT PARTS =====

  async getManuscriptPart(partId) {
    return this.request(`/manuscript_part?id=${partId}&granularity=2`);
  }

  async listManuscriptParts(versionId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript_version/manuscript_parts?id=${versionId}`,
      "POST",
      body,
    );
  }

  async createManuscriptPart(data) {
    return this.request("/manuscript_part", "PUT", data);
  }

  async updateManuscriptPart(partId, data) {
    return this.request(`/manuscript_part?id=${partId}`, "PATCH", data);
  }

  async deleteManuscriptPart(partId) {
    return this.request(`/manuscript_part?id=${partId}`, "DELETE");
  }

  // ===== MANUSCRIPT BEATS =====

  async getManuscriptBeat(beatId) {
    return this.request(`/manuscript_beat?id=${beatId}&granularity=2`);
  }

  async listManuscriptBeats(partId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript_part/manuscript_beats?id=${partId}`,
      "POST",
      body,
    );
  }

  async createManuscriptBeat(data) {
    return this.request("/manuscript_beat", "PUT", data);
  }

  async updateManuscriptBeat(beatId, data) {
    return this.request(`/manuscript_beat?id=${beatId}`, "PATCH", data);
  }

  async deleteManuscriptBeat(beatId) {
    return this.request(`/manuscript_beat?id=${beatId}`, "DELETE");
  }

  // ===== MANUSCRIPT BOOKMARKS =====

  async getManuscriptBookmark(bookmarkId) {
    return this.request(`/manuscript_bookmark?id=${bookmarkId}&granularity=2`);
  }

  async listManuscriptBookmarks(manuscriptId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript/manuscript_bookmarks?id=${manuscriptId}`,
      "POST",
      body,
    );
  }

  async createManuscriptBookmark(data) {
    return this.request("/manuscript_bookmark", "PUT", data);
  }

  async updateManuscriptBookmark(bookmarkId, data) {
    return this.request(`/manuscript_bookmark?id=${bookmarkId}`, "PATCH", data);
  }

  async deleteManuscriptBookmark(bookmarkId) {
    return this.request(`/manuscript_bookmark?id=${bookmarkId}`, "DELETE");
  }

  // ===== MANUSCRIPT TAGS =====

  async getManuscriptTag(tagId) {
    return this.request(`/manuscript_tag?id=${tagId}&granularity=2`);
  }

  async listManuscriptTags(manuscriptId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript/manuscript_tags?id=${manuscriptId}`,
      "POST",
      body,
    );
  }

  async createManuscriptTag(data) {
    return this.request("/manuscript_tag", "PUT", data);
  }

  async updateManuscriptTag(tagId, data) {
    return this.request(`/manuscript_tag?id=${tagId}`, "PATCH", data);
  }

  async deleteManuscriptTag(tagId) {
    return this.request(`/manuscript_tag?id=${tagId}`, "DELETE");
  }

  // ===== MANUSCRIPT STATS =====

  async getManuscriptStat(statId) {
    return this.request(`/manuscript_stat?id=${statId}&granularity=2`);
  }

  async listManuscriptStats(versionId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript_version/manuscript_stats?id=${versionId}`,
      "POST",
      body,
    );
  }

  async createManuscriptStat(data) {
    return this.request("/manuscript_stat", "PUT", data);
  }

  async updateManuscriptStat(statId, data) {
    return this.request(`/manuscript_stat?id=${statId}`, "PATCH", data);
  }

  async deleteManuscriptStat(statId) {
    return this.request(`/manuscript_stat?id=${statId}`, "DELETE");
  }

  // ===== MANUSCRIPT LABELS =====

  async getManuscriptLabel(labelId) {
    return this.request(`/manuscript_label?id=${labelId}&granularity=2`);
  }

  async listManuscriptLabels(manuscriptId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript/manuscript_labels?id=${manuscriptId}`,
      "POST",
      body,
    );
  }

  async createManuscriptLabel(data) {
    return this.request("/manuscript_label", "PUT", data);
  }

  async updateManuscriptLabel(labelId, data) {
    return this.request(`/manuscript_label?id=${labelId}`, "PATCH", data);
  }

  async deleteManuscriptLabel(labelId) {
    return this.request(`/manuscript_label?id=${labelId}`, "DELETE");
  }

  // ===== MANUSCRIPT PLOTS =====

  async getManuscriptPlot(plotId) {
    return this.request(`/manuscript_plot?id=${plotId}&granularity=2`);
  }

  async listManuscriptPlots(versionId, options = {}) {
    const body = {
      limit: options.limit !== undefined ? String(options.limit) : "50",
      offset: options.offset !== undefined ? String(options.offset) : "0",
    };
    return this.request(
      `/manuscript_version/manuscript_plots?id=${versionId}`,
      "POST",
      body,
    );
  }

  async createManuscriptPlot(data) {
    return this.request("/manuscript_plot", "PUT", data);
  }

  async updateManuscriptPlot(plotId, data) {
    return this.request(`/manuscript_plot?id=${plotId}`, "PATCH", data);
  }

  async deleteManuscriptPlot(plotId) {
    return this.request(`/manuscript_plot?id=${plotId}`, "DELETE");
  }
}
