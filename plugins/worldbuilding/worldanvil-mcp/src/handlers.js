/**
 * World Anvil MCP Server - Tool Handlers
 *
 * Implementation of all tool call handlers.
 */

import { markdownToBBCode, convertFieldsToBBCode } from './utils.js';

/**
 * Create a successful response with JSON content
 * @param {*} data - Data to serialize as JSON
 * @returns {Object} MCP tool response
 */
function jsonResponse(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Create an error response
 * @param {Error} error - The error that occurred
 * @returns {Object} MCP tool error response
 */
function errorResponse(error) {
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true,
  };
}

/**
 * Handle a tool call request
 *
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @param {WorldAnvilClient} client - API client instance
 * @returns {Promise<Object>} MCP tool response
 */
export async function handleToolCall(name, args, client) {
  try {
    switch (name) {
      // ===== IDENTITY & WORLDS =====
      case 'worldanvil_get_identity':
        return jsonResponse(await client.getIdentity());

      case 'worldanvil_list_worlds':
        return jsonResponse(await client.listWorlds());

      case 'worldanvil_get_world':
        return jsonResponse(await client.getWorld(args.world_id));

      case 'worldanvil_create_world':
        return jsonResponse(await client.createWorld({ title: args.title }));

      case 'worldanvil_update_world': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateWorld(args.world_id, data));
      }

      case 'worldanvil_delete_world':
        return jsonResponse(await client.deleteWorld(args.world_id));

      // ===== ARTICLES =====
      case 'worldanvil_list_articles': {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        return jsonResponse(await client.listArticles(args.world_id, options));
      }

      case 'worldanvil_get_article':
        return jsonResponse(await client.getArticle(args.article_id));

      case 'worldanvil_create_article': {
        const data = {
          title: args.title,
          world: { id: args.world_id },
        };
        if (args.template !== undefined) data.templateType = args.template;
        if (args.content !== undefined) data.content = markdownToBBCode(args.content);
        if (args.icon !== undefined) data.icon = args.icon;
        if (args.fields !== undefined && typeof args.fields === 'object') {
          Object.assign(data, convertFieldsToBBCode(args.fields));
        }
        return jsonResponse(await client.createArticle(data));
      }

      case 'worldanvil_update_article': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined) data.content = markdownToBBCode(args.content);
        if (args.icon !== undefined) data.icon = args.icon;
        if (args.fields !== undefined && typeof args.fields === 'object') {
          Object.assign(data, convertFieldsToBBCode(args.fields));
        }
        return jsonResponse(await client.updateArticle(args.article_id, data));
      }

      case 'worldanvil_delete_article':
        return jsonResponse(await client.deleteArticle(args.article_id));

      // ===== CATEGORIES =====
      case 'worldanvil_list_categories':
        return jsonResponse(await client.listCategories(args.world_id));

      case 'worldanvil_get_category':
        return jsonResponse(await client.getCategory(args.category_id));

      case 'worldanvil_create_category': {
        const data = {
          title: args.title,
          world: { id: args.world_id },
        };
        if (args.icon !== undefined) data.icon = args.icon;
        return jsonResponse(await client.createCategory(data));
      }

      case 'worldanvil_update_category': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.icon !== undefined) data.icon = args.icon;
        // Category content goes in custom1, not description (WorldAnvil quirk)
        if (args.content !== undefined) data.custom1 = markdownToBBCode(args.content);
        if (args.excerpt !== undefined) data.excerpt = args.excerpt;
        return jsonResponse(await client.updateCategory(args.category_id, data));
      }

      case 'worldanvil_delete_category':
        return jsonResponse(await client.deleteCategory(args.category_id));

      // ===== IMAGES =====
      case 'worldanvil_list_images': {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        return jsonResponse(await client.listImages(args.world_id, options));
      }

      // ===== NOTEBOOKS =====
      case 'worldanvil_get_notebook':
        return jsonResponse(await client.getNotebook(args.notebook_id));

      case 'worldanvil_list_notebooks':
        return jsonResponse(await client.listNotebooks(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_notebook':
        return jsonResponse(await client.createNotebook({ title: args.title, world: { id: args.world_id } }));

      case 'worldanvil_update_notebook':
        return jsonResponse(await client.updateNotebook(args.notebook_id, { title: args.title }));

      case 'worldanvil_delete_notebook':
        return jsonResponse(await client.deleteNotebook(args.notebook_id));

      // ===== NOTE SECTIONS =====
      case 'worldanvil_get_notesection':
        return jsonResponse(await client.getNotesection(args.notesection_id));

      case 'worldanvil_list_notesections':
        return jsonResponse(await client.listNotesections(args.notebook_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_notesection':
        return jsonResponse(await client.createNotesection({ title: args.title, notebook: { id: args.notebook_id } }));

      case 'worldanvil_update_notesection':
        return jsonResponse(await client.updateNotesection(args.notesection_id, { title: args.title }));

      case 'worldanvil_delete_notesection':
        return jsonResponse(await client.deleteNotesection(args.notesection_id));

      // ===== NOTES =====
      case 'worldanvil_get_note':
        return jsonResponse(await client.getNote(args.note_id));

      case 'worldanvil_list_notes':
        return jsonResponse(await client.listNotes(args.notesection_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_note':
        return jsonResponse(await client.createNote({
          title: args.title,
          notesection: { id: args.notesection_id },
          content: markdownToBBCode(args.content),
          type: 'default'  // Required but undocumented field
        }));

      case 'worldanvil_update_note':
        return jsonResponse(await client.updateNote(args.note_id, {
          title: args.title,
          content: markdownToBBCode(args.content)
        }));

      case 'worldanvil_delete_note':
        return jsonResponse(await client.deleteNote(args.note_id));

      // ===== SECRETS =====
      case 'worldanvil_get_secret':
        return jsonResponse(await client.getSecret(args.secret_id));

      case 'worldanvil_list_secrets':
        return jsonResponse(await client.listSecrets(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_secret':
        return jsonResponse(await client.createSecret({
          title: args.title,
          world: { id: args.world_id },
          content: markdownToBBCode(args.content)
        }));

      case 'worldanvil_update_secret':
        return jsonResponse(await client.updateSecret(args.secret_id, {
          title: args.title,
          content: markdownToBBCode(args.content)
        }));

      case 'worldanvil_delete_secret':
        return jsonResponse(await client.deleteSecret(args.secret_id));

      // ===== MAPS =====
      case 'worldanvil_get_map':
        return jsonResponse(await client.getMap(args.map_id));

      case 'worldanvil_list_maps':
        return jsonResponse(await client.listMaps(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_map':
        return jsonResponse(await client.createMap({ title: args.title, world: { id: args.world_id } }));

      case 'worldanvil_update_map':
        return jsonResponse(await client.updateMap(args.map_id, { title: args.title }));

      case 'worldanvil_delete_map':
        return jsonResponse(await client.deleteMap(args.map_id));

      // ===== MAP MARKERS =====
      case 'worldanvil_get_marker':
        return jsonResponse(await client.getMarker(args.marker_id));

      case 'worldanvil_list_markers':
        return jsonResponse(await client.listMarkers(args.map_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_marker':
        return jsonResponse(await client.createMarker({ title: args.title, map: args.map_id }));

      case 'worldanvil_update_marker':
        return jsonResponse(await client.updateMarker(args.marker_id, { title: args.title }));

      case 'worldanvil_delete_marker':
        return jsonResponse(await client.deleteMarker(args.marker_id));

      // ===== TIMELINES =====
      case 'worldanvil_get_timeline':
        return jsonResponse(await client.getTimeline(args.timeline_id));

      case 'worldanvil_list_timelines':
        return jsonResponse(await client.listTimelines(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_timeline': {
        const data = { title: args.title, world: { id: args.world_id } };
        if (args.description !== undefined) data.description = args.description;
        if (args.type !== undefined) data.type = args.type;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        return jsonResponse(await client.createTimeline(data));
      }

      case 'worldanvil_update_timeline': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.description !== undefined) data.description = args.description;
        if (args.type !== undefined) data.type = args.type;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        if (args.history_ids !== undefined) data.histories = args.history_ids.map(id => ({ id }));
        return jsonResponse(await client.updateTimeline(args.timeline_id, data));
      }

      case 'worldanvil_delete_timeline':
        return jsonResponse(await client.deleteTimeline(args.timeline_id));

      // ===== HISTORY EVENTS =====
      case 'worldanvil_get_history':
        return jsonResponse(await client.getHistory(args.history_id));

      case 'worldanvil_list_histories':
        return jsonResponse(await client.listHistories(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_history': {
        const data = {
          title: args.title,
          world: { id: args.world_id },
          year: String(args.year),
        };
        if (args.month !== undefined) data.month = args.month;
        if (args.day !== undefined) data.day = args.day;
        if (args.hour !== undefined) data.hour = args.hour;
        if (args.endingYear !== undefined) data.endingYear = String(args.endingYear);
        if (args.endingMonth !== undefined) data.endingMonth = args.endingMonth;
        if (args.endingDay !== undefined) data.endingDay = args.endingDay;
        if (args.endingHour !== undefined) data.endingHour = args.endingHour;
        if (args.significance !== undefined) data.significance = args.significance;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        if (args.content !== undefined) data.content = args.content;
        if (args.fullcontent !== undefined) data.fullcontent = markdownToBBCode(args.fullcontent);
        if (args.displayDateName !== undefined) data.displayDateName = args.displayDateName;
        if (args.displayRange !== undefined) data.displayRange = args.displayRange;
        if (args.alternativeDisplayRange !== undefined) data.alternativeDisplayRange = args.alternativeDisplayRange;
        if (args.article_id !== undefined) data.article = { id: args.article_id };
        if (args.location_id !== undefined) data.location = { id: args.location_id };
        if (args.character_ids !== undefined) data.characters = args.character_ids.map(id => ({ id }));
        if (args.organization_ids !== undefined) data.organizations = args.organization_ids.map(id => ({ id }));
        return jsonResponse(await client.createHistory(data));
      }

      case 'worldanvil_update_history': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.year !== undefined) data.year = String(args.year);
        if (args.month !== undefined) data.month = args.month;
        if (args.day !== undefined) data.day = args.day;
        if (args.hour !== undefined) data.hour = args.hour;
        if (args.endingYear !== undefined) data.endingYear = String(args.endingYear);
        if (args.endingMonth !== undefined) data.endingMonth = args.endingMonth;
        if (args.endingDay !== undefined) data.endingDay = args.endingDay;
        if (args.endingHour !== undefined) data.endingHour = args.endingHour;
        if (args.significance !== undefined) data.significance = args.significance;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        if (args.content !== undefined) data.content = args.content;
        if (args.fullcontent !== undefined) data.fullcontent = markdownToBBCode(args.fullcontent);
        if (args.displayDateName !== undefined) data.displayDateName = args.displayDateName;
        if (args.displayRange !== undefined) data.displayRange = args.displayRange;
        if (args.alternativeDisplayRange !== undefined) data.alternativeDisplayRange = args.alternativeDisplayRange;
        if (args.article_id !== undefined) data.article = { id: args.article_id };
        if (args.location_id !== undefined) data.location = { id: args.location_id };
        if (args.character_ids !== undefined) data.characters = args.character_ids.map(id => ({ id }));
        if (args.organization_ids !== undefined) data.organizations = args.organization_ids.map(id => ({ id }));
        return jsonResponse(await client.updateHistory(args.history_id, data));
      }

      case 'worldanvil_delete_history':
        return jsonResponse(await client.deleteHistory(args.history_id));

      // ===== RPG SYSTEMS =====
      case 'worldanvil_get_rpgsystem':
        return jsonResponse(await client.getRpgSystem(args.rpgsystem_id));

      case 'worldanvil_list_rpgsystems':
        return jsonResponse(await client.listRpgSystems({ offset: args.offset, limit: args.limit }));

      // ===== BLOCKS =====
      case 'worldanvil_get_block':
        return jsonResponse(await client.getBlock(args.block_id));

      case 'worldanvil_list_blocks':
        return jsonResponse(await client.listBlocks(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_list_blocks_in_folder':
        return jsonResponse(await client.listBlocksInFolder(args.blockfolder_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_block':
        return jsonResponse(await client.createBlock({
          title: args.title,
          template: { id: args.template_id },  // Requires a valid BlockTemplate ID
          folder: args.folder_id ? { id: args.folder_id } : undefined,
        }));

      case 'worldanvil_update_block': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined) data.content = markdownToBBCode(args.content);
        return jsonResponse(await client.updateBlock(args.block_id, data));
      }

      case 'worldanvil_delete_block':
        return jsonResponse(await client.deleteBlock(args.block_id));

      // ===== BLOCK FOLDERS =====
      case 'worldanvil_get_blockfolder':
        return jsonResponse(await client.getBlockFolder(args.blockfolder_id));

      case 'worldanvil_list_blockfolders':
        return jsonResponse(await client.listBlockFolders(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_blockfolder':
        return jsonResponse(await client.createBlockFolder({
          title: args.title,
          world: { id: args.world_id }
        }));

      case 'worldanvil_update_blockfolder':
        return jsonResponse(await client.updateBlockFolder(args.blockfolder_id, { title: args.title }));

      case 'worldanvil_delete_blockfolder':
        return jsonResponse(await client.deleteBlockFolder(args.blockfolder_id));

      // ===== BLOCK TEMPLATES =====
      case 'worldanvil_get_blocktemplate':
        return jsonResponse(await client.getBlockTemplate(args.template_id));

      case 'worldanvil_list_blocktemplates':
        return jsonResponse(await client.listBlockTemplates(args.user_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_blocktemplate':
        return jsonResponse(await client.createBlockTemplate({ title: args.title }));

      case 'worldanvil_update_blocktemplate': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateBlockTemplate(args.template_id, data));
      }

      case 'worldanvil_delete_blocktemplate':
        return jsonResponse(await client.deleteBlockTemplate(args.template_id));

      // ===== BLOCK TEMPLATE PARTS =====
      case 'worldanvil_get_blocktemplatepart':
        return jsonResponse(await client.getBlockTemplatePart(args.part_id));

      case 'worldanvil_list_blocktemplateparts':
        return jsonResponse(await client.listBlockTemplateParts(args.template_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_blocktemplatepart': {
        const data = {
          title: args.title,
          type: args.type,
          template: { id: args.template_id }
        };
        if (args.description !== undefined) data.description = args.description;
        if (args.placeholder !== undefined) data.placeholder = args.placeholder;
        if (args.required !== undefined) data.required = args.required;
        if (args.position !== undefined) data.position = args.position;
        if (args.section !== undefined) data.section = args.section;
        if (args.min !== undefined) data.min = args.min;
        if (args.max !== undefined) data.max = args.max;
        if (args.options !== undefined) data.options = args.options;
        return jsonResponse(await client.createBlockTemplatePart(data));
      }

      case 'worldanvil_update_blocktemplatepart': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.type !== undefined) data.type = args.type;
        if (args.description !== undefined) data.description = args.description;
        if (args.placeholder !== undefined) data.placeholder = args.placeholder;
        if (args.required !== undefined) data.required = args.required;
        if (args.position !== undefined) data.position = args.position;
        if (args.section !== undefined) data.section = args.section;
        if (args.min !== undefined) data.min = args.min;
        if (args.max !== undefined) data.max = args.max;
        if (args.options !== undefined) data.options = args.options;
        return jsonResponse(await client.updateBlockTemplatePart(args.part_id, data));
      }

      case 'worldanvil_delete_blocktemplatepart':
        return jsonResponse(await client.deleteBlockTemplatePart(args.part_id));

      // ===== MANUSCRIPTS =====
      case 'worldanvil_get_manuscript':
        return jsonResponse(await client.getManuscript(args.manuscript_id));

      case 'worldanvil_list_manuscripts':
        return jsonResponse(await client.listManuscripts(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_manuscript':
        return jsonResponse(await client.createManuscript({
          title: args.title,
          world: { id: args.world_id }
        }));

      case 'worldanvil_update_manuscript':
        return jsonResponse(await client.updateManuscript(args.manuscript_id, { title: args.title }));

      case 'worldanvil_delete_manuscript':
        return jsonResponse(await client.deleteManuscript(args.manuscript_id));

      // ===== CANVAS (Visual Boards) =====
      case 'worldanvil_get_canvas':
        return jsonResponse(await client.getCanvas(args.canvas_id));

      case 'worldanvil_list_canvases':
        return jsonResponse(await client.listCanvases(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_canvas':
        return jsonResponse(await client.createCanvas({
          title: args.title,
          world: { id: args.world_id },
          data: args.data || {} // Canvas requires a data field for whiteboard content
        }));

      case 'worldanvil_update_canvas':
        return jsonResponse(await client.updateCanvas(args.canvas_id, { title: args.title }));

      case 'worldanvil_delete_canvas':
        return jsonResponse(await client.deleteCanvas(args.canvas_id));

      // ===== SUBSCRIBER GROUPS =====
      case 'worldanvil_get_subscribergroup':
        return jsonResponse(await client.getSubscriberGroup(args.subscribergroup_id));

      case 'worldanvil_list_subscribergroups':
        return jsonResponse(await client.listSubscriberGroups(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_subscribergroup':
        return jsonResponse(await client.createSubscriberGroup({
          title: args.title,
          world: { id: args.world_id }
        }));

      case 'worldanvil_update_subscribergroup':
        return jsonResponse(await client.updateSubscriberGroup(args.subscribergroup_id, { title: args.title }));

      case 'worldanvil_delete_subscribergroup':
        return jsonResponse(await client.deleteSubscriberGroup(args.subscribergroup_id));

      // ===== VARIABLE COLLECTIONS =====
      case 'worldanvil_get_variablecollection':
        return jsonResponse(await client.getVariableCollection(args.collection_id));

      case 'worldanvil_list_variablecollections':
        return jsonResponse(await client.listVariableCollections(args.world_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_variablecollection': {
        const data = {
          title: args.title,
          world: { id: args.world_id }
        };
        if (args.description !== undefined) data.description = args.description;
        if (args.prefix !== undefined) data.prefix = args.prefix;
        return jsonResponse(await client.createVariableCollection(data));
      }

      case 'worldanvil_update_variablecollection': {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.description !== undefined) data.description = args.description;
        if (args.prefix !== undefined) data.prefix = args.prefix;
        return jsonResponse(await client.updateVariableCollection(args.collection_id, data));
      }

      case 'worldanvil_delete_variablecollection':
        return jsonResponse(await client.deleteVariableCollection(args.collection_id));

      // ===== VARIABLES =====
      case 'worldanvil_get_variable':
        return jsonResponse(await client.getVariable(args.variable_id));

      case 'worldanvil_list_variables':
        return jsonResponse(await client.listVariables(args.collection_id, { offset: args.offset, limit: args.limit }));

      case 'worldanvil_create_variable': {
        // Note: Despite Swagger showing plain strings, API requires nested objects
        const data = {
          collection: { id: args.collection_id },
          k: args.k,
          type: args.type,
          v: args.v,
          world: { id: args.world_id }
        };
        return jsonResponse(await client.createVariable(data));
      }

      case 'worldanvil_update_variable': {
        const data = {};
        if (args.k !== undefined) data.k = args.k;
        if (args.v !== undefined) data.v = args.v;
        if (args.type !== undefined) data.type = args.type;
        return jsonResponse(await client.updateVariable(args.variable_id, data));
      }

      case 'worldanvil_delete_variable':
        return jsonResponse(await client.deleteVariable(args.variable_id));

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return errorResponse(error);
  }
}
