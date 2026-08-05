# Generation Pipeline

End-to-end flow from user prompt to generated website project files.

## Pipeline stages

```
1. Input resolution
   WebsiteGenerationInput → resolveGenerationTemplatePackageId()

2. Structure application
   applyStructureTemplateToProject() — pages, sections, layout

3. V2 injection (flagships)
   injectV2TemplatePipeline() — component files, tokens, site-images

4. AI content generation
   plugins/website/generate.ts → file-generation-loop.ts

5. Image Engine
   runAiImageEngine() → inject into lib/site-images.ts

6. Preview
   buildStaticPreviewHtml() → V2 preview document

7. Export / publish
   prepare-export.ts → validate images → zip project
```

## Entry points

| Entry | File |
|-------|------|
| API stream | `app/api/website-builder/stream/route.ts` |
| Plugin generate | `plugins/website/generate.ts` |
| File loop | `plugins/website/file-generation-loop.ts` |
| V2 bridge | `lib/website/template-v2/generation/v2-generation-bridge.ts` |
| Structure apply | `lib/website/builder/apply-structure-template.ts` |
| V2 apply | `lib/website/template-v2/apply/apply-v2-template.ts` |

## Flagship path guarantee

`assertFlagshipUsesV2Generation()` in `v2-generation-bridge.ts` scans generated files for:

- `components/themes/` paths (legacy Theme scaffold)
- `ThemeBold`, `ThemeCorporate`, etc. component names

Flagship packages must produce V2-native file paths only.

## Image integration point

Images are injected after content generation:

1. `enrichManifestWithProfileSlots()` fills semantic slots from industry profile
2. `injectAiImagesIntoProject()` writes `lib/site-images.ts`
3. `validateAndRepairProjectImages()` runs before every preview render

## Preview generation

`build-static-preview.server.ts`:

1. Detects V2 input via `isV2PreviewInput()`
2. Runs image validation/repair
3. Delegates to `buildV2PreviewDocument()` for flagships
4. Falls back to theme preview for legacy templates

Cache signature: `v2PreviewCacheSignature()` invalidates on file/token changes.

## Quality gates

| Gate | Module |
|------|--------|
| Registry integrity | `validate-template-registry.test.ts` |
| Marketplace QA | `scripts/flagship-template-qa.mts` |
| Visual regression | `lib/website/v1-baseline/golden.json` |
| Image validation | `validate-before-render.ts` |
| Publish gates | `scripts/verify-website-publish-gates.mjs` |

## Frozen pipeline modules

See `FROZEN_GENERATION_PIPELINE_MODULES` in `lib/website/v1-baseline/manifest.ts`.

## Running pipeline QA

```bash
# Single flagship
npx tsx scripts/flagship-template-qa.mts saas-enterprise

# All 10 flagships
npx tsx scripts/run-all-flagship-qa.mjs --skip-lighthouse

# Full v1 QA including build
npm run qa:website-builder
```
