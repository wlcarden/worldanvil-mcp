/**
 * World Anvil MCP Server - Tool Definitions
 *
 * All MCP tool schemas for the World Anvil integration.
 */

/**
 * Get all tool definitions
 * @returns {Array} Array of tool definition objects
 */
export function getToolDefinitions() {
  return [
    // ===== IDENTITY & WORLDS =====
    {
      name: 'worldanvil_get_identity',
      description: 'Get the current authenticated user\'s identity and information',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'worldanvil_list_worlds',
      description: 'List all worlds belonging to the authenticated user',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'worldanvil_get_world',
      description: 'Get details about a specific world by its ID',
      inputSchema: {
        type: 'object',
        properties: {
          world_id: { type: 'string', description: 'The ID of the world to retrieve' },
        },
        required: ['world_id'],
      },
    },
    {
      name: 'worldanvil_create_world',
      description: 'Create a new world in WorldAnvil',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the world' },
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
          world_id: { type: 'string', description: 'The ID of the world to update' },
          title: { type: 'string', description: 'The new title of the world (optional)' },
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
          world_id: { type: 'string', description: 'The ID of the world to delete' },
        },
        required: ['world_id'],
      },
    },

    // ===== ARTICLES =====
    {
      name: 'worldanvil_list_articles',
      description: 'List articles in a specific world',
      inputSchema: {
        type: 'object',
        properties: {
          world_id: { type: 'string', description: 'The ID of the world to list articles from' },
          offset: { type: 'number', description: 'Pagination offset (optional)' },
          limit: { type: 'number', description: 'Maximum number of articles to return (optional)' },
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
          article_id: { type: 'string', description: 'The ID of the article to retrieve' },
        },
        required: ['article_id'],
      },
    },
    {
      name: 'worldanvil_create_article',
      description: 'Create a new article in WorldAnvil. Markdown is automatically converted to BBCode in both the content field AND all template-specific fields. Use the fields parameter to set template-specific fields like localization, manifestation, lawtype (for Law), anatomy, traits (for Species), seeded, authornotes, etc.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the article' },
          world_id: { type: 'string', description: 'The ID of the world to create the article in' },
          template: { type: 'string', description: 'The template type for the article. Use "article" for generic articles, or specific types like: law, species, ethnicity, material, document, technology, organization, location, character, item, etc.' },
          content: { type: 'string', description: 'The main content/intro of the article (markdown auto-converted to BBCode)' },
          icon: { type: 'string', description: 'FontAwesome or RPG-Awesome icon class (e.g., "fa-solid fa-dragon", "fa-solid fa-scroll", "ra ra-crystal-ball"). See fontawesome.com for icon names.' },
          fields: { type: 'object', description: 'Template-specific fields as key-value pairs. Markdown in all text fields is auto-converted to BBCode (e.g., manifestation, anatomy, seeded, authornotes, culture, etc.)', additionalProperties: true },
        },
        required: ['title', 'world_id'],
      },
    },
    {
      name: 'worldanvil_update_article',
      description: 'Update an existing article in WorldAnvil. Markdown is automatically converted to BBCode in both the content field AND all template-specific fields passed via the fields parameter.',
      inputSchema: {
        type: 'object',
        properties: {
          article_id: { type: 'string', description: 'The ID of the article to update' },
          title: { type: 'string', description: 'The new title of the article (optional)' },
          content: { type: 'string', description: 'The new main content of the article (markdown auto-converted to BBCode)' },
          icon: { type: 'string', description: 'FontAwesome or RPG-Awesome icon class (e.g., "fa-solid fa-dragon", "fa-solid fa-scroll", "ra ra-crystal-ball")' },
          fields: { type: 'object', description: 'Template-specific fields to update as key-value pairs. Markdown in all text fields is auto-converted to BBCode.', additionalProperties: true },
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
          article_id: { type: 'string', description: 'The ID of the article to delete' },
        },
        required: ['article_id'],
      },
    },

    // ===== CATEGORIES =====
    {
      name: 'worldanvil_list_categories',
      description: 'List categories in a specific world',
      inputSchema: {
        type: 'object',
        properties: {
          world_id: { type: 'string', description: 'The ID of the world to list categories from' },
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
          category_id: { type: 'string', description: 'The ID of the category to retrieve' },
        },
        required: ['category_id'],
      },
    },
    {
      name: 'worldanvil_create_category',
      description: 'Create a new category in WorldAnvil',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The title of the category' },
          world_id: { type: 'string', description: 'The ID of the world to create the category in' },
          icon: { type: 'string', description: 'FontAwesome or RPG-Awesome icon class (e.g., "fa-solid fa-folder-tree", "fa-solid fa-users")' },
        },
        required: ['title', 'world_id'],
      },
    },
    {
      name: 'worldanvil_update_category',
      description: 'Update an existing category in WorldAnvil. Markdown in content is auto-converted to BBCode.',
      inputSchema: {
        type: 'object',
        properties: {
          category_id: { type: 'string', description: 'The ID of the category to update' },
          title: { type: 'string', description: 'The new title of the category (optional)' },
          icon: { type: 'string', description: 'FontAwesome or RPG-Awesome icon class (e.g., "fa-solid fa-folder-tree", "fa-solid fa-users")' },
          content: { type: 'string', description: 'The main content of the category page (markdown auto-converted to BBCode, stored in custom1)' },
          excerpt: { type: 'string', description: 'A short teaser/summary for the category' },
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
          category_id: { type: 'string', description: 'The ID of the category to delete' },
        },
        required: ['category_id'],
      },
    },

    // ===== IMAGES =====
    {
      name: 'worldanvil_list_images',
      description: 'List images in a specific world',
      inputSchema: {
        type: 'object',
        properties: {
          world_id: { type: 'string', description: 'The ID of the world to list images from' },
          offset: { type: 'number', description: 'Pagination offset (optional)' },
          limit: { type: 'number', description: 'Maximum number of images to return (optional)' },
        },
        required: ['world_id'],
      },
    },

    // ===== NOTEBOOKS =====
    { name: 'worldanvil_get_notebook', description: 'Get notebook by ID', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string', description: 'Notebook ID' } }, required: ['notebook_id'] } },
    { name: 'worldanvil_list_notebooks', description: 'List notebooks in world (WARNING: API endpoint currently broken per WorldAnvil docs - use get_notebook with known IDs instead)', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
    { name: 'worldanvil_create_notebook', description: 'Create notebook', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] } },
    { name: 'worldanvil_update_notebook', description: 'Update notebook', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string' }, title: { type: 'string' } }, required: ['notebook_id'] } },
    { name: 'worldanvil_delete_notebook', description: 'Delete notebook', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string' } }, required: ['notebook_id'] } },

    // ===== NOTE SECTIONS =====
    { name: 'worldanvil_get_notesection', description: 'Get note section by ID', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string', description: 'Note section ID' } }, required: ['notesection_id'] } },
    { name: 'worldanvil_list_notesections', description: 'List note sections in notebook', inputSchema: { type: 'object', properties: { notebook_id: { type: 'string', description: 'Notebook ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['notebook_id'] } },
    { name: 'worldanvil_create_notesection', description: 'Create note section', inputSchema: { type: 'object', properties: { title: { type: 'string' }, notebook_id: { type: 'string' } }, required: ['title', 'notebook_id'] } },
    { name: 'worldanvil_update_notesection', description: 'Update note section', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string' }, title: { type: 'string' } }, required: ['notesection_id'] } },
    { name: 'worldanvil_delete_notesection', description: 'Delete note section', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string' } }, required: ['notesection_id'] } },

    // ===== NOTES =====
    { name: 'worldanvil_get_note', description: 'Get note by ID', inputSchema: { type: 'object', properties: { note_id: { type: 'string', description: 'Note ID' } }, required: ['note_id'] } },
    { name: 'worldanvil_list_notes', description: 'List notes in section', inputSchema: { type: 'object', properties: { notesection_id: { type: 'string', description: 'Note section ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['notesection_id'] } },
    { name: 'worldanvil_create_note', description: 'Create note', inputSchema: { type: 'object', properties: { title: { type: 'string' }, notesection_id: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'notesection_id'] } },
    { name: 'worldanvil_update_note', description: 'Update note', inputSchema: { type: 'object', properties: { note_id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['note_id'] } },
    { name: 'worldanvil_delete_note', description: 'Delete note', inputSchema: { type: 'object', properties: { note_id: { type: 'string' } }, required: ['note_id'] } },

    // ===== SECRETS =====
    { name: 'worldanvil_get_secret', description: 'Get secret by ID', inputSchema: { type: 'object', properties: { secret_id: { type: 'string', description: 'Secret ID' } }, required: ['secret_id'] } },
    { name: 'worldanvil_list_secrets', description: 'List secrets in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
    { name: 'worldanvil_create_secret', description: 'Create secret', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'world_id'] } },
    { name: 'worldanvil_update_secret', description: 'Update secret', inputSchema: { type: 'object', properties: { secret_id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['secret_id'] } },
    { name: 'worldanvil_delete_secret', description: 'Delete secret', inputSchema: { type: 'object', properties: { secret_id: { type: 'string' } }, required: ['secret_id'] } },

    // ===== MAPS =====
    { name: 'worldanvil_get_map', description: 'Get map by ID', inputSchema: { type: 'object', properties: { map_id: { type: 'string', description: 'Map ID' } }, required: ['map_id'] } },
    { name: 'worldanvil_list_maps', description: 'List maps in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
    { name: 'worldanvil_create_map', description: 'Create map', inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] } },
    { name: 'worldanvil_update_map', description: 'Update map', inputSchema: { type: 'object', properties: { map_id: { type: 'string' }, title: { type: 'string' } }, required: ['map_id'] } },
    { name: 'worldanvil_delete_map', description: 'Delete map', inputSchema: { type: 'object', properties: { map_id: { type: 'string' } }, required: ['map_id'] } },

    // ===== MAP MARKERS =====
    { name: 'worldanvil_get_marker', description: 'Get map marker by ID', inputSchema: { type: 'object', properties: { marker_id: { type: 'string', description: 'Marker ID' } }, required: ['marker_id'] } },
    { name: 'worldanvil_list_markers', description: 'List markers on map', inputSchema: { type: 'object', properties: { map_id: { type: 'string', description: 'Map ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['map_id'] } },
    { name: 'worldanvil_create_marker', description: 'Create map marker', inputSchema: { type: 'object', properties: { title: { type: 'string' }, map_id: { type: 'string' } }, required: ['title', 'map_id'] } },
    { name: 'worldanvil_update_marker', description: 'Update map marker', inputSchema: { type: 'object', properties: { marker_id: { type: 'string' }, title: { type: 'string' } }, required: ['marker_id'] } },
    { name: 'worldanvil_delete_marker', description: 'Delete map marker', inputSchema: { type: 'object', properties: { marker_id: { type: 'string' } }, required: ['marker_id'] } },

    // ===== TIMELINES =====
    { name: 'worldanvil_get_timeline', description: 'Get timeline by ID', inputSchema: { type: 'object', properties: { timeline_id: { type: 'string', description: 'Timeline ID' } }, required: ['timeline_id'] } },
    { name: 'worldanvil_list_timelines', description: 'List timelines in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
    {
      name: 'worldanvil_create_timeline',
      description: 'Create a timeline in a world',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Timeline title' },
          world_id: { type: 'string', description: 'World ID' },
          description: { type: 'string', description: 'Timeline description' },
          type: { type: 'string', enum: ['parallel', 'master'], description: 'Timeline type' },
          state: { type: 'string', enum: ['public', 'private'], description: 'Visibility state' },
          tags: { type: 'string', description: 'Comma-separated tags' },
        },
        required: ['title', 'world_id'],
      },
    },
    {
      name: 'worldanvil_update_timeline',
      description: 'Update an existing timeline. Use history_ids to attach history events to this timeline.',
      inputSchema: {
        type: 'object',
        properties: {
          timeline_id: { type: 'string', description: 'Timeline ID' },
          title: { type: 'string', description: 'Timeline title' },
          description: { type: 'string', description: 'Timeline description' },
          type: { type: 'string', enum: ['parallel', 'master'], description: 'Timeline type' },
          state: { type: 'string', enum: ['public', 'private'], description: 'Visibility state' },
          tags: { type: 'string', description: 'Comma-separated tags' },
          history_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of history events on this timeline. Replaces the full list — include all existing IDs alongside any new ones to avoid losing previously attached events.' },
        },
        required: ['timeline_id'],
      },
    },
    { name: 'worldanvil_delete_timeline', description: 'Delete timeline', inputSchema: { type: 'object', properties: { timeline_id: { type: 'string' } }, required: ['timeline_id'] } },

    // ===== HISTORY EVENTS =====
    { name: 'worldanvil_get_history', description: 'Get history event by ID', inputSchema: { type: 'object', properties: { history_id: { type: 'string', description: 'History event ID' } }, required: ['history_id'] } },
    { name: 'worldanvil_list_histories', description: 'List history events in world', inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] } },
    {
      name: 'worldanvil_create_history',
      description: 'Create a history event (timeline entry). year is required by the WorldAnvil API. After creating, call worldanvil_update_timeline with history_ids to attach the event to a timeline.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Event title' },
          world_id: { type: 'string', description: 'World ID' },
          year: { type: 'string', description: 'Year of the event, e.g. "1247". Required by WorldAnvil API.' },
          month: { type: 'integer', description: 'Month of the event (1-12)' },
          day: { type: 'integer', description: 'Day of the event' },
          hour: { type: 'integer', description: 'Hour of the event' },
          endingYear: { type: 'string', description: 'End year for ranged/era events' },
          endingMonth: { type: 'integer', description: 'End month for ranged events' },
          endingDay: { type: 'integer', description: 'End day for ranged events' },
          endingHour: { type: 'integer', description: 'End hour for ranged events' },
          significance: { type: 'integer', minimum: 0, maximum: 5, description: 'Importance rating (0-5)' },
          state: { type: 'string', enum: ['public', 'private'], description: 'Visibility state' },
          tags: { type: 'string', description: 'Comma-separated tags' },
          content: { type: 'string', description: 'Short summary/description of the event' },
          fullcontent: { type: 'string', description: 'Full content body (Markdown is auto-converted to BBCode)' },
          displayDateName: { type: 'string', description: 'Custom display name for the date' },
          displayRange: { type: 'boolean', description: 'Whether to display the date range' },
          alternativeDisplayRange: { type: 'string', description: 'Custom date range display text' },
          article_id: { type: 'string', description: 'ID of a linked article' },
          location_id: { type: 'string', description: 'ID of a linked location article' },
          character_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of linked character articles' },
          organization_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of linked organization articles' },
        },
        required: ['title', 'world_id', 'year'],
      },
    },
    {
      name: 'worldanvil_update_history',
      description: 'Update an existing history event',
      inputSchema: {
        type: 'object',
        properties: {
          history_id: { type: 'string', description: 'History event ID' },
          title: { type: 'string', description: 'Event title' },
          year: { type: 'string', description: 'Year of the event' },
          month: { type: 'integer', description: 'Month of the event (1-12)' },
          day: { type: 'integer', description: 'Day of the event' },
          hour: { type: 'integer', description: 'Hour of the event' },
          endingYear: { type: 'string', description: 'End year for ranged/era events' },
          endingMonth: { type: 'integer', description: 'End month for ranged events' },
          endingDay: { type: 'integer', description: 'End day for ranged events' },
          endingHour: { type: 'integer', description: 'End hour for ranged events' },
          significance: { type: 'integer', minimum: 0, maximum: 5, description: 'Importance rating (0-5)' },
          state: { type: 'string', enum: ['public', 'private'], description: 'Visibility state' },
          tags: { type: 'string', description: 'Comma-separated tags' },
          content: { type: 'string', description: 'Short summary/description of the event' },
          fullcontent: { type: 'string', description: 'Full content body (Markdown is auto-converted to BBCode)' },
          displayDateName: { type: 'string', description: 'Custom display name for the date' },
          displayRange: { type: 'boolean', description: 'Whether to display the date range' },
          alternativeDisplayRange: { type: 'string', description: 'Custom date range display text' },
          article_id: { type: 'string', description: 'ID of a linked article' },
          location_id: { type: 'string', description: 'ID of a linked location article' },
          character_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of linked character articles' },
          organization_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of linked organization articles' },
        },
        required: ['history_id'],
      },
    },
    { name: 'worldanvil_delete_history', description: 'Delete history event', inputSchema: { type: 'object', properties: { history_id: { type: 'string' } }, required: ['history_id'] } },

    // ===== RPG SYSTEMS =====
    { name: 'worldanvil_get_rpgsystem', description: 'Get RPG system by ID', inputSchema: { type: 'object', properties: { rpgsystem_id: { type: 'string', description: 'RPG system ID' } }, required: ['rpgsystem_id'] } },
    { name: 'worldanvil_list_rpgsystems', description: 'List all RPG systems', inputSchema: { type: 'object', properties: { offset: { type: 'number' }, limit: { type: 'number' } } } },

    // ===== BLOCKS =====
    {
      name: 'worldanvil_get_block',
      description: 'Get a reusable content block by ID',
      inputSchema: { type: 'object', properties: { block_id: { type: 'string', description: 'Block ID' } }, required: ['block_id'] }
    },
    {
      name: 'worldanvil_list_blocks',
      description: 'List all blocks in a world',
      inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] }
    },
    {
      name: 'worldanvil_list_blocks_in_folder',
      description: 'List blocks within a specific block folder',
      inputSchema: { type: 'object', properties: { blockfolder_id: { type: 'string', description: 'Block folder ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['blockfolder_id'] }
    },
    {
      name: 'worldanvil_create_block',
      description: 'Create a new statblock/content block. Requires a BlockTemplate ID (templates define the block structure).',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, template_id: { type: 'number', description: 'ID of the BlockTemplate to use (required - create templates via WorldAnvil web UI)' }, folder_id: { type: 'number', description: 'Optional BlockFolder ID to organize the block' } }, required: ['title', 'template_id'] }
    },
    {
      name: 'worldanvil_update_block',
      description: 'Update an existing block',
      inputSchema: { type: 'object', properties: { block_id: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['block_id'] }
    },
    {
      name: 'worldanvil_delete_block',
      description: 'Delete a block',
      inputSchema: { type: 'object', properties: { block_id: { type: 'string' } }, required: ['block_id'] }
    },

    // ===== BLOCK FOLDERS =====
    {
      name: 'worldanvil_get_blockfolder',
      description: 'Get a block folder by ID',
      inputSchema: { type: 'object', properties: { blockfolder_id: { type: 'string', description: 'Block folder ID' } }, required: ['blockfolder_id'] }
    },
    {
      name: 'worldanvil_list_blockfolders',
      description: 'List all block folders in a world',
      inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] }
    },
    {
      name: 'worldanvil_create_blockfolder',
      description: 'Create a new block folder',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] }
    },
    {
      name: 'worldanvil_update_blockfolder',
      description: 'Update a block folder',
      inputSchema: { type: 'object', properties: { blockfolder_id: { type: 'string' }, title: { type: 'string' } }, required: ['blockfolder_id'] }
    },
    {
      name: 'worldanvil_delete_blockfolder',
      description: 'Delete a block folder',
      inputSchema: { type: 'object', properties: { blockfolder_id: { type: 'string' } }, required: ['blockfolder_id'] }
    },

    // ===== BLOCK TEMPLATES =====
    {
      name: 'worldanvil_get_blocktemplate',
      description: 'Get a block template by ID. Block templates define the structure/fields for statblocks.',
      inputSchema: { type: 'object', properties: { template_id: { type: 'number', description: 'Block template ID' } }, required: ['template_id'] }
    },
    {
      name: 'worldanvil_list_blocktemplates',
      description: 'List all block templates belonging to a user',
      inputSchema: { type: 'object', properties: { user_id: { type: 'string', description: 'User ID (from get_identity)' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['user_id'] }
    },
    {
      name: 'worldanvil_create_blocktemplate',
      description: 'Create a new block template',
      inputSchema: { type: 'object', properties: { title: { type: 'string', description: 'Template name' } }, required: ['title'] }
    },
    {
      name: 'worldanvil_update_blocktemplate',
      description: 'Update a block template',
      inputSchema: { type: 'object', properties: { template_id: { type: 'number' }, title: { type: 'string' } }, required: ['template_id'] }
    },
    {
      name: 'worldanvil_delete_blocktemplate',
      description: 'Delete a block template (also deletes all its parts)',
      inputSchema: { type: 'object', properties: { template_id: { type: 'number' } }, required: ['template_id'] }
    },

    // ===== BLOCK TEMPLATE PARTS =====
    {
      name: 'worldanvil_get_blocktemplatepart',
      description: 'Get a block template part by ID',
      inputSchema: { type: 'object', properties: { part_id: { type: 'number', description: 'Block template part ID' } }, required: ['part_id'] }
    },
    {
      name: 'worldanvil_list_blocktemplateparts',
      description: 'List all parts in a block template (WARNING: API has server-side bug - use get_blocktemplate with granularity=2 instead)',
      inputSchema: { type: 'object', properties: { template_id: { type: 'number', description: 'Block template ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['template_id'] }
    },
    {
      name: 'worldanvil_create_blocktemplatepart',
      description: 'Create a new part/field in a block template',
      inputSchema: {
        type: 'object',
        properties: {
          template_id: { type: 'number', description: 'Parent block template ID' },
          title: { type: 'string', description: 'Field label' },
          type: { type: 'string', description: 'Field type (e.g., text, number, textarea)' },
          description: { type: 'string', description: 'Help text for the field' },
          placeholder: { type: 'string', description: 'Placeholder text' },
          required: { type: 'number', description: '1 if required, 0 if optional' },
          position: { type: 'number', description: 'Display order' },
          section: { type: 'string', description: 'Section grouping' },
          min: { type: 'number', description: 'Minimum value (for number fields)' },
          max: { type: 'number', description: 'Maximum value (for number fields)' },
          options: { type: 'string', description: 'Options for select fields' }
        },
        required: ['template_id', 'title', 'type']
      }
    },
    {
      name: 'worldanvil_update_blocktemplatepart',
      description: 'Update a block template part',
      inputSchema: {
        type: 'object',
        properties: {
          part_id: { type: 'number' },
          title: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
          placeholder: { type: 'string' },
          required: { type: 'number' },
          position: { type: 'number' },
          section: { type: 'string' },
          min: { type: 'number' },
          max: { type: 'number' },
          options: { type: 'string' }
        },
        required: ['part_id']
      }
    },
    {
      name: 'worldanvil_delete_blocktemplatepart',
      description: 'Delete a block template part',
      inputSchema: { type: 'object', properties: { part_id: { type: 'number' } }, required: ['part_id'] }
    },

    // ===== MANUSCRIPTS =====
    {
      name: 'worldanvil_get_manuscript',
      description: 'Get a manuscript by ID',
      inputSchema: { type: 'object', properties: { manuscript_id: { type: 'string', description: 'Manuscript ID' } }, required: ['manuscript_id'] }
    },
    {
      name: 'worldanvil_list_manuscripts',
      description: 'List all manuscripts in a world',
      inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] }
    },
    {
      name: 'worldanvil_create_manuscript',
      description: 'Create a new manuscript',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] }
    },
    {
      name: 'worldanvil_update_manuscript',
      description: 'Update a manuscript',
      inputSchema: { type: 'object', properties: { manuscript_id: { type: 'string' }, title: { type: 'string' } }, required: ['manuscript_id'] }
    },
    {
      name: 'worldanvil_delete_manuscript',
      description: 'Delete a manuscript',
      inputSchema: { type: 'object', properties: { manuscript_id: { type: 'string' } }, required: ['manuscript_id'] }
    },

    // ===== CANVAS (Visual Boards) =====
    {
      name: 'worldanvil_get_canvas',
      description: 'Get a visual board/canvas by ID',
      inputSchema: { type: 'object', properties: { canvas_id: { type: 'string', description: 'Canvas ID' } }, required: ['canvas_id'] }
    },
    {
      name: 'worldanvil_list_canvases',
      description: 'List all visual boards/canvases in a world',
      inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] }
    },
    {
      name: 'worldanvil_create_canvas',
      description: 'Create a new visual board/canvas for worldbuilding diagrams and connections',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Canvas title' },
          world_id: { type: 'string', description: 'World ID' },
          data: { type: 'object', description: 'Whiteboard content data (optional, defaults to empty)' }
        },
        required: ['title', 'world_id']
      }
    },
    {
      name: 'worldanvil_update_canvas',
      description: 'Update a visual board/canvas',
      inputSchema: { type: 'object', properties: { canvas_id: { type: 'string' }, title: { type: 'string' } }, required: ['canvas_id'] }
    },
    {
      name: 'worldanvil_delete_canvas',
      description: 'Delete a visual board/canvas',
      inputSchema: { type: 'object', properties: { canvas_id: { type: 'string' } }, required: ['canvas_id'] }
    },

    // ===== SUBSCRIBER GROUPS =====
    {
      name: 'worldanvil_get_subscribergroup',
      description: 'Get a subscriber/access control group by ID',
      inputSchema: { type: 'object', properties: { subscribergroup_id: { type: 'string', description: 'Subscriber group ID' } }, required: ['subscribergroup_id'] }
    },
    {
      name: 'worldanvil_list_subscribergroups',
      description: 'List all subscriber/access control groups in a world',
      inputSchema: { type: 'object', properties: { world_id: { type: 'string', description: 'World ID' }, offset: { type: 'number' }, limit: { type: 'number' } }, required: ['world_id'] }
    },
    {
      name: 'worldanvil_create_subscribergroup',
      description: 'Create a new subscriber/access control group',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, world_id: { type: 'string' } }, required: ['title', 'world_id'] }
    },
    {
      name: 'worldanvil_update_subscribergroup',
      description: 'Update a subscriber/access control group',
      inputSchema: { type: 'object', properties: { subscribergroup_id: { type: 'string' }, title: { type: 'string' } }, required: ['subscribergroup_id'] }
    },
    {
      name: 'worldanvil_delete_subscribergroup',
      description: 'Delete a subscriber/access control group',
      inputSchema: { type: 'object', properties: { subscribergroup_id: { type: 'string' } }, required: ['subscribergroup_id'] }
    },

    // ===== VARIABLE COLLECTIONS =====
    {
      name: 'worldanvil_get_variablecollection',
      description: 'Get a variable collection by ID with its metadata and prefix. Use to inspect collection structure before creating variables. Collections organize reusable values referenced in articles as [prefix:key].',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: { type: 'string', description: 'Variable collection ID' }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'worldanvil_list_variablecollections',
      description: 'List all variable collections in a world. ALWAYS call this before creating a new collection to avoid duplicates. PRINCIPLE: "Better to have too many collections than too few" - organize by theme (e.g., "Calendar", "Currency", "Titles") rather than catch-all buckets.',
      inputSchema: {
        type: 'object',
        properties: {
          world_id: { type: 'string', description: 'World ID' },
          offset: { type: 'number' },
          limit: { type: 'number' }
        },
        required: ['world_id']
      }
    },
    {
      name: 'worldanvil_create_variablecollection',
      description: 'Create a new variable collection with a prefix for referencing. CRITICAL: The prefix CANNOT be changed later without breaking all references. Use 3-6 character lowercase prefixes (e.g., "lore", "cal", "npc", "term"). Variables will be accessed as [prefix:key] in articles.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Collection name (displayed in UI, can be changed)' },
          world_id: { type: 'string', description: 'World ID' },
          description: { type: 'string', description: 'Explain what variables belong here - helps future organization' },
          prefix: { type: 'string', description: 'PERMANENT: Short prefix for [prefix:key] syntax. Cannot change without breaking references.' }
        },
        required: ['title', 'world_id']
      }
    },
    {
      name: 'worldanvil_update_variablecollection',
      description: 'Update collection title or description. WARNING: Changing prefix breaks ALL [prefix:key] references in articles - avoid unless absolutely necessary.',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: { type: 'string', description: 'Collection ID to update' },
          title: { type: 'string' },
          description: { type: 'string' },
          prefix: { type: 'string', description: 'DANGER: Changing this breaks all existing references' }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'worldanvil_delete_variablecollection',
      description: 'Delete a collection AND ALL ITS VARIABLES. This is destructive and cannot be undone. All [prefix:key] references in articles will break. Consider updating variables instead.',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: { type: 'string', description: 'Collection ID to delete' }
        },
        required: ['collection_id']
      }
    },

    // ===== VARIABLES =====
    {
      name: 'worldanvil_get_variable',
      description: 'Get a variable\'s key, value, type, and parent collection. Variables are reusable values for content that appears in multiple articles but doesn\'t warrant its own article page.',
      inputSchema: {
        type: 'object',
        properties: {
          variable_id: { type: 'string', description: 'Variable ID' }
        },
        required: ['variable_id']
      }
    },
    {
      name: 'worldanvil_list_variables',
      description: 'List variables in a collection. Call before creating to avoid duplicate keys. NAMING: Use lowercase_snake_case keys, keep short (they\'re typed in articles). Good: "current_year", "gold_value". Bad: "the_current_year_of_the_realm".',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: { type: 'string', description: 'Variable collection ID' },
          offset: { type: 'number' },
          limit: { type: 'number' }
        },
        required: ['collection_id']
      }
    },
    {
      name: 'worldanvil_create_variable',
      description: 'Create a variable in a collection, referenced as [prefix:key] in articles. TYPE BEHAVIORS: "string" = title displays, value shows as HOVER TOOLTIP (for glossary/terms). "rendered" = value renders INLINE with BBCode support (for reusable formatted blocks). "link" = creates clickable hyperlink. "number" = numeric value. Use string for most cases.',
      inputSchema: {
        type: 'object',
        properties: {
          collection_id: { type: 'string', description: 'Parent collection ID' },
          k: { type: 'string', description: 'Variable key (lowercase_snake_case, used in [prefix:key])' },
          type: { type: 'string', description: '"string" (hover tooltip), "rendered" (inline BBCode), "link" (hyperlink), "number", "json"' },
          v: { type: 'string', description: 'Value - for string type this is the tooltip text; for rendered type this is BBCode that replaces the variable' },
          world_id: { type: 'string', description: 'World ID' }
        },
        required: ['collection_id', 'k', 'type', 'v', 'world_id']
      }
    },
    {
      name: 'worldanvil_update_variable',
      description: 'Update a variable\'s value (safe) or key (breaks references). PREFER updating value over deleting - keeps references working. WARNING: Changing key breaks existing [prefix:oldkey] references.',
      inputSchema: {
        type: 'object',
        properties: {
          variable_id: { type: 'string', description: 'Variable ID to update' },
          k: { type: 'string', description: 'New key - DANGER: breaks existing references' },
          v: { type: 'string', description: 'New value - safe to change' },
          type: { type: 'string', description: 'New type' }
        },
        required: ['variable_id']
      }
    },
    {
      name: 'worldanvil_delete_variable',
      description: 'Delete a variable. All [prefix:key] references will break. PREFER updating the value to empty/placeholder instead - preserves reference structure for future use.',
      inputSchema: {
        type: 'object',
        properties: {
          variable_id: { type: 'string', description: 'Variable ID to delete' }
        },
        required: ['variable_id']
      }
    },
  ];
}
