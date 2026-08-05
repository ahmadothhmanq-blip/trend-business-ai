# Template System

Website Builder templates are versioned packages registered in the structure template index and synced to the marketplace registry.

## Registry layers

| Layer | File | Purpose |
|-------|------|---------|
| Structure index | `lib/website/builder/template-package-index.ts` | Maps template IDs → package metadata |
| Package resolver | `lib/website/builder/resolve-builder-template-package-id.ts` | Resolves user selection → package ID |
| TI mapping | `lib/website/builder/template-package-ti-mapping.ts` | Links packages to Template Intelligence |
| Validation | `lib/website/builder/validate-template-registry.test.ts` | Integrity checks (run in CI) |
| Marketplace sync | `scripts/sync-flagship-registry.mjs` | Copies structure assets to `website-registry/` |

## Flagship registration touchpoints

When adding or modifying a flagship (requires v1 baseline bump):

1. Package directory under `templates/website/{id}/`
2. Component source under `lib/website/template-v2/flagship/{id}/`
3. TBDP profile under `lib/website/template-v2/tbdp/profiles/`
4. `FLAGSHIP_V2_PACKAGE_IDS` in `v2-generation-bridge.ts`
5. `FROZEN_FLAGSHIP_PACKAGE_IDS` in `lib/website/v1-baseline/manifest.ts`
6. `WEBSITE_STRUCTURE_TEMPLATES` in `template-package-index.ts`
7. `scripts/sync-flagship-registry.mjs` FLAGSHIPS array
8. `scripts/flagship-template-qa.mts` TEMPLATE_SPECS
9. Golden baseline update via `npm run qa:website-builder:update-golden`

## Supersession aliases

Legacy package IDs (e.g. `restaurant-signature`, `real-estate-prestige`) map to current flagships via `PACKAGE_SUPERSESSION_ALIASES`. Existing projects continue to resolve correctly.

## Design tokens

Tokens are emitted into generated projects as:

- `lib/design-tokens.ts` — CSS custom properties (`--color-primary`, fonts, radii)
- `lib/site-images.ts` — Semantic image slots (`resolveSlotImage`, `HERO_IMAGE`)

Emitters (frozen at v1):

- `lib/website/template-v2/tokens/emit-design-tokens.ts`
- `lib/website/template-v2/tokens/emit-site-images.ts`

## Template selection flow

```
User selects template in builder
  → resolveBuilderTemplatePackageId()
  → getWebsiteStructureTemplate()
  → applyStructureTemplateToProject()
  → injectV2TemplatePipeline() [for V2 flagships]
  → emit design tokens + site images
  → generate page components
```

## QA per template

Each flagship must pass `scripts/flagship-template-qa.mts`:

- Marketplace composite score ≥ 95
- Visual design quality ≥ 90 (including responsive layout)
- Hero image present, no placeholder images
- V2 markers present in preview HTML
- Image validation passes (industry profile)
- Preview HTML hash matches golden baseline

## Registry sync

```bash
# Sync structure assets to marketplace registry
node scripts/sync-flagship-registry.mjs

# Verify registry is in sync (CI / QA)
node scripts/sync-flagship-registry.mjs --check
```
