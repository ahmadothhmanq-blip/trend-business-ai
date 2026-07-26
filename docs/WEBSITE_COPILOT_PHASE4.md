# Website Copilot — Phase 4 Specification (SSOT)

**Document ID:** `WEBSITE_COPILOT_PHASE4`  
**Version:** 1.0.0  
**Status:** Approved — single source of truth for implementation  
**Builds on:** Phases 0–3 (`lib/website/platform/`, `lib/ai-core/website-copilot/`)

---

## 1. Purpose

Phase 4 extracts a **shared Copilot runtime kernel** and delivers **App Builder command API parity** with Website Copilot — without changing Phase 1–3 website behavior.

---

## 2. Scope (Phase 4 deliverables)

| # | Deliverable |
|---|-------------|
| P4-1 | `lib/ai-core/copilot-kernel/` — shared types, meta helpers, stream loop |
| P4-2 | Website Copilot refactored to use kernel (regression-safe) |
| P4-3 | `lib/webapp/platform/` — revision, OCC, idempotency, commit boundary |
| P4-4 | `lib/ai-core/app-copilot/` — App Builder NL command module |
| P4-5 | `POST .../copilot/{commands,stream,undo}` on webapp-builder |
| P4-6 | App management assistant delegates to Copilot API |
| P4-7 | `scripts/verify-website-copilot-phase4.mjs` + `verify-app-copilot.mjs` |

## 3. Out of scope (Phase 5+)

- Multi-turn conversational chat UI
- Memory / Review engines
- Cross-product compound commands

---

## 4. Kernel extraction

Shared orchestration in `lib/ai-core/copilot-kernel/`:

| Module | Extracted from |
|--------|----------------|
| `types.ts` | Generic cost hint, routing meta, stream send types |
| `meta.ts` | `attachCostHint`, `attachRoutingMeta` |
| `stream-loop.ts` | Multi-step SSE command loop |

Product modules keep domain routing, executors, and platform adapters.

---

## 5. App Builder Copilot API (parity)

Mirrors Website Copilot:

- `POST /api/webapp-builder/[id]/copilot/commands`
- `POST /api/webapp-builder/[id]/copilot/stream`
- `POST /api/webapp-builder/[id]/copilot/undo`

Request/response shape matches website (with `model`/`files` instead of `project`).

---

## 6. App capability URIs

| URI | Tier | Example |
|-----|------|---------|
| `app.brand.color.set` | local | "Change primary color to blue" |
| `app.catalog.add` | local | "Add a new product called Widget" |
| `app.screen.add` | local | "Add a dashboard screen" |
| `app.screen.remove` | local | "Remove the settings screen" |
| `app.feature.booking` | local | "Add booking feature" |
| `app.design.redesign` | local | "Redesign the application" |
| `app.data.add-model` | local | "Add customer management" |
| `app.backend.provision` | local | "Connect database" |
| `app.assistant.continue` | ai-continue | "Improve the app with AI" |
| `app.copilot.undo` | local | undo endpoint |
| `app.advisory.*` | advisory | unknown / compound |

---

## 7. Webapp platform (Phase 0 parity)

Migration `076_webapp_platform_foundation.sql`:

- `webapp_generations.blueprint_revision`
- `webapp_commit_idempotency` table (7-day TTL)

---

## 8. Acceptance criteria

- [ ] Kernel module exists; website-copilot uses it
- [ ] App copilot commands/stream/undo routes implemented
- [ ] App management assistant uses `/copilot/commands`
- [ ] Phase 1–3 website verify scripts pass
- [ ] `verify-website-copilot-phase4.mjs` passes
- [ ] `verify-app-copilot.mjs` passes

---

**End of specification.**
