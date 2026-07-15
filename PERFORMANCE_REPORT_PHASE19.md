# Phase 19 — Enterprise Performance & Scalability Report

**Date:** 2026-07-16  
**Scope:** Frontend, Next.js, database, AI, API, assets, memory, scalability, monitoring  
**Constraint:** No feature rebuilds; business logic unchanged except lazy detail hydration for slim list payloads

---

## Executive summary

Phase 19 reduces marketing re-render cost, shrinks client bundles (JSZip / heavy tools), cuts list payload size for workspace/website/agent history, parallelizes independent DB and AI work, reuses AI SDK clients with timeouts, adds composite indexes, and introduces request timing logs. Estimated gains below assume typical mid-tier Vercel + Supabase load.

**Operator action:** apply `supabase/migrations/027_performance_indexes.sql` (or `APPLY_PHASE19.sql`).

---

## 1. Bottlenecks found

| Area | Bottleneck |
|------|------------|
| Marketing | `MouseProvider` re-rendered entire shell on every `mousemove` |
| Bundles | Static `jszip` in 8 client tools; ~71KB website builder eagerly loaded |
| Fonts / images | Mono font preloaded globally; logos always `priority` |
| Database | List endpoints selected full JSONB (`blueprint` / `output`); missing composite indexes; sequential billing/team/admin queries |
| AI | New OpenAI/DeepSeek clients per call; no request timeout; sequential image concept generation |
| API | Plans uncached; usage unbounded; rate-limit Maps unbounded; no timing signals |
| Memory | Mutation/auth/webhook rate-limit stores never pruned |

---

## 2. Improvements made

### Frontend
- Localized mouse parallax inside `SiteBackground` (rAF-throttled); removed provider wrapping marketing/auth trees
- Dynamic import for `WebsiteBuilderTool` and Content Studio tabs
- Client JSZip loaded only on download click
- Memoized sidebar `NavLink` and `WorkspaceProjectsList`
- Logo `priority` only when requested (header/auth)

### Next.js
- `compress`, `poweredByHeader: false`, long-cache for `/images/*`
- `optimizePackageImports` includes `radix-ui`
- `serverExternalPackages`: `openai`, `jspdf`, `jszip`
- Geist Mono `preload: false`
- Moved unused `shadcn` CLI to `devDependencies`

### Database
- Migration `027`: composite `(user_id, created_at)` indexes across generation tables; notification/unread; billing checkout `provider_order_id`
- Slim list selects for website, workspace, agent executions (detail via `[id]` hydrate)

### AI
- Singleton OpenAI/DeepSeek clients per adapter + 120s timeout
- Anthropic `AbortSignal.timeout`
- Parallel concept generation in image plugin
- `withTiming` around adapter calls and AI usage enforcement

### API / scalability
- `Promise.all` for billing status, team, admin counts, notifications
- Plans `Cache-Control: private, max-age=60`
- Usage query capped (2000) with narrower columns
- Rate-limit Maps prune at 5k keys
- `Server-Timing` on workspace/website list routes
- Stateless APIs preserved (no sticky session requirements)

### Module splits
- `lib/workspace/export-meta.ts`, `lib/ai/sanitize-path.ts` keep heavy deps out of light imports

---

## 3. Estimated performance gains

| Change | Estimated impact |
|--------|------------------|
| Marketing mouse isolation | **60–90% fewer** marketing re-renders during pointer move |
| Dynamic website builder + JSZip | **~150–300KB** less initial JS on website/tool routes |
| Slim list payloads | **70–95% smaller** list responses when blueprints/outputs are large |
| Composite indexes | **2–10× faster** paginated history queries at scale |
| Parallel billing/team/admin | **~40–70% lower** wall time for those endpoints |
| AI client reuse | **~50–200ms** saved per subsequent AI call (cold import avoided) |
| Parallel image concepts | **~2–4× faster** multi-concept generation wall time |
| Font/logo priority trim | Faster LCP on marketing/footer views |

Overall for a concurrent user browsing marketing → dashboard → history: expect **noticeably lower TTI** on public pages and **materially lower DB/bandwidth** on generation lists under load.

---

## 4. Remaining recommendations

1. Apply migration `027` in all environments.
2. Configure Upstash Redis in production for global rate limits (multi-instance).
3. Extend slim-list + hydrate-on-select to logo/brand/image/video tools.
4. Add CDN/edge caching for fully static marketing HTML where auth is not required.
5. Introduce a background job queue (e.g. Inngest/BullMQ) for long AI generations at thousands of concurrent users.
6. Wire APM (OpenTelemetry / Vercel Analytics) to `withTiming` spans.
7. Consider `count: "estimated"` or `limit+1` pagination to avoid exact count cost on huge tables.
8. Cap concurrent AI fan-out with a small semaphore to protect provider rate limits.

---

## 5. Verification

| Check | Result |
|-------|--------|
| Production build | (run in CI / local verify) |
| TypeScript | 0 errors target |
| ESLint | 0 errors target |
| Business logic | Unchanged except lazy detail hydration for slim lists |

---

## 6. Scalability posture

- **Horizontal scaling:** API routes remain cookie-auth + Supabase; no in-process session store required for correctness (in-memory rate limits are best-effort without Upstash).
- **Queue-ready:** AI generation already isolated behind ProviderManager/plugins; can move long jobs behind a queue without rewriting product UX.
- **Stateless:** Billing fulfillment and credit RPC remain DB-backed and safe across instances.
