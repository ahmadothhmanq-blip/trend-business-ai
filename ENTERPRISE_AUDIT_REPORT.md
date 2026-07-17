# Trend Business AI — Enterprise Audit Report

**Document type:** Read-only enterprise audit (no code changes)  
**Date:** 2026-07-17  
**Project:** Trend Business AI  
**Stack:** Next.js 16.2.9 · React 19.2.4 · Supabase · Tailwind 4 · TypeScript (strict)  
**Build status (this audit):** `tsc --noEmit` **PASS** · ESLint **9 warnings** (unused vars in AI Search routes/scripts; 0 errors). Strict `--max-warnings 0` would fail until cleaned.

---

## Executive summary

Trend Business AI is a large, coherent App Router SaaS with a broad AI product surface, platform infrastructure (billing, orgs, growth, SEO), and recent Phase 18–22 hardening. **Code maturity is high; launch readiness is not.** Production reports still block ship on ops configuration and authenticated end-to-end proof.

| Dimension | Score (0–100) | Notes |
|-----------|---------------|--------|
| Architecture & structure | 86 | Clear domain libs; some orphan dirs / naming drift |
| Feature completeness | 82 | Core AI tools strong; some marketing/redirect gaps |
| Security posture | 78 | Solid RLS + auth gates; CSP/key encryption remain |
| SEO / AEO / GEO | 88 | Strong on-site engine; registry scores ≠ live SERP |
| Performance | 74 | Good foundations; heavy client tools |
| Accessibility | 68 | Basics present; no CI axe |
| Ops / production readiness | 45 | Env + E2E + billing certification incomplete |
| **Overall completion** | **78%** | Product-capable codebase; not launch-certified |

**Launch recommendation:** **NOT READY FOR PRODUCTION** until P0 blockers in §6 are closed.

---

## 1. Architecture

### 1.1 Overview

```
Browser
  → proxy.ts (session refresh, security headers, CSP)
  → App Router (marketing | auth | dashboard)
  → app/api/* (requireUser | intentional public)
  → lib/* (ai, billing, growth, seo, ai-search, platform, workspace)
  → plugins/* (product generation pipelines)
  → Supabase (Auth + Postgres RLS)
```

| Layer | Location | Assessment |
|-------|----------|------------|
| Edge/session | `proxy.ts`, `lib/supabase/proxy.ts` | Good — Next 16 proxy pattern |
| Domain logic | `lib/{ai,ai-search,seo,billing,growth,platform,workspace}` | Strong separation |
| Product plugins | `plugins/*` + thin `lib/*-generator.ts` facades | Scalable |
| UI | `components/{marketing,dashboard,auth,seo,ui}` | Consistent enough |
| Data | SQL migrations `001`–`030` (no Prisma) | Enterprise-shaped |

### 1.2 Folder structure issues

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Medium** | Empty orphan trees: `app/dashboard/**` (empty), `app/login/`, `app/(marketing)/` — real routes live under `app/(dashboard)/dashboard/**` and `app/(auth)/**` | Delete empty shells or document as reserved | P2 |
| **Medium** | Product ID drift: `logo-maker` vs `logo-designer`, `brand-studio` vs `brand-identity`, `app-builder` vs `webapp-builder` | Canonical slug map + redirects | P2 |
| **Low** | Triple path for generators (`lib/*-generator`, `lib/ai/prompts`, `plugins/*`) | Document facade contract; avoid fourth path | P3 |
| **Low** | `lib/routes/scaffold-page.tsx` returns `null` | Remove dead helper | P3 |

---

## 2. Pages & navigation

### 2.1 Surface area

- **89** `page.tsx` routes discovered
- **~42** dashboard pages under `app/(dashboard)/dashboard/**`
- Marketing: home, pricing, features, about, contact, blog, docs, learn, FAQ, legal, product hubs, programmatic SEO hubs
- Auth: login, signup, forgot/reset password, `/register` → `/signup`, `/auth/callback`

### 2.2 Dashboard & navigation

Sidebar (`lib/constants/dashboard-nav.ts`) aligns with primary tools including **AI Search Center**, SEO Engine, Growth Engine, billing, team.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Medium** | Marketing nav collapses many products onto coarse `/products/create|content|business` anchors | Deep-link to individual `/products/*` slugs | P2 |
| **Medium** | `/products/business-manager` markets a tool whose dashboard route only redirects to business-intelligence | Point CTA to BI or ship a distinct product | P2 |
| **Low** | Legacy tools (ideas, market-analysis, reports, favorites, admin) off primary nav | Labs group or merge into Business Suite | P3 |
| **Low** | No public `/products/ai-agents` or AI Search marketing SKU | Add if those modules are sold externally | P3 |

### 2.3 Alias / thin pages (intentional but confusing)

| Route | Behavior |
|-------|----------|
| `/dashboard/brand-designer` | Alias → brand-studio engine |
| `/dashboard/creative-studio` | Alias → image-generator |
| `/dashboard/business-audit`, `/dashboard/business-manager` | Redirect → business-intelligence |
| `/dashboard/subscription` | Redirect → billing |
| `/dashboard/templates` | Static quick-start cards, not a template engine |
| `/dashboard/analytics` | Usage + activity panels, not product analytics |
| `/dashboard/files` | History-style list, not a file store |

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Medium** | Templates / Files / Analytics naming overstates capability | Rename UI labels or implement real systems | P2 |

---

## 3. UI/UX consistency

**Strengths**

- Dark luxury shell (`#050505`), gold tokens (`premium-gold`, `luxury-black`), glass panels
- Shared dashboard primitives (`DashboardHeader`, `DashboardCard`, `DashboardPanel`)
- Marketing site shell components and SEO components reused

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Low** | Marketing and dashboard visual languages partially diverge (Geist/SaaS vs black-gold luxury) | Unify marketing accents with dashboard tokens | P3 |
| **Medium** | Dense builder UIs are desktop-first; mobile usability of three-pane tools unproven | Manual QA at 375px for top 3 tools | P2 |

---

## 4. Services & features inventory

| Capability | Marketing | Dashboard | API | Status |
|------------|-----------|-----------|-----|--------|
| Website Builder | Yes | Yes | Yes | **Complete** |
| Landing Page Builder | Yes | Yes | Yes | **Complete** |
| App / Webapp Builder | Yes | Yes | Yes | **Complete** (name mismatch) |
| Logo Designer | Yes | Yes | Yes | **Complete** (name mismatch) |
| Brand Studio | Yes | Yes | Yes | **Complete** (name mismatch) |
| Image Generator | Yes | Yes | Yes | **Partial** — concepts/prompts, not pixel files |
| Video Studio | Yes | Yes | Yes | **Partial** — storyboards/concepts, not rendered video |
| Content Studio | Yes | Yes | Yes + calendar | **Complete** |
| Social Media | Yes | Yes | workspaces | **Complete** |
| Marketing AI | Yes | Yes | workspaces | **Complete** |
| Business Intelligence | Yes | Yes | business-suite | **Complete** |
| Feasibility Study | Yes | Yes | workspaces | **Complete** |
| Business Manager | Yes | Redirect only | — | **Incomplete** |
| AI Agents | No product page | Yes | Yes | **Dashboard-complete** |
| Ideas / Market / Reports | — | Off-nav | Yes | **Legacy complete** |
| SEO Engine | — | Yes | Yes | **Complete** |
| AI Search Center | — | Yes | Yes | **Complete** (on-site readiness) |
| Growth Engine | Capture on site | Yes | Yes | **Mostly complete** (ESP missing) |
| Billing | Pricing page | Yes | Yes | **Code-complete** (ops uncertified) |
| Team / Orgs | — | Yes | Yes | **Partial** (invite email missing) |

---

## 5. AI integrations

| Provider | Status | Env |
|----------|--------|-----|
| DeepSeek | **Active** (default) | `DEEPSEEK_API_KEY` |
| OpenAI | **Active** | `OPENAI_API_KEY` |
| Anthropic | **Active** | `ANTHROPIC_API_KEY` |
| Gemini | **Placeholder** (throws) | `GEMINI_API_KEY` |
| Grok | **Placeholder** (throws) | `GROK_API_KEY` |
| Llama | **Placeholder** (throws) | `LLAMA_API_KEY` |

User-managed keys via `ai_provider_settings` (migration `012`); responses masked; **no encryption-at-rest** found.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **High** | UI can expose Gemini/Grok/Llama while adapters throw “not yet implemented” | Hide placeholders or implement adapters | P1 |
| **High** | Provider API keys stored without encryption | Encrypt with app secret/KMS before persist | P1 |
| **High** | Long AI generations lack a durable job queue | Background worker / queue for scale | P1 |

---

## 6. API routes

- **73** route handlers under `app/api/`
- Dominant pattern: `requireUser()` → 401
- **Intentional public (5):**
  - `POST /api/growth/leads`
  - `POST /api/growth/newsletter`
  - `POST /api/growth/events`
  - `GET /api/health`
  - `POST /api/webhooks/billing/[provider]`

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Critical** | Production growth rate limits fail closed without Upstash on Vercel | Require Upstash in production | P0 |
| **Medium** | Team invite API stores DB row only; email not sent | Wire ESP (Resend/SendGrid) + accept flow | P1 |
| **Medium** | Public lead/newsletter endpoints lack CAPTCHA | Add Turnstile/hCaptcha | P2 |

---

## 7. Database (Supabase)

**Migrations:** `001`–`030` contiguous (profiles → workspace → products → platform → billing → hardening → growth → growth security).

**Key domains:** profiles, generations, workspaces, projects, organizations/org_members, billing, agents, growth_*, notifications, api_keys, webhooks.

**RLS:** Enabled widely; hardened in `023`, `026`, `028`, `030` (billing service-role writes, org escalation, growth financial locks).

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Critical** | Incomplete migration apply leaves APIs broken / older RLS | Run `npm run db:apply` through **030** + `db:verify` before launch | P0 |
| **Medium** | `DEPLOYMENT.md` early migration table under-documents 001–030 | Sync deploy docs to full 001–030 checklist | P2 |

---

## 8. Authentication & authorization

| Flow | Status |
|------|--------|
| Login / Signup | Present |
| Forgot / Reset password | Present |
| Auth callback + `safeRedirectPath` | Present |
| Dashboard layout + proxy session gate | Present |
| Sign-out server action | Present |
| Social OAuth UI | Not found (email/password) |

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **High** | Phase 20: authenticated E2E incomplete (email confirmation blocked harness); reset not mailbox-verified | Staging confirmed user + mailbox E2E | P0 |
| **Medium** | No social OAuth | Document as intentional or add providers | P3 |

---

## 9. Billing

**Present:** PayPal + hosted card adapters, checkout/credits/cancel/invoices APIs, webhook verification, dashboard billing panel, migrations `025`+.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Critical** | Live checkout uncertified; `SUPABASE_SERVICE_ROLE_KEY` required for webhook fulfillment | Configure sandbox/live PayPal + service role; webhook E2E | P0 |
| **Medium** | CSP `connect-src` may omit PayPal domains for client checkout scripts | Extend CSP when enabling hosted PayPal UI | P1 |

---

## 10. Team & organization

**Present:** Personal org bootstrap, team panel, roles, invitations table, org APIs, RLS anti-escalation.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **High** | Invites are DB-only; collaborators cannot onboard via email | ESP + invite accept URL + auth binding | P1 |
| **Medium** | Multi-org switcher UX appears minimal | Complete org switcher in header/settings | P2 |

---

## 11. AI Search Center · SEO / AEO / GEO

### Strengths

- SEO: metadata, JSON-LD, sitemaps, programmatic hubs, `/dashboard/seo`
- AI Search Center: visibility, AEO/GEO analyzers, schema validator, optimizer, analytics, programmatic manager, knowledge, competitors, recommendations
- Cities kept **draft** (avoids thin URL indexing)
- Local registry readiness historically ~**88/100**

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Medium** | UI implies optimization for ChatGPT/Google AI Mode etc.; scores are **on-site readiness**, not live engine feedback | Clarify copy; optional future live connectors | P2 |
| **Medium** | Knowledge kinds largely unpublished; Review/HowTo underused on public pages | Publish quality knowledge + schema on qualifying pages | P2 |
| **Low** | No `app/cities` pages (registry draft only) | Publish only after editorial quality gate | P3 |

---

## 12. Performance

**Positives:** `optimizePackageImports`, AVIF/WebP, DB indexes (`027`), website builder dynamic import, timing helpers.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Medium** | Large client tool bundles; only website builder clearly lazy-loaded | Dynamic-import remaining tool entrypoints | P2 |
| **Medium** | Dashboard panels client-fetch on mount (waterfalls) | Prefetch critical data in RSC pages | P2 |
| **High** | AI generation latency/cost without durable queue | Async jobs + status polling for heavy gens | P1 |

---

## 13. Accessibility

**Positives:** Skip link, some ARIA on auth, decorative `aria-hidden`, `:focus-visible` gold ring, reduced-motion notes in prior phases.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Medium** | No automated axe/WCAG gate in CI | Add axe on marketing + auth + one tool | P2 |
| **Low** | Preview iframes need consistent descriptive `title` | Audit all iframes | P3 |

---

## 14. Responsive design

Marketing and dashboard shells use `sm`/`md`/`lg` breakpoints; sidebar has mobile drawer.

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Low** | Builder workflows appear desktop-first | Device QA checklist before launch | P2 |

---

## 15. Security

| Area | Status |
|------|--------|
| Secrets in git | `.env*` gitignored; `.env.example` only |
| Auth on APIs | Strong `requireUser` coverage |
| XSS | Markdown/SVG sanitizers; JSON-LD stringify |
| Preview iframe | Sandbox **without** `allow-same-origin` (hardened) |
| Redirects | `safeRedirectPath` hardened |
| Headers | HSTS, XFO, nosniff, CSP |
| Preview RCE | `WEBSITE_PREVIEW_BUILDER_ENABLED` default off |

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Critical** | Enabling website preview builder can run `npm install` on user packages | Keep flag **false** in production; isolate if ever enabled | P0 |
| **High** | CSP allows `'unsafe-inline'` / `'unsafe-eval'` | Move to nonce-based CSP when feasible | P1 |
| **High** | Local `.env.local` holds live API keys (gitignored) | Rotate if ever leaked; never commit | P1 |
| **Medium** | Multiple `dangerouslySetInnerHTML` surfaces (sanitized) | Keep sanitizer tests; periodic XSS review | P2 |
| **Medium** | Public growth endpoints abuse risk | CAPTCHA + monitoring | P2 |

---

## 16. TypeScript & quality gates

| Check | Result |
|-------|--------|
| `strict: true` | Enabled |
| `tsc --noEmit` (this audit) | **PASS** |
| ESLint flat config + `eslint-config-next` | **9 warnings** (unused `_mode` / `_c` in AI Search; QA script) — 0 errors |
| `skipLibCheck` / `allowJs` | Softens edges |

| Severity | Description | Recommended solution | Priority |
|----------|-------------|----------------------|----------|
| **Low** | ESLint unused-var warnings in Phase 22 AI Search paths | Clean unused bindings before launch CI gate | P3 |
| **Low** | No `noUncheckedIndexedAccess` | Adopt gradually | P3 |

---

## 17. Production readiness (ops)

Aligned with `PRODUCTION_AUDIT_REPORT.md` (**NO**), `PHASE20` (**NOT READY**), and Phase 19 (**RC after checklist**).

### P0 blockers before launch

1. Set real `NEXT_PUBLIC_SITE_URL` (fail-closed on Vercel production)
2. Set `SUPABASE_SERVICE_ROLE_KEY`
3. Configure Upstash Redis for distributed / fail-closed growth rate limits
4. Apply migrations **001–030** and verify
5. Keep `WEBSITE_PREVIEW_BUILDER_ENABLED=false`
6. Certify billing (PayPal + webhook E2E) if monetization is live
7. Authenticated staging E2E: register → confirm → login → generate → save → logout
8. At least one production AI provider key

### P1 before launch (strongly recommended)

- Hide or implement Gemini/Grok/Llama providers  
- Encrypt user provider keys at rest  
- Team invite email delivery  
- Password-reset mailbox verification  
- Clarify AI Search “readiness” vs live ranking claims in UI  

---

## Issue register (consolidated)

### Critical

| ID | Description | Solution | Priority |
|----|-------------|----------|----------|
| C1 | Production env incomplete (SITE_URL, service role, Upstash) | Complete ops checklist | P0 |
| C2 | Migrations must be fully applied through 030 | `db:apply` + `db:verify` | P0 |
| C3 | Preview builder RCE risk if enabled | Keep disabled in prod | P0 |
| C4 | Billing webhook/fulfillment needs service role + provider creds | Certify sandbox then live | P0 |

### High

| ID | Description | Solution | Priority |
|----|-------------|----------|----------|
| H1 | Auth/AI journeys not E2E accepted (Phase 20) | Staging confirmed account suite | P0 |
| H2 | Placeholder AI providers can fail at runtime | Hide or implement | P1 |
| H3 | Provider keys unencrypted at rest | Encrypt | P1 |
| H4 | Team invites without email | ESP + accept flow | P1 |
| H5 | CSP unsafe-inline/eval | Nonce CSP | P1 |
| H6 | No durable AI job queue | Background jobs | P1 |

### Medium

| ID | Description | Solution | Priority |
|----|-------------|----------|----------|
| M1 | Orphan empty app directories | Cleanup | P2 |
| M2 | Route/API naming drift | Canonical slugs | P2 |
| M3 | Overstated Templates/Files/Analytics | Rename or build | P2 |
| M4 | Business Manager marketing vs redirect | Align product | P2 |
| M5 | AI Search copy overclaims live engines | Clarify readiness scoring | P2 |
| M6 | Marketing nav coarse deep-links | Fix product links | P2 |
| M7 | CAPTCHA missing on public forms | Turnstile | P2 |
| M8 | a11y CI missing | axe in CI | P2 |
| M9 | Client tool bundle weight | More dynamic imports | P2 |

### Low

| ID | Description | Solution | Priority |
|----|-------------|----------|----------|
| L1 | Dead scaffold helper | Remove | P3 |
| L2 | Legacy tools discoverability | Labs nav | P3 |
| L3 | No OAuth | Document or add | P3 |
| L4 | TS strictness extras | Gradual tighten | P3 |
| L5 | Marketing/dashboard visual polish | Token unify | P3 |

---

## Final answers

### 1. Overall completion percentage

**78%**

Breakdown weighting: product features ~82%, architecture ~86%, security code ~78%, SEO/AEO/GEO ~88%, ops/launch proof ~45%.

### 2. What’s finished

- Next 16 App Router SaaS with session proxy and dashboard shell  
- Full AI builder suite (website, landing, app, logo, brand, content, social, marketing, BI, feasibility) + agents  
- Auth pages and hardened redirects  
- Platform: billing (code), orgs/team (schema+UI), API keys, notifications, usage  
- Growth engine (leads, newsletter, events, CRM/affiliate panels)  
- SEO engine + programmatic hubs + sitemaps + JSON-LD  
- AI Search Center (AEO/GEO/schema/optimizer/analytics/competitors/recommendations)  
- Security hardening migrations through 030  
- TypeScript strict + current **green** `tsc` / ESLint  

### 3. What’s missing

- Production env certification (SITE_URL, service role, Upstash, billing keys)  
- Authenticated end-to-end acceptance (Phase 20 gap)  
- ESP for invites and growth email campaigns  
- Real Gemini/Grok/Llama adapters  
- API key encryption at rest  
- Distinct Business Manager product (or de-market it)  
- True image/video file rendering (vs concepts)  
- CAPTCHA on public capture forms  
- Stricter CSP nonces  
- Folder cleanup + slug canonicalization  
- Live AI-engine feedback (if marketed as such)  
- Published city pages / fuller knowledge catalog  

### 4. What should be done before launch

1. Complete **P0 ops checklist** (env, migrations 001–030, Upstash, preview flag off)  
2. Run **authenticated staging E2E** (auth → generate → persist → billing dry-run)  
3. Certify **PayPal webhook** path with service role  
4. Hide placeholder AI providers; ensure default provider works in prod  
5. Wire **invite email** or disable invite UX until ready  
6. Soften/clarify **AI Search** and Image/Video marketing claims to match capabilities  
7. Smoke **mobile** on top tools + run axe on marketing/auth  
8. Update **DEPLOYMENT.md** to a single 001–030 + env matrix  

### 5. Recommended next phase

**Phase 23 — Launch Hardening & Acceptance**

Focus (no new feature sprawl):

1. Ops certification + staging environment parity  
2. Authenticated E2E test suite (Playwright) covering auth, one AI tool CRUD, billing sandbox, growth capture  
3. Provider UX honesty + key encryption  
4. Team invite email + accept flow  
5. Naming/canonical slug cleanup and orphan route deletion  
6. CAPTCHA on public forms + CSP nonce plan  
7. Final go/no-go gate with a single **READY / NOT READY** scorecard  

---

## Verdict

**NOT READY FOR PRODUCTION**

The platform is a strong, enterprise-shaped product codebase with impressive SEO/AI Search and platform modules, but **launch is blocked by operations configuration, authenticated acceptance testing, billing certification, and several high-severity honesty/security gaps** (placeholder providers, unencrypted keys, invite email). Close P0/P1 items in Phase 23 before any public production cutover.
