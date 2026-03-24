/**
 * Timeline & History Handler Unit Tests
 *
 * Tests the handler dispatch and data-transformation logic for timeline and
 * history tools without making real API calls. The mock client captures
 * whatever arguments were passed so assertions can verify them exactly.
 *
 * Integration tests (real API calls) live in api.test.js.
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { handleToolCall } from '../src/handlers.js';
import { WorldAnvilClient } from '../src/api-client.js';

// ---------------------------------------------------------------------------
// Mock client — records every method call for assertion
// ---------------------------------------------------------------------------

function makeMockClient(overrides = {}) {
  const stub = (name) => vi.fn(async (...args) => ({ _called: name, _args: args }));
  return {
    createTimeline: stub('createTimeline'),
    updateTimeline: stub('updateTimeline'),
    deleteTimeline: stub('deleteTimeline'),
    getTimeline: stub('getTimeline'),
    listTimelines: stub('listTimelines'),
    createHistory: stub('createHistory'),
    updateHistory: stub('updateHistory'),
    deleteHistory: stub('deleteHistory'),
    getHistory: stub('getHistory'),
    listHistories: stub('listHistories'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Timeline handler tests
// ---------------------------------------------------------------------------

describe('Timeline handlers', () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe('worldanvil_create_timeline', () => {
    it('sends required fields', async () => {
      await handleToolCall('worldanvil_create_timeline', {
        title: 'Age of Empires',
        world_id: 'world-1',
      }, client);

      expect(client.createTimeline).toHaveBeenCalledOnce();
      const [payload] = client.createTimeline.mock.calls[0];
      expect(payload.title).toBe('Age of Empires');
      expect(payload.world).toEqual({ id: 'world-1' });
    });

    it('passes optional description, type, state, and tags', async () => {
      await handleToolCall('worldanvil_create_timeline', {
        title: 'Age of Empires',
        world_id: 'world-1',
        description: 'The rise and fall of empires.',
        type: 'master',
        state: 'public',
        tags: 'history,empires',
      }, client);

      const [payload] = client.createTimeline.mock.calls[0];
      expect(payload.description).toBe('The rise and fall of empires.');
      expect(payload.type).toBe('master');
      expect(payload.state).toBe('public');
      expect(payload.tags).toBe('history,empires');
    });

    it('omits optional fields when not provided', async () => {
      await handleToolCall('worldanvil_create_timeline', {
        title: 'Minimal',
        world_id: 'world-1',
      }, client);

      const [payload] = client.createTimeline.mock.calls[0];
      expect(payload.description).toBeUndefined();
      expect(payload.type).toBeUndefined();
      expect(payload.state).toBeUndefined();
      expect(payload.tags).toBeUndefined();
    });
  });

  describe('worldanvil_update_timeline', () => {
    it('sends only provided fields', async () => {
      await handleToolCall('worldanvil_update_timeline', {
        timeline_id: 'tl-1',
        title: 'Renamed',
      }, client);

      const [id, payload] = client.updateTimeline.mock.calls[0];
      expect(id).toBe('tl-1');
      expect(payload.title).toBe('Renamed');
      expect(payload.description).toBeUndefined();
    });

    it('converts history_ids array to { id } objects', async () => {
      await handleToolCall('worldanvil_update_timeline', {
        timeline_id: 'tl-1',
        history_ids: ['h-1', 'h-2', 'h-3'],
      }, client);

      const [, payload] = client.updateTimeline.mock.calls[0];
      expect(payload.histories).toEqual([{ id: 'h-1' }, { id: 'h-2' }, { id: 'h-3' }]);
    });

    it('passes all optional fields', async () => {
      await handleToolCall('worldanvil_update_timeline', {
        timeline_id: 'tl-1',
        description: 'Updated desc',
        type: 'parallel',
        state: 'private',
        tags: 'ancient',
      }, client);

      const [, payload] = client.updateTimeline.mock.calls[0];
      expect(payload.description).toBe('Updated desc');
      expect(payload.type).toBe('parallel');
      expect(payload.state).toBe('private');
      expect(payload.tags).toBe('ancient');
    });

    it('sends an empty payload when only timeline_id is given', async () => {
      await handleToolCall('worldanvil_update_timeline', {
        timeline_id: 'tl-1',
      }, client);

      const [, payload] = client.updateTimeline.mock.calls[0];
      expect(Object.keys(payload)).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// History handler tests
// ---------------------------------------------------------------------------

describe('History handlers', () => {
  let client;

  beforeEach(() => {
    client = makeMockClient();
  });

  describe('worldanvil_create_history', () => {
    it('sends required fields including year', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'The Great War',
        world_id: 'world-1',
        year: '1247',
      }, client);

      expect(client.createHistory).toHaveBeenCalledOnce();
      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.title).toBe('The Great War');
      expect(payload.world).toEqual({ id: 'world-1' });
      expect(payload.year).toBe('1247');
    });

    it('coerces numeric year to string', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: 500,
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.year).toBe('500');
      expect(typeof payload.year).toBe('string');
    });

    it('passes precise date fields', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Battle of Dawn',
        world_id: 'world-1',
        year: '1247',
        month: 6,
        day: 15,
        hour: 8,
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.month).toBe(6);
      expect(payload.day).toBe(15);
      expect(payload.hour).toBe(8);
    });

    it('passes date range fields for era events', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Age of Dragons',
        world_id: 'world-1',
        year: '100',
        endingYear: '500',
        endingMonth: 12,
        endingDay: 31,
        endingHour: 23,
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.endingYear).toBe('500');
      expect(payload.endingMonth).toBe(12);
      expect(payload.endingDay).toBe(31);
      expect(payload.endingHour).toBe(23);
    });

    it('coerces numeric endingYear to string', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Era',
        world_id: 'world-1',
        year: '100',
        endingYear: 200,
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.endingYear).toBe('200');
      expect(typeof payload.endingYear).toBe('string');
    });

    it('passes significance, state, and tags', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'The Founding',
        world_id: 'world-1',
        year: '1',
        significance: 5,
        state: 'public',
        tags: 'founding,important',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.significance).toBe(5);
      expect(payload.state).toBe('public');
      expect(payload.tags).toBe('founding,important');
    });

    it('passes content as short summary (no BBCode conversion)', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1',
        content: 'A brief summary.',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.content).toBe('A brief summary.');
    });

    it('converts fullcontent Markdown to BBCode', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1',
        fullcontent: '**Bold** and *italic* text.',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.fullcontent).toBe('[b]Bold[/b] and [i]italic[/i] text.');
    });

    it('passes display fields', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1247',
        displayDateName: 'Year of the Dragon',
        displayRange: true,
        alternativeDisplayRange: '1247–1250 AE',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.displayDateName).toBe('Year of the Dragon');
      expect(payload.displayRange).toBe(true);
      expect(payload.alternativeDisplayRange).toBe('1247–1250 AE');
    });

    it('converts article_id to nested object', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1',
        article_id: 'art-42',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.article).toEqual({ id: 'art-42' });
    });

    it('converts location_id to nested object', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1',
        location_id: 'loc-7',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.location).toEqual({ id: 'loc-7' });
    });

    it('converts character_ids array to { id } objects', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1',
        character_ids: ['char-1', 'char-2'],
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.characters).toEqual([{ id: 'char-1' }, { id: 'char-2' }]);
    });

    it('converts organization_ids array to { id } objects', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Event',
        world_id: 'world-1',
        year: '1',
        organization_ids: ['org-1'],
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.organizations).toEqual([{ id: 'org-1' }]);
    });

    it('omits all optional fields when not provided', async () => {
      await handleToolCall('worldanvil_create_history', {
        title: 'Minimal',
        world_id: 'world-1',
        year: '1',
      }, client);

      const [payload] = client.createHistory.mock.calls[0];
      expect(payload.month).toBeUndefined();
      expect(payload.day).toBeUndefined();
      expect(payload.endingYear).toBeUndefined();
      expect(payload.significance).toBeUndefined();
      expect(payload.fullcontent).toBeUndefined();
      expect(payload.article).toBeUndefined();
      expect(payload.characters).toBeUndefined();
    });
  });

  describe('worldanvil_update_history', () => {
    it('sends only provided fields', async () => {
      await handleToolCall('worldanvil_update_history', {
        history_id: 'h-1',
        title: 'Renamed Event',
      }, client);

      const [id, payload] = client.updateHistory.mock.calls[0];
      expect(id).toBe('h-1');
      expect(payload.title).toBe('Renamed Event');
      expect(payload.year).toBeUndefined();
    });

    it('coerces year to string on update', async () => {
      await handleToolCall('worldanvil_update_history', {
        history_id: 'h-1',
        year: 750,
      }, client);

      const [, payload] = client.updateHistory.mock.calls[0];
      expect(payload.year).toBe('750');
    });

    it('converts fullcontent Markdown on update', async () => {
      await handleToolCall('worldanvil_update_history', {
        history_id: 'h-1',
        fullcontent: '## Updated\n- item',
      }, client);

      const [, payload] = client.updateHistory.mock.calls[0];
      expect(payload.fullcontent).toContain('[h2]Updated[/h2]');
      expect(payload.fullcontent).toContain('[li]item[/li]');
    });

    it('converts linked entity IDs on update', async () => {
      await handleToolCall('worldanvil_update_history', {
        history_id: 'h-1',
        article_id: 'art-1',
        location_id: 'loc-1',
        character_ids: ['char-1'],
        organization_ids: ['org-1'],
      }, client);

      const [, payload] = client.updateHistory.mock.calls[0];
      expect(payload.article).toEqual({ id: 'art-1' });
      expect(payload.location).toEqual({ id: 'loc-1' });
      expect(payload.characters).toEqual([{ id: 'char-1' }]);
      expect(payload.organizations).toEqual([{ id: 'org-1' }]);
    });

    it('sends an empty payload when only history_id is given', async () => {
      await handleToolCall('worldanvil_update_history', {
        history_id: 'h-1',
      }, client);

      const [, payload] = client.updateHistory.mock.calls[0];
      expect(Object.keys(payload)).toHaveLength(0);
    });
  });

  describe('worldanvil_delete_history', () => {
    it('calls deleteHistory with the correct ID', async () => {
      await handleToolCall('worldanvil_delete_history', { history_id: 'h-99' }, client);

      expect(client.deleteHistory).toHaveBeenCalledWith('h-99');
    });
  });

  describe('worldanvil_list_histories', () => {
    it('passes world_id and pagination options', async () => {
      await handleToolCall('worldanvil_list_histories', {
        world_id: 'world-1',
        offset: 10,
        limit: 25,
      }, client);

      expect(client.listHistories).toHaveBeenCalledWith('world-1', { offset: 10, limit: 25 });
    });
  });
});

// ---------------------------------------------------------------------------
// Integration tests — real API calls, skipped without both credentials
// ---------------------------------------------------------------------------

// Both WA_AUTH_TOKEN and WA_APP_KEY are required to run integration tests.
// Proxy mode (WA_AUTH_TOKEN only) is not used here because the public proxy
// may be blocked by WorldAnvil's Cloudflare protection, causing test flakiness.
const hasCredentials = !!process.env.WA_AUTH_TOKEN && !!process.env.WA_APP_KEY;
const TIMEOUT = 30000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const RATE_LIMIT_DELAY = 750;

describe.skipIf(!hasCredentials)('Timeline & History Integration', () => {
  let client;
  let testWorldId;
  // IDs shared across the ordered lifecycle tests
  let timelineId;
  let historyId;

  beforeAll(async () => {
    client = new WorldAnvilClient({
      appKey: process.env.WA_APP_KEY,
      authToken: process.env.WA_AUTH_TOKEN,
    });

    // Use configured world, or find/create a [TEST] world
    if (process.env.WA_TEST_WORLD_ID) {
      testWorldId = process.env.WA_TEST_WORLD_ID;
      return;
    }
    await delay(RATE_LIMIT_DELAY);
    const worlds = await client.listWorlds();
    const testWorld = worlds.entities.find(w => w.title.startsWith('[TEST]'));
    if (testWorld) {
      testWorldId = testWorld.id;
    } else {
      const created = await client.createWorld({ title: '[TEST] MCP Timeline Tests' });
      testWorldId = created.id;
    }
  }, TIMEOUT);

  // Single 750ms pause between every test — no extra delays inside tests
  // except where a write→read round-trip needs its own settle time.
  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  afterAll(async () => {
    // Safety-net cleanup: delete anything the ordered tests didn't already clean up.
    if (historyId) {
      await delay(RATE_LIMIT_DELAY);
      try { await client.deleteHistory(historyId); } catch { /* ignore */ }
    }
    if (timelineId) {
      await delay(RATE_LIMIT_DELAY);
      try { await client.deleteTimeline(timelineId); } catch { /* ignore */ }
    }
  }, TIMEOUT);

  // -----------------------------------------------------------------------
  // Ordered lifecycle — tests run sequentially and share timelineId/historyId
  // -----------------------------------------------------------------------

  it('creates a timeline with description, type, state, and tags', async () => {
    const result = await client.createTimeline({
      title: '[TEST] Age of Empires',
      world: { id: testWorldId },
      description: 'The rise and fall of the old empires.',
      type: 'master',
      state: 'private',
      tags: 'test,empires',
    });

    expect(result.id).toBeDefined();
    timelineId = result.id;
  }, TIMEOUT);

  it('updates timeline description and type', async () => {
    expect(timelineId).toBeDefined();

    await client.updateTimeline(timelineId, {
      title: '[TEST] Age of Empires (Revised)',
      description: 'Updated description.',
      type: 'parallel',
    });

    await delay(RATE_LIMIT_DELAY); // settle before read
    const result = await client.getTimeline(timelineId);
    expect(result.title).toBe('[TEST] Age of Empires (Revised)');
  }, TIMEOUT);

  it('creates a history event with year, date range, significance, and full content', async () => {
    expect(testWorldId).toBeDefined();

    const result = await client.createHistory({
      title: '[TEST] The Great War',
      world: { id: testWorldId },
      year: '1247',
      month: 6,
      day: 15,
      endingYear: '1250',
      significance: 5,
      state: 'private',
      tags: 'test,war',
      content: 'A brief summary of the conflict.',
      fullcontent: '[b]The Great War[/b] reshaped the realm.',
    });

    expect(result.id).toBeDefined();
    historyId = result.id;
  }, TIMEOUT);

  it('reads back the history event', async () => {
    expect(historyId).toBeDefined();

    const result = await client.getHistory(historyId);
    expect(result.id).toBe(historyId);
    expect(result.title).toBe('[TEST] The Great War');
  }, TIMEOUT);

  it('attaches history event to timeline via history_ids replace', async () => {
    expect(timelineId).toBeDefined();
    expect(historyId).toBeDefined();

    await client.updateTimeline(timelineId, {
      histories: [{ id: historyId }],
    });

    await delay(RATE_LIMIT_DELAY); // settle before read
    const result = await client.getTimeline(timelineId);
    const ids = (result.histories || []).map(h => h.id);
    expect(ids).toContain(historyId);
  }, TIMEOUT);

  it('updates history event title and date fields', async () => {
    expect(historyId).toBeDefined();

    await client.updateHistory(historyId, {
      title: '[TEST] The Great War (Updated)',
      month: 7,
      significance: 4,
    });

    await delay(RATE_LIMIT_DELAY); // settle before read
    const result = await client.getHistory(historyId);
    expect(result.title).toBe('[TEST] The Great War (Updated)');
  }, TIMEOUT);

  it('history event appears in world listing', async () => {
    expect(historyId).toBeDefined();

    const result = await client.listHistories(testWorldId);
    expect(result.entities).toBeDefined();
    const found = result.entities.find(h => h.id === historyId);
    expect(found).toBeDefined();
  }, TIMEOUT);

  it('deletes the history event', async () => {
    expect(historyId).toBeDefined();

    await client.deleteHistory(historyId);

    await delay(RATE_LIMIT_DELAY); // settle before read
    const list = await client.listHistories(testWorldId);
    const found = list.entities.find(h => h.id === historyId);
    expect(found).toBeUndefined();
    historyId = null; // mark clean so afterAll skips it
  }, TIMEOUT);

  it('deletes the timeline', async () => {
    expect(timelineId).toBeDefined();

    await client.deleteTimeline(timelineId);
    timelineId = null; // mark clean so afterAll skips it
  }, TIMEOUT);
});

describe.runIf(!hasCredentials)('Timeline & History Integration (Skipped)', () => {
  it('requires WA_AUTH_TOKEN and WA_APP_KEY environment variables', () => {
    console.log('\n  Integration tests skipped - WA_AUTH_TOKEN and WA_APP_KEY must both be set\n');
    expect(true).toBe(true);
  });
});
