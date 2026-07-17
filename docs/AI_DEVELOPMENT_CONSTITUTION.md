# Trend Business AI — AI Development Constitution

**Purpose:** Binding rules for humans and AI agents working on Trend Business AI.  
**Based on:** `docs/PRODUCT_VISION.md`, `docs/PROJECT_AUDIT.md`, `docs/PROJECT_MASTER_BLUEPRINT.md`  
**Last updated:** 2026-07-17  

---

## Article I — Project Continuity

1. This is an **existing** project named **Trend Business AI** — an **AI Business Operating System**.  
2. **Do not** create a replacement app or parallel architecture.  
3. **Do not** remove working features without an entry in `DECISIONS_LOG.md` and explicit approval.  
4. Prefer **surgical fixes** over large rewrites.  
5. Follow `PRODUCT_VISION.md` Core Product Principle + D-015 / D-016: customers receive **finished usable products** via **AI-powered production tools**, not code-generator UX.

---

## Article II — Single Source of Truth

1. Living truth lives under **`docs/`**.  
2. Before coding: read `PROJECT_STATUS.md` and `TASK_QUEUE.md`.  
3. After completing work: update status/tasks/decisions as needed.  
4. Historical root reports are reference only; do not treat them as the active plan.

---

## Article III — Architecture Mandates

1. Keep **Next.js App Router**, **Supabase**, **ProviderManager**, and **plugins**.  
2. New AI products must follow the plugin contract (`analyze → plan → generate → validate → export` or the established workspace text-plugin pattern).  
3. API routes must use existing helpers: auth (`requireUser`), validation (Zod), rate limits / credits where applicable.  
4. Do not introduce a second ORM (no Prisma) unless decided in `DECISIONS_LOG.md`.

---

## Article IV — Core Product Principle & Product Honesty

### Core Product Principle (binding)

**Trend Business AI builds AI-powered production tools, not AI code generators.**

AI may use code internally as a technical implementation method, but the customer experience must always focus on delivering **complete, usable, production-ready results**.

The goal is professional **AI-powered business tools that produce real results**, not developer tools that only generate code.

Every AI service must:

1. Generate a **complete final product**.  
2. Provide **preview and user interaction**.  
3. Support **AI-powered editing through natural language commands** (D-016).  
4. Allow **continuous improvement and iteration** (D-016).  
5. Deliver a **real outcome** ready for use, publishing, or export.

See `PRODUCT_VISION.md` §2. This principle **includes** D-015 (finished products) and D-016 (NL iteration); it does not replace honesty/safety rules below.

### Honesty & delivery rules (still binding)

1. **North star (D-015):** Trend Business AI is **not** a customer-facing code generator. Every service must aim for a complete usable result (use / export / publish) and a full UX.  
2. **Current delivery (D-003):** Website Builder ships complete projects via **ZIP export** until preview/publish are Accepted and built. Export is an allowed delivery channel; unfinished trees and fake “live site” CTAs are not. Preview/interaction remain required product goals under the Core Product Principle.  
3. Do not market a hosted live website or Live Preview unless the capability actually ships.  
4. **Unsafe npm preview builder** remains **off** (D-004 / H08). **Safe** live preview is D-017 (`/live-preview`). Public sites use `/w/[slug]` when published; disable with `WEBSITE_PUBLISH_ENABLED=false`.  
5. Hide or disable placeholder providers (Gemini/Grok/Llama) in user-facing production paths until implemented.  
6. No demo pages, fake buttons, or unfinished features presented as complete.  
7. **D-016 (merged into Core Product Principle):** Every AI product must support post-generation **natural-language AI editing / continue / improve** with parent context — not generate-once only.

---

## Article V — Website Builder Safety Rules

1. **Never** SSR-load full `blueprint` JSONB for list pages. Use slim list columns; hydrate detail via API.  
2. Keep generation bounded (file cap / soft-pass philosophy from audit — avoid 50–180 file runaway loops).  
3. Do not enable `WEBSITE_PREVIEW_BUILDER_ENABLED` without a security review (RCE risk via install/build). **H08:** production/`VERCEL_ENV=production` hard-disables the builder even if the flag is `"true"`.  
4. Progress UI must not fake completion; prefer real status or honest “still generating” states.

---

## Article VI — Security

1. Never commit secrets (`.env*`).  
2. Preserve RLS; billing money tables stay server/service-role write paths.  
3. Prefer Upstash rate limits in production for AI and public growth endpoints.  
4. Sanitize redirects; keep security headers.  
5. Do not weaken auth on `/dashboard` or AI APIs.  
6. Full checklist lives in `PROJECT_MASTER_BLUEPRINT.md` §5 — treat it as mandatory.  
7. Do not enable preview builder install/build without an Accepted security decision.

---

## Article VII — Code Change Discipline

1. Change only what the approved task requires.  
2. No drive-by refactors, no unrelated file churn.  
3. Match existing naming, UI tokens (black/gold), and component patterns.  
4. Do not downgrade Next/React/Supabase packages to “fix” issues.  
5. Application source changes for **Pending Medium/Low** tasks may proceed under `docs/AUTONOMOUS_EXECUTION.md` when the user has authorized that workflow. **Future/`F*`**, architecture changes, and destructive ops still require an explicit stop/decision.

---

## Article VIII — AI Provider Rules

1. Default provider: **DeepSeek**.  
2. Real adapters today: DeepSeek, OpenAI, Claude.  
3. Placeholder adapters must not be silently selectable as “active” in production UX.  
4. Provider keys: mask on read; encrypt-at-rest is a future approved task, not an ad-hoc half-fix.

---

## Article IX — Testing Expectations

Before marking a High-priority task done:

1. Relevant route loads (e.g. `/dashboard/website-builder`).  
2. Critical path smoke (e.g. generate → save → download for Website Builder when touching generation).  
3. No new ThemeProvider / client `<script>` regressions.  
4. Note residual risks in `PROJECT_STATUS.md`.

---

## Article X — Decision & Task Hygiene

1. Architecture or product-promise changes → `DECISIONS_LOG.md`.  
2. Work items → `TASK_QUEUE.md` with priority and status.  
3. Phase timing → `ROADMAP.md`.  
4. If audit and code disagree, **re-verify code**, then update docs — do not invent features.

---

## Article XI — Code Quality Standard

All work on Trend Business AI must meet a **global SaaS company** bar—not a prototype or “good enough for now” bar.

1. All code must be **production-ready**, not temporary scaffolding, throwaway hacks, or left-behind TODOs that block ship quality.  
2. Follow **industry best practices** for the stack in use (Next.js App Router, React, TypeScript, Supabase, Zod, and established repo patterns).  
3. Code must be **scalable**, **maintainable**, **secure**, and **performant**.  
4. Avoid duplicated code — apply the **DRY** principle; extract shared helpers when the same logic appears in multiple places.  
5. Use **clean architecture** and **clear separation of responsibilities** (UI vs API vs domain/`lib` vs plugins vs data access).  
6. UI code must follow **professional global SaaS standards** (consistent layout, accessibility, clear hierarchy, and the existing product visual language).  
7. AI integrations must be **flexible** and support a **future multi-provider** architecture (ProviderManager / adapters — do not hard-wire a single vendor into product surfaces).  
8. No feature is considered **complete** without **testing** and a **documentation update** (`PROJECT_STATUS.md` / `TASK_QUEUE.md` / related docs as applicable).  
9. **Working code is not enough**; code quality must match a **global SaaS company standard**.

---

## Violations

Agents/devs must stop and ask the user when asked to:

- Rewrite the app from scratch  
- Enable unsafe preview builds  
- Ship “live website” claims without implementation  
- Treat AI products as code-generator UX in violation of Article IV Core Product Principle  
- Delete billing/auth/RLS protections  
- Ignore `docs/` and invent a parallel plan  
- Ship temporary or low-quality code that violates Article XI  

---

**This constitution is active. Implementation still waits for approval.**
