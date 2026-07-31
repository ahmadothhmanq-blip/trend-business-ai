# Website Builder — Final QA + Production Readiness Report

**Date:** 2026-07-19  
**Scope:** AI Website Builder audit only (no new features)  
**Build:** `npm run build` — **PASS**

---

## Verdict

| Ready for | Not ready for |
|-----------|----------------|
| Internal / sandbox testing (generate → preview → optimize → publish smoke) | Customer-facing, SEO-indexable, conversion-gated go-live |

**Overall score: 74 / 100**

| Dimension | Score | Notes |
|-----------|------:|-------|
| Design | 84 | Premium templates, components, design system strong |
| SEO | 62 | Artifacts/engines strong; public `/w` delivery weak |
| Performance | 74 | Heuristic CWV/mobile/image checks; not Lighthouse |
| UX | 68 | Flow works; publish checklist UI + gates lag |

---

## 1. Generation quality

| Area | Status | Score | Notes |
|------|--------|------:|-------|
| Industry understanding | Strong | 88 | 10 verticals; detect → apply in LayerRunner |
| Template selection | Strong | 85 | Premium Templates primary path |
| Component selection | Strong | 86 | Catalog + goal-aware compose/inject |
| Design quality | Strong | 84 | Premium design system + industry presets |
| AI images | Adequate | 72 | Image Engine; SVG fallback without provider |
| Content quality | Adequate | 68 | Strategy rich; CRO mostly post-generation |

**Invent loop:** Well-guarded (scaffolds, inject, validate/repair). Residual risk on non-scaffold LLM files.

---

## 2. Technical quality

| Area | Status | Score | Notes |
|------|--------|------:|-------|
| Build / TypeScript | Pass | — | Full Next build + tsc succeeded |
| Code quality / errors | Adequate | 68 | Routes validated; finalize optimizer soft-skips |
| Responsive / mobile | Strong | 78 | Scaffold breakpoints + mobile checks |
| Performance engine | Adequate | 74 | Heuristic only |
| SEO readiness | Weak* | 62 | *Engines strong; hosted delivery gap |

---

## 3. User experience

| Area | Status | Score | Notes |
|------|--------|------:|-------|
| User flow | Adequate | 70 | Generate → preview → optimize → publish |
| CTA effectiveness | Adequate | 72 | Conversion engine; advisory unless Improve AI |
| Navigation | Strong | 82 | Premium nav + mobile drawer scaffolds |
| Publishing readiness | Weak | 42 | Checklists in API; weak UI surfacing; `/w` noindex |

---

## Top gaps (do not fix in this phase — track for next)

### P0
1. ~~**Template switching / Apply Template is broken**~~ **FIXED 2026-07-30** — marketplace and in-builder **Use** now POST `templatePackageId` to `/api/website-builder/[id]/template`, rebuild preview via `applyStructureTemplateToProject`, persist `websiteStructureTemplateId` in project settings. Verified: 4 distinct Theme* families from one Brew & Gold project (Corporate → Bold → Luxury → Creative).
2. `app/w/[slug]/route.ts` always sets `X-Robots-Tag: noindex`
3. Public host serves sanitized preview HTML — SEO package (sitemap/robots/JSON-LD/OG) not applied to live URL
4. Publish does not hard/soft-block on `conversionReady` / SEO `publishReady`

### P1
4. Prepare API returns `qualityRecommendations` but UI mostly toasts the message
5. SEO artifacts are sidecars — not auto-wired into root layout metadata
6. Sitemap/canonical may use relative paths or `https://example.com` fallback

### P2
7. Image provider missing → fallback SVGs look unfinished  
8. Conversion rules at finalize, not before invent  
9. Scores are heuristics (not lab CWV / SERP)  
10. Published HTML strips interactive client nav behavior  

---

## 4. Template switching QA — 2026-07-30

**Scope:** In-project template switching only (not new-site generation per template).  
**Environment:** `http://localhost:3003`  
**Test project:** Brew & Gold Coffee MVP Blueprint (`2b50e196-80ed-4fe9-b038-59097f4a1440`, 61 files at generation; 26 files in current workspace snapshot)  
**Method:** Browser QA with before/after screenshots on every switch. No code changes.

### Workflow executed

1. Opened existing project **Brew & Gold Coffee MVP Blueprint** (baseline live preview captured).
2. Navigated to **Template Marketplace** (`/dashboard/website-builder/marketplace`).
3. Clicked **Use** on each installed template, then returned to the same project and inspected live preview.
4. Additionally clicked in-builder **Use** on **Restaurant Bistro** from the Templates panel while the project was open.

### Baseline preview fingerprint (unchanged across all switches)

| Attribute | Value |
|-----------|-------|
| H1 | Brew & Gold Coffee MVP Blueprint |
| Header / nav | Services · Features · Pricing · Contact + **RESERVE A TABLE** CTA |
| Hero | “PREMIUM EXPERIENCE” label, split hero, Reserve a table / Learn more CTAs |
| Stats band | 120+ Fortune 500 clients · 99.99% uptime · 48h onboarding |
| Sections (Theme*) | ThemeModernNav, ThemeModernHero, ThemeModernFeatures, ThemeModernServices, ThemeModernPricing, ThemeModernFaq, ThemeModernFooter |
| Colors | primary `#0F172A`, accent `#2563EB`, background `#F8FAFC` |
| Layout | Modern Product / corporate single-column stack |

### Results — marketplace **Use** (same project)

| Template | URL after click | Preview changed? | Header | Hero | Nav | Sections | Layout | Colors | Typography | Overall design |
|----------|-----------------|------------------|--------|------|-----|----------|--------|--------|------------|----------------|
| Modern Business | `?templateId=modern-business` | **NO** | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged |
| SaaS Starter | `?templateId=saas-starter` | **NO** | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged |
| Restaurant Bistro | `?templateId=restaurant-bistro` | **NO** | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged |
| Agency Portfolio | `?templateId=agency-portfolio` | **NO** | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged |

**Observed UI:** Status line shows “Template selected: {id}” but live preview HTML and visuals are identical to baseline. `?generation=` deep-link is stripped from the URL when returning to the builder.

### Results — in-builder Templates panel **Use**

| Template | Behavior | Preview changed? |
|----------|----------|------------------|
| Restaurant Bistro (embedded Use) | Success toast only; no loading / no preview refresh | **NO** — identical to baseline |

### Screenshot evidence

All captures saved under `C:\Users\PC\AppData\Local\Temp\cursor\screenshots\`:

| Step | File |
|------|------|
| Baseline (before any switch) | `qa-switch-00-baseline-brew-gold.png` |
| Before Modern Business Use | `qa-switch-marketplace-before-modern-business.png` |
| After Modern Business Use (project reopened) | `qa-switch-01b-brew-gold-after-modern-business-use.png` |
| Before SaaS Starter Use | `qa-switch-02-before-saas-starter-use.png` |
| After SaaS Starter Use | `qa-switch-02b-brew-gold-after-saas-starter-use.png` |
| Before Restaurant Bistro Use | `qa-switch-03-before-restaurant-bistro-use.png` |
| After Restaurant Bistro Use | `qa-switch-03-after-restaurant-bistro-use.png` |
| Before Agency Portfolio Use | `qa-switch-04-before-agency-portfolio-use.png` |
| After Agency Portfolio Use | `qa-switch-04-after-agency-portfolio-use.png` |
| Before embedded Restaurant Use | `qa-switch-embedded-before-restaurant-use.png` |
| After embedded Restaurant Use | `qa-switch-embedded-after-restaurant-use.png` |

Before/after pairs are visually indistinguishable for header, hero, navigation, sections, layout, colors, typography, and overall design.

---

### P0 — Template Switching / Apply Template is broken

**Title:** Template Switching / Apply Template is broken  
**Severity:** P0 — Critical  
**Verdict:** **FAIL** (historical) → **PASS after 2026-07-30 implementation** (see implementation summary below).

**Post-fix verification (2026-07-30):** API script `scripts/qa-template-switch-test.mjs` reports 4 unique preview hashes. Browser UI **Use** on Brew & Gold (`2b50e196-80ed-4fe9-b038-59097f4a1440`) produced visibly distinct designs: ThemeCreative* → ThemeCorporate* → ThemeBold* → ThemeLuxury* → ThemeCreative*. Screenshots: `verify-switch-*.png` in temp screenshots folder.

**Steps to reproduce**

1. Generate or open an existing website project (e.g. Brew & Gold Coffee MVP Blueprint).
2. Confirm live preview shows the current design (note H1, nav, hero, colors).
3. Go to **Template Marketplace** → click **Use** on Modern Business, SaaS Starter, Restaurant Bistro, or Agency Portfolio.
4. Return to the same project (History → continue, or reopen from workspace).
5. Observe live preview.

**Expected:** Immediate redesign — new header, hero, navigation, sections, layout, colors, typography, and overall visual identity per the selected template package.

**Actual:** Preview is pixel- and structurally identical to pre-switch baseline. Only a “Template selected” status message (marketplace path) or success toast (in-builder path) appears.

**Root cause (code, not fixed in this QA pass)**

1. **Standalone marketplace** (`components/dashboard/template-marketplace/template-marketplace.tsx`) renders `WbTemplateMarketplaceCatalog` **without** `onSelect`. **Use** is a navigation link to `/dashboard/website-builder?templateId={id}` (`defaultUseHref` in `wb-template-marketplace-catalog.tsx`) — it pre-selects a template for **new** generation only.
2. **Query-param handoff** (`website-builder-tool.tsx` ~L370–388) sets `selectedTemplateId` and `streamStatus` but **never** calls `applyTemplateIntelligenceToActiveProject` or any apply-to-project API when a project is already open.
3. **In-builder Use** calls `handleStructureTemplateSelect`, which only POSTs to `/api/website-builder/[id]/template` when `isLegacyMarketplaceStructureTemplate(choice)` is true (`template-catalog.ts`). Installed package templates have empty `marketplaceTemplateId` and non-legacy IDs, so the handler shows a toast and **skips** the apply API.
4. Even the direct apply API path (when invoked manually) maps all four packages to the same `templateIntelligenceId` (`ti-corporate-trust` per `template-catalog-mapping.ts`), so distinct template layouts would not surface per package until mapping is fixed.

**Note:** E2E `scripts/e2e-website-builder-full-workflow.mjs` (40/40 pass) validates **new generation per template**, not in-project switching — do not treat that suite as coverage for this workflow.

---

## Suggested real-world test plan

| ID | Case | Pass criteria |
|----|------|---------------|
| T1 | Industry prompts (tourism, restaurant, SaaS, real-estate) | Correct template + sections |
| T2 | Preview desktop/tablet/mobile | Readable layout; usable nav |
| T3 | Improve with AI | New version; reports present |
| T4 | Prepare publish (inspect API JSON) | SEO/perf/mobile/conversion fields |
| T5 | Publish `/w/[slug]` | Loads; expect **noindex** (known) |
| T6 | Export ZIP | `seo/`, `public/robots.txt`, `sitemap.xml` present |
| T7 | Image provider on/off | Clear quality difference |
| T8 | `npm run build` | Exit 0 |
| T9 | **In-project template switch** (marketplace Use on open project) | Live preview updates header, hero, nav, sections, layout, colors, typography immediately |

---

## What to keep

- Full AI Core pipeline: Industry Intelligence → Premium Templates → Components → Design → Images → SEO/Perf → Conversion + SEO Performance finalize reports  
- Guarded invent loop with professional scaffolds  
- Auth, rate limits, Zod on builder APIs  
- Secure-by-default static `/w` hosting  

---

*Audit-only phase. No product feature changes shipped with this report.*
