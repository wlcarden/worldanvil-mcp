# WorldAnvil Boromir API - Complete Endpoint Catalog

> Compiled from [@crit-fumble/worldanvil](https://www.npmjs.com/package/@crit-fumble/worldanvil) TypeScript client (v3.1.0)
> Last updated: 2025-12-22

All endpoints are prefixed with `/api/external/boromir`

## Authentication

All requests require two headers:
- `x-application-key`: Your approved application key from World Anvil dev team
- `x-auth-token`: Your personal authentication token

## Common Parameters

- **granularity**: Controls detail level of returned data (0, 1, or 2)
  - 0: Basic/reference data
  - 1: Standard data with content
  - 2: Full data with all relationships

## API Resources

### Identity & Users

#### Get Current User Identity
- **GET** `/identity`
- Returns authenticated user's ID and information
- **Status**: ✅ Implemented in MCP

#### Get User by ID
- **GET** `/user?id={userId}&granularity={0-2}`
- **Status**: ❌ Not implemented

---

### Worlds

#### Get World
- **GET** `/world?id={worldId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Worlds
- **GET** `/user/worlds`
- Lists all worlds for authenticated user
- **Status**: ✅ Implemented in MCP

#### Create World
- **PUT** `/world`
- Body: `CreateWorldRequest`
- **Status**: ❌ Not implemented

#### Update World
- **PATCH** `/world?id={worldId}`
- Body: `UpdateWorldRequest`
- **Status**: ❌ Not implemented

#### Delete World
- **DELETE** `/world?id={worldId}`
- **Status**: ❌ Not implemented

---

### Articles

#### Get Article
- **GET** `/article?id={articleId}&granularity={0-2}`
- Returns article with optional content based on granularity
- **Status**: ✅ Implemented in MCP

#### List Articles in World
- **GET** `/world/articles?id={worldId}`
- **Status**: ✅ Implemented in MCP (but returns 404 - needs investigation)

#### Create Article
- **PUT** `/article`
- Body: `CreateArticleRequest` (title, world, category, template, content, etc.)
- **Status**: ❌ Not implemented (code exists in index.js line 145-147 but not exposed)

#### Update Article
- **PATCH** `/article?id={articleId}`
- Body: `UpdateArticleRequest`
- **Status**: ❌ Not implemented (code exists in index.js line 152-154 but not exposed)

#### Delete Article
- **DELETE** `/article?id={articleId}`
- **Status**: ❌ Not implemented

---

### Categories

#### Get Category
- **GET** `/category?id={categoryId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Categories in World
- **GET** `/world/categories?id={worldId}`
- **Status**: ✅ Implemented in MCP (but returns 404 - needs investigation)

#### Create Category
- **PUT** `/category`
- Body: `CreateCategoryRequest`
- **Status**: ❌ Not implemented

#### Update Category
- **PATCH** `/category?id={categoryId}`
- Body: `UpdateCategoryRequest`
- **Status**: ❌ Not implemented

#### Delete Category
- **DELETE** `/category?id={categoryId}`
- **Status**: ❌ Not implemented

---

### Images

#### Get Image
- **GET** `/image?id={imageId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Images in World
- **GET** `/world/images?id={worldId}`
- **Status**: ✅ Implemented in MCP

---

### Notebooks (Session Notes/Journals)

#### Get Notebook
- **GET** `/notebook?id={notebookId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Notebooks in World
- **GET** `/world/notebooks?id={worldId}`
- **Status**: ❌ Not implemented

#### Create Notebook
- **PUT** `/notebook`
- Body: `CreateNotebookRequest`
- **Status**: ❌ Not implemented

#### Update Notebook
- **PATCH** `/notebook?id={notebookId}`
- Body: `UpdateNotebookRequest`
- **Status**: ❌ Not implemented

#### Delete Notebook
- **DELETE** `/notebook?id={notebookId}`
- **Status**: ❌ Not implemented

---

### Note Sections

#### Get Note Section
- **GET** `/notesection?id={notesectionId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Note Sections in Notebook
- **GET** `/notebook/notesections?id={notebookId}`
- **Status**: ❌ Not implemented

#### Create Note Section
- **PUT** `/notesection`
- Body: `CreateNotesectionRequest`
- **Status**: ❌ Not implemented

#### Update Note Section
- **PATCH** `/notesection?id={notesectionId}`
- Body: `UpdateNotesectionRequest`
- **Status**: ❌ Not implemented

#### Delete Note Section
- **DELETE** `/notesection?id={notesectionId}`
- **Status**: ❌ Not implemented

---

### Notes

#### Get Note
- **GET** `/note?id={noteId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Notes in Section
- **GET** `/notesection/notes?id={notesectionId}`
- **Status**: ❌ Not implemented

#### Create Note
- **PUT** `/note`
- Body: `CreateNoteRequest` (title, notesection, content, etc.)
- **Status**: ❌ Not implemented

#### Update Note
- **PATCH** `/note?id={noteId}`
- Body: `UpdateNoteRequest`
- **Status**: ❌ Not implemented

#### Delete Note
- **DELETE** `/note?id={noteId}`
- **Status**: ❌ Not implemented

---

### Maps

#### Get Map
- **GET** `/map?id={mapId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Maps in World
- **GET** `/world/maps?id={worldId}`
- **Status**: ❌ Not implemented

#### Create Map
- **PUT** `/map`
- Body: `CreateMapRequest`
- **Status**: ❌ Not implemented

#### Update Map
- **PATCH** `/map?id={mapId}`
- Body: `UpdateMapRequest`
- **Status**: ❌ Not implemented

#### Delete Map
- **DELETE** `/map?id={mapId}`
- **Status**: ❌ Not implemented

---

### Map Markers

#### Get Marker
- **GET** `/marker?id={markerId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Markers on Map
- **GET** `/map/markers?id={mapId}`
- **Status**: ❌ Not implemented

#### Create Marker
- **PUT** `/marker`
- Body: `CreateMarkerRequest`
- **Status**: ❌ Not implemented

#### Update Marker
- **PATCH** `/marker?id={markerId}`
- Body: `UpdateMarkerRequest`
- **Status**: ❌ Not implemented

#### Delete Marker
- **DELETE** `/marker?id={markerId}`
- **Status**: ❌ Not implemented

---

### Timelines

#### Get Timeline
- **GET** `/timeline?id={timelineId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Timelines in World
- **GET** `/world/timelines?id={worldId}`
- **Status**: ❌ Not implemented

#### Create Timeline
- **PUT** `/timeline`
- Body: `CreateTimelineRequest`
- **Status**: ❌ Not implemented

#### Update Timeline
- **PATCH** `/timeline?id={timelineId}`
- Body: `UpdateTimelineRequest`
- **Status**: ❌ Not implemented

#### Delete Timeline
- **DELETE** `/timeline?id={timelineId}`
- **Status**: ❌ Not implemented

---

### History Events (Timeline Entries)

#### Get History Event
- **GET** `/history?id={historyId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List History Events in World
- **GET** `/world/histories?id={worldId}`
- **Status**: ❌ Not implemented

#### Create History Event
- **PUT** `/history`
- Body: `CreateHistoryRequest`
- **Status**: ❌ Not implemented

#### Update History Event
- **PATCH** `/history?id={historyId}`
- Body: `UpdateHistoryRequest`
- **Status**: ❌ Not implemented

#### Delete History Event
- **DELETE** `/history?id={historyId}`
- **Status**: ❌ Not implemented

---

### Secrets

#### Get Secret
- **GET** `/secret?id={secretId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List Secrets in World
- **GET** `/world/secrets?id={worldId}`
- **Status**: ❌ Not implemented

#### Create Secret
- **PUT** `/secret`
- Body: `CreateSecretRequest`
- **Status**: ❌ Not implemented

#### Update Secret
- **PATCH** `/secret?id={secretId}`
- Body: `UpdateSecretRequest`
- **Status**: ❌ Not implemented

#### Delete Secret
- **DELETE** `/secret?id={secretId}`
- **Status**: ❌ Not implemented

---

### RPG Systems

#### Get RPG System
- **GET** `/rpgsystem?id={rpgSystemId}&granularity={0-2}`
- **Status**: ❌ Not implemented

#### List All RPG Systems
- **POST** `/rpgsystems` (note: uses POST per World Anvil API design)
- **Status**: ❌ Not implemented

---

## Implementation Status Summary

### Currently Implemented (8 endpoints)
1. ✅ GET `/identity` - Get user identity
2. ✅ GET `/user/worlds` - List worlds
3. ✅ GET `/world` - Get world details
4. ✅ GET `/article` - Get article
5. ✅ GET `/world/articles` - List articles (returns 404 - needs fix)
6. ✅ GET `/category` - Get category
7. ✅ GET `/world/categories` - List categories (returns 404 - needs fix)
8. ✅ GET `/world/images` - List images

### Partially Implemented (Hidden)
- PUT `/article` - Create article (code exists but not exposed as MCP tool)
- PATCH `/article` - Update article (code exists but not exposed as MCP tool)

### Not Implemented (82+ endpoints)
- All write operations (PUT, PATCH, DELETE) except hidden article creation/update
- All notebook/notesection/note endpoints
- All map/marker endpoints
- All timeline/history endpoints
- All secret endpoints
- All RPG system endpoints
- User lookup endpoint

---

## Priority Recommendations for Expansion

### Phase 1: Fix Existing Issues
1. **Debug 404 errors** - Fix `list_articles` and `list_categories` endpoints
2. **Expose hidden functionality** - Make create/update article tools available

### Phase 2: Add Write Operations (High Value)
3. **Article management** - Create, update, delete articles
4. **Category management** - Create, update, delete categories
5. **World management** - Create, update, delete worlds

### Phase 3: Campaign Management (High Value for TTRPG)
6. **Notebooks** - Session journals and campaign notes
7. **Notes** - Individual session notes with full CRUD
8. **Secrets** - GM-only information management

### Phase 4: Worldbuilding Tools
9. **Maps** - Interactive map management with markers
10. **Timelines** - Historical event tracking
11. **Images** - Asset management and metadata

### Phase 5: Advanced Features
12. **Granularity support** - Add granularity parameter to existing tools
13. **Batch operations** - Bulk create/update/delete
14. **Search** - Full-text search across resources
15. **Relationships** - Link articles, track dependencies

---

## Sources
- [WorldAnvil API Documentation](https://www.worldanvil.com/api/external/boromir/swagger-documentation)
- [@crit-fumble/worldanvil npm package](https://www.npmjs.com/package/@crit-fumble/worldanvil)
- [pywaclient Python client](https://pypi.org/project/pywaclient/)
