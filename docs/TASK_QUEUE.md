# Trend Business AI — Task Queue

**Living work queue.** Priorities from `PROJECT_AUDIT.md`.  
**Statuses:** `Completed` | `In Progress` | `Pending` | `Future`  
**Rule:** Do not start Pending/Future implementation without approval.  
**Last updated:** 2026-07-17  

---

## Priority legend

- **High** — Stability, honesty, launch blockers  
- **Medium** — Product clarity and maintainability  
- **Low** — Cleanup and polish  

---

## High Priority

| ID | Task | Status | Notes |
|----|------|--------|-------|
| H01 | Confirm Supabase migrations `001`–`030` applied on each environment | Pending | Ops |
| H02 | Confirm required env (`SUPABASE_*`, `DEEPSEEK_API_KEY`, `NEXT_PUBLIC_SITE_URL`, service role, Upstash for prod) | Pending | Ops |
| H03 | Commit/reconcile Website Builder SSR slim-list fix (no full blueprint on list) | Pending | Working tree; needs approval to land on `main` |
| H04 | Commit/reconcile React 19–safe theme migration (no client script crash) | Pending | Working tree |
| H05 | Commit/reconcile generation file-cap + soft-pass (prevent runaway loops) | Pending | Working tree |
| H06 | Authenticated smoke: `/dashboard/website-builder` loads + generate → save → download | Pending | After H03–H05 |
| H07 | Fix Live Preview honesty: replace frozen “Live Preview” UI with Download/Deploy messaging (or equivalent honesty) | Pending | UI copy only unless F01 accepted |
| H08 | Policy: keep `WEBSITE_PREVIEW_BUILDER_ENABLED=false` in production until security redesign | Pending | Not a duplicate of H07 — env/policy vs UI |

---

## Medium Priority

| ID | Task | Status | Notes |
|----|------|--------|-------|
| M01 | Align Website Builder / marketing copy with ZIP/code delivery | Pending | Product honesty |
| M02 | Hide placeholder AI providers (Gemini/Grok/Llama) in production UI | Pending | |
| M03 | Collapse duplicate routes (`brand-designer` vs `brand-studio`, `creative-studio` vs `image-generator`, etc.) | Pending | Redirects OK |
| M04 | Update root README to match current multi-product reality | Pending | Docs only OK anytime |
| M05 | Real generation progress (avoid fake stuck ~90% feel) | Pending | Prefer server events / clearer status |
| M06 | Credit fairness: don’t punish users when AI fails mid-run | Pending | Billing path |
| M07 | Staging E2E for auth + Website Builder + billing (when PayPal configured) | Pending | |

---

## Low Priority

| ID | Task | Status | Notes |
|----|------|--------|-------|
| L01 | Remove orphan empty App Router directories | Pending | Dead code |
| L02 | Remove unused platform dashboard scaffolds | Pending | |
| L03 | Normalize naming (`deepseek.ts` facade, slug vs product id) | Pending | Careful, wide touch |
| L04 | Consolidate dual product engines (dedicated vs generic workspace) | Pending | Design first |
| L05 | Dashboard bundle performance budgets | Pending | |
| L06 | Archive/consolidate root phase report markdown into `docs/` index | Pending | |
| L07 | Remove empty plugin stub dirs + empty `app/api/test-generation/` | Pending | Dead code |
| L08 | Commit `docs/` pack to `main` so SSOT is on remote | Pending | Docs-only commit OK when approved |

---

## Completed (reference)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| C01 | Phase 1 full project audit | Completed | `PROJECT_AUDIT.md` |
| C02 | Docs SSOT pack | Completed | Blueprint, Constitution, Status, Queue, Decisions, Roadmap |
| C03 | Core auth + dashboard shell | Completed | In product |
| C04 | Website Builder code generation + ZIP | Completed | Preview not included |
| C05 | ProviderManager + DeepSeek/OpenAI/Claude | Completed | |
| C06 | Billing schema + PayPal adapters (code) | Completed | Env-gated |
| C07 | SEO / AI Search / Growth modules | Completed | Core present |
| C08 | Security baseline (RLS, rate limits, headers) | Completed | Ongoing vigilance |
| C09 | Profile API content-type / PUT fixes | Completed | See FIX_REPORT (historical) |
| C10 | Generation runaway file-tree mitigation (WT) | Completed (local only) | **Not done on remote until H05 lands** — do not treat as shipped |

---

## In Progress

| ID | Task | Status | Notes |
|----|------|--------|-------|
| I01 | Docs as single source of truth | In Progress | This folder |
| I02 | Production ops readiness | In Progress | Env/migrations/E2E open |

---

## Future Versions

| ID | Task | Status | Notes |
|----|------|--------|-------|
| F01 | Safe Live Preview (sandboxed; no arbitrary npm install) | Future | Decision required |
| F02 | One-click deploy integration (e.g. Vercel) optional | Future | Not required for ZIP product |
| F03 | Durable AI job queue + SSE/progress | Future | |
| F04 | Pro plan live + marketing price update | Future | |
| F05 | Encrypt AI provider keys at rest | Future | |
| F06 | Team invite email (ESP) | Future | |
| F07 | True image/video media generation | Future | Beyond concepts |
| F08 | Gemini/Grok/Llama real adapters | Future | Only if product needs |
| F09 | Hosted live website product mode | Future | Major promise change — needs decision |

---

## Execution order (recommended after approval)

1. H01–H02 (ops)  
2. H03–H05 (land critical WT fixes)  
3. H06 (smoke)  
4. H07–H08 (preview honesty/policy)  
5. M01–M03 (clarity)  
6. Then Medium/Low / Future per `ROADMAP.md`  

---

**Wait for approval before implementing any Pending/Future application tasks.**
