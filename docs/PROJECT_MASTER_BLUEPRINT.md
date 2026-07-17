# Trend Business AI — Project Master Blueprint

**Role:** Single architectural map of the **current** Trend Business AI project.  
**Source of truth chain:** `PRODUCT_VISION.md` (north star) → `PROJECT_AUDIT.md` → this blueprint → `TASK_QUEUE.md` / `ROADMAP.md`  
**Last updated:** 2026-07-17 (product vision accepted)  
**Code baseline:** Feature branch `cursor/docs-ssot-audit-plan` ahead of remote `main` (see §10 / D-011)  
**Rule:** Extend this project. Do not replace the architecture. Ship finished products (D-015), not code dumps.

---

## 1. Product Definition

### 1.1 North star (`PRODUCT_VISION.md` Core Product Principle, D-015, D-016)

**Trend Business AI** is an **AI Business Operating System**: create, automate, manage, and grow a business from one place.  
It builds **AI-powered production tools, not AI code generators**. Customers must receive **complete usable products** (preview / interaction / NL AI edit / continuous iteration / export or publish) — not developer UX that stops at source files.

### 1.2 Current reality (honest)

Authenticated multi-product SaaS that:

- Markets Create / Design / Content / Business AI tools  
- Authenticates users via Supabase  
- Generates website/app/landing artifacts via DeepSeek (default) + ProviderManager  
- Saves generations to Supabase and delivers **Download ZIP** (primary Website Builder channel today)  
- Provides platform ops: billing UI, team, usage, SEO, AI Search, Growth  

**Not yet shipped:** safe Live Preview, one-click publish/hosted live URL (D-004, D-010).

**Primary Website Builder deliverable today:** complete site project + ZIP export (interim channel under D-003; north star remains finished-product UX).

---

## 2. Tech Stack (Locked)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19.2.4, Tailwind CSS 4, shadcn-style `components/ui` |
| Auth / DB | Supabase Auth + Postgres + RLS |
| AI | ProviderManager + plugins; DeepSeek default; OpenAI/Claude real; Gemini/Grok/Llama placeholders |
| Billing | `lib/billing` + PayPal adapters (env-gated) |
| Repo | GitHub `ahmadothhmanq-blip/trend-business-ai`, branch `main` |

---

## 3. System Architecture (Keep)

```
Browser
  → proxy.ts (session + security headers)
  → app/ (marketing | auth | dashboard | api | sitemaps)
  → components/ (marketing | dashboard | ui | theme | seo | auth | providers)
  → lib/ (see §3.1)
  → plugins/ (see §3.2)
  → supabase/migrations (001_profiles.sql … 030_growth_security_hardening.sql)
```

**AI pipeline (website and siblings):**  
`analyze → plan → generate → validate → export` via `lib/ai/engine.ts` + product plugins.

**Website Builder API path:**  
UI → `POST /api/website-builder` → `generateWebsite` → plugin → Supabase `website_generations` → client hydrate via `GET /api/website-builder/[id]`.

### 3.1 `lib/` folders (current)

`actions`, `ai`, `ai-search`, `api`, `billing`, `constants`, `db`, `export`, `growth`, `hooks`, `perf`, `platform`, `products`, `routes`, `seo`, `supabase`, `theme`, `validations`, `workspace`  

Plus root service files (e.g. `deepseek.ts`, `env.ts`, product generators).

**Auth clients:** `lib/supabase/server.ts`, `admin.ts`, `proxy.ts` (no separate `client.ts`).

### 3.2 `plugins/` (current)

**Populated:** `website`, `webapp`, `landing-page`, `logo-designer`, `brand-identity`, `image-generator`, `video-studio`, `content-studio`, `business-suite`, `ai-agents`, `workspace`  

**Empty stub directories (debt):** `audit`, `brand`, `business`, `content`, `creative`, `manager`, `marketing`, `social`  

Workspace text domains are implemented under `plugins/workspace/`, not those empty top-level folders.

### 3.3 Major `app/api/` groups

`website-builder`, `webapp-builder`, `landing-page-builder`, `logo-designer`, `brand-identity`, `image-generator`, `video-studio`, `content-studio`, `business-suite`, `ai-agents`, `workspaces`, `ideas`, `market-analysis`, `reports`, `platform`, `growth`, `seo`, `ai-search`, `ai-settings`, `profile`, `preferences`, `uploads`, `webhooks`, `health`  

**Orphan:** `app/api/test-generation/` (empty — no `route.ts`).

**API `route.ts` count:** **73**.

---

## 4. Domain Map

### Marketing
Home, pricing, features, products (+ category landings), SEO hubs (industries, countries, services, use-cases, compare), blog, docs, learn, resources, templates, FAQ, contact, changelog, legal (privacy/terms).

### Auth
Login, signup, forgot/reset password, `/auth/callback`, `(dashboard)` layout guard via `getUser`.

### Dashboard routes (40 page directories)

| Suite | Routes |
|-------|--------|
| Create | `website-builder` (+ `website-builder/settings`), `landing-page-builder`, `app-builder` |
| Design | `logo-maker`, `brand-studio`, `brand-designer` (alias/overlap), `image-generator`, `creative-studio` (overlap) |
| Content | `content-studio`, `video-studio`, `social-media` |
| Business | `marketing`, `business-intelligence`, `business-manager` (redirect/alias), `business-audit` (redirect/alias), `feasibility-study`, `ai-agents`, `ideas`, `market-analysis`, `reports` |
| Library | `projects`, `history`, `favorites`, `files`, `templates` |
| Platform | `analytics`, `seo`, `ai-search`, `growth`, `billing`, `subscription` (→ billing), `ai-providers`, `team`, `notifications`, `api-keys`, `usage`, `settings`, `profile`, `search`, `admin` |

**Counts:** 40 dashboard route directories; **42** `page.tsx` files including `/dashboard` root and website-builder settings.

**Also:** empty orphan tree `app/dashboard/*` (legacy leftover — not the live `(dashboard)` group).

### Data domains (key tables)

| Domain | Tables / artifacts |
|--------|-------------------|
| Users | `profiles`, `user_preferences`, avatars storage |
| Generations | `website_generations`, `workspace_generations`, plus per-product generation tables (webapp, landing, logo, brand, image, video, content, business, …) |
| Projects | Phase 5 `projects` + generation metadata columns |
| AI settings | `ai_provider_settings` |
| Orgs | `organizations`, `org_members`, invitations, notifications, API keys, webhooks |
| Billing | customers, subscriptions, invoices, credit balances/ledger/packs, checkout sessions |
| Growth | leads/CRM/newsletter/events (+ security hardening migration 030) |

**Migrations:** 30 SQL files — `001_profiles.sql` … `030_growth_security_hardening.sql`.

---

## 5. Security Requirements (Must Preserve)

1. Dashboard and AI APIs require authenticated user (`requireUser` / layout guard).  
2. Session refresh via `proxy.ts` → `lib/supabase/proxy.ts`.  
3. RLS on profiles, generations, orgs, billing, AI settings.  
4. Billing money tables: no client write policies (server/service-role paths).  
5. Rate limits on AI and sensitive mutations (Upstash preferred in production).  
6. Zod validation on API bodies; safe redirects.  
7. Security headers (CSP/HSTS/XFO family via proxy/config).  
8. Never commit secrets; mask provider keys on settings GET.  
9. Keep `WEBSITE_PREVIEW_BUILDER_ENABLED=false` until a sandboxed redesign is Accepted.  
10. Required production env: public Supabase URL/anon, service role, `NEXT_PUBLIC_SITE_URL`, AI keys, Upstash for durable rate limits.

---

## 6. Non-Goals (Do Not Build Without Explicit Decision)

- Replacing Next.js / Supabase / plugin architecture  
- Greenfield “new Trend Business AI” rewrite  
- Enabling unsafe preview builder (`npm install` on user packages) without a security redesign  
- Marketing Gemini/Grok/Llama as live until adapters exist  
- Claiming hosted live websites until preview/deploy is real (see `DECISIONS_LOG.md` D-010)  

---

## 7. Design System (Preserve)

- Dark luxury: near-black backgrounds, gold accent `#D4AF37`  
- Geist / Geist Mono  
- Dashboard shell + marketing `SiteShell`  
- Theme: working tree uses cookie SSR class + custom provider (no client `<script>` theme injection). Committed HEAD may still reference `next-themes` until WT lands.

---

## 8. Quality Bars

| Area | Bar |
|------|-----|
| Auth | Dashboard routes require session |
| AI | Prefer DeepSeek; do not select placeholder providers for production paths |
| Website list SSR | Never load full `blueprint` JSONB in list queries (WT already slim; must land on `main`) |
| Website generation | Cap planned files (~18); avoid infinite validation loops |
| Security | Articles in §5 |
| Docs | Update `docs/` when status or decisions change |

---

## 9. Documentation Map (SSOT)

| Doc | Purpose |
|-----|---------|
| `PROJECT_AUDIT.md` | Phase 1 findings |
| `PROJECT_MASTER_BLUEPRINT.md` | This architecture map |
| `AI_DEVELOPMENT_CONSTITUTION.md` | Rules for all agents/devs |
| `PROJECT_STATUS.md` | Living status board |
| `TASK_QUEUE.md` | Prioritized work items |
| `DECISIONS_LOG.md` | Architecture/product decisions |
| `ROADMAP.md` | Phased plan |
| `FINAL_REVIEW.md` | Docs review summary |
| `README.md` | Index |

Root phase reports (`FIX_REPORT.md`, etc.) are historical; **new work follows `docs/`**.

---

## 10. Working Tree vs Git HEAD

| Topic | Working tree (local) | Committed HEAD `fa44510` |
|-------|----------------------|---------------------------|
| Theme | Custom provider; `next-themes` removed from `package.json` | May still depend on `next-themes` |
| Website list SSR | Slim columns only | Still had `select("*")` fallback historically |
| Generation bounds | 18-file cap + soft-pass | May lack caps on remote until committed |
| `docs/` | Present locally | May be untracked until first docs commit |

**Always verify the tree you are editing.** Tasks H03–H05 exist to reconcile WT → `main`.

---

## 11. Success Definition (Near Term)

1. Stable dashboard + Website Builder generate → save → download  
2. Honest UI about ZIP vs live preview  
3. Required env + migrations verified  
4. Critical WT fixes reviewed and committed to `main`  
5. No architecture rewrite  

---

**Approval required before implementation work begins.**
