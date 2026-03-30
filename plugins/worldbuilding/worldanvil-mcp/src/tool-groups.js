/**
 * World Anvil MCP Server - Tool Group Filtering
 *
 * Allows users to load only the tool groups they need,
 * reducing context window overhead for LLMs.
 *
 * Configure via WA_TOOL_GROUPS env var:
 *   WA_TOOL_GROUPS=content,maps,timeline     (specific groups)
 *   WA_TOOL_GROUPS=standard                   (preset)
 *   WA_TOOL_GROUPS=all                        (default — everything)
 *
 * The "core" group (identity + worlds) is always included.
 */

/**
 * Group definitions: group name → resource suffixes.
 * A tool's resource suffix is extracted by stripping 'worldanvil_{verb}_' from its name.
 * E.g., 'worldanvil_create_article' → suffix 'article' → group 'content'.
 */
const GROUP_RESOURCES = {
  core: ["identity", "worlds", "world"],
  content: ["articles", "article", "categories", "category"],
  images: ["images", "image"],
  campaign: [
    "notebook",
    "notebooks",
    "notesection",
    "notesections",
    "note",
    "notes",
    "secret",
    "secrets",
  ],
  maps: [
    "map",
    "maps",
    "marker",
    "markers",
    "markers_in_group",
    "layer",
    "layers",
    "markergroup",
    "markergroups",
    "markertype",
    "markertypes",
  ],
  timeline: ["timeline", "timelines", "history", "histories"],
  blocks: [
    "block",
    "blocks",
    "blocks_in_folder",
    "blockfolder",
    "blockfolders",
    "blocktemplate",
    "blocktemplates",
    "blocktemplatepart",
    "blocktemplateparts",
  ],
  manuscripts: [
    "manuscript",
    "manuscripts",
    "manuscriptversion",
    "manuscriptversions",
    "manuscriptpart",
    "manuscriptparts",
    "manuscriptbeat",
    "manuscriptbeats",
    "manuscriptbookmark",
    "manuscriptbookmarks",
    "manuscripttag",
    "manuscripttags",
    "manuscriptstat",
    "manuscriptstats",
    "manuscriptlabel",
    "manuscriptlabels",
    "manuscriptplot",
    "manuscriptplots",
  ],
  canvas: ["canvas", "canvases"],
  variables: [
    "variable",
    "variables",
    "variablecollection",
    "variablecollections",
  ],
  social: ["subscribergroup", "subscribergroups", "user"],
  rpg: ["rpgsystem", "rpgsystems"],
};

/**
 * Presets: named collections of groups for common use cases.
 */
const PRESETS = {
  all: Object.keys(GROUP_RESOURCES),
  standard: [
    "core",
    "content",
    "images",
    "campaign",
    "maps",
    "timeline",
    "variables",
    "rpg",
  ],
  worldbuilding: [
    "core",
    "content",
    "images",
    "maps",
    "timeline",
    "variables",
    "canvas",
  ],
  writing: ["core", "content", "manuscripts", "variables"],
  gamemaster: [
    "core",
    "content",
    "campaign",
    "maps",
    "timeline",
    "rpg",
    "blocks",
  ],
};

// Build reverse lookup: resource suffix → group name
const RESOURCE_TO_GROUP = new Map();
for (const [group, resources] of Object.entries(GROUP_RESOURCES)) {
  for (const resource of resources) {
    RESOURCE_TO_GROUP.set(resource, group);
  }
}

/**
 * Get the group name for a tool by its name.
 * @param {string} toolName - e.g. 'worldanvil_create_article'
 * @returns {string} group name, defaults to 'core' for unknown tools
 */
function getToolGroup(toolName) {
  const resource = toolName.replace(
    /^worldanvil_(get|list|create|update|delete)_/,
    "",
  );
  return RESOURCE_TO_GROUP.get(resource) || "core";
}

/**
 * Parse a WA_TOOL_GROUPS value into a Set of enabled group names.
 *
 * @param {string|undefined} value - Env var value (preset name, comma-separated groups, or 'all')
 * @returns {Set<string>|null} Set of enabled groups, or null for no filtering
 */
export function parseToolGroups(value) {
  if (!value || value.trim() === "" || value.trim().toLowerCase() === "all") {
    return null; // no filtering
  }

  const parts = value.split(",").map((s) => s.trim().toLowerCase());
  const groups = new Set();

  // Core is always included
  groups.add("core");

  for (const part of parts) {
    if (PRESETS[part]) {
      for (const g of PRESETS[part]) groups.add(g);
    } else if (GROUP_RESOURCES[part]) {
      groups.add(part);
    }
    // Silently ignore unknown names
  }

  return groups;
}

/**
 * Filter tool definitions to only include enabled groups.
 *
 * @param {Array} tools - Full tool definitions array
 * @param {Set<string>|null} enabledGroups - From parseToolGroups(), or null for all
 * @returns {Array} Filtered tool definitions
 */
export function filterTools(tools, enabledGroups) {
  if (!enabledGroups) return tools;
  return tools.filter((tool) => enabledGroups.has(getToolGroup(tool.name)));
}

export { GROUP_RESOURCES, PRESETS };
