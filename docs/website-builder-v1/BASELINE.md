# V1 Baseline & Golden Reference

Website Builder v1 baseline protects production architecture from unintended regressions.

## Version

| Field | Value |
|-------|-------|
| Version | `1.0.0` |
| Frozen at | `2026-08-05` |
| Manifest | `lib/website/v1-baseline/manifest.ts` |
| Golden metrics | `lib/website/v1-baseline/golden.json` |
| Golden previews | `lib/website/v1-baseline/golden/previews/{package-id}/preview.html` |

## Frozen surfaces

### 1. Ten flagship templates

Canonical IDs in `FROZEN_FLAGSHIP_PACKAGE_IDS`:

```
saas-enterprise, corporate-business, restaurant-premium,
ecommerce-premium, medical-premium, real-estate-premium,
creative-agency-premium, education-premium, finance-premium,
hotel-resort-premium
```

### 2. Image Engine

Module list: `FROZEN_IMAGE_ENGINE_MODULES` in manifest.ts

### 3. V2 architecture

Module list: `FROZEN_V2_ARCHITECTURE_MODULES`

### 4. Generation pipeline

Module list: `FROZEN_GENERATION_PIPELINE_MODULES`

### 5. Template registry

Module list: `FROZEN_REGISTRY_MODULES`

### 6. Design tokens

Module list: `FROZEN_DESIGN_TOKEN_MODULES`

## Regression protection

### Local

```bash
npm run qa:website-builder
```

### CI (every PR)

`.github/workflows/website-builder-v1.yml` runs:

| Check | What it verifies |
|-------|------------------|
| TypeScript | `npm run type-check` |
| V1 baseline tests | Frozen modules exist, golden integrity |
| Template registry | All flagships registered, KB integrity |
| V2 generation bridge | Flagships use V2 path |
| Image Engine tests | Slot/profile/validation logic |
| Image validation tests | Pre-render repair |
| Marketplace catalog | Template marketplace integrity |
| Registry sync | `website/` ↔ `website-registry/` |
| Flagship QA | Generation + scores ≥ 95 |
| Golden compare | Preview HTML hashes + QA metrics |
| Build | `npm run build` |

### What golden comparison checks

Per flagship template:

- Marketplace score ≥ 95
- Visual overall ≥ 90
- Responsive layout ≥ 90
- Hero image present
- No placeholder images
- V2 markers (`data-v2-package`, hero, render)
- Image validation passed
- Duplicate image count matches baseline
- Preview HTML SHA-256 matches golden hash

## Updating the baseline

Only after **intentional, approved** changes:

```bash
# 1. Re-run flagship QA
npx tsx scripts/run-all-flagship-qa.mjs --skip-lighthouse

# 2. Update golden snapshots
npm run qa:website-builder:update-golden

# 3. Bump WEBSITE_BUILDER_V1_VERSION in manifest.ts

# 4. Verify full QA
npm run qa:website-builder
```

## Golden preview normalization

Preview HTML is hashed after stripping volatile timestamps to avoid false positives from metadata changes. Normalization logic is in `lib/website/v1-baseline/compare-golden.ts` → `normalizePreviewHtml()`.

## Minimum quality thresholds

| Metric | Threshold |
|--------|-----------|
| Marketplace composite | ≥ 95 |
| Visual overall | ≥ 90 |
| Responsive layout | ≥ 90 |
| Lighthouse | Optional in CI (`--skip-lighthouse`); run locally with `--with-lighthouse` |

## File inventory

```
lib/website/v1-baseline/
  manifest.ts              # Version, frozen IDs, module paths
  golden.json              # Per-template metrics + preview hashes
  compare-golden.ts        # Comparison logic (importable)
  regression.test.ts       # Baseline integrity tests
  index.ts                 # Public exports
  golden/
    previews/
      saas-enterprise/preview.html
      corporate-business/preview.html
      ... (10 total)
```

## Intentional change policy

1. **Bug fixes** that don't change visual output — no golden update needed
2. **Visual changes** — update golden + bump patch version
3. **Architecture changes** — bump minor version + full QA + docs update
4. **New flagship** — bump minor version + extend all frozen lists
