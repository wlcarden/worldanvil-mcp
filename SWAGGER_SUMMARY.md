# World Anvil Boromir API - Official Swagger Documentation Summary

**Source**: World Anvil Public API Documentation
**Version**: 2.0.0 - Boromir
**OpenAPI Spec**: https://wa-cdn.nyc3.cdn.digitaloceanspaces.com/assets/prod/boromir-documentation/swagger/openapi.yml

## Critical Discovery: List Operations Use POST, NOT GET!

The official documentation confirms that **ALL list/query operations use POST**, not GET.

### List Operations (All use POST)

| Endpoint | Method | Operation |
|----------|--------|-----------|
| `/user/worlds` | **POST** | List Worlds By User |
| `/world/articles` | **POST** | List Articles By World |
| `/world/categories` | **POST** | List Categories By World |
| `/world/images` | **POST** | List Images By World |
| `/world/notebooks` | **POST** | List Notebooks By World |
| `/world/notesections` | **POST** | List Notesections By Notebook |
| `/notesection/notes` | **POST** | List Notes By Notesection |
| `/world/timelines` | **POST** | List Timelines By World |
| `/world/histories` | **POST** | List Histories By World |
| `/world/maps` | **POST** | List Maps By World |
| `/map/markers` | **POST** | List Markers By Map |
| `/world/secrets` | **POST** | List Secrets By World |
| `/world/blockfolders` | **POST** | List Block Folders By World |
| `/blockfolder/blocks` | **POST** | List Blocks By Block Folder |
| `/world/canvases` | **POST** | List Canvases By World |
| `/world/manuscripts` | **POST** | List Manuscripts By World |
| `/world/subscribergroups` | **POST** | List Subscribergroups By World |
| `/world/variablecollections` | **POST** | List Variable Collection By World |
| `/rpgsystems` | **POST** | List RPG Systems |
| `/markertypes` | **POST** | List Marker Types |

### Single Resource Operations (Use GET/PUT/PATCH/DELETE)

| Endpoint | GET | PUT | PATCH | DELETE |
|----------|-----|-----|-------|--------|
| `/identity` | ✅ Read Token User | - | - | - |
| `/user` | ✅ Read User | - | ✅ Update | - |
| `/world` | ✅ Read World | ✅ Create | ✅ Update | ✅ Delete |
| `/article` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/category` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/image` | ✅ Read | ✅ Create (NYI) | ✅ Update | ✅ Delete |
| `/notebook` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/notesection` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/note` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/timeline` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/history` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/map` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/marker` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |
| `/secret` | ✅ Read | ✅ Create | ✅ Update | ✅ Delete |

## Why This Matters

1. **Our original POST implementation was CORRECT** ✅
2. **The @crit-fumble package using GET is WRONG** ❌ (explains why it doesn't work)
3. **This is a non-standard but valid API design** - WorldAnvil uses POST for queries/lists

## API Design Pattern

WorldAnvil follows this pattern:
- **GET** with `?id=xxx` - Retrieve single resource
- **POST** with body `{world_id: xxx}` or similar - Query/list resources
- **PUT** - Create new resource
- **PATCH** - Update existing resource
- **DELETE** - Remove resource

This is different from REST conventions but is documented and intentional.

## Complete Resource List

### Core Resources
- Articles, Categories, Images, Worlds, Users

### Campaign Management
- Notebooks, Notesections, Notes, Secrets, Subscribergroups

### Maps & Geography
- Maps, Layers, Markers, Marker Groups, Marker Types (Pins)

### Timeline & History
- Timelines, Histories (timeline events)

### Writing & Publishing
- Manuscripts, Manuscript Versions, Manuscript Parts, Manuscript Beats
- Manuscript Bookmarks, Manuscript Tags, Manuscript Stats
- Manuscript Labels, Manuscript Plots

### Advanced Features
- Blocks, Block Folders, Block Templates, Block Template Parts
- Canvases (visual boards)
- Variables, Variable Collections
- RPG Systems (lookup/metadata)

## Notes

- Image creation marked as "NYI" (Not Yet Implemented)
- All list operations use POST (not GET)
- OpenAPI spec available at: https://wa-cdn.nyc3.cdn.digitaloceanspaces.com/assets/prod/boromir-documentation/swagger/openapi.yml

---

**Archived**: 2025-12-22
**Purpose**: Reference for MCP server implementation
