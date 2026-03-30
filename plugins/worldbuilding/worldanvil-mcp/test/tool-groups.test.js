/**
 * Tool Group Filtering Tests
 *
 * Tests the tool group parsing, filtering, and preset logic
 * that controls which tools are exposed to LLMs.
 */

import { describe, it, expect } from "vitest";
import {
  parseToolGroups,
  filterTools,
  GROUP_RESOURCES,
  PRESETS,
} from "../src/tool-groups.js";
import { getToolDefinitions } from "../src/tools.js";

const ALL_TOOLS = getToolDefinitions();

describe("parseToolGroups", () => {
  it("should return null for undefined (no filtering)", () => {
    expect(parseToolGroups(undefined)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseToolGroups("")).toBeNull();
  });

  it("should return null for 'all'", () => {
    expect(parseToolGroups("all")).toBeNull();
    expect(parseToolGroups("ALL")).toBeNull();
    expect(parseToolGroups("  All  ")).toBeNull();
  });

  it("should parse a single group name", () => {
    const groups = parseToolGroups("content");
    expect(groups).toBeInstanceOf(Set);
    expect(groups.has("content")).toBe(true);
    expect(groups.has("core")).toBe(true); // always included
  });

  it("should parse comma-separated group names", () => {
    const groups = parseToolGroups("content,maps,timeline");
    expect(groups.has("content")).toBe(true);
    expect(groups.has("maps")).toBe(true);
    expect(groups.has("timeline")).toBe(true);
    expect(groups.has("core")).toBe(true);
    expect(groups.has("manuscripts")).toBe(false);
  });

  it("should handle whitespace in group names", () => {
    const groups = parseToolGroups(" content , maps , timeline ");
    expect(groups.has("content")).toBe(true);
    expect(groups.has("maps")).toBe(true);
    expect(groups.has("timeline")).toBe(true);
  });

  it("should expand preset names", () => {
    const groups = parseToolGroups("standard");
    for (const g of PRESETS.standard) {
      expect(groups.has(g)).toBe(true);
    }
  });

  it("should handle mixed presets and group names", () => {
    const groups = parseToolGroups("writing,blocks");
    // writing preset includes: core, content, manuscripts, variables
    expect(groups.has("content")).toBe(true);
    expect(groups.has("manuscripts")).toBe(true);
    expect(groups.has("variables")).toBe(true);
    // explicit group
    expect(groups.has("blocks")).toBe(true);
    // not included
    expect(groups.has("maps")).toBe(false);
  });

  it("should ignore unknown group names silently", () => {
    const groups = parseToolGroups("content,nonexistent,maps");
    expect(groups.has("content")).toBe(true);
    expect(groups.has("maps")).toBe(true);
    expect(groups.has("nonexistent")).toBe(false);
  });

  it("should always include core group", () => {
    const groups = parseToolGroups("manuscripts");
    expect(groups.has("core")).toBe(true);
  });
});

describe("filterTools", () => {
  it("should return all tools when enabledGroups is null", () => {
    const result = filterTools(ALL_TOOLS, null);
    expect(result).toHaveLength(ALL_TOOLS.length);
  });

  it("should filter to only core tools", () => {
    const groups = new Set(["core"]);
    const result = filterTools(ALL_TOOLS, groups);
    // Core has identity + world CRUD = 6 tools
    expect(result.length).toBe(6);
    expect(result.every((t) => t.name.match(/identity|world/))).toBe(true);
  });

  it("should filter to content group", () => {
    const groups = new Set(["core", "content"]);
    const result = filterTools(ALL_TOOLS, groups);
    // Core (6) + articles (5) + categories (5) = 16
    expect(result.length).toBe(16);
  });

  it("should filter with a preset", () => {
    const groups = parseToolGroups("writing");
    const result = filterTools(ALL_TOOLS, groups);
    // writing = core + content + manuscripts + variables
    // Should be significantly less than all tools
    expect(result.length).toBeGreaterThan(6);
    expect(result.length).toBeLessThan(ALL_TOOLS.length);
    // Should include article tools
    expect(result.some((t) => t.name === "worldanvil_create_article")).toBe(
      true,
    );
    // Should include manuscript tools
    expect(result.some((t) => t.name === "worldanvil_create_manuscript")).toBe(
      true,
    );
    // Should NOT include map tools
    expect(result.some((t) => t.name === "worldanvil_create_map")).toBe(false);
  });

  it("should not filter out tools that are called even if not listed", () => {
    // Verify that handlers still work for filtered-out tools
    // (filtering is context reduction, not access control)
    const groups = new Set(["core"]);
    const filtered = filterTools(ALL_TOOLS, groups);
    const fullNames = new Set(ALL_TOOLS.map((t) => t.name));
    const filteredNames = new Set(filtered.map((t) => t.name));
    // Confirm articles are filtered out of the listing
    expect(filteredNames.has("worldanvil_create_article")).toBe(false);
    // But they still exist in the full definitions
    expect(fullNames.has("worldanvil_create_article")).toBe(true);
  });
});

describe("GROUP_RESOURCES completeness", () => {
  it("should map every tool to a group", () => {
    // Build the reverse map the same way the module does
    const resourceToGroup = new Map();
    for (const [group, resources] of Object.entries(GROUP_RESOURCES)) {
      for (const resource of resources) {
        resourceToGroup.set(resource, group);
      }
    }

    const unmapped = [];
    for (const tool of ALL_TOOLS) {
      const resource = tool.name.replace(
        /^worldanvil_(get|list|create|update|delete)_/,
        "",
      );
      if (!resourceToGroup.has(resource)) {
        unmapped.push(tool.name);
      }
    }

    expect(unmapped).toEqual([]);
  });

  it("should include all group names in the 'all' preset", () => {
    const allGroupNames = Object.keys(GROUP_RESOURCES);
    expect(PRESETS.all).toEqual(allGroupNames);
  });

  it("should only reference valid groups in presets", () => {
    const validGroups = new Set(Object.keys(GROUP_RESOURCES));
    for (const [presetName, groups] of Object.entries(PRESETS)) {
      for (const g of groups) {
        expect(validGroups.has(g)).toBe(true);
      }
    }
  });
});
