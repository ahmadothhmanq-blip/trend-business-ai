# DeepSeek Audit Report

**Date:** 2026-07-17  
**Scope:** Full AI generation pipeline + Website Builder DeepSeek connectivity  
**Live test:** Authenticated `POST /api/website-builder`

---

## Is DeepSeek connected?

**YES**

Evidence:
- `DEEPSEEK_API_KEY` is present in `.env.local` (length 35, prefix `sk-fe43…`).
- Direct DeepSeek API ping → **HTTP 200** (`deepseek-chat` / `deepseek-v4-flash`), JSON response parsed correctly.
- Website Builder live generate → **HTTP 200**, `provider: "deepseek"`, **33 files**, **19,195 tokens**, ~154s.

---

## Verification checklist

| # | Check | Result |
|---|--------|--------|
| 1 | `DEEPSEEK_API_KEY` loaded from `.env.local` | **YES** — Next.js loads `.env.local`; adapter reads `process.env.DEEPSEEK_API_KEY` |
| 2 | Every AI generation endpoint uses DeepSeek | **YES** — all generators go through `providerManager` → default/active `deepseek` |
| 3 | Website Builder sends a real DeepSeek request | **YES** — live generate returned DeepSeek usage + provider |
| 4 | Response received correctly | **YES** — project saved with files/title/usage |
| 5 | No Gemini / disabled-provider fallback in use | **YES** — Gemini adapter is placeholder (throws); not configured; not selected |
| 6 | Exact reason generation stops at 92% | **UI fake-progress hard-cap** (fixed) |

---

## Pipeline map (Website Builder)

```
UI (website-builder-tool.tsx)
  → POST /api/website-builder
    → generateWebsite()  [lib/deepseek.ts / lib/website-generator.ts]
      → providerManager.runPlugin(websitePlugin)
        → resolveAvailableProvider() → "deepseek"
        → DeepSeekAdapter.generateJson() × N
          → https://api.deepseek.com/chat/completions
```

Stages inside the plugin: **analyze → plan (blueprint + file plan) → generate files → validate/repair → export**.

Each planned file is a separate DeepSeek JSON call (plus retries/repairs). A small portfolio run produced **33 files** and took ~**2.5 minutes**, which is why the UI appeared “stuck” near the end of the fake progress bar.

---

## Endpoints audited (all use `providerManager` / active DeepSeek)

| Surface | Entry | Generator / runner |
|---------|-------|--------------------|
| Website Builder | `app/api/website-builder/route.ts` | `lib/deepseek.ts` → `websitePlugin` |
| Web App Builder | `app/api/webapp-builder/route.ts` | `lib/webapp-generator.ts` |
| Landing Page Builder | `app/api/landing-page-builder/route.ts` | `lib/landing-page-generator.ts` |
| Logo Designer | `app/api/logo-designer/route.ts` | `lib/logo-generator.ts` |
| Brand Identity | `app/api/brand-identity/route.ts` | `lib/brand-identity-generator.ts` |
| Image Generator | `app/api/image-generator/route.ts` | `lib/image-generator.ts` |
| Video Studio | `app/api/video-studio/route.ts` | `lib/video-generator.ts` |
| Content Studio | `app/api/content-studio/route.ts` | `lib/content-generator.ts` |
| Business Suite | `app/api/business-suite/route.ts` | `lib/business-generator.ts` |
| AI Agents | `lib/agent-runner.ts` | `providerManager.runPlugin` |
| Workspaces | `app/api/workspaces/[type]/route.ts` (+ stream) | `lib/workspace/service.ts` |
| Ideas / Market / Reports | `lib/ai/business-ideas.ts`, `market-analysis.ts`, `reports.ts` | `providerManager.generateJson` |
| SEO / AI Search text assists | `lib/seo/analyzer.ts`, `lib/ai-search/*` | `providerManager.generateText` |

**Active provider config:** `lib/ai/provider-config.ts` → default `"deepseek"`.  
**Adapter:** `lib/ai/adapters/deepseek-adapter.ts` → `baseURL: https://api.deepseek.com`.

---

## Gemini / fallback status

| Item | Status |
|------|--------|
| `GEMINI_API_KEY` in `.env.local` | **Not set** |
| `GeminiAdapter` | Placeholder — throws “not yet implemented” |
| Registry status | `"placeholder"` — excluded by `isProviderImplemented` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | **Not set** |
| `generateStructuredWorkspaceOutput` | Dead helper only — **not called** by generation routes |
| Workspace multi-provider loop | Only iterates **configured + implemented** providers; with env as-is that is DeepSeek only |

No runtime fallback to Gemini or another disabled provider was found on the Website Builder path.

---

## Root cause: generation “stops at 92%”

**Not a DeepSeek disconnect.** DeepSeek was working; generation continued server-side.

### Exact cause

In `components/dashboard/website-builder-tool.tsx`, fake progress while waiting on `POST /api/website-builder` was capped:

```ts
setProgress((value) => Math.min(92, value + 14));
```

Progress only jumped to **100** after a successful response. A real Website Builder run takes **minutes** (many sequential DeepSeek file calls), so the bar sat at **92%** until completion — appearing “stuck.”

### Related bug (workspace tools)

In `lib/hooks/use-workspace-tool.ts`:

```ts
setProgress((value) => (value >= 92 ? 34 : value + 7));
```

Hitting 92% **reset progress to 34%**, causing a looped / stalled progress experience on non-website workspace tools.

---

## Files checked

- `.env.local` (key presence only; values not logged)
- `lib/ai/provider-config.ts`
- `lib/ai/provider-manager.ts`
- `lib/ai/adapters/index.ts`
- `lib/ai/adapters/deepseek-adapter.ts`
- `lib/ai/adapters/gemini-adapter.ts`
- `lib/ai/engine.ts`
- `lib/ai/retry.ts`
- `lib/ai/generator.ts`
- `lib/deepseek.ts`
- `lib/website-generator.ts`
- `plugins/website/*` (analyze/plan/generate/index)
- `app/api/website-builder/route.ts`
- Other AI API routes listed above
- `lib/workspace/service.ts`
- `lib/workspace/structured-output.ts`
- `components/dashboard/website-builder-tool.tsx`
- `lib/hooks/use-workspace-tool.ts`

---

## Files modified

| File | Change |
|------|--------|
| `components/dashboard/website-builder-tool.tsx` | Removed hard 92% cap; asymptotic progress to 99% while DeepSeek works; clearer DeepSeek status labels |
| `lib/hooks/use-workspace-tool.ts` | Fixed 92→34 reset loop; asymptotic progress to 99% |

---

## Fix applied

1. **Website Builder UI progress** — no longer hard-stops at 92%; slowly approaches 99% until the API returns, then sets 100% on success.
2. **Workspace tool progress** — no longer resets from 92% back to 34%.
3. Status copy updated to mention DeepSeek so the long multi-file wait is clearer.

No provider/pipeline change was required — DeepSeek was already the active path and returned valid results.

---

## Live generation proof (Website Builder)

```
status: 200
provider: deepseek
title: Nora-Portfolio
fileCount: 33
usage: { promptTokens: 17564, completionTokens: 1631, totalTokens: 19195 }
duration: ~153984 ms
message: Generated project saved.
```

Direct API ping (same key):

```
POST https://api.deepseek.com/chat/completions → 200
content: {"ok":true,"provider":"deepseek"}
```

---

## Final status

| Item | Status |
|------|--------|
| DeepSeek connected | **YES** |
| Website Builder uses DeepSeek | **YES** |
| Real request/response verified | **YES** |
| Gemini fallback active | **NO** |
| 92% stall root cause | **UI progress cap** (fixed) |
| Overall | **PASS** |
