# Production Cleanup Report

**Date:** 2026-07-17  
**Branch:** `cursor/docs-ssot-audit-plan`  
**Scope:** Safe cleanup + quality repair for launch readiness  
**Constraint:** No architecture rewrite; protect AI Engine, Website Builder, Dashboard, Workspace, Auth, DB

---

## Verification results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npx eslint . --max-warnings 0` | **PASS** |
| `npm run smoke:website-ai` | **PASS** |
| `npm run build` (production) | **PASS** |
| `npm run verify` | **133 passed / 4 failed** (env/ops — see Remaining) |
| `npm run perf:budget` | Advisory: 1 chunk ~409 KB above soft 350 KB limit |

---

## What was fixed

### Environment / ops hygiene
- Un-ignored and tracked **`.env.example`** (was blocked by `.env*` gitignore)
- Gitignore hardened for local artifacts: `.tmp/`, `trend-business-ai.zip`, stray `pnpm-*` lockfiles

### Lint / TypeScript quality
- Cleared all ESLint warnings (ai-search analyze route, content-optimizer `@context` omit, phase20 unused helper)
- Ignored `.tmp/**` in ESLint so local audit scripts do not pollute CI
- Shared Supabase query cast helpers in `lib/api/supabase-query.ts` (Website Builder settings/parent load)

### Security / consistency
- Logo / Image / Video plugins now use shared **`sanitizeSvgContent`** (strips scripts/handlers) instead of weak local SVG trim helpers
- Preview builder remains fail-closed + production hard-disable (unchanged; reconfirmed)

### Tooling
- Added `npm run smoke:website-ai` script for AI Engine / Website Builder contract checks

---

## What was removed

| Item | Reason |
|------|--------|
| `plugins/website/legacy.ts` | Dead `WebsiteGenerationPipeline` — zero imports |
| `lib/ai/openai-client.ts` | Dead OpenAI helper — adapter has its own client |
| `plugins/index.ts` | Unused barrel (`getPlugin` / `aiPlugins` never imported) |
| `scripts/extract-logo.mjs` | One-off script requiring missing `sharp` |

**Not removed (protected / deferred):**
- Working product routes, plugins, dashboard platform panels, auth, migrations
- Empty orphan App Router directories (directory deletion deferred by policy)
- Placeholder AI provider stubs (hidden in production; needed for F08)
- Root historical `*_REPORT.md` files (indexed under `docs/HISTORICAL_REPORTS.md`; left at root for link stability)
- npm dependencies — all declared packages show real usage

---

## Project structure notes

- App Router live under `app/(dashboard)`, `app/(auth)`, marketing pages at `app/*`
- AI: `lib/ai/*` + `plugins/*` (website, workspace, design/content tools)
- Docs SSOT: `docs/` (including this report)
- Env template: `.env.example` (now trackable)

---

## Remaining issues (ops / follow-up)

### `npm run verify` — 4 failures (not app-code regressions)
1. **`OPENAI_API_KEY` missing** — optional when DeepSeek is default; verify warns for OpenAI path  
2. **`user_preferences` table missing** — run remaining migrations on the target DB if needed  
3. **RLS `user_preferences`** — follows missing table  
4. **`avatars` storage bucket missing** — apply storage migration `007` (or equivalent) on Supabase  

### Production env still required before launch
| Variable | Status guidance |
|----------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | Required on Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for billing/webhooks |
| `UPSTASH_REDIS_*` | Recommended for multi-instance rate limits |
| `WEBSITE_PREVIEW_BUILDER_ENABLED` | Keep `false` |
| `ALLOW_INSECURE_PAYPAL_WEBHOOKS` | Keep unset/false |
| Anon JWT length | Confirm full key in Supabase dashboard (prior H02 WARN) |

### Deferred cleanups (safe later)
- Barrel re-exports unused at top level (`lib/seo/index.ts`, etc.) — consumers import deep paths  
- Empty orphan dirs (`app/dashboard/*` legacy shells) — directory delete needs explicit approval  
- PDF export helper duplication (`lib/export` vs `lib/workspace/export`)  
- Credit refund on AI failure (**M06** / D-014)  
- Merge feature branch to `main` (**L08**)  
- Uncommitted local WIP still in working tree: `profile` / `workspace-tool` / `product-engine-page` (left untouched)

---

## Protected features — status after cleanup

| Area | Status |
|------|--------|
| AI Engine | Intact — settings load, fallback, validated stages |
| Website Builder | Intact — stream, export ZIP, regenerate/continue |
| Dashboard | Intact — routes + platform panels unchanged |
| Workspace | Intact — plugins/APIs untouched |
| Authentication | Intact |
| Database / migrations | Intact — no schema changes in this cleanup |

---

## Recommended next steps for launch

1. Apply missing Supabase migrations / storage bucket on staging+prod  
2. Fill production env checklist above  
3. Re-run `npm run verify` + authenticated Website Builder smoke (H06 follow-up)  
4. Merge `cursor/docs-ssot-audit-plan` → `main` when ready (L08)
