# Template Marketplace Specification

Version: **1.0.0**  
Module: `lib/website/template-marketplace/`

## Purpose

The Template Marketplace is the discovery layer for Website Builder template packages. It exposes installed and future remote template listings without coupling to:

- Website Builder UI
- Website Builder generation pipeline
- Legacy AI template marketplace (`lib/ai-core/template-marketplace`)
- Creator commerce marketplace (`lib/marketplace/templates`)

Download and installation flows are intentionally out of scope for this foundation.

## Architecture

```
templates/website/<package>/     → Template Engine (installed packages)
remote-catalog.ts                → Future online listings (metadata only)
        ↓
template-marketplace/registry.ts   → Merged marketplace registry
        ↓
template-marketplace/catalog.ts    → Search, filter, sort, facets
        ↓
/api/website-builder/template-marketplace
```

### Dependency rules

| Module | May import marketplace? | Marketplace may import? |
|--------|-------------------------|-------------------------|
| Template Engine | No | Yes |
| Template Renderer | No | No |
| Website Builder | Not yet (future UI phase) | No direct requirement |
| Legacy AI marketplace | No | No |

The marketplace imports the Template Engine to discover installed packages. The Template Engine must remain isolated and must not import marketplace code.

## Data model

### `WbTemplateMarketplaceListing`

Canonical marketplace record for a template package.

| Field | Description |
|-------|-------------|
| `id` | Template package id |
| `version` | Package semver |
| `name` / `description` | Display metadata |
| `category` | Template package category |
| `tags` | Searchable labels |
| `layout` | Default layout kind |
| `regionCount` / `pageCount` | Structural summary |
| `thumbnail` / `preview` | Media references |
| `source` | `installed` or `remote` |
| `availability` | `installed`, `remote`, or `unavailable` |
| `featured` / `featuredRank` | Curated promotion |
| `metadata` | Author, license, compatibility, release info |
| `remote` | Future remote registry reference |
| `installedAt` | Present for installed listings |

### Remote references

`WbTemplateMarketplaceRemoteRef` reserves fields for future signed distribution:

- `registryId`
- `packageUrl`
- `checksum`
- `signature`
- `publisher`

No download or install behavior is implemented in v1.0.0.

## Registry

`WbTemplateMarketplaceRegistry` merges:

1. **Remote seeds** from `remote-catalog.ts`
2. **Installed packages** from the Template Engine registry

Installed listings override remote seeds with the same `id`.

## Catalog operations

| Function | Description |
|----------|-------------|
| `listTemplateMarketplaceCatalog()` | Filter, sort, paginate, facets |
| `searchTemplateMarketplaceCatalog()` | Query-aware catalog |
| `getTemplateMarketplaceListing(id)` | Single listing lookup |
| `listFeaturedTemplateMarketplaceListings()` | Featured subset |
| `getTemplateMarketplaceStatus()` | Registry status |

### Filters

- `category`
- `tags`
- `query`
- `source`
- `availability`
- `featured`
- `layout`

### Sort fields

- `name`
- `releasedAt`
- `featured`
- `category`
- `regionCount`
- `pageCount`

Default sort: `featured desc`, then name.

## API

`GET /api/website-builder/template-marketplace`

### Endpoints via query params

| Param | Result |
|-------|--------|
| `id=<templateId>` | Single listing |
| `status=1` | Registry status |
| `featured=1` | Featured listings |
| `q=<query>` | Search |
| `category`, `layout`, `tags`, `source`, `availability` | Filters |
| `sort`, `direction`, `limit`, `offset` | Sorting and pagination |

Response shape:

```json
{
  "ok": true,
  "listings": [],
  "count": 0,
  "total": 0,
  "filters": {},
  "sort": { "field": "featured", "direction": "desc" },
  "facets": {
    "categories": [],
    "tags": [],
    "sources": [],
    "layouts": []
  },
  "categories": [],
  "tags": []
}
```

## Future online marketplace support

This foundation prepares for:

1. Remote registry sync (replace static `remote-catalog.ts` seeds)
2. Signed package distribution via `remote.packageUrl`
3. Install state transitions (`remote` → `installing` → `installed`)
4. Creator commerce linkage via `registryId`
5. Website Builder UI consumption through a thin client adapter

## Verification

```bash
npm run test:template-marketplace
node scripts/verify-wb-template-marketplace.mjs
```

## Related systems

- Template Engine: `lib/website/template-engine/`
- Template Package Spec: `lib/website/template-engine/spec/TEMPLATE_PACKAGE_SPEC.md`
- Legacy AI marketplace (unchanged): `lib/ai-core/template-marketplace/`
- Creator marketplace (unchanged): `lib/marketplace/templates/`
