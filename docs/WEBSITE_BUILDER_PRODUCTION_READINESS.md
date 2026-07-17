# Website Builder — Production Readiness Report

**Date:** 2026-07-17  
**Scope:** Phase 1 AI Website Builder only  
**Product north star:** `docs/PRODUCT_VISION.md` (D-015 finished products, D-016 NL AI editing, D-017 safe preview + publish)  
**Related:** `docs/WEBSITE_BUILDER_PHASE1_REPORT.md`, `docs/WEBSITE_PUBLISH_ARCHITECTURE.md`, `docs/DECISIONS_LOG.md`

---

## Executive verdict

Phase 1 delivers a **complete customer loop** on a configured local environment:

**Login → Create → AI generate → Live preview → AI improve → Publish → Open public URL**

That loop has been **authenticated end-to-end validated** (real DeepSeek generation + cookie session + public `/w/{slug}`).

**Public launch is not yet certified.** Remaining work is primarily **ops / production env hardening**, not missing Phase 1 product surface. Marketing and launch must not over-claim custom domains, compiled Next.js live preview, or WYSIWYG editing.

| Area | Status |
|------|--------|
| Phase 1 product flow | **Ready (validated locally)** |
| Production hosting env | **Not ready** (SITE_URL, service role, Upstash, staging) |
| Security posture (preview/publish) | **Acceptable for static HTML hosting** (D-004 / D-017) |
| Launch certification | **Blocked on ops checklist below** |

---

## 1. Completed customer flow

| Step | Behavior | Validation |
|------|----------|------------|
| **Login** | Supabase email/password; session via SSR cookies | PASS (confirmed test user) |
| **Create website** | Dashboard Website Builder → brief + generate | PASS |
| **AI generation** | `POST /api/website-builder/stream` (SSE); fallback JSON POST | PASS (~1–2 min, DeepSeek) |
| **Preview** | In-platform iframe → `GET /api/website-builder/{id}/live-preview` | PASS (static multi-page HTML) |
| **AI improvement** | `mode: "continue"` + natural-language `continueInstruction`; new linked generation | PASS (blueprint list normalization for improve path) |
| **Publish** | `POST .../publish` `{ "action": "publish" }` → `website_publications` | PASS |
| **Open public URL** | Unauthenticated `GET /w/{slug}` | PASS |

**Supporting delivery channel (still valid):** ZIP export of the Next.js source project (D-003).

---

## 2. Existing features (Phase 1)

### Generation & workspace
- SSE streaming generation with progress events
- Persist to `website_generations` + workspace `projects`
- Version lineage (`mode`, `parent_generation_id`, `prompt_versions`)
- Regenerate / continue / retry modes
- Credit + AI rate-limit enforcement on generate/improve

### Live preview (D-017)
- Safe static HTML preview (`preview/index.html`)
- Multi-page navigation via CSS `:target` (no scripts)
- Sandboxed iframe; authenticated owner-only live-preview API
- Desktop / tablet / mobile viewport framing in UI

### AI natural-language editing (D-016)
- “Improve with AI” edit mode
- Continue instruction applied with parent blueprint/file context
- New generation linked to parent (history / versions)

### Publish / public hosting (D-017)
- Prepare / publish / unpublish actions
- Public path `/w/{slug}` (`{slugify(title)}-{generationId[0:8]}`)
- Sanitized HTML, CSP, script stripping
- Feature flag: `WEBSITE_PUBLISH_ENABLED` (default **ON**; set `false` to disable)
- Migration `031_website_publications` required and applied on configured DB

### Export
- ZIP download of generated Next.js project (`/export`)

### Safety gates retained
- npm compile preview builder **off** (`WEBSITE_PREVIEW_BUILDER_ENABLED` / D-004)
- No server-side `npm install` / Next build for preview or publish

---

## 3. Current limitations

| Limitation | Detail |
|------------|--------|
| Preview fidelity | Static HTML product preview ≠ full compiled Next.js runtime |
| Editing model | Natural language only — no WYSIWYG / drag-drop editor |
| Hosting model | App-served static pages at `/w/{slug}` — not customer custom domains / CDN (F09) |
| Generation depth | Soft MVP caps (file count, scaffold limits); not unlimited site size |
| Auth UX | Email confirmation required before session (Supabase project setting) |
| Billing coupling | Generation consumes credits; production billing needs service role + tables |
| Media / assets | Limited media depth vs marketing “full studio” expectations |
| Observability | No dedicated Website Builder SLO dashboard / alerting yet |
| Multi-region / scale | Public HTML served from app origin; no edge cache design for high traffic |

---

## 4. Production risks

### Critical / high
| Risk | Why it matters |
|------|----------------|
| Missing `NEXT_PUBLIC_SITE_URL` on host | Auth confirm/reset links and absolute public URLs wrong or fail-closed on Vercel production |
| Missing `SUPABASE_SERVICE_ROLE_KEY` | Billing writes / webhooks / admin paths break in production |
| Email confirmation delivery | New customers cannot reach Website Builder until mailbox confirm works |
| Publish default ON | Misconfigured staging can expose published HTML publicly — verify flag + RLS + migration before go-live |
| AI cost / abuse | Generate + improve are LLM-heavy; rate limits without Upstash are per-instance only |
| Content quality variance | Soft-pass / model drift can produce weak sites; customers may expect “finished brand site” every time |

### Medium
| Risk | Why it matters |
|------|----------------|
| Anon key configuration | Local audits flagged unusually short anon key — confirm production dashboard keys |
| Static HTML vs ZIP mismatch | Preview/public page is not the full Next.js export — set expectations in UI/marketing |
| Slug collisions / SEO | Public pages `noindex`; still need abuse monitoring for spam publishes |
| Single DB dependency | `website_publications` missing → publish 503; must be in prod migrate checklist |

### Accepted (by design)
| Risk | Decision |
|------|----------|
| No npm live builder | D-004 — unsafe; stay off |
| ZIP still offered | D-003 — valid export channel alongside publish |

---

## 5. What is needed before public launch

### P0 — must have
1. **Production env**
   - `NEXT_PUBLIC_SITE_URL` = canonical production origin  
   - `NEXT_PUBLIC_SUPABASE_URL` + full anon key  
   - `SUPABASE_SERVICE_ROLE_KEY`  
   - `DEEPSEEK_API_KEY` (or configured primary AI provider)  
   - Confirm `WEBSITE_PUBLISH_ENABLED` intentional (`true` / unset vs `false`)
2. **Database**
   - Apply migrations through `031_website_publications` (and credit RPCs used by `enforceAiUsage`) on **production**
3. **Auth**
   - Working confirmation email (SMTP) with production `SITE_URL` redirect  
   - Smoke: signup → confirm → login → open Website Builder
4. **Staging E2E sign-off** (same journey as local)
   - Login → create → generate → preview → improve → publish → open `/w/{slug}` → unpublish
5. **Marketing honesty**
   - Claim “preview + AI edit + publish public URL + ZIP export”  
   - Do **not** claim custom domains, compiled Next live IDE, or visual page builder

### P1 — strongly recommended before / at launch
6. **Upstash Redis** for distributed AI/auth rate limits  
7. **Credits / billing path** verified for new free users (initial grant + consume)  
8. **Monitoring**: error rate on `/api/website-builder/stream`, `/publish`, `/w/[slug]`; AI latency/cost alerts  
9. **Content policy / abuse**: rate limits on publish; ability to unpublish/takedown  
10. **Load check**: public HTML caching headers + basic traffic expectation

### P2 — post-launch / Phase 2+
11. Custom domains / CDN (F09)  
12. Higher-fidelity preview (still without unsafe npm builder unless F01 Accepted)  
13. Richer media, templates, and brand kits  
14. Optional WYSIWYG on top of NL improve  

---

## 6. Evidence summary (Phase 1)

| Check | Result |
|-------|--------|
| Product decisions D-015 / D-016 / D-017 | Accepted / implemented in Phase 1 scope |
| Migration `031` on configured DB | Applied |
| Unit smokes (`smoke-live-preview`, `smoke-website-publish`, `smoke-website-ai`) | PASS |
| Authenticated customer journey (local) | **PASS** (2026-07-17) |
| Production env certification | **Open** |

---

## 7. Launch recommendation

**Ship Phase 1 to production only after the P0 checklist is green on a staging (or production) environment that is not this developer laptop alone.**

Phase 1 is **product-complete for the promised loop** (generate → preview → NL improve → publish → public URL, plus ZIP). It is **ops-incomplete for public launch** until production env, auth email, migrations, and a signed staging E2E are done.

---

*Report only — no code changes. Update this document when staging E2E and production env sign-off complete.*
