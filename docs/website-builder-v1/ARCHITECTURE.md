# V2 Architecture

Template Architecture V2 replaces legacy Theme* components with native package-scoped components, TBDP design profiles, and a file-based preview compiler.

## Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Website Builder UI                        │
│  (dashboard, media manager, preview iframe, export)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              buildStaticPreviewHtml (server)                 │
│  validateAndRepairProjectImages → V2 preview document        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│           Template V2 Router + Preview Compiler              │
│  resolve-template-architecture → v2-preview-compiler         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Flagship Package (per industry)                  │
│  components/ · tokens/ · layouts/ · regions/ · pages/         │
└───────────────────────────────────────────────────────────────┘
```

## Key modules (frozen at v1)

| Module | Role |
|--------|------|
| `lib/website/template-v2/router/resolve-template-architecture.ts` | Routes project to V2 vs legacy |
| `lib/website/template-v2/inject/inject-v2-pipeline.ts` | Injects V2 files into generated project |
| `lib/website/template-v2/preview/v2-preview-compiler.ts` | Compiles React components to static HTML |
| `lib/website/template-v2/preview/v2-preview-document.ts` | Assembles full preview document |
| `lib/website/template-v2/generation/v2-generation-bridge.ts` | Ensures flagships never use Theme* path |
| `lib/website/build-static-preview.server.ts` | Server entry for live preview |

## V2 markers

Generated preview HTML includes data attributes used by QA:

- `data-v2-render="v2-files"`
- `data-v2-package="{package-id}"`
- `data-v2-layout="{layout-id}"`

## TBDP integration

Each flagship maps to a TBDP (Trend Business Design Profile) under `lib/website/template-v2/tbdp/profiles/`. TBDP supplies:

- Color, typography, spacing tokens
- Motion and interaction presets
- Industry-specific section ordering

## Package structure

```
templates/website/{package-id}/
  manifest.json          # Package metadata
  package.entry.json     # Entry component map
  canvas.json            # Builder canvas definition
  layouts/               # Layout variants
  regions/               # Region grid definitions
  pages/                 # Page blueprints
  assets/                # Static assets
```

Component source lives in `lib/website/template-v2/flagship/{package-id}/`.

## Preview compilation

1. `buildStaticPreviewHtml` receives project files + template metadata.
2. `validateAndRepairProjectImages` runs industry profile validation.
3. `buildV2PreviewDocument` selects package, layout, locale, RTL.
4. `v2-preview-compiler` transpiles TSX components with stubbed imports (`resolveSlotImage`, design tokens).
5. Output is self-contained HTML with inlined CSS (no Tailwind CDN in production previews).

## Flagship enforcement

`FLAGSHIP_V2_PACKAGE_IDS` in `v2-generation-bridge.ts` is the canonical list. The generation bridge rejects Theme scaffold paths for these packages and routes through `injectV2TemplatePipeline`.
