# Extension Guide

How to extend Website Builder without breaking the v1 baseline.

## Before you change anything

1. Run `npm run qa:website-builder` on the current branch — establish green baseline.
2. Determine if your change affects a **frozen surface** (see [BASELINE.md](./BASELINE.md)).
3. If yes: bump `WEBSITE_BUILDER_V1_VERSION` and update golden references.

## Safe extension zones

These areas can be extended without a baseline bump (additive only):

- New non-flagship template packages (not in `FROZEN_FLAGSHIP_PACKAGE_IDS`)
- New API routes under `app/api/website-builder/` that don't alter generation
- Dashboard UI improvements that don't change preview output
- New industry profiles in Image Engine (additive to `profiles/data.ts`)
- Documentation and tests

## Changes that require baseline bump

| Change | Required action |
|--------|-----------------|
| Modify flagship component markup/CSS | Re-run QA, update golden |
| Change token emission format | Bump version, update all flagships |
| Alter `resolveSlotImage` API | Bump version, migrate all templates |
| Change preview compiler output | Update golden preview hashes |
| Add/remove flagship package | Update manifest, registry, golden, docs |
| Change marketplace score thresholds | Update `golden.json` minimums |

## Adding a new template (non-flagship)

1. Create package under `templates/website/{id}/`
2. Add components under `lib/website/template-v2/flagship/{id}/` or legacy theme path
3. Register in `template-package-index.ts`
4. Add TBDP profile if V2-native
5. Run `validate-template-registry.test.ts`
6. Do **not** add to `FROZEN_FLAGSHIP_PACKAGE_IDS` unless promoting to flagship

## Promoting a template to flagship

1. Complete full QA ≥ 95 via `flagship-template-qa.mts`
2. Add to all registration touchpoints (see [TEMPLATE-SYSTEM.md](./TEMPLATE-SYSTEM.md))
3. Bump `WEBSITE_BUILDER_V1_VERSION`
4. Run `npm run qa:website-builder:update-golden`
5. Update documentation

## Image slot extension

To add a new semantic slot:

1. Add slot to `lib/ai-core/image-engine/slots.ts`
2. Add defaults to relevant industry profiles in `profiles/data.ts`
3. Update `emit-site-images.ts` if new constants needed
4. Use `resolveSlotImage("new-slot")` in templates
5. Add validator rules in `slot-validator.ts`
6. Add tests in `image-engine.test.ts`

Do not remove or rename existing slots without a version bump.

## Preview compiler extension

New stub imports for V2 components go in `lib/website/theme-preview/preview-stubs.tsx`.

After adding stubs, verify all flagships still pass visual regression.

## CI integration

New validation steps should be added to:

- `scripts/website-builder-v1-qa.mjs`
- `.github/workflows/website-builder-v1.yml`

Keep CI runtime under 45 minutes; use `--skip-lighthouse` in PR checks.

## Golden update workflow

```bash
# 1. Make intentional visual change
# 2. Re-run flagship QA
npx tsx scripts/run-all-flagship-qa.mjs --skip-lighthouse

# 3. Update golden snapshots
npm run qa:website-builder:update-golden

# 4. Bump version in lib/website/v1-baseline/manifest.ts

# 5. Verify
npm run qa:website-builder
```
