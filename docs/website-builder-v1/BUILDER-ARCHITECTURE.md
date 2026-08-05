# Website Builder Architecture

The dashboard Website Builder orchestrates generation, editing, preview, media management, and export.

## Component map

```
app/dashboard/website-builder/
  page.tsx                          # Builder list / entry
  [id]/page.tsx                     # Project workspace

components/dashboard/website-builder/
  builder-workspace.tsx             # Main editor shell
  builder-tool-rail.tsx             # Tool tabs (design, media, etc.)
  site-image-manager-panel.tsx      # Media manager (Image Engine UI)
  media-library-panel.tsx           # Asset library with upload
  website-management-dashboard.tsx  # Project management view
```

## API routes

| Route | Purpose |
|-------|---------|
| `app/api/website-builder/stream/route.ts` | SSE generation stream |
| `app/api/website-builder/[id]/site-images/route.ts` | Image slot CRUD |
| `app/api/website-builder/[id]/preview/route.ts` | Live preview HTML |

## Preview system

Two preview modes coexist:

1. **V2 file-based preview** — compiles project TSX files to static HTML (flagships)
2. **Theme preview** — legacy Theme* component rendering (non-flagship)

V2 preview uses stubs in `lib/website/theme-preview/preview-stubs.tsx` for `resolveSlotImage`, design tokens, and client hooks.

Compiler: `lib/website/template-v2/preview/v2-preview-compiler.ts`

## Export flow

`lib/website/prepare-export.ts`:

1. `validateAndRepairProjectImages()` — industry validation
2. Package project files into downloadable zip
3. Include optimized image metadata

## Template marketplace

Remote catalog: `lib/website/template-marketplace/remote-catalog.ts`

Local registry: `templates/website-registry/` (synced from `templates/website/`)

## State and persistence

- Project files stored in Supabase (`website_generations` table)
- Generation state streamed via SSE with recovery (`lib/website/stream-recovery.ts`)
- Site images persisted per project, merged with profile defaults on read

## Tool rail tabs

| Tab | Component |
|-----|-----------|
| Design | Theme / layout controls |
| Media | `SiteImageManagerPanel` |
| Content | Section editing |
| SEO | Metadata controls |
| Publish | Export and publish gates |

## Integration with AI core

Website Builder consumes:

- **Master Plan** — `lib/ai-core/generation-engine/master-plan/`
- **TBGE** — business idea → website structure
- **Image Engine** — `lib/ai-core/image-engine/`
- **Design Platform** — tokens, sector DNA
- **Language Platform** — locale, RTL, typography

## Performance

- Preview compiler cache (`clearV2PreviewCompilerCache()` for QA resets)
- Static preview avoids Tailwind CDN in V2 flagships
- Image optimization deferred to export unless user requests WebP in media manager
