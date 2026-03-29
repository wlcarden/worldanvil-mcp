/**
 * Handler Unit Tests
 *
 * Tests handler dispatch and data-transformation logic for categories,
 * articles, secrets, canvas, and markers without making real API calls.
 * Follows the same mock-client pattern established in timeline.test.js.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleToolCall } from "../src/handlers.js";

// ---------------------------------------------------------------------------
// Mock client — records every method call for assertion
// ---------------------------------------------------------------------------

function makeMockClient(overrides = {}) {
  const stub = (name) =>
    vi.fn(async (...args) => ({ _called: name, _args: args }));
  return {
    listCategories: stub("listCategories"),
    createCategory: stub("createCategory"),
    updateCategory: stub("updateCategory"),
    createArticle: stub("createArticle"),
    updateArticle: stub("updateArticle"),
    createSecret: stub("createSecret"),
    updateSecret: stub("updateSecret"),
    updateCanvas: stub("updateCanvas"),
    createMarker: stub("createMarker"),
    updateMarker: stub("updateMarker"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Category handlers
// ---------------------------------------------------------------------------

describe("Category handlers", () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe("worldanvil_list_categories", () => {
    it("passes world_id and pagination options", async () => {
      await handleToolCall(
        "worldanvil_list_categories",
        {
          world_id: "world-1",
          offset: 10,
          limit: 25,
        },
        client,
      );

      expect(client.listCategories).toHaveBeenCalledOnce();
      const [worldId, options] = client.listCategories.mock.calls[0];
      expect(worldId).toBe("world-1");
      expect(options.offset).toBe(10);
      expect(options.limit).toBe(25);
    });

    it("omits offset/limit when not provided", async () => {
      await handleToolCall(
        "worldanvil_list_categories",
        {
          world_id: "world-1",
        },
        client,
      );

      const [worldId, options] = client.listCategories.mock.calls[0];
      expect(worldId).toBe("world-1");
      expect(options).toEqual({});
    });
  });

  describe("worldanvil_create_category", () => {
    it("sends required fields", async () => {
      await handleToolCall(
        "worldanvil_create_category",
        {
          title: "Noble Houses",
          world_id: "world-1",
        },
        client,
      );

      expect(client.createCategory).toHaveBeenCalledOnce();
      const [payload] = client.createCategory.mock.calls[0];
      expect(payload.title).toBe("Noble Houses");
      expect(payload.world).toEqual({ id: "world-1" });
    });

    it("passes parent_category_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_create_category",
        {
          title: "House Blackwood",
          world_id: "world-1",
          parent_category_id: "cat-parent",
        },
        client,
      );

      const [payload] = client.createCategory.mock.calls[0];
      expect(payload.parentCategory).toEqual({ id: "cat-parent" });
    });

    it("omits parentCategory when parent_category_id not provided", async () => {
      await handleToolCall(
        "worldanvil_create_category",
        {
          title: "Top Level",
          world_id: "world-1",
        },
        client,
      );

      const [payload] = client.createCategory.mock.calls[0];
      expect(payload.parentCategory).toBeUndefined();
    });
  });

  describe("worldanvil_update_category", () => {
    it("passes parent_category_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_update_category",
        {
          category_id: "cat-1",
          parent_category_id: "cat-parent",
        },
        client,
      );

      expect(client.updateCategory).toHaveBeenCalledOnce();
      const [, payload] = client.updateCategory.mock.calls[0];
      expect(payload.parentCategory).toEqual({ id: "cat-parent" });
    });

    it("sends only provided fields", async () => {
      await handleToolCall(
        "worldanvil_update_category",
        {
          category_id: "cat-1",
          title: "Renamed",
        },
        client,
      );

      const [, payload] = client.updateCategory.mock.calls[0];
      expect(payload.title).toBe("Renamed");
      expect(payload.parentCategory).toBeUndefined();
      expect(payload.icon).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Article handlers
// ---------------------------------------------------------------------------

describe("Article handlers", () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe("worldanvil_create_article", () => {
    it("passes category_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_create_article",
        {
          title: "Thronehold",
          world_id: "world-1",
          category_id: "cat-cities",
        },
        client,
      );

      expect(client.createArticle).toHaveBeenCalledOnce();
      const [payload] = client.createArticle.mock.calls[0];
      expect(payload.category).toEqual({ id: "cat-cities" });
    });

    it("omits category when category_id not provided", async () => {
      await handleToolCall(
        "worldanvil_create_article",
        {
          title: "Orphan Article",
          world_id: "world-1",
        },
        client,
      );

      const [payload] = client.createArticle.mock.calls[0];
      expect(payload.category).toBeUndefined();
    });
  });

  describe("worldanvil_update_article", () => {
    it("passes category_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_update_article",
        {
          article_id: "art-1",
          category_id: "cat-new",
        },
        client,
      );

      expect(client.updateArticle).toHaveBeenCalledOnce();
      const [, payload] = client.updateArticle.mock.calls[0];
      expect(payload.category).toEqual({ id: "cat-new" });
    });

    it("omits category when category_id not provided", async () => {
      await handleToolCall(
        "worldanvil_update_article",
        {
          article_id: "art-1",
          title: "New Title",
        },
        client,
      );

      const [, payload] = client.updateArticle.mock.calls[0];
      expect(payload.category).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Secret handlers
// ---------------------------------------------------------------------------

describe("Secret handlers", () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe("worldanvil_create_secret", () => {
    it("sends required fields", async () => {
      await handleToolCall(
        "worldanvil_create_secret",
        {
          title: "Hidden Truth",
          world_id: "world-1",
        },
        client,
      );

      expect(client.createSecret).toHaveBeenCalledOnce();
      const [payload] = client.createSecret.mock.calls[0];
      expect(payload.title).toBe("Hidden Truth");
      expect(payload.world).toEqual({ id: "world-1" });
    });

    it("passes article_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_create_secret",
        {
          title: "Hidden Truth",
          world_id: "world-1",
          article_id: "art-npc",
        },
        client,
      );

      const [payload] = client.createSecret.mock.calls[0];
      expect(payload.article).toEqual({ id: "art-npc" });
    });

    it("omits content when not provided", async () => {
      await handleToolCall(
        "worldanvil_create_secret",
        {
          title: "No Content Secret",
          world_id: "world-1",
        },
        client,
      );

      const [payload] = client.createSecret.mock.calls[0];
      expect(payload.content).toBeUndefined();
    });

    it("omits article when article_id not provided", async () => {
      await handleToolCall(
        "worldanvil_create_secret",
        {
          title: "Unattached Secret",
          world_id: "world-1",
          content: "some text",
        },
        client,
      );

      const [payload] = client.createSecret.mock.calls[0];
      expect(payload.article).toBeUndefined();
    });
  });

  describe("worldanvil_update_secret", () => {
    it("sends only provided fields", async () => {
      await handleToolCall(
        "worldanvil_update_secret",
        {
          secret_id: "sec-1",
          title: "New Title",
        },
        client,
      );

      expect(client.updateSecret).toHaveBeenCalledOnce();
      const [, payload] = client.updateSecret.mock.calls[0];
      expect(payload.title).toBe("New Title");
      expect(payload.content).toBeUndefined();
      expect(payload.article).toBeUndefined();
    });

    it("passes article_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_update_secret",
        {
          secret_id: "sec-1",
          article_id: "art-2",
        },
        client,
      );

      const [, payload] = client.updateSecret.mock.calls[0];
      expect(payload.article).toEqual({ id: "art-2" });
    });
  });
});

// ---------------------------------------------------------------------------
// Canvas handlers
// ---------------------------------------------------------------------------

describe("Canvas handlers", () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe("worldanvil_update_canvas", () => {
    it("passes title", async () => {
      await handleToolCall(
        "worldanvil_update_canvas",
        {
          canvas_id: "canvas-1",
          title: "New Board Name",
        },
        client,
      );

      expect(client.updateCanvas).toHaveBeenCalledOnce();
      const [, payload] = client.updateCanvas.mock.calls[0];
      expect(payload.title).toBe("New Board Name");
    });

    it("passes data object", async () => {
      const boardData = { nodes: [{ id: 1, label: "Test" }] };
      await handleToolCall(
        "worldanvil_update_canvas",
        {
          canvas_id: "canvas-1",
          data: boardData,
        },
        client,
      );

      const [, payload] = client.updateCanvas.mock.calls[0];
      expect(payload.data).toEqual(boardData);
    });

    it("sends empty payload when only canvas_id given", async () => {
      await handleToolCall(
        "worldanvil_update_canvas",
        {
          canvas_id: "canvas-1",
        },
        client,
      );

      const [, payload] = client.updateCanvas.mock.calls[0];
      expect(payload).toEqual({});
    });
  });
});

// ---------------------------------------------------------------------------
// Marker handlers
// ---------------------------------------------------------------------------

describe("Marker handlers", () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe("worldanvil_create_marker", () => {
    it("sends required fields", async () => {
      await handleToolCall(
        "worldanvil_create_marker",
        {
          title: "Dragon Lair",
          map_id: "map-1",
        },
        client,
      );

      expect(client.createMarker).toHaveBeenCalledOnce();
      const [payload] = client.createMarker.mock.calls[0];
      expect(payload.title).toBe("Dragon Lair");
      expect(payload.map).toBe("map-1");
    });

    it("passes article_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_create_marker",
        {
          title: "Dragon Lair",
          map_id: "map-1",
          article_id: "art-dragon",
        },
        client,
      );

      const [payload] = client.createMarker.mock.calls[0];
      expect(payload.article).toEqual({ id: "art-dragon" });
    });

    it("omits article when article_id not provided", async () => {
      await handleToolCall(
        "worldanvil_create_marker",
        {
          title: "Unmarked Point",
          map_id: "map-1",
        },
        client,
      );

      const [payload] = client.createMarker.mock.calls[0];
      expect(payload.article).toBeUndefined();
    });
  });

  describe("worldanvil_update_marker", () => {
    it("sends only provided fields", async () => {
      await handleToolCall(
        "worldanvil_update_marker",
        {
          marker_id: "marker-1",
          title: "Renamed Marker",
        },
        client,
      );

      expect(client.updateMarker).toHaveBeenCalledOnce();
      const [, payload] = client.updateMarker.mock.calls[0];
      expect(payload.title).toBe("Renamed Marker");
      expect(payload.article).toBeUndefined();
    });

    it("passes article_id as nested object", async () => {
      await handleToolCall(
        "worldanvil_update_marker",
        {
          marker_id: "marker-1",
          article_id: "art-new",
        },
        client,
      );

      const [, payload] = client.updateMarker.mock.calls[0];
      expect(payload.article).toEqual({ id: "art-new" });
    });

    it("sends empty payload when only marker_id given", async () => {
      await handleToolCall(
        "worldanvil_update_marker",
        {
          marker_id: "marker-1",
        },
        client,
      );

      const [, payload] = client.updateMarker.mock.calls[0];
      expect(payload).toEqual({});
    });
  });
});
