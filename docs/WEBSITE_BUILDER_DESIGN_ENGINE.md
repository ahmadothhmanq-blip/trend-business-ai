# Website Builder — AI Design & Development Engine

**Status:** Implemented on the existing plugin pipeline (analyze → plan → generate → validate → export)  
**Decisions:** Assets use real OpenAI DALL·E when `OPENAI_API_KEY` is set (SVG/CSS fallback otherwise). Strategy/Design/Assets panels are post-hoc NL edit surfaces (no blocking approve).

## Pipeline mapping

| Customer layer | Engine stage | Module |
|----------------|--------------|--------|
| Business Idea | `analyze` | `plugins/website/layers/business-idea.ts` |
| Strategy | `plan` | `plugins/website/layers/strategy.ts` |
| Design | `plan` | `plugins/website/layers/design-engine.ts` |
| Assets | `generate` (before code) | `plugins/website/layers/assets.ts` |
| Code | `generate` | `plugins/website/generate.ts` + scaffold |
| Quality Check | `generate` + `validate` | `plugins/website/layers/quality.ts` |

## Persisted artifacts

Stored on `website_generations.blueprint` (JSONB):

- `businessProfile`
- `strategy`
- `designSystem`
- `assetManifest`
- `qualityReport`
- `files[]` (including `preview/index.html`)

Storage bucket: `website-assets` (migration `032_website_design_engine_artifacts.sql`).

## NL improve prefixes

Workspace panels set `continueInstruction` prefixes:

- `[strategy]` — refine sitemap / conversion
- `[design]` — refresh design tokens
- `[assets]` — regenerate visuals
- `[quality]` — used internally by quality improve pass

## Progress events

`Analyzing business idea…` → `Building strategy…` → `Creating design system…` → `Generating assets…` → `Creating blueprint…` → `Planning files…` → `Generating files…` → `Running quality check…` → `Improving weak sections…` → save/preview.

## Kept features

Workspace projects, live static preview, ZIP export, public publish `/w/{slug}`, DeepSeek/OpenAI/Claude text providers.
