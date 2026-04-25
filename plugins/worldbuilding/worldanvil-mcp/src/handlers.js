/**
 * World Anvil MCP Server - Tool Handlers
 *
 * Implementation of all tool call handlers.
 */

import { markdownToBBCode, convertFieldsToBBCode } from "./utils.js";

/**
 * Create a successful response with JSON content
 * @param {*} data - Data to serialize as JSON
 * @returns {Object} MCP tool response
 */
function jsonResponse(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Create an error response
 * @param {Error} error - The error that occurred
 * @returns {Object} MCP tool error response
 */
function errorResponse(error) {
  return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
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
      case "worldanvil_get_identity":
        return jsonResponse(await client.getIdentity());

      case "worldanvil_list_worlds":
        return jsonResponse(await client.listWorlds());

      case "worldanvil_get_world":
        return jsonResponse(await client.getWorld(args.world_id));

      case "worldanvil_create_world":
        return jsonResponse(await client.createWorld({ title: args.title }));

      case "worldanvil_update_world": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateWorld(args.world_id, data));
      }

      case "worldanvil_delete_world":
        return jsonResponse(await client.deleteWorld(args.world_id));

      // ===== ARTICLES =====
      case "worldanvil_list_articles": {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        return jsonResponse(await client.listArticles(args.world_id, options));
      }

      case "worldanvil_get_article":
        return jsonResponse(await client.getArticle(args.article_id));

      case "worldanvil_create_article": {
        const data = {
          title: args.title,
          world: { id: args.world_id },
        };
        if (args.template !== undefined) data.templateType = args.template;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        if (args.icon !== undefined) data.icon = args.icon;
        if (args.fields !== undefined && typeof args.fields === "object") {
          Object.assign(data, convertFieldsToBBCode(args.fields));
        }
        if (args.category_id) data.category = { id: args.category_id };
        return jsonResponse(await client.createArticle(data));
      }

      case "worldanvil_update_article": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        if (args.icon !== undefined) data.icon = args.icon;
        if (args.fields !== undefined && typeof args.fields === "object") {
          Object.assign(data, convertFieldsToBBCode(args.fields));
        }
        if (args.category_id) data.category = { id: args.category_id };
        return jsonResponse(await client.updateArticle(args.article_id, data));
      }

      case "worldanvil_delete_article":
        return jsonResponse(await client.deleteArticle(args.article_id));

      // ===== CATEGORIES =====
      case "worldanvil_list_categories": {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        return jsonResponse(
          await client.listCategories(args.world_id, options),
        );
      }

      case "worldanvil_get_category":
        return jsonResponse(await client.getCategory(args.category_id));

      case "worldanvil_create_category": {
        const data = {
          title: args.title,
          world: { id: args.world_id },
        };
        if (args.icon !== undefined) data.icon = args.icon;
        if (args.description !== undefined)
          data.description = markdownToBBCode(args.description);
        // Field name is `parent` per WA API GET response shape, not `parentCategory`.
        // Discovered 2026-04-25 when category reparenting silently no-op'd.
        if (args.parent_category_id)
          data.parent = { id: args.parent_category_id };
        return jsonResponse(await client.createCategory(data));
      }

      case "worldanvil_update_category": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.icon !== undefined) data.icon = args.icon;
        // Categories expose two body fields: `description` (legacy, top of page) and
        // `custom1` (column layout). `content` writes custom1 for back-compat;
        // `description` targets the legacy field directly. Pass empty string to clear.
        if (args.content !== undefined)
          data.custom1 = markdownToBBCode(args.content);
        if (args.description !== undefined)
          data.description = markdownToBBCode(args.description);
        if (args.excerpt !== undefined) data.excerpt = args.excerpt;
        // Field name is `parent` per WA API GET response shape, not `parentCategory`.
        // Discovered 2026-04-25 when category reparenting silently no-op'd.
        if (args.parent_category_id)
          data.parent = { id: args.parent_category_id };
        return jsonResponse(
          await client.updateCategory(args.category_id, data),
        );
      }

      case "worldanvil_delete_category":
        return jsonResponse(await client.deleteCategory(args.category_id));

      // ===== IMAGES =====
      case "worldanvil_list_images": {
        const options = {};
        if (args.offset !== undefined) options.offset = args.offset;
        if (args.limit !== undefined) options.limit = args.limit;
        return jsonResponse(await client.listImages(args.world_id, options));
      }

      // ===== NOTEBOOKS =====
      case "worldanvil_get_notebook":
        return jsonResponse(await client.getNotebook(args.notebook_id));

      case "worldanvil_list_notebooks":
        return jsonResponse(
          await client.listNotebooks(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_notebook":
        return jsonResponse(
          await client.createNotebook({
            title: args.title,
            world: { id: args.world_id },
          }),
        );

      case "worldanvil_update_notebook": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateNotebook(args.notebook_id, data),
        );
      }

      case "worldanvil_delete_notebook":
        return jsonResponse(await client.deleteNotebook(args.notebook_id));

      // ===== NOTE SECTIONS =====
      case "worldanvil_get_notesection":
        return jsonResponse(await client.getNotesection(args.notesection_id));

      case "worldanvil_list_notesections":
        return jsonResponse(
          await client.listNotesections(args.notebook_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_notesection":
        return jsonResponse(
          await client.createNotesection({
            title: args.title,
            notebook: { id: args.notebook_id },
          }),
        );

      case "worldanvil_update_notesection": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateNotesection(args.notesection_id, data),
        );
      }

      case "worldanvil_delete_notesection":
        return jsonResponse(
          await client.deleteNotesection(args.notesection_id),
        );

      // ===== NOTES =====
      case "worldanvil_get_note":
        return jsonResponse(await client.getNote(args.note_id));

      case "worldanvil_list_notes":
        return jsonResponse(
          await client.listNotes(args.notesection_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_note":
        return jsonResponse(
          await client.createNote({
            title: args.title,
            notesection: { id: args.notesection_id },
            content: markdownToBBCode(args.content),
            type: "default", // Required but undocumented field
          }),
        );

      case "worldanvil_update_note": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        return jsonResponse(await client.updateNote(args.note_id, data));
      }

      case "worldanvil_delete_note":
        return jsonResponse(await client.deleteNote(args.note_id));

      // ===== SECRETS =====
      case "worldanvil_get_secret":
        return jsonResponse(await client.getSecret(args.secret_id));

      case "worldanvil_list_secrets":
        return jsonResponse(
          await client.listSecrets(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_secret": {
        const data = {
          title: args.title,
          world: { id: args.world_id },
        };
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        if (args.article_id) data.article = { id: args.article_id };
        return jsonResponse(await client.createSecret(data));
      }

      case "worldanvil_update_secret": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        if (args.article_id) data.article = { id: args.article_id };
        return jsonResponse(await client.updateSecret(args.secret_id, data));
      }

      case "worldanvil_delete_secret":
        return jsonResponse(await client.deleteSecret(args.secret_id));

      // ===== MAPS =====
      case "worldanvil_get_map":
        return jsonResponse(await client.getMap(args.map_id));

      case "worldanvil_list_maps":
        return jsonResponse(
          await client.listMaps(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_map":
        return jsonResponse(
          await client.createMap({
            title: args.title,
            world: { id: args.world_id },
          }),
        );

      case "worldanvil_update_map": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateMap(args.map_id, data));
      }

      case "worldanvil_delete_map":
        return jsonResponse(await client.deleteMap(args.map_id));

      // ===== MAP MARKERS =====
      case "worldanvil_get_marker":
        return jsonResponse(await client.getMarker(args.marker_id));

      case "worldanvil_list_markers":
        return jsonResponse(
          await client.listMarkers(args.map_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_marker": {
        const data = { title: args.title, map: args.map_id };
        if (args.article_id) data.article = { id: args.article_id };
        return jsonResponse(await client.createMarker(data));
      }

      case "worldanvil_update_marker": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.article_id) data.article = { id: args.article_id };
        return jsonResponse(await client.updateMarker(args.marker_id, data));
      }

      case "worldanvil_delete_marker":
        return jsonResponse(await client.deleteMarker(args.marker_id));

      // ===== TIMELINES =====
      case "worldanvil_get_timeline":
        return jsonResponse(await client.getTimeline(args.timeline_id));

      case "worldanvil_list_timelines":
        return jsonResponse(
          await client.listTimelines(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_timeline": {
        const data = { title: args.title, world: { id: args.world_id } };
        if (args.description !== undefined) data.description = args.description;
        if (args.type !== undefined) data.type = args.type;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        return jsonResponse(await client.createTimeline(data));
      }

      case "worldanvil_update_timeline": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.description !== undefined) data.description = args.description;
        if (args.type !== undefined) data.type = args.type;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        if (args.history_ids !== undefined)
          data.histories = args.history_ids.map((id) => ({ id }));
        return jsonResponse(
          await client.updateTimeline(args.timeline_id, data),
        );
      }

      case "worldanvil_delete_timeline":
        return jsonResponse(await client.deleteTimeline(args.timeline_id));

      // ===== HISTORY EVENTS =====
      case "worldanvil_get_history":
        return jsonResponse(await client.getHistory(args.history_id));

      case "worldanvil_list_histories":
        return jsonResponse(
          await client.listHistories(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_history": {
        const data = {
          title: args.title,
          world: { id: args.world_id },
          year: String(args.year),
        };
        if (args.month !== undefined) data.month = args.month;
        if (args.day !== undefined) data.day = args.day;
        if (args.hour !== undefined) data.hour = args.hour;
        if (args.endingYear !== undefined)
          data.endingYear = String(args.endingYear);
        if (args.endingMonth !== undefined) data.endingMonth = args.endingMonth;
        if (args.endingDay !== undefined) data.endingDay = args.endingDay;
        if (args.endingHour !== undefined) data.endingHour = args.endingHour;
        if (args.significance !== undefined)
          data.significance = args.significance;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        // content is the plain-text short summary — NOT converted to BBCode (unlike other handlers)
        // fullcontent is the full body and does support BBCode
        if (args.content !== undefined) data.content = args.content;
        if (args.fullcontent !== undefined)
          data.fullcontent = markdownToBBCode(args.fullcontent);
        if (args.displayDateName !== undefined)
          data.displayDateName = args.displayDateName;
        if (args.displayRange !== undefined)
          data.displayRange = args.displayRange;
        if (args.alternativeDisplayRange !== undefined)
          data.alternativeDisplayRange = args.alternativeDisplayRange;
        if (args.article_id !== undefined)
          data.article = { id: args.article_id };
        if (args.location_id !== undefined)
          data.location = { id: args.location_id };
        if (args.character_ids !== undefined)
          data.characters = args.character_ids.map((id) => ({ id }));
        if (args.organization_ids !== undefined)
          data.organizations = args.organization_ids.map((id) => ({ id }));
        return jsonResponse(await client.createHistory(data));
      }

      case "worldanvil_update_history": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.year !== undefined) data.year = String(args.year);
        if (args.month !== undefined) data.month = args.month;
        if (args.day !== undefined) data.day = args.day;
        if (args.hour !== undefined) data.hour = args.hour;
        if (args.endingYear !== undefined)
          data.endingYear = String(args.endingYear);
        if (args.endingMonth !== undefined) data.endingMonth = args.endingMonth;
        if (args.endingDay !== undefined) data.endingDay = args.endingDay;
        if (args.endingHour !== undefined) data.endingHour = args.endingHour;
        if (args.significance !== undefined)
          data.significance = args.significance;
        if (args.state !== undefined) data.state = args.state;
        if (args.tags !== undefined) data.tags = args.tags;
        // content is the plain-text short summary — NOT converted to BBCode (unlike other handlers)
        // fullcontent is the full body and does support BBCode
        if (args.content !== undefined) data.content = args.content;
        if (args.fullcontent !== undefined)
          data.fullcontent = markdownToBBCode(args.fullcontent);
        if (args.displayDateName !== undefined)
          data.displayDateName = args.displayDateName;
        if (args.displayRange !== undefined)
          data.displayRange = args.displayRange;
        if (args.alternativeDisplayRange !== undefined)
          data.alternativeDisplayRange = args.alternativeDisplayRange;
        if (args.article_id !== undefined)
          data.article = { id: args.article_id };
        if (args.location_id !== undefined)
          data.location = { id: args.location_id };
        if (args.character_ids !== undefined)
          data.characters = args.character_ids.map((id) => ({ id }));
        if (args.organization_ids !== undefined)
          data.organizations = args.organization_ids.map((id) => ({ id }));
        return jsonResponse(await client.updateHistory(args.history_id, data));
      }

      case "worldanvil_delete_history":
        return jsonResponse(await client.deleteHistory(args.history_id));

      // ===== RPG SYSTEMS =====
      case "worldanvil_get_rpgsystem":
        return jsonResponse(await client.getRpgSystem(args.rpgsystem_id));

      case "worldanvil_list_rpgsystems":
        return jsonResponse(
          await client.listRpgSystems({
            offset: args.offset,
            limit: args.limit,
          }),
        );

      // ===== BLOCKS =====
      case "worldanvil_get_block":
        return jsonResponse(await client.getBlock(args.block_id));

      case "worldanvil_list_blocks":
        return jsonResponse(
          await client.listBlocks(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_list_blocks_in_folder":
        return jsonResponse(
          await client.listBlocksInFolder(args.blockfolder_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_block":
        return jsonResponse(
          await client.createBlock({
            title: args.title,
            template: { id: args.template_id }, // Requires a valid BlockTemplate ID
            folder: args.folder_id ? { id: args.folder_id } : undefined,
          }),
        );

      case "worldanvil_update_block": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        return jsonResponse(await client.updateBlock(args.block_id, data));
      }

      case "worldanvil_delete_block":
        return jsonResponse(await client.deleteBlock(args.block_id));

      // ===== BLOCK FOLDERS =====
      case "worldanvil_get_blockfolder":
        return jsonResponse(await client.getBlockFolder(args.blockfolder_id));

      case "worldanvil_list_blockfolders":
        return jsonResponse(
          await client.listBlockFolders(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_blockfolder":
        return jsonResponse(
          await client.createBlockFolder({
            title: args.title,
            world: { id: args.world_id },
          }),
        );

      case "worldanvil_update_blockfolder": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateBlockFolder(args.blockfolder_id, data),
        );
      }

      case "worldanvil_delete_blockfolder":
        return jsonResponse(
          await client.deleteBlockFolder(args.blockfolder_id),
        );

      // ===== BLOCK TEMPLATES =====
      case "worldanvil_get_blocktemplate":
        return jsonResponse(await client.getBlockTemplate(args.template_id));

      case "worldanvil_list_blocktemplates":
        return jsonResponse(
          await client.listBlockTemplates(args.user_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_blocktemplate":
        return jsonResponse(
          await client.createBlockTemplate({ title: args.title }),
        );

      case "worldanvil_update_blocktemplate": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateBlockTemplate(args.template_id, data),
        );
      }

      case "worldanvil_delete_blocktemplate":
        return jsonResponse(await client.deleteBlockTemplate(args.template_id));

      // ===== BLOCK TEMPLATE PARTS =====
      case "worldanvil_get_blocktemplatepart":
        return jsonResponse(await client.getBlockTemplatePart(args.part_id));

      case "worldanvil_list_blocktemplateparts":
        return jsonResponse(
          await client.listBlockTemplateParts(args.template_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_blocktemplatepart": {
        const data = {
          title: args.title,
          type: args.type,
          template: { id: args.template_id },
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

      case "worldanvil_update_blocktemplatepart": {
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
        return jsonResponse(
          await client.updateBlockTemplatePart(args.part_id, data),
        );
      }

      case "worldanvil_delete_blocktemplatepart":
        return jsonResponse(await client.deleteBlockTemplatePart(args.part_id));

      // ===== MANUSCRIPTS =====
      case "worldanvil_get_manuscript":
        return jsonResponse(await client.getManuscript(args.manuscript_id));

      case "worldanvil_list_manuscripts":
        return jsonResponse(
          await client.listManuscripts(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscript":
        return jsonResponse(
          await client.createManuscript({
            title: args.title,
            world: { id: args.world_id },
          }),
        );

      case "worldanvil_update_manuscript": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateManuscript(args.manuscript_id, data),
        );
      }

      case "worldanvil_delete_manuscript":
        return jsonResponse(await client.deleteManuscript(args.manuscript_id));

      // ===== CANVAS (Visual Boards) =====
      case "worldanvil_get_canvas":
        return jsonResponse(await client.getCanvas(args.canvas_id));

      case "worldanvil_list_canvases":
        return jsonResponse(
          await client.listCanvases(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_canvas":
        return jsonResponse(
          await client.createCanvas({
            title: args.title,
            world: { id: args.world_id },
            data: args.data || {}, // Canvas requires a data field for whiteboard content
          }),
        );

      case "worldanvil_update_canvas": {
        const canvasData = {};
        if (args.title !== undefined) canvasData.title = args.title;
        if (args.data !== undefined) canvasData.data = args.data;
        return jsonResponse(
          await client.updateCanvas(args.canvas_id, canvasData),
        );
      }

      case "worldanvil_delete_canvas":
        return jsonResponse(await client.deleteCanvas(args.canvas_id));

      // ===== SUBSCRIBER GROUPS =====
      case "worldanvil_get_subscribergroup":
        return jsonResponse(
          await client.getSubscriberGroup(args.subscribergroup_id),
        );

      case "worldanvil_list_subscribergroups":
        return jsonResponse(
          await client.listSubscriberGroups(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_subscribergroup":
        return jsonResponse(
          await client.createSubscriberGroup({
            title: args.title,
            world: { id: args.world_id },
          }),
        );

      case "worldanvil_update_subscribergroup": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateSubscriberGroup(args.subscribergroup_id, data),
        );
      }

      case "worldanvil_delete_subscribergroup":
        return jsonResponse(
          await client.deleteSubscriberGroup(args.subscribergroup_id),
        );

      // ===== VARIABLE COLLECTIONS =====
      case "worldanvil_get_variablecollection":
        return jsonResponse(
          await client.getVariableCollection(args.collection_id),
        );

      case "worldanvil_list_variablecollections":
        return jsonResponse(
          await client.listVariableCollections(args.world_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_variablecollection": {
        const data = {
          title: args.title,
          world: { id: args.world_id },
        };
        if (args.description !== undefined) data.description = args.description;
        if (args.prefix !== undefined) data.prefix = args.prefix;
        return jsonResponse(await client.createVariableCollection(data));
      }

      case "worldanvil_update_variablecollection": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.description !== undefined) data.description = args.description;
        if (args.prefix !== undefined) data.prefix = args.prefix;
        return jsonResponse(
          await client.updateVariableCollection(args.collection_id, data),
        );
      }

      case "worldanvil_delete_variablecollection":
        return jsonResponse(
          await client.deleteVariableCollection(args.collection_id),
        );

      // ===== VARIABLES =====
      case "worldanvil_get_variable":
        return jsonResponse(await client.getVariable(args.variable_id));

      case "worldanvil_list_variables":
        return jsonResponse(
          await client.listVariables(args.collection_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_variable": {
        // Note: Despite Swagger showing plain strings, API requires nested objects
        const data = {
          collection: { id: args.collection_id },
          k: args.k,
          type: args.type,
          v: args.v,
          world: { id: args.world_id },
        };
        return jsonResponse(await client.createVariable(data));
      }

      case "worldanvil_update_variable": {
        const data = {};
        if (args.k !== undefined) data.k = args.k;
        if (args.v !== undefined) data.v = args.v;
        if (args.type !== undefined) data.type = args.type;
        return jsonResponse(
          await client.updateVariable(args.variable_id, data),
        );
      }

      case "worldanvil_delete_variable":
        return jsonResponse(await client.deleteVariable(args.variable_id));

      // ===== MAP LAYERS =====
      case "worldanvil_get_layer":
        return jsonResponse(await client.getLayer(args.layer_id));

      case "worldanvil_list_layers":
        return jsonResponse(
          await client.listLayers(args.map_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_layer":
        return jsonResponse(
          await client.createLayer({
            title: args.title,
            map: { id: args.map_id },
          }),
        );

      case "worldanvil_update_layer": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateLayer(args.layer_id, data));
      }

      case "worldanvil_delete_layer":
        return jsonResponse(await client.deleteLayer(args.layer_id));

      // ===== MARKER GROUPS =====
      case "worldanvil_get_markergroup":
        return jsonResponse(await client.getMarkerGroup(args.markergroup_id));

      case "worldanvil_list_markergroups":
        return jsonResponse(
          await client.listMarkerGroups(args.map_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_list_markers_in_group":
        return jsonResponse(
          await client.listMarkersInGroup(args.markergroup_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_markergroup":
        return jsonResponse(
          await client.createMarkerGroup({
            title: args.title,
            map: { id: args.map_id },
          }),
        );

      case "worldanvil_update_markergroup": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateMarkerGroup(args.markergroup_id, data),
        );
      }

      case "worldanvil_delete_markergroup":
        return jsonResponse(
          await client.deleteMarkerGroup(args.markergroup_id),
        );

      // ===== MARKER TYPES =====
      case "worldanvil_get_markertype":
        return jsonResponse(await client.getMarkerType(args.markertype_id));

      case "worldanvil_list_markertypes":
        return jsonResponse(
          await client.listMarkerTypes({
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_markertype":
        return jsonResponse(
          await client.createMarkerType({ title: args.title }),
        );

      case "worldanvil_update_markertype": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateMarkerType(args.markertype_id, data),
        );
      }

      case "worldanvil_delete_markertype":
        return jsonResponse(await client.deleteMarkerType(args.markertype_id));

      // ===== USERS =====
      case "worldanvil_get_user":
        return jsonResponse(await client.getUser(args.user_id));

      case "worldanvil_update_user": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateUser(args.user_id, data));
      }

      // ===== IMAGES (single resource) =====
      case "worldanvil_get_image":
        return jsonResponse(await client.getImage(args.image_id));

      case "worldanvil_update_image": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(await client.updateImage(args.image_id, data));
      }

      case "worldanvil_delete_image":
        return jsonResponse(await client.deleteImage(args.image_id));

      // ===== MANUSCRIPT VERSIONS =====
      case "worldanvil_get_manuscriptversion":
        return jsonResponse(await client.getManuscriptVersion(args.version_id));

      case "worldanvil_list_manuscriptversions":
        return jsonResponse(
          await client.listManuscriptVersions(args.manuscript_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptversion":
        return jsonResponse(
          await client.createManuscriptVersion({
            title: args.title,
            manuscript: { id: args.manuscript_id },
          }),
        );

      case "worldanvil_update_manuscriptversion": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateManuscriptVersion(args.version_id, data),
        );
      }

      case "worldanvil_delete_manuscriptversion":
        return jsonResponse(
          await client.deleteManuscriptVersion(args.version_id),
        );

      // ===== MANUSCRIPT PARTS =====
      case "worldanvil_get_manuscriptpart":
        return jsonResponse(await client.getManuscriptPart(args.part_id));

      case "worldanvil_list_manuscriptparts":
        return jsonResponse(
          await client.listManuscriptParts(args.version_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptpart": {
        const data = {
          title: args.title,
          manuscriptVersion: { id: args.version_id },
        };
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        return jsonResponse(await client.createManuscriptPart(data));
      }

      case "worldanvil_update_manuscriptpart": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        return jsonResponse(
          await client.updateManuscriptPart(args.part_id, data),
        );
      }

      case "worldanvil_delete_manuscriptpart":
        return jsonResponse(await client.deleteManuscriptPart(args.part_id));

      // ===== MANUSCRIPT BEATS =====
      case "worldanvil_get_manuscriptbeat":
        return jsonResponse(await client.getManuscriptBeat(args.beat_id));

      case "worldanvil_list_manuscriptbeats":
        return jsonResponse(
          await client.listManuscriptBeats(args.part_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptbeat": {
        const data = {
          title: args.title,
          manuscriptPart: { id: args.part_id },
        };
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        return jsonResponse(await client.createManuscriptBeat(data));
      }

      case "worldanvil_update_manuscriptbeat": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.content !== undefined)
          data.content = markdownToBBCode(args.content);
        return jsonResponse(
          await client.updateManuscriptBeat(args.beat_id, data),
        );
      }

      case "worldanvil_delete_manuscriptbeat":
        return jsonResponse(await client.deleteManuscriptBeat(args.beat_id));

      // ===== MANUSCRIPT BOOKMARKS =====
      case "worldanvil_get_manuscriptbookmark":
        return jsonResponse(
          await client.getManuscriptBookmark(args.bookmark_id),
        );

      case "worldanvil_list_manuscriptbookmarks":
        return jsonResponse(
          await client.listManuscriptBookmarks(args.manuscript_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptbookmark":
        return jsonResponse(
          await client.createManuscriptBookmark({
            title: args.title,
            manuscript: { id: args.manuscript_id },
          }),
        );

      case "worldanvil_update_manuscriptbookmark": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateManuscriptBookmark(args.bookmark_id, data),
        );
      }

      case "worldanvil_delete_manuscriptbookmark":
        return jsonResponse(
          await client.deleteManuscriptBookmark(args.bookmark_id),
        );

      // ===== MANUSCRIPT TAGS =====
      case "worldanvil_get_manuscripttag":
        return jsonResponse(await client.getManuscriptTag(args.tag_id));

      case "worldanvil_list_manuscripttags":
        return jsonResponse(
          await client.listManuscriptTags(args.manuscript_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscripttag":
        return jsonResponse(
          await client.createManuscriptTag({
            title: args.title,
            manuscript: { id: args.manuscript_id },
          }),
        );

      case "worldanvil_update_manuscripttag": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateManuscriptTag(args.tag_id, data),
        );
      }

      case "worldanvil_delete_manuscripttag":
        return jsonResponse(await client.deleteManuscriptTag(args.tag_id));

      // ===== MANUSCRIPT STATS =====
      case "worldanvil_get_manuscriptstat":
        return jsonResponse(await client.getManuscriptStat(args.stat_id));

      case "worldanvil_list_manuscriptstats":
        return jsonResponse(
          await client.listManuscriptStats(args.version_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptstat":
        return jsonResponse(
          await client.createManuscriptStat({
            title: args.title,
            manuscriptVersion: { id: args.version_id },
          }),
        );

      case "worldanvil_update_manuscriptstat": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateManuscriptStat(args.stat_id, data),
        );
      }

      case "worldanvil_delete_manuscriptstat":
        return jsonResponse(await client.deleteManuscriptStat(args.stat_id));

      // ===== MANUSCRIPT LABELS =====
      case "worldanvil_get_manuscriptlabel":
        return jsonResponse(await client.getManuscriptLabel(args.label_id));

      case "worldanvil_list_manuscriptlabels":
        return jsonResponse(
          await client.listManuscriptLabels(args.manuscript_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptlabel": {
        const data = {
          title: args.title,
          manuscript: { id: args.manuscript_id },
        };
        if (args.color !== undefined) data.color = args.color;
        return jsonResponse(await client.createManuscriptLabel(data));
      }

      case "worldanvil_update_manuscriptlabel": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.color !== undefined) data.color = args.color;
        return jsonResponse(
          await client.updateManuscriptLabel(args.label_id, data),
        );
      }

      case "worldanvil_delete_manuscriptlabel":
        return jsonResponse(await client.deleteManuscriptLabel(args.label_id));

      // ===== MANUSCRIPT PLOTS =====
      case "worldanvil_get_manuscriptplot":
        return jsonResponse(await client.getManuscriptPlot(args.plot_id));

      case "worldanvil_list_manuscriptplots":
        return jsonResponse(
          await client.listManuscriptPlots(args.version_id, {
            offset: args.offset,
            limit: args.limit,
          }),
        );

      case "worldanvil_create_manuscriptplot":
        return jsonResponse(
          await client.createManuscriptPlot({
            title: args.title,
            manuscriptVersion: { id: args.version_id },
          }),
        );

      case "worldanvil_update_manuscriptplot": {
        const data = {};
        if (args.title !== undefined) data.title = args.title;
        return jsonResponse(
          await client.updateManuscriptPlot(args.plot_id, data),
        );
      }

      case "worldanvil_delete_manuscriptplot":
        return jsonResponse(await client.deleteManuscriptPlot(args.plot_id));

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return errorResponse(error);
  }
}
