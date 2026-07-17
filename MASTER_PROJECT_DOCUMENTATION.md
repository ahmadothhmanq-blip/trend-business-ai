# MASTER_PROJECT_DOCUMENTATION.md

**Project:** Trend Business AI (`trend-business-ai`)  
**Repository:** `https://github.com/ahmadothhmanq-blip/trend-business-ai`  
**Local path:** `C:\Users\PC\Desktop\trend-business-ai`  
**Document type:** Full system reference for continuation (analysis only; no code changes)  
**Last analyzed:** 2026-07-17  
**Stack snapshot:** Next.js **16.2.9** · React **19.2.4** · Supabase Auth + Postgres · Tailwind CSS **4** · TypeScript **5** · Zod **4**

---

# 1. Executive Summary

## What this project is

**Trend Business AI** is an enterprise-oriented SaaS platform that helps founders, marketers, agencies, and operators plan and generate business assets with AI — websites, landing pages, web apps, logos, brand systems, images, video concepts, content calendars, marketing strategy, business intelligence, feasibility studies, and AI agents — inside one authenticated dashboard.

It is **not** a single chatbot. It is a multi-product AI workspace with:

- Public marketing + programmatic SEO surfaces
- Cookie-based Supabase authentication
- Per-user generation history stored in Postgres with RLS
- Platform layer: organizations/teams, billing/credits, API keys, usage, notifications
- Growth Engine: affiliates, referrals, leads, CRM, newsletter, experiments
- SEO Engine + **AI Search Center** (AEO + GEO + SEO visibility)

## Business goal

Become a category-defining **all-in-one AI business operating system** that:

1. Replaces fragmented AI chats (one tool for copy, another for design, another for strategy)
2. Ranks and gets cited in Google Search, Google AI Mode, ChatGPT, Gemini, Claude, Perplexity, and Copilot
3. Monetizes via subscription plans + credit packs (PayPal-first billing)
4. Compounds growth via affiliates, referrals, lead capture, and content/SEO

## Current development phase

| Phase | Theme | Status |
|-------|--------|--------|
| 1–13 | Core product, AI tools, workspaces, agents foundations | Largely complete in code |
| 14 | Organizations / team / platform infra (`021`–`024`) | Complete in migrations |
| 16 | Billing (`025`) | Complete in code; ops config often incomplete |
| 17–18 | SEO engine + production security audit (`026`) | Complete in code |
| 19 | Performance indexes / RC hardening (`027`) | Complete in code |
| 20 | Functional QA / org RLS fixes (`028`) | Complete in code; E2E auth gaps remain |
| 21 | Growth Engine (`029`–`030`) | Complete in code |
| 22 | AI Search Center (AEO/GEO/SEO dashboard) | Complete in code (on `main`) |

**Overall product maturity:** ~**78–82%** complete as a codebase.  
**Production launch readiness:** **Not launch-certified** until production env, billing certification, and authenticated E2E journeys are proven (see §§13–17).

---

# 2. Complete Architecture

## High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                          │
│  Marketing pages · Auth forms · Dashboard (client panels)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  proxy.ts  (Next.js 16 request proxy — NOT classic middleware)    │
│  • Supabase session cookie refresh                                │
│  • /dashboard* auth gate → /login?redirect=…                      │
│  • CSP + security headers                                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   App Router pages      app/api/* handlers     Server Actions
   (RSC + client UI)     (JSON APIs)            (lib/actions/auth.ts)
          │                     │                     │
          └──────────┬──────────┴──────────┬──────────┘
                     ▼                     ▼
              lib/* domain            plugins/* pipelines
         (ai, billing, seo,         (website, webapp, logo,
          growth, workspace,         brand, content, agents…)
          ai-search, platform)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                  │
│  Auth (email/password) · Postgres + RLS · Storage buckets         │
│  Optional: service role for billing/webhooks                      │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
        External: DeepSeek / OpenAI / Anthropic · PayPal · Upstash
```

## Folder structure (purpose)

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router: marketing, auth, dashboard, API, sitemaps, robots, manifest |
| `app/(auth)/` | Login, signup, forgot/reset password UI |
| `app/(dashboard)/` | Protected dashboard layout + all `/dashboard/*` pages |
| `app/api/` | ~73 Route Handlers for AI products, platform, billing, growth, SEO, AI Search |
| `app/products/` | Public product marketing pages |
| `app/sitemaps/` | Specialized XML sitemap endpoints |
| `components/auth/` | Auth forms |
| `components/dashboard/` | Dashboard shell, product UIs, platform panels |
| `components/marketing/` | Landing/marketing/growth capture UI |
| `components/seo/` | JSON-LD, breadcrumbs, programmatic landings, analytics scripts |
| `components/ui/` | shadcn/Radix primitives |
| `lib/ai/` | Provider manager, adapters, sanitize, prompts |
| `lib/ai-search/` | AEO/GEO/visibility/schema/optimizer/recommendations |
| `lib/seo/` | Metadata, sitemaps, programmatic, knowledge, analyzer, health |
| `lib/billing/` | Checkout, credits, PayPal, webhooks |
| `lib/growth/` | Affiliates, CRM, newsletter, dashboard payload |
| `lib/workspace/` | Typed workspace generation service |
| `lib/platform/` | Orgs/team/usage helpers (as used by APIs) |
| `lib/supabase/` | SSR server client, admin client, proxy session |
| `lib/actions/` | Server Actions (auth, profile) |
| `lib/api/` | `requireUser`, rate limits, helpers |
| `plugins/` | Product generation pipelines (plan/generate/validate/export) |
| `supabase/migrations/` | Ordered SQL `001`–`030` |
| `supabase/APPLY_PHASE*.sql` | Paste-friendly migration bundles |
| `scripts/` | `db:apply`, verify, Phase 20 QA harnesses |
| `types/` | Shared TypeScript models |
| `public/` | Static images/icons |
| Root `*.md` | Phase reports, deployment, audits |

## How everything connects

1. **Marketing CTA** → `/signup` or `/login` → Supabase Auth → cookie session.
2. **`proxy.ts`** refreshes session and blocks unauthenticated `/dashboard*`.
3. **Dashboard pages** are mostly thin server shells + client panels that `fetch('/api/...')`.
4. **AI APIs** call `requireUser()` → `enforceAiUsage` (rate limit + credits) → `providerManager` / plugin → persist to generation tables under RLS.
5. **Billing** mutations use **service role** write path; users only SELECT billing rows.
6. **Growth public** endpoints (leads/newsletter/events) use anon-safe inserts with RLS + rate limits.
7. **SEO/AI Search** compute from in-process registries (`lib/seo`, `lib/ai-search`) plus optional LLM enrichment.

---

# 3. Technology Stack

## Frameworks & runtime

| Technology | Version / note |
|------------|----------------|
| Next.js | **16.2.9** App Router (uses `proxy.ts`, not classic `middleware.ts`) |
| React | **19.2.4** |
| TypeScript | **5** (`tsc --noEmit` via `npm run type-check`) |
| Tailwind CSS | **4** (`@tailwindcss/postcss`) |
| Node | Used for scripts (`pg` for migrations) |

## Libraries & packages (production)

| Package | Role |
|---------|------|
| `@supabase/ssr` + `@supabase/supabase-js` | Auth + DB clients (cookie SSR) |
| `@upstash/ratelimit` + `@upstash/redis` | Distributed rate limiting |
| `openai` | OpenAI-compatible HTTP client (also DeepSeek-compatible patterns) |
| `zod` | Request/body validation |
| `framer-motion` | UI motion |
| `lucide-react` | Icons |
| `next-themes` | Theme provider |
| `sonner` | Toasts |
| `radix-ui` | Accessible primitives |
| `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` | Styling |
| `jspdf`, `jszip` | Export PDF/ZIP |

## Dev tooling

ESLint (`eslint-config-next`), `pg` (apply migrations), `shadcn` CLI, TypeScript types.

## APIs (internal)

See **§8** — REST-style Route Handlers under `/api/*`.

## AI providers

| Provider key | Env | Adapter status |
|--------------|-----|----------------|
| `deepseek` | `DEEPSEEK_API_KEY` | **Active** (default) |
| `openai` | `OPENAI_API_KEY` | **Active** |
| `claude` | `ANTHROPIC_API_KEY` | **Active** |
| `gemini` | `GEMINI_API_KEY` | Placeholder (not implemented) |
| `grok` | `GROK_API_KEY` | Placeholder |
| `llama` | `LLAMA_API_KEY` | Placeholder |

Central orchestration: `lib/ai/provider-manager.ts` + `lib/ai/provider-config.ts` + `lib/ai/adapters/*`.

## Database

**Supabase Postgres** with Row Level Security. Schema applied via numbered migrations `001`–`030` (`npm run db:apply`) or SQL Editor `APPLY_PHASE*.sql` bundles. No Prisma.

## Authentication

Supabase Auth email/password; cookie session via `@supabase/ssr`; server actions in `lib/actions/auth.ts`; callback at `/auth/callback`.

---

# 4. Every Feature

## 4.1 Public marketing site

| Item | Detail |
|------|--------|
| **Purpose** | Acquire users; explain product; SEO landings |
| **How it works** | App Router pages + `SiteShell` / marketing components; metadata via `lib/seo` |
| **Status** | Complete for core pages; some product slug naming drift |
| **Files** | `app/page.tsx`, `app/{pricing,features,about,contact,faq,blog,docs,learn,privacy,terms,templates,resources,changelog}/**`, `components/marketing/**` |
| **Dependencies** | SEO engine, growth capture widgets |

## 4.2 Programmatic SEO hubs

| Item | Detail |
|------|--------|
| **Purpose** | Scale organic pages: use-cases, compare, services, industries, countries |
| **How it works** | Registry defs in `lib/seo/programmatic.ts`, `industries.ts`, `countries.ts`, `cities.ts` (cities draft-only); pages under matching `app/*` |
| **Status** | Published entries live; city pages intentionally draft (not sitemapped) |
| **Files** | `app/use-cases`, `compare`, `services`, `industries`, `countries`, `lib/seo/*`, `components/seo/programmatic-*` |
| **Dependencies** | Sitemap builders, internal linking |

## 4.3 Authentication

| Item | Detail |
|------|--------|
| **Purpose** | Account create/login/session/password reset |
| **How it works** | Server Actions → Supabase Auth; proxy gate for dashboard |
| **Status** | Complete; email confirmation may block immediate session |
| **Files** | `app/(auth)/*`, `lib/actions/auth.ts`, `app/auth/callback/route.ts`, `components/auth/*` |
| **Dependencies** | Supabase Auth settings, `NEXT_PUBLIC_SITE_URL` for redirects |

## 4.4 Dashboard shell

| Item | Detail |
|------|--------|
| **Purpose** | Authenticated workspace chrome |
| **How it works** | Layout checks user; sidebar from `dashboard-nav.ts`; black/gold UI |
| **Status** | Complete |
| **Files** | `app/(dashboard)/layout.tsx`, `components/dashboard/{sidebar,header}.tsx`, `lib/constants/dashboard-nav.ts` |
| **Dependencies** | Auth session |

## 4.5 Website Builder

| Item | Detail |
|------|--------|
| **Purpose** | AI website blueprints / structures |
| **How it works** | Dashboard UI → `/api/website-builder` → plugin pipeline → `website_generations` |
| **Status** | Complete; live preview gated by `WEBSITE_PREVIEW_BUILDER_ENABLED` |
| **Files** | `app/(dashboard)/dashboard/website-builder/**`, `app/api/website-builder/**`, `plugins/website/**`, `lib` website helpers |
| **Dependencies** | AI provider, credits, RLS table `website_generations` |

## 4.6 Landing Page Builder

| Item | Detail |
|------|--------|
| **Purpose** | Conversion landing layouts/messaging |
| **How it works** | `/api/landing-page-builder` + `plugins/landing-page` → `landing_page_generations` |
| **Status** | Complete |
| **Files** | `dashboard/landing-page-builder`, `app/api/landing-page-builder/**`, `plugins/landing-page/**` |
| **Dependencies** | AI provider, credits |

## 4.7 Web App Builder

| Item | Detail |
|------|--------|
| **Purpose** | App structure / flows generation |
| **How it works** | Nav href `/dashboard/app-builder`; API `/api/webapp-builder`; plugins/webapp → `webapp_generations` |
| **Status** | Complete (slug naming: app-builder vs webapp-builder) |
| **Files** | `dashboard/app-builder`, `app/api/webapp-builder/**`, `plugins/webapp/**` |
| **Dependencies** | AI provider, credits |

## 4.8 Logo Designer

| Item | Detail |
|------|--------|
| **Purpose** | Logo concepts |
| **How it works** | Nav `/dashboard/logo-maker`; API `/api/logo-designer` → `logo_generations` |
| **Status** | Complete |
| **Files** | `dashboard/logo-maker`, `app/api/logo-designer/**`, `plugins/logo-designer/**` |
| **Dependencies** | AI provider, credits |

## 4.9 Brand Identity / Brand Studio

| Item | Detail |
|------|--------|
| **Purpose** | Brand systems (palette, voice, identity) |
| **How it works** | Nav `/dashboard/brand-studio`; API `/api/brand-identity` → `brand_identity_generations`; workspace type `brand` may map to brand-designer |
| **Status** | Complete with naming aliases |
| **Files** | `dashboard/brand-studio`, `dashboard/brand-designer`, `app/api/brand-identity/**`, `plugins/brand-identity/**` |
| **Dependencies** | AI provider, credits, workspace optional |

## 4.10 Image Generator

| Item | Detail |
|------|--------|
| **Purpose** | Image concepts / prompts / blueprints |
| **How it works** | `/api/image-generator` → `image_generations` |
| **Status** | Complete (primarily structured/AI text blueprints unless provider image APIs wired) |
| **Files** | `dashboard/image-generator`, `app/api/image-generator/**`, `plugins/image-generator/**` |
| **Dependencies** | AI provider, credits |

## 4.11 Video Studio

| Item | Detail |
|------|--------|
| **Purpose** | Video concepts / storyboards |
| **How it works** | `/api/video-studio` → `video_generations` |
| **Status** | Complete as concept generator (not a full video render farm) |
| **Files** | `dashboard/video-studio`, `app/api/video-studio/**`, `plugins/video-studio/**` |
| **Dependencies** | AI provider, credits |

## 4.12 Content Studio

| Item | Detail |
|------|--------|
| **Purpose** | Content drafts + calendar |
| **How it works** | `/api/content-studio` + calendar routes → `content_generations`, `content_calendar` |
| **Status** | Complete |
| **Files** | `dashboard/content-studio`, `app/api/content-studio/**`, `plugins/content-studio/**` |
| **Dependencies** | AI provider, credits |

## 4.13 Social Media / Marketing / Business Suite / Feasibility

| Feature | Dashboard | API / storage | Status |
|---------|-----------|---------------|--------|
| Social Media | `/dashboard/social-media` | Often via workspace `social` + content tools | Present |
| Marketing Strategy | `/dashboard/marketing` | Workspace `marketing` / business suite tools | Present |
| Business Suite / BI | `/dashboard/business-intelligence` | `/api/business-suite` → `business_generations` | Complete |
| Feasibility Study | `/dashboard/feasibility-study` | Business suite / dedicated flows | Present |
| Business Manager / Audit / Creative Studio | Dedicated pages (some redirect/overlap) | Workspace types | Partial clarity |

## 4.14 AI Agents

| Item | Detail |
|------|--------|
| **Purpose** | Configurable agents, workflows, executions, prompts |
| **How it works** | `/api/ai-agents*` → tables `agents`, `agent_workflows`, `agent_executions`, `agent_memory`, `prompt_library`, `scheduled_jobs` |
| **Status** | Platform complete; scheduling/automation depth varies |
| **Files** | `dashboard/ai-agents`, `app/api/ai-agents/**`, `plugins/ai-agents/**`, migration `022` |
| **Dependencies** | AI provider, credits, RLS |

## 4.15 Ideas / Market Analysis / Reports (legacy core)

| Item | Detail |
|------|--------|
| **Purpose** | Original MVP AI tools |
| **How it works** | Dedicated APIs + tables `business_ideas`, `market_analyses`, `reports` |
| **Status** | Functional; often off primary sidebar (Labs-like) |
| **Files** | `dashboard/ideas|market-analysis|reports`, matching `/api/*` |
| **Dependencies** | AI provider, credits |

## 4.16 Projects / History / Favorites / Files / Templates

| Item | Detail |
|------|--------|
| **Purpose** | Organize and revisit generations |
| **How it works** | `projects`, `favorites`, generation list APIs, attachments storage |
| **Status** | Present |
| **Files** | `dashboard/projects|history|favorites|files|templates`, migrations `005`,`011` |
| **Dependencies** | RLS, storage bucket `generation-uploads` |

## 4.17 SEO Engine (dashboard)

| Item | Detail |
|------|--------|
| **Purpose** | Sitewide SEO health + page analyzer |
| **How it works** | `GET /api/seo/health`, `POST /api/seo/analyze` → `lib/seo/health`, `analyzer` |
| **Status** | Complete |
| **Files** | `dashboard/seo`, `components/dashboard/platform/seo-health-panel.tsx`, `lib/seo/**` |
| **Dependencies** | Optional AI enrich via provider + `seo-analyzer` quota |

## 4.18 AI Search Center (Phase 22)

| Item | Detail |
|------|--------|
| **Purpose** | Optimize for Google + AI answer/generative engines (AEO/GEO) |
| **How it works** | `GET /api/ai-search/dashboard` builds visibility/analytics/programmatic/knowledge/competitors/recommendations from live registries; `POST /api/ai-search/analyze` modes: `aeo|geo|schema|optimize` |
| **Status** | Complete in code |
| **Files** | `dashboard/ai-search`, `components/dashboard/platform/ai-search-panel.tsx`, `lib/ai-search/**`, `types/ai-search.ts` |
| **Dependencies** | SEO registries; optional AI for enrich |

## 4.19 Growth Engine

| Item | Detail |
|------|--------|
| **Purpose** | Affiliates, referrals, leads, CRM, email campaigns, A/B, automations, analytics events |
| **How it works** | Authenticated dashboard + public capture APIs; migrations `029`/`030` |
| **Status** | Complete in code; ESP live email sending may be stubbed/optional |
| **Files** | `dashboard/growth`, `app/api/growth/**`, `lib/growth/**`, `components/marketing/growth/**` |
| **Dependencies** | Supabase growth tables, Upstash for production public rate limits |

## 4.20 Billing / Subscription / Credits

| Item | Detail |
|------|--------|
| **Purpose** | Monetization |
| **How it works** | Plans/packs catalog → checkout (PayPal) → webhook/complete → subscription + credits; AI usage consumes credits |
| **Status** | Code complete; requires service role + PayPal credentials for production |
| **Files** | `dashboard/billing|subscription`, `app/api/platform/billing/**`, `app/api/webhooks/billing/[provider]`, `lib/billing/**`, migration `025`+ |
| **Dependencies** | `SUPABASE_SERVICE_ROLE_KEY`, PayPal env vars |

## 4.21 Team / Organizations / API Keys / Notifications / Usage / Admin

| Feature | Status | Notes |
|---------|--------|-------|
| Organizations & team | Complete schema + APIs | RLS helpers in `028` |
| API keys | Complete | Hashed storage |
| Notifications | Complete | User-scoped |
| Usage | Complete | Records + dashboard |
| Admin | Present | Role-gated paths; growth lead claim admin JWT role |
| AI Providers settings | Complete | Per-user defaults in `ai_provider_settings` |

## 4.22 Profile / Settings / Preferences

| Item | Detail |
|------|--------|
| **Purpose** | User profile, avatar, theme prefs |
| **How it works** | Server actions + `/api/profile`, `/api/preferences`; avatars bucket |
| **Status** | Complete |
| **Files** | `lib/actions/auth.ts`, `dashboard/profile|settings`, migrations `001`,`006`,`007` |

---

# 5. Application Flow

## End-to-end user journey

```
1. Land on `/` (marketing hero, product story, CTAs)
2. Browse `/features`, `/pricing`, `/products/*`, programmatic hubs, `/blog`, `/faq`
3. Optional: newsletter / contact lead → POST /api/growth/newsletter|leads
4. Click Sign up → `/signup`
5. Server Action signUp → Supabase Auth
   - If email confirmation required → `/login?message=confirm-email`
   - Else session cookie → redirect `/dashboard`
6. Confirm email (if enabled) → `/auth/callback` exchanges code → `/dashboard`
7. Login → `/login` → signInWithPassword → safe redirect to `/dashboard` or `?redirect=`
8. proxy.ts keeps session fresh; blocks unauthenticated dashboard
9. Dashboard overview → pick AI product from sidebar
10. Submit generation form → POST /api/<product>
    → requireUser → enforceAiUsage (rate + credits)
    → providerManager / plugin → save row in generation table
11. View history / project / favorite / export
12. Optional: Billing → checkout → PayPal → webhook/complete → credits/plan
13. Optional: Team invite, Growth affiliate links, SEO/AI Search optimization
14. Logout → signOut → `/login`
```

## Auth edge cases

- Open redirect protection: `safeRedirectPath`
- Forgot password always returns success (anti-enumeration)
- Reset password requires callback session then `updateUser({ password })`

---

# 6. Database Documentation

## Tables (by domain)

### Identity
- `profiles` — extends `auth.users`
- `user_preferences` — theme, notifications
- Trigger `handle_new_user` creates profile + prefs

### Legacy AI content
- `business_ideas`, `market_analyses`, `reports`, `favorites`

### Product generations
- `website_generations`, `webapp_generations`, `landing_page_generations`
- `logo_generations`, `brand_identity_generations`, `image_generations`, `video_generations`
- `content_generations`, `content_calendar`, `business_generations`
- `workspace_generations` (typed workspaces)
- `projects`, `generation_attachments`
- `ai_provider_settings`

### Agents
- `agents`, `agent_workflows`, `agent_executions`, `agent_memory`
- `prompt_library`, `scheduled_jobs`

### Platform
- `organizations`, `org_members`, `team_invitations`
- `notifications`, `activity_log`, `api_keys`, `webhooks`
- `usage_records`, `feature_flags`, `subscription_plans`

### Billing
- `billing_customers`, `billing_subscriptions`, `billing_invoices`
- `credit_balances`, `credit_ledger`, `credit_packs`
- `billing_checkout_sessions`, `billing_webhook_events`
- RPC: `consume_credits`

### Growth
- `growth_affiliates`, `growth_affiliate_commissions`, `growth_affiliate_payouts`
- `growth_referral_codes`, `growth_referral_invites`
- `growth_leads`, `growth_contacts`, `growth_deals`
- `growth_subscribers`, `growth_email_campaigns`, `growth_automations`
- `growth_events`, `growth_experiments`, `growth_segments`

## Relationships (simplified)

```
auth.users
  ├─ profiles / user_preferences / ai_provider_settings / credit_balances
  ├─ *generations → optional projects / attachments / parent self-refs
  ├─ organizations (owner) ↔ org_members
  ├─ billing_* / credit_ledger / checkout
  ├─ agents → executions / memory / workflows
  └─ growth_* (owner-scoped + limited anon inserts)
```

## RLS policy themes

1. **Owner CRUD** on user content (`auth.uid() = user_id`)
2. **Org membership** via SECURITY DEFINER helpers (`is_org_member/admin/owner`) — recursion fixed in `028`
3. **Public catalog SELECT** on plans/packs/flags
4. **Billing: user SELECT only**; writes via service role (`026`)
5. **Growth: anon INSERT** for leads/subscribers/events under null-owner constraints; financial columns trigger-locked (`030`)
6. **Templates/public agents**: read public; mutate own only

## Storage

| Bucket | Public | Rule |
|--------|--------|------|
| `avatars` | Yes | Path folder must match `auth.uid()` for writes |
| `generation-uploads` | No | Path scoped to `auth.uid()` |

## Migrations (ordered)

| # | File | Purpose |
|---|------|---------|
| 001 | profiles | Profiles + RLS |
| 002 | business_ideas | Ideas |
| 003 | market_analyses | Market analysis |
| 004 | reports | Reports |
| 005 | favorites | Favorites |
| 006 | user_preferences | Prefs + signup trigger |
| 007 | storage_avatars | Avatars bucket |
| 008 | website_generations | Website builder |
| 009 | website_favorites | Website favorites extension |
| 010 | workspace_generations | Workspace gens |
| 011 | ai_engine_phase5 | Projects, attachments, metadata |
| 012 | ai_provider_settings | Provider prefs |
| 013–020 | product generation tables | Webapp → business suite |
| 021 | platform_infrastructure | Orgs, keys, usage, flags, plans |
| 022 | ai_agents_platform | Agents system |
| 023 | security_hardening | Notification/org policy fixes |
| 024 | organization_bootstrap | Create org as owner |
| 025 | billing_system | Billing + credits |
| 026 | security_hardening | Billing lockdown |
| 027 | performance_indexes | Hot-path indexes |
| 028 | production_qa_fixes | Org RLS helpers, checkout processing, credits |
| 029 | growth_engine | Growth tables |
| 030 | growth_security_hardening | Affiliate finance locks |

**Apply helpers:** `supabase/APPLY_PHASE14.sql` … `APPLY_PHASE22.sql` mirror the above for SQL Editor paste.

---

# 7. AI System

## Provider manager

- **File:** `lib/ai/provider-manager.ts`
- Resolves provider: user preference → active → first configured active registry entry
- Methods: `generateJson`, `generateText`, `streamText`, `runPlugin`
- Default: **DeepSeek**
- User overrides stored in `ai_provider_settings`
- Prompt sanitization: `lib/ai/sanitize.ts`

## Website Builder

- Plugin: `plugins/website` (plan → generate → validate → export/analyze)
- API: `/api/website-builder` (+ `[id]`, preview routes)
- Persist: `website_generations`
- Preview builder feature-flagged

## App Builder (Web App)

- Plugin: `plugins/webapp`
- API: `/api/webapp-builder`
- UI route: `/dashboard/app-builder`
- Persist: `webapp_generations`

## Landing Page Builder

- Plugin: `plugins/landing-page`
- API: `/api/landing-page-builder`
- Persist: `landing_page_generations`

## AI Search (not a chat product)

- Engines in `lib/ai-search/*`
- Visibility scores (SEO/AEO/GEO/technical/content/schema)
- Analyzers: AEO, GEO, schema validate, content optimize
- Managers: programmatic inventory, knowledge gaps, competitor matrix, recommendations
- Optional LLM enrichment reuses `seo-analyzer` credit/rate bucket

## AI Chat

- **There is no standalone general “AI Chat” product** as a first-class nav item.
- Chat-like behavior appears inside tool UIs / agents / streaming workspace endpoints (`/api/workspaces/[type]/stream`), not a freeform ChatGPT clone page.

## Workspace

- Types: `brand | creative | content | business | manager | marketing | social | audit`
- Service: `lib/workspace/service.ts` + `plugins/workspace`
- API: `/api/workspaces/[type]` (+ id + stream)
- Persist: `workspace_generations`

## Agents

- CRUD agents/workflows/prompts; list executions
- Tables from `022`
- Plugin schemas in `plugins/ai-agents`

## Automation

- Growth automations table + dashboard tab
- Agent `scheduled_jobs` / workflows
- Not a full Zapier replacement; platform scaffolding present

## Content / Images / Video

- Content Studio: generations + calendar
- Image/Video: blueprint/concept pipelines via plugins + generation tables
- Exports may use jspdf/jszip where implemented

## Usage gating

Almost all AI POSTs: `requireUser` → `enforceAiUsage(resource)` → rate limit + `consume_credits`.

---

# 8. API Documentation

Auth legend: **U** = `requireUser` required · **P** = public/intentional unauthenticated · **W** = webhook

| Endpoint | Methods | Auth | Purpose |
|----------|---------|------|---------|
| `/api/health` | GET | P | Liveness |
| `/api/profile` | GET, POST | U | Profile |
| `/api/preferences` | GET, PUT | U | Preferences |
| `/api/uploads` | POST | U | Uploads |
| `/api/ai-settings` | GET, PUT | U | AI provider settings |
| `/api/ai-settings/test` | POST | U | Test provider |
| `/api/ideas` | GET, POST | U | Ideas list/create |
| `/api/ideas/[id]` | PUT, PATCH, DELETE | U | Idea mutate |
| `/api/market-analysis` | GET, POST | U | Market analyses |
| `/api/market-analysis/[id]` | PATCH, DELETE | U | Mutate |
| `/api/reports` | GET, POST | U | Reports |
| `/api/reports/[id]` | PATCH, DELETE | U | Mutate |
| `/api/workspaces/[type]` | GET, POST | U | Workspace gens |
| `/api/workspaces/[type]/[id]` | GET, PATCH, POST, DELETE | U | Workspace item |
| `/api/workspaces/[type]/stream` | POST | U | Stream generation |
| `/api/website-builder` | GET, POST | U | Website gens |
| `/api/website-builder/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/website-builder/preview` | POST | U | Preview create |
| `/api/website-builder/preview/[id]` | GET | special | Preview HTML |
| `/api/website-builder/preview/[id]/asset/[...path]` | GET | special | Preview assets |
| `/api/webapp-builder` | GET, POST | U | Webapp gens |
| `/api/webapp-builder/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/landing-page-builder` | GET, POST | U | Landing gens |
| `/api/landing-page-builder/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/logo-designer` | GET, POST | U | Logos |
| `/api/logo-designer/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/brand-identity` | GET, POST | U | Brands |
| `/api/brand-identity/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/image-generator` | GET, POST | U | Images |
| `/api/image-generator/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/video-studio` | GET, POST | U | Videos |
| `/api/video-studio/[id]` | GET, PATCH, POST, DELETE | U | Item |
| `/api/content-studio` | GET, POST | U | Content |
| `/api/content-studio/[id]` | GET, PATCH, DELETE | U | Item |
| `/api/content-studio/calendar` | GET, POST | U | Calendar |
| `/api/content-studio/calendar/[id]` | PATCH, DELETE | U | Calendar item |
| `/api/business-suite` | GET, POST | U | Business suite |
| `/api/business-suite/[id]` | GET, PATCH, DELETE | U | Item |
| `/api/ai-agents` | GET, POST | U | Agents |
| `/api/ai-agents/[id]` | GET, PATCH, DELETE | U | Agent |
| `/api/ai-agents/executions` | GET | U | Executions |
| `/api/ai-agents/executions/[id]` | GET | U | Execution |
| `/api/ai-agents/workflows` | GET, POST | U | Workflows |
| `/api/ai-agents/prompts` | GET, POST | U | Prompts |
| `/api/platform/usage` | GET | U | Usage |
| `/api/platform/plans` | GET | U | Plans |
| `/api/platform/notifications` | GET, PATCH | U | Notifications |
| `/api/platform/admin` | GET | U/admin | Admin |
| `/api/platform/team` | GET, POST | U | Team |
| `/api/platform/organizations` | GET, POST | U | Orgs |
| `/api/platform/activity` | GET | U | Activity |
| `/api/platform/api-keys` | GET, POST | U | API keys |
| `/api/platform/api-keys/[id]` | PATCH, DELETE | U | Key |
| `/api/platform/webhooks` | GET, POST | U | Outbound webhooks |
| `/api/platform/webhooks/[id]` | PATCH, DELETE | U | Webhook |
| `/api/platform/billing` | GET | U | Billing status |
| `/api/platform/billing/checkout` | POST | U | Start checkout |
| `/api/platform/billing/complete` | POST | U | Complete checkout |
| `/api/platform/billing/cancel` | POST | U | Cancel |
| `/api/platform/billing/credits` | POST | U | Buy/grant credits flow |
| `/api/platform/billing/invoices` | GET | U | Invoices |
| `/api/webhooks/billing/[provider]` | POST | W | Provider webhooks |
| `/api/growth/dashboard` | GET | U | Growth dashboard |
| `/api/growth/leads` | POST | P | Lead capture |
| `/api/growth/events` | POST | P | Analytics events |
| `/api/growth/newsletter` | POST | P | Newsletter |
| `/api/growth/actions` | POST | U | Growth actions |
| `/api/growth/crm` | POST, PATCH | U | CRM |
| `/api/growth/referrals` | POST | U | Referrals |
| `/api/seo/health` | GET | U | SEO health |
| `/api/seo/analyze` | POST | U | SEO analyze |
| `/api/ai-search/dashboard` | GET | U | AI Search payload |
| `/api/ai-search/analyze` | POST | U | AEO/GEO/schema/optimize |

**Also:** `/auth/callback`, `/robots.txt`, `/sitemap.xml`, `/sitemaps/*.xml`, `/manifest.webmanifest`.

---

# 9. Security

## Architecture

1. **Transport:** HTTPS in production (HSTS header set in proxy)
2. **Session:** HttpOnly cookies via Supabase SSR; refreshed in `proxy.ts`
3. **Route protection:** Proxy + dashboard layout double-check
4. **API protection:** `requireUser` on private routes; intentional public growth endpoints rate-limited
5. **Data protection:** Postgres RLS owner isolation + org helpers
6. **Billing integrity:** Users cannot write billing tables; service role + signed webhooks
7. **Growth integrity:** Triggers block affiliate financial tampering; admin-only lead claim
8. **Input safety:** Zod validation; AI prompt sanitize; path sanitize for exports
9. **Headers/CSP:** Set in `lib/supabase/proxy.ts` (script allows unsafe-inline/eval for Next/GTM tradeoffs)
10. **Logging:** `lib/logger.ts` redacts secrets
11. **Redirects:** `safeRedirectPath` blocks open redirects

## Residual risks (known)

- CSP allows `unsafe-inline` / `unsafe-eval` (Next practicality)
- Placeholder AI providers must never be treated as production-ready
- `ALLOW_INSECURE_PAYPAL_WEBHOOKS` must never be true in production
- Growth public rate limits fail-closed on Vercel without Upstash

---

# 10. Authentication & Authorization

## Authentication

| Flow | Implementation |
|------|----------------|
| Sign up | `signUp` server action → Supabase; optional email confirm |
| Sign in | `signInWithPassword` |
| Sign out | `signOut` → `/login` |
| Forgot password | `resetPasswordForEmail` |
| Reset password | callback session → `updateUser({ password })` |
| OAuth/email code | `/auth/callback` `exchangeCodeForSession` |

## Authorization

| Layer | Mechanism |
|-------|-----------|
| App routes | Session presence for `/dashboard*` |
| API | `requireUser()` |
| DB | RLS |
| Orgs | Roles `owner|admin|member|viewer` |
| Billing writes | Service role only |
| Admin growth claim | JWT `app_metadata.role = 'admin'` |
| Credits | `consume_credits` RPC enforces ownership when `auth.uid()` present |

---

# 11. Deployment

## Target

Typically **Vercel** + **Supabase** + **PayPal** + **Upstash Redis**.

## Checklist (from `DEPLOYMENT.md` + audits)

1. Apply migrations `001`–`030` (or APPLY phase SQL bundles) on target DB
2. Configure Supabase Auth Site URL + Redirect URLs (`/auth/callback`, `/reset-password`)
3. Set production env vars (see §12) — especially `NEXT_PUBLIC_SITE_URL`, service role, AI keys, PayPal, Upstash
4. `npm run build` && `npm start` (or Vercel build)
5. Verify `/api/health`, auth, one AI generation, billing sandbox webhook, growth lead POST
6. Confirm production `robots.txt` allows indexing (`isProductionRuntime`)

## Scripts

- `npm run dev|build|start|lint|type-check|verify`
- `npm run db:apply` / `db:verify`

## Important Next.js note

This project uses **Next.js 16** conventions (`proxy.ts`). Read `node_modules/next/dist/docs/` and `AGENTS.md` before changing request pipeline.

---

# 12. Environment Variables

**Names only — never commit values.**

### Required / core
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `DEEPSEEK_API_KEY` (default AI) and/or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`

### Database ops
- `SUPABASE_DB_URL`
- `DATABASE_URL`

### Billing / admin
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_MODE`
- `BILLING_OPTIONAL`
- `ALLOW_INSECURE_PAYPAL_WEBHOOKS`

### AI (optional / placeholder)
- `GEMINI_API_KEY`
- `GROK_API_KEY`
- `LLAMA_API_KEY`

### Rate limiting
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### SEO / analytics (optional)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GTM_ID`

### Runtime / ops
- `NODE_ENV`
- `VERCEL_URL`
- `VERCEL_ENV`
- `LOG_LEVEL`
- `HEALTH_DETAILED`
- `WEBSITE_PREVIEW_BUILDER_ENABLED`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (alias path in some scripts)
- `QA_BASE` (QA harness only)

---

# 13. Current Project Status

## Completed (in codebase)

- Full multi-product AI dashboard + APIs + plugins
- Supabase auth + profile/prefs/avatars
- Migrations through Growth security (`030`)
- Billing system code (PayPal adapter, credits, webhooks)
- Organizations/team/API keys/notifications/usage
- SEO engine, sitemaps, programmatic hubs, knowledge foundation
- Growth Engine (dashboard + public capture)
- AI Search Center (Phase 22) on `main`
- Security hardenings (Phases 18–20, 30)
- Performance indexes (Phase 19)
- Typecheck historically green; large feature surface shipping

## Partially completed

- Gemini/Grok/Llama providers (stubs)
- Live ESP email sending for Growth campaigns
- City programmatic pages (draft registry only)
- Authenticated E2E QA coverage (email confirm blocks disposable sessions)
- Some marketing ↔ dashboard slug consistency (`logo-maker` vs `logo-designer`, etc.)
- Accessibility CI / axe coverage
- Real image/video render pipelines beyond structured generation
- Standalone AI Chat product (not a primary feature)

## Missing / launch blockers (ops + proof)

- Production env fully configured on deploy target
- Billing sandbox→live certification with real webhooks
- Confirmed authenticated journey: login → generate → persist → logout
- Optional: analytics IDs, SMTP for auth emails, Upstash on Vercel

---

# 14. Known Problems

1. **Production env often incomplete** locally (Site URL, service role, Upstash, PayPal) — blocks safe deploy.
2. **Email confirmation** prevents easy automated auth E2E without confirmed users.
3. **Naming drift** across nav/API/plugin slugs confuses deep links.
4. **Empty/orphan route folders** historically noted in audits (`app/dashboard` empty shells, etc.).
5. **CSP unsafe-inline/eval** tradeoff remains.
6. **README.md is outdated** vs actual product breadth (still describes early MVP routes only).
7. **Growth lead insert** previously failed when using `.select()` under anon RLS — fixed to insert-only; callers must not expect returned DB id for anon.
8. **Local robots.txt Disallow: /** is intentional non-production behavior.

---

# 15. Technical Debt

- Triple generator paths (`lib/*-generator`, prompts, `plugins/*`) — need clear facade contract
- Sidebar vs orphan dashboard pages (ideas/reports/admin) lack Labs grouping
- Placeholder provider adapters still in tree
- Marketing nav coarse product hubs vs many `/products/*` pages
- Documentation sprawl across many phase `*.md` reports (this master doc consolidates)
- Possible unused scaffold helpers (`lib/routes/scaffold-page.tsx` noted in audits)
- Heavy client dashboard panels (bundle weight)

---

# 16. Performance

## Strengths

- Specialized sitemaps; long-cache static images
- `optimizePackageImports` for lucide/framer/radix
- Composite DB indexes (`027`) on `(user_id, created_at)` hot paths
- AI Search dashboard is in-process registry compute (no N+1 DB)
- Rate limits protect expensive AI routes

## Risks

- Large client panels for AI tools
- Generation responses can be large JSON blueprints
- Without Upstash, rate limits are per-instance memory (weaker on serverless fan-out)
- Preview iframe paths need careful caching/CSP

---

# 17. Production Readiness

| Area | Ready? |
|------|--------|
| Core AI product code | Yes (with AI keys) |
| Auth code | Yes |
| RLS/migrations | Yes (if applied through `030`) |
| SEO/AI Search code | Yes |
| Growth code | Yes |
| Billing code | Yes |
| Ops configuration | **Often No** |
| Authenticated E2E proof | **Often No** |
| Provider stubs | Not for Gemini/Grok/Llama |

**Verdict used in Phase 20/enterprise audits:** **NOT READY FOR PRODUCTION** until env + billing + auth E2E checklist passes.

Release candidate posture (Phase 19): **RC YES after env checklist** — still not “go live” without §13 blockers closed.

---

# 18. Roadmap

1. **Launch hardening** — env, Upstash, PayPal live, auth E2E, monitoring
2. **Slug unification** — canonical product IDs across marketing/nav/API
3. **Provider completion** — Gemini/Grok/Llama or remove stubs from UI
4. **Growth monetization** — ESP integration, affiliate payouts ops
5. **AI Search content ops** — publish knowledge kinds, comparison pages, HowTo/Review schema on public pages
6. **City SEO** — publish only after quality gates
7. **A11y + CWV program** — CI axe, real Core Web Vitals budgets
8. **True multimodal** — real image/video providers if product requires
9. **Enterprise SSO / RBAC polish** — if B2B expansion needs it

---

# 19. Recommended Development Order

1. Apply/verify migrations `001`–`030` on production Supabase  
2. Fill production env (`SITE_URL`, service role, DeepSeek/OpenAI, PayPal, Upstash)  
3. Configure Auth redirect URLs + email templates  
4. Smoke: health, signup/login, one AI generate, lead capture, billing sandbox  
5. Fix remaining slug/marketing inconsistencies  
6. Authenticated QA script / checklist for every AI product  
7. Turn on analytics verification IDs  
8. Publish highest-ROI programmatic/knowledge pages from AI Search recommendations  
9. Only then: custom domain launch + indexable robots  

---

# 20. Everything ChatGPT (or any successor agent) needs to know

## Non-negotiables

1. **This is Next.js 16** — use `proxy.ts`, not assumptions from Next 13 middleware tutorials. Read `AGENTS.md` / Next dist docs before request-pipeline changes.
2. **Do not invent Prisma** — schema is raw SQL migrations in `supabase/migrations`.
3. **Default AI is DeepSeek** via `providerManager`; placeholders for Gemini/Grok/Llama are not production.
4. **Dashboard pattern:** thin `page.tsx` + client panel + `/api/*` with `requireUser`.
5. **Billing writes require service role**; never “fix” by allowing client writes to billing tables.
6. **Growth public inserts** must respect RLS (no `.select()` returning rows for anon leads).
7. **AI Search** builds from registries — do not replace with mock SERP numbers.
8. **City pages stay draft** until quality gates; do not sitemap thin content.
9. **Black/gold dashboard tokens:** `premium-gold`, `luxury-black`, `glass-panel*`, Growth-style gold tabs.
10. **Nav source of truth:** `lib/constants/dashboard-nav.ts`.
11. **Phase numbering in docs:** Billing≈16, SEO≈17, audits≈18–20, Growth≈21, AI Search≈22 (older README phases may disagree — prefer migration/report files).
12. **Remote repo:** `origin` → `https://github.com/ahmadothhmanq-blip/trend-business-ai.git`, branch `main`.
13. **Secrets:** never commit `.env.local`; `.env*` is gitignored.
14. **ZIP archives** (`trend-business-ai.zip`) should stay untracked.
15. **Existing reports to consult before re-auditing:**  
    `DEPLOYMENT.md`, `PRODUCTION_AUDIT_REPORT.md`, `SECURITY_AUDIT_PHASE18.md`, `PHASE19_*`, `PHASE20_*`, `SEO_ENGINE_REPORT.md`, `GROWTH_ENGINE_REPORT.md`, `PHASE22_AI_SEARCH_REPORT.md`, `ENTERPRISE_AUDIT_REPORT.md`.

## How to extend safely

| Goal | Touch |
|------|-------|
| New AI product | `plugins/<name>`, migration table, `/api/<name>`, dashboard page, nav entry, types |
| New SEO page | `lib/seo` registry + `app/.../page.tsx` + sitemap builder |
| New AI Search check | `lib/ai-search/*` + dashboard tab if needed |
| New growth entity | migration + `lib/growth` + RLS review + API |
| Billing change | service-role path + webhook idempotency + RLS SELECT-only |

## Commands

```bash
npm install
cp .env.example .env.local   # fill values
npm run db:apply             # needs SUPABASE_DB_URL
npm run dev
npm run type-check
npm run lint
npm run build
```

## Definition of “done” for production

- Migrations `001`–`030` applied  
- Production env complete  
- Auth E2E works with real mailbox/confirm  
- At least one paid checkout + webhook fulfilled in sandbox  
- AI generation persists under RLS  
- Growth lead + newsletter succeed  
- `robots.txt` indexable in production  
- No critical security findings open  

---

**End of MASTER_PROJECT_DOCUMENTATION.md**
