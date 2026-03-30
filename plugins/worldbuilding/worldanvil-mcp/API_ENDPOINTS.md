# WorldAnvil Boromir API - Complete Endpoint Catalog

> Compiled from [@crit-fumble/worldanvil](https://www.npmjs.com/package/@crit-fumble/worldanvil) TypeScript client (v3.1.0)
> Last updated: 2026-03-29

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
- **Status**: ✅ Implemented in MCP

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
- **Status**: ✅ Implemented in MCP

#### Update World

- **PATCH** `/world?id={worldId}`
- Body: `UpdateWorldRequest`
- **Status**: ✅ Implemented in MCP

#### Delete World

- **DELETE** `/world?id={worldId}`
- **Status**: ✅ Implemented in MCP

---

### Articles

#### Get Article

- **GET** `/article?id={articleId}&granularity={0-2}`
- Returns article with optional content based on granularity
- **Status**: ✅ Implemented in MCP

#### List Articles in World

- **GET** `/world/articles?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create Article

- **PUT** `/article`
- Body: `CreateArticleRequest` (title, world, category, template, content, etc.)
- **Status**: ✅ Implemented in MCP

#### Update Article

- **PATCH** `/article?id={articleId}`
- Body: `UpdateArticleRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Article

- **DELETE** `/article?id={articleId}`
- **Status**: ✅ Implemented in MCP

---

### Categories

#### Get Category

- **GET** `/category?id={categoryId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Categories in World

- **GET** `/world/categories?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create Category

- **PUT** `/category`
- Body: `CreateCategoryRequest`
- **Status**: ✅ Implemented in MCP

#### Update Category

- **PATCH** `/category?id={categoryId}`
- Body: `UpdateCategoryRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Category

- **DELETE** `/category?id={categoryId}`
- **Status**: ✅ Implemented in MCP

---

### Images

#### Get Image

- **GET** `/image?id={imageId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Images in World

- **GET** `/world/images?id={worldId}`
- **Status**: ✅ Implemented in MCP

---

### Notebooks (Session Notes/Journals)

#### Get Notebook

- **GET** `/notebook?id={notebookId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Notebooks in World

- **GET** `/world/notebooks?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create Notebook

- **PUT** `/notebook`
- Body: `CreateNotebookRequest`
- **Status**: ✅ Implemented in MCP

#### Update Notebook

- **PATCH** `/notebook?id={notebookId}`
- Body: `UpdateNotebookRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Notebook

- **DELETE** `/notebook?id={notebookId}`
- **Status**: ✅ Implemented in MCP

---

### Note Sections

#### Get Note Section

- **GET** `/notesection?id={notesectionId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Note Sections in Notebook

- **GET** `/notebook/notesections?id={notebookId}`
- **Status**: ✅ Implemented in MCP

#### Create Note Section

- **PUT** `/notesection`
- Body: `CreateNotesectionRequest`
- **Status**: ✅ Implemented in MCP

#### Update Note Section

- **PATCH** `/notesection?id={notesectionId}`
- Body: `UpdateNotesectionRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Note Section

- **DELETE** `/notesection?id={notesectionId}`
- **Status**: ✅ Implemented in MCP

---

### Notes

#### Get Note

- **GET** `/note?id={noteId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Notes in Section

- **GET** `/notesection/notes?id={notesectionId}`
- **Status**: ✅ Implemented in MCP

#### Create Note

- **PUT** `/note`
- Body: `CreateNoteRequest` (title, notesection, content, etc.)
- **Status**: ✅ Implemented in MCP

#### Update Note

- **PATCH** `/note?id={noteId}`
- Body: `UpdateNoteRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Note

- **DELETE** `/note?id={noteId}`
- **Status**: ✅ Implemented in MCP

---

### Maps

#### Get Map

- **GET** `/map?id={mapId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Maps in World

- **GET** `/world/maps?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create Map

- **PUT** `/map`
- Body: `CreateMapRequest`
- **Status**: ✅ Implemented in MCP

#### Update Map

- **PATCH** `/map?id={mapId}`
- Body: `UpdateMapRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Map

- **DELETE** `/map?id={mapId}`
- **Status**: ✅ Implemented in MCP

---

### Map Markers

#### Get Marker

- **GET** `/marker?id={markerId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Markers on Map

- **GET** `/map/markers?id={mapId}`
- **Status**: ✅ Implemented in MCP

#### Create Marker

- **PUT** `/marker`
- Body: `CreateMarkerRequest`
- **Status**: ✅ Implemented in MCP

#### Update Marker

- **PATCH** `/marker?id={markerId}`
- Body: `UpdateMarkerRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Marker

- **DELETE** `/marker?id={markerId}`
- **Status**: ✅ Implemented in MCP

---

### Timelines

#### Get Timeline

- **GET** `/timeline?id={timelineId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Timelines in World

- **GET** `/world/timelines?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create Timeline

- **PUT** `/timeline`
- Body: `CreateTimelineRequest`
- **Status**: ✅ Implemented in MCP

#### Update Timeline

- **PATCH** `/timeline?id={timelineId}`
- Body: `UpdateTimelineRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Timeline

- **DELETE** `/timeline?id={timelineId}`
- **Status**: ✅ Implemented in MCP

---

### History Events (Timeline Entries)

#### Get History Event

- **GET** `/history?id={historyId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List History Events in World

- **GET** `/world/histories?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create History Event

- **PUT** `/history`
- Body: `CreateHistoryRequest`
- **Status**: ✅ Implemented in MCP

#### Update History Event

- **PATCH** `/history?id={historyId}`
- Body: `UpdateHistoryRequest`
- **Status**: ✅ Implemented in MCP

#### Delete History Event

- **DELETE** `/history?id={historyId}`
- **Status**: ✅ Implemented in MCP

---

### Secrets

#### Get Secret

- **GET** `/secret?id={secretId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List Secrets in World

- **GET** `/world/secrets?id={worldId}`
- **Status**: ✅ Implemented in MCP

#### Create Secret

- **PUT** `/secret`
- Body: `CreateSecretRequest`
- **Status**: ✅ Implemented in MCP

#### Update Secret

- **PATCH** `/secret?id={secretId}`
- Body: `UpdateSecretRequest`
- **Status**: ✅ Implemented in MCP

#### Delete Secret

- **DELETE** `/secret?id={secretId}`
- **Status**: ✅ Implemented in MCP

---

### RPG Systems

#### Get RPG System

- **GET** `/rpgsystem?id={rpgSystemId}&granularity={0-2}`
- **Status**: ✅ Implemented in MCP

#### List All RPG Systems

- **POST** `/rpgsystems` (note: uses POST per World Anvil API design)
- **Status**: ✅ Implemented in MCP

---

## Implementation Status Summary (v1.11.0 — 166 tools)

### Fully Implemented — Full CRUD + List (26 resource types)

| Resource            | GET | List | Create | Update | Delete | Notes            |
| ------------------- | --- | ---- | ------ | ------ | ------ | ---------------- |
| Identity            | ✅  | —    | —      | —      | —      | Read-only        |
| User                | ✅  | —    | —      | ✅     | —      |                  |
| World               | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Article             | ✅  | ✅   | ✅     | ✅     | ✅     | Markdown→BBCode  |
| Category            | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Image               | ✅  | ✅   | —      | ✅     | ✅     | Upload NYI by WA |
| Notebook            | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Note Section        | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Note                | ✅  | ✅   | ✅     | ✅     | ✅     | Markdown→BBCode  |
| Secret              | ✅  | ✅   | ✅     | ✅     | ✅     | Markdown→BBCode  |
| Map                 | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Map Layer           | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Marker              | ✅  | ✅   | ✅     | ✅     | ✅     | +list by group   |
| Marker Group        | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Marker Type         | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Timeline            | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| History Event       | ✅  | ✅   | ✅     | ✅     | ✅     | Markdown→BBCode  |
| RPG System          | ✅  | ✅   | —      | —      | —      | Read-only        |
| Block               | ✅  | ✅   | ✅     | ✅     | ✅     | +list by folder  |
| Block Folder        | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Block Template      | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Block Template Part | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript          | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript Version  | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript Part     | ✅  | ✅   | ✅     | ✅     | ✅     | Markdown→BBCode  |
| Manuscript Beat     | ✅  | ✅   | ✅     | ✅     | ✅     | Markdown→BBCode  |
| Manuscript Bookmark | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript Tag      | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript Stat     | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript Label    | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Manuscript Plot     | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Canvas              | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Subscriber Group    | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Variable Collection | ✅  | ✅   | ✅     | ✅     | ✅     |                  |
| Variable            | ✅  | ✅   | ✅     | ✅     | ✅     |                  |

### Not Implemented (API limitations or low value)

- Image upload (PUT `/image`) — marked NYI by WorldAnvil
- RPG System create/update/delete — system-level reference data

---

## Sources

- [WorldAnvil API Documentation](https://www.worldanvil.com/api/external/boromir/swagger-documentation)
- [@crit-fumble/worldanvil npm package](https://www.npmjs.com/package/@crit-fumble/worldanvil)
- [pywaclient Python client](https://pypi.org/project/pywaclient/)
