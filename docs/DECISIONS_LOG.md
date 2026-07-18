# Trend Business AI — Decisions Log

**Purpose:** Record product and architecture decisions so agents do not re-litigate them.  
**Rule:** New decisions require a dated entry. Supersede old entries explicitly.  
**Last updated:** 2026-07-17 (Core Product Principle + D-015 / D-016)  

---

## How to use

- Status: `Accepted` | `Proposed` | `Superseded` | `Rejected`  
- Link related tasks from `TASK_QUEUE.md` when implementation is approved  

---

## D-001 — Continue existing project (no rewrite)

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Phase 1 audit of Trend Business AI |
| Decision | Improve the current Next.js + Supabase + plugin codebase. Do not create a new project or replace the architecture. |
| Consequences | All work is additive/surgical on this repo. |
| Related | Blueprint Art. continuity; Constitution Art. I |

---

## D-002 — Docs under `docs/` are the living SSOT

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Many root phase reports; agents lacked one plan |
| Decision | Active planning/status/tasks/decisions live in `docs/`. Root `*_REPORT.md` files are historical. |
| Consequences | Update `PROJECT_STATUS.md` / `TASK_QUEUE.md` when work lands. |
| Related | Constitution Art. II |

---

## D-003 — Website Builder current delivery is ZIP export (not hosted live URL)

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (current delivery mechanism; refined by D-015) |
| Context | Customer tests showed files + Download ZIP; no live URL |
| Decision | Until preview/publish ship, Website Builder **delivers via ZIP/export**. Do not claim a hosted live URL. ZIP is a **delivery channel for a complete site project**, not permission to ship unfinished code dumps as the product. |
| Consequences | UI/marketing must not claim a ready hosted website without implementation. **M01 (done):** marketing/SEO/registry/tool copy aligned to ZIP + self-host delivery. Product north star remains finished-product UX (D-015). |
| Related | D-015, Tasks M01 (done), H07, F01, F02, F09 |

---

## D-015 — Critical product rule: finished products, not code generators

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (folded into Core Product Principle; not superseded) |
| Context | Product vision: Trend Business AI is an AI Business Operating System |
| Decision | The platform is **not** a code generator for customers. AI may use code internally; every service must deliver a **real, professional, usable result** (use / export / publish) with a complete UX. See `PRODUCT_VISION.md` §2 Core Product Principle. |
| Consequences | New features judged against finished-product / production-tool bar. Placeholder/demo/fake CTAs forbidden. Website Builder path: create → preview → AI edit → export/publish; export-only is interim honesty (D-003), not the end state. Preview/hosted still require Accepted F01/F09. |
| Related | Core Product Principle, `PRODUCT_VISION.md` §2, D-003, D-004, D-010, D-016, Constitution Art. IV |

---

## D-016 — Post-generation AI editing required on every AI product

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (merged into Core Product Principle; remains binding) |
| Context | Finished-product UX requires iteration, not one-shot generation |
| Decision | Every AI product must support **AI-powered editing, improvement, and iteration after generation**. Users continuously modify results via **natural-language commands** (continue/improve with parent context). Regenerate-without-context alone is not enough. This is an explicit clause of the Core Product Principle (complete product + preview/interaction + NL edit + continuous iteration + ready outcome). |
| Consequences | APIs load parent generation + apply edit instruction (`lib/ai/iteration.ts`). UI exposes Improve with AI. Applies to Website, Workspace, and dedicated builders. |
| Related | Core Product Principle, D-015, `PRODUCT_VISION.md` §2 / §12, Constitution Art. IV |

---

## D-004 — Unsafe npm Live Preview builder stays off

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (refined by D-017) |
| Context | Preview builder can run install/build on generated projects (RCE risk) |
| Decision | Keep **`WEBSITE_PREVIEW_BUILDER_ENABLED`** fail-closed / production hard-disabled. Do **not** use npm install + Next build for customer preview. |
| Consequences | H08 remains. Safe in-platform preview is D-017 (static HTML sandbox), not this builder. |
| Related | H07, H08, D-017, F01 |

---

## D-017 — Safe sandboxed live preview + public publish URL

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (publish flow complete) |
| Context | Core Product Principle requires preview + publish without RCE |
| Decision | **Live preview** = authenticated `/api/website-builder/[id]/live-preview` (sanitized static HTML). **Publish** = `website_publications` with prepare/publish/unpublish; public `GET /w/[slug]` when `status=published`. Publishing enabled unless `WEBSITE_PUBLISH_ENABLED=false`. |
| Consequences | Full flow: generate → preview → improve → publish → open public URL. npm preview builder stays off (D-004). Migration 031 required. |
| Related | D-004, D-003, D-015, F01, F02, F09, `WEBSITE_PUBLISH_ARCHITECTURE.md` |

---

## D-005 — Keep ProviderManager + DeepSeek default

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | DeepSeek verified as live default; OpenAI/Claude real; others stubs |
| Decision | Retain ProviderManager. Default DeepSeek. Do not remove plugin architecture. |
| Consequences | New AI features plug into existing engine. |
| Related | Constitution Art. III, VIII |

---

## D-006 — Bound Website generation (anti-hang)

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (implemented locally; commit/push pending) |
| Context | Unbounded production file lists caused multi-minute hangs / 92% UX freeze |
| Decision | Keep generation bounded (file cap ~18 + soft-pass / non-infinite validation). Prefer finishing a usable project over perfect trees. |
| Consequences | Soft-pass may save imperfect trees; document warnings if needed. |
| Related | Tasks H05 (verified), H06 |

---

## D-007 — Never SSR full website blueprints on list pages

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (implemented on feature branch; merge to `main` pending) |
| Context | `select("*")` blueprints hung `/dashboard/website-builder` |
| Decision | List endpoints/pages use slim columns only; detail hydrate via API. |
| Consequences | Slight delay before file tree fills; page must load fast. |
| Related | Task H03 — **verified PASS** on `cursor/docs-ssot-audit-plan` @ `f1f5549` |

---

## D-008 — No application code changes without approval (docs phase)

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Phase 1 audit + docs pack |
| Decision | After generating documentation, **wait for explicit approval** before implementing application changes. |
| Consequences | Agents may only edit docs until told otherwise. |
| Related | Constitution Art. VII |

---

## D-009 — Placeholder providers not marketed as ready

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Gemini/Grok/Llama adapters throw |
| Decision | Hide or clearly disable in production UI until implemented. |
| Consequences | **M02 (done):** production UI/API hide Gemini/Grok/Llama; stubs remain for local/dev and F08. |
| Related | Task M02 (done), F08 |

---

## D-014 — Credit charge timing / refund on AI failure (M06) — Proposed

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Proposed** (blocks M06) |
| Context | `enforceAiUsage` deducts 1 credit before AI; no refund on generate/save failure |
| Open questions | (1) Charge on AI success vs DB persist vs SSE complete? (2) Full refund on any failure? (3) Reverse `lifetime_used` on refund? (4) Idempotent `reference_id` pairing? |
| Interim | Do not implement refund/charge-after without Accepted answers. |
| Related | Task M06 (blocked) |

---

## D-013 — Canonical dashboard product routes (M03)

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Duplicate entry points (brand-designer/brand-studio, creative-studio/image-generator, business-manager/BI, business-audit, subscription/billing) |
| Decision | Canonical: `brand-studio`, `image-generator`, `business-intelligence`, `feasibility-study`, `billing`. Legacy paths 308/redirect permanently. `business-audit` → `feasibility-study` (not BI). |
| Consequences | Workspace `dashboardHref` values updated; dedicated tools remain source of truth. Legacy `workspace_generations` for brand/creative are not migrated (separate follow-up if needed). |
| Related | Task M03 (done) |

---

## D-010 — Hosted live website product (proposed only)

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Proposed** (not accepted) |
| Context | Gap between brand promise and ZIP delivery |
| Decision | **Not approved.** Would require explicit product decision + preview/deploy architecture. |
| Consequences | Remains Future F09 until Accepted. |
| Related | F01, F02, F09 |

---

## D-011 — Docs describe working tree; git HEAD may lag

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Local fixes (theme, SSR slim list, generation caps) exist in WT but may not be on remote `main` (`fa44510`) |
| Decision | Documentation inventories describe the **current local project tree**. Status/tasks must call out **WT vs HEAD** when they differ. Shipping requires commit tasks H03–H05 (+ L08 for docs). |
| Consequences | Agents must not assume GitHub already contains WT fixes. |
| Related | H03–H05, L08, Blueprint §10 |

---

## D-012 — Empty plugin directories are stubs, not features

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | Top-level `plugins/brand`, `marketing`, etc. are empty; real workspace plugins live under `plugins/workspace/` |
| Decision | Do not treat empty plugin folders as implemented services. Cleanup via L07. |
| Consequences | Blueprint lists populated vs stub plugins explicitly. |
| Related | L07 |

---

## D-018 — Website Builder Design Engine layers (Idea→Strategy→Design→Assets→Code→QA)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Upgrade Website Builder from Prompt→Code into a multi-layer design/development engine without replacing AIGenerationEngine |
| Decision | Map layers into existing analyze/plan/generate/validate stages. Real AI images via OpenAI DALL·E when keyed, else SVG fallback. Automatic pipeline with Strategy/Design/Assets panels for post-hoc NL improve (`[strategy]` / `[design]` / `[assets]`). |
| Consequences | Richer blueprint JSONB; `website-assets` bucket; quality soft-gates + one improve pass; file cap raised to 22. |
| Related | D-015, D-016, D-017, `docs/WEBSITE_BUILDER_DESIGN_ENGINE.md` |

---

## D-026 — AI Design System + AI Assets Engine (Phase 7)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Add shared design decisions from Strategy and a reusable asset generation layer |
| Decision | Add `lib/ai-core/design-system` (presets including creative; colors/type/spacing/UI/component/animation) and `lib/ai-core/assets` (plan + OpenAI/SVG generate); Website Core adapter merges design foundation and uses Assets Engine; expose `GET /api/ai-core/design-presets`; keep product APIs unchanged |
| Consequences | Design/Assets are Core-native; Website still uses plugin AI design refine + website-assets storage |
| Related | D-025, `docs/AI_CORE_ENGINE.md` |

---

## D-025 — AI Template Engine + Industry Intelligence (Phase 6)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Add shared industry templates so Core can select layout, sections, design preset, and required features |
| Decision | Add `lib/ai-core/templates` with 7 industry profiles; `LayerRunner` enriches briefs via `enrichBriefWithIndustryTemplate` before Idea; Website adapter applies selection to profile/design; expose `GET /api/ai-core/industries`; keep product APIs unchanged |
| Consequences | All Core runs get industry-aware defaults; artifacts store `templateSelection` |
| Related | D-024, `docs/AI_CORE_ENGINE.md` |

---

## D-024 — Unified AI Core registry + run API (Phase 5)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Finalize Core integration with a single product catalog and generic run endpoints |
| Decision | Add `lib/ai-core/products.ts` catalog (canonical ids + aliases including `app-builder`), `POST/GET /api/ai-core/runs`, `POST /api/ai-core/runs/[id]/continue`, `GET /api/ai-core/products`; persist to `ai_runs`; keep product-specific APIs/generators unchanged |
| Consequences | Clients can invoke any migrated product through one API; existing dashboards continue on legacy routes |
| Related | D-023, `docs/AI_CORE_ENGINE.md` |

---

## D-023 — Video Studio + Marketing AI on AI Core LayerRunner (Phase 4)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Move Video Studio and Marketing AI through LayerRunner without rewriting generators/APIs |
| Decision | Add `video-studio` and `marketing-ai` ProductEngineAdapters reusing `plugins/video-studio` and workspace `marketingPlugin`; wire `generateVideo` and marketing branch of `generateWorkspaceProject` through `layerRunner` |
| Consequences | Seven products on shared Core flow; Marketing keeps `/api/workspaces/marketing` while Core id is `marketing-ai` |
| Related | D-022, `docs/AI_CORE_ENGINE.md` |

---

## D-022 — Brand Designer + Content Studio on AI Core LayerRunner (Phase 3)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Move Brand Designer and Content Studio through LayerRunner without rewriting UI/generators |
| Decision | Add `brand-designer` and `content-studio` ProductEngineAdapters that reuse `plugins/brand-identity` and `plugins/content-studio` stages via plugin methods; wire `generateBrandIdentity` and `generateContent` through `layerRunner`; keep `/api/brand-identity` and `/api/content-studio` unchanged |
| Consequences | Five products on shared Core flow; Brand Core id is `brand-designer` while HTTP/API id remains `brand-identity` |
| Related | D-021, D-020, `docs/AI_CORE_ENGINE.md` |

---

## D-021 — Web App + Landing Page on AI Core LayerRunner (Phase 2)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Move App Builder and Landing Page Builder through LayerRunner without rewriting UI/generators |
| Decision | Add `webapp-builder` and `landing-page-builder` ProductEngineAdapters that reuse `plugins/webapp` and `plugins/landing-page` stages; map Idea=analyze, Strategy=plan, Design/Assets=derived, Generation/Quality/Finalize=generate/validate/export; wire generators through `layerRunner` |
| Consequences | Shared Core flow for three builders; App/Landing keep existing APIs and plugin AI; Design/Assets are deterministic until a later Design Engine upgrade |
| Related | D-020, D-019, `docs/AI_CORE_ENGINE.md` |

---

## D-020 — Website Builder on AI Core LayerRunner (Phase 1)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Move Website Builder execution through LayerRunner without rewriting UI/delivery |
| Decision | Add `website-builder` ProductEngineAdapter that reuses `plugins/website` layers; `generateWebsite` (`lib/deepseek.ts`) calls `layerRunner.run`; preview/ZIP/publish stay on existing routes |
| Consequences | Core owns Idea→Strategy→Design→Assets→Generation→Quality→Finalize for WB; plugin remains for scaffolds/compat; other products unchanged |
| Related | D-019, D-018, `docs/AI_CORE_ENGINE.md` |

---

## D-019 — AI Core Engine foundation (Phase 0)

| Field | Value |
|-------|--------|
| Date | 2026-07-18 |
| Status | Accepted |
| Context | Extract reusable Idea→Strategy→Design→Assets→Generation→QA pipeline for all products without rewriting AIGenerationEngine |
| Decision | Add `lib/ai-core` with generic layer types/schemas, `LayerRunner`, `ProductEngineAdapter`, empty registry, and `ai_runs` + `ai-assets` migration. Do not migrate Website Builder or other products in Phase 0. |
| Consequences | Foundation ready for Phase 1 Website adapter; existing product routes unchanged. |
| Related | D-018, `docs/AI_CORE_ENGINE.md` |

---

## Template for new entries

```markdown
## D-XXX — Title

| Field | Value |
|-------|--------|
| Date | YYYY-MM-DD |
| Status | Proposed / Accepted / Rejected / Superseded |
| Context | … |
| Decision | … |
| Consequences | … |
| Related | … |
```
