# Trend Business AI — Roadmap

**Product north star:** `PRODUCT_VISION.md` (finished products, not code dumps)  
**Constraint:** Continue the current project; no architecture replacement (D-001)  
**Last updated:** 2026-07-17  

---

## Vision (customer outcome)

Ship an **AI Business Operating System** of **AI-powered production tools** (Core Product Principle): complete final products, preview/interaction, natural-language AI editing (D-016), continuous iteration, and outcomes ready for use / publish / export — not developer code-generator UX.

**Current honesty bridge:** Website Builder ships complete projects via **ZIP export** until safe preview/publish is Accepted and built (D-003 + D-015 + D-016 + D-004 / D-010).

---

## Product phases (priority lens)

| Phase | Name | Goal | Status vs codebase |
|-------|------|------|--------------------|
| **P1** | Foundation | AI Engine, Auth, Dashboard, Workspace, Website Builder as finished-product UX | Core present; preview/publish gated; Zip export live |
| **P2** | Creation | App Builder, Landing Page Builder, Creative Studio (real outputs) | Scaffold/pipelines exist; deepen to finished-product bar |
| **P3** | Business growth | Marketing Hub, CRM, Business Manager, AI Agents | Partial; avoid marketing unfinished tools as complete |
| **P4** | SaaS expansion | Billing depth, scaling, Enterprise, Deployment | Billing code + env gates; deploy Future |

---

## Engineering track (execution)

| Phase | Name | Goal | Gate |
|-------|------|------|------|
| **1** | Audit | Understand system | Done — `PROJECT_AUDIT.md` |
| **1b** | Docs SSOT | Plan & constitution + product vision | Done — this docs pack |
| **2** | Stabilize | Critical fixes + honesty | Done on feature branch (merge to `main` open) |
| **3** | Clarify | Copy, routes, providers UX | Done (M01–M04) |
| **4** | Generation UX | Real progress + iteration | Done (M05 + regenerate/continue) |
| **5** | Monetize | Pro live + credit fairness | Env + D-014 (M06 blocked) |
| **6** | Preview / Deploy | Safe preview and/or publish | Decision-gated (F01/F02/F09) — **required for P1 finished-product bar** |
| **7** | Consolidate & launch | Dead code, E2E, monitoring | Launch checklist |

---

## Phase 1 — Audit (Completed)

- [x] Full codebase audit  
- [x] `docs/PROJECT_AUDIT.md`  

**Exit:** Understanding without code changes.

---

## Phase 1b — Documentation SSOT (Completed)

- [x] Blueprint, Constitution, Status, Queue, Decisions, Roadmap  
- [x] `PRODUCT_VISION.md` (product north star)  
- [x] Docs validation pass + `FINAL_REVIEW.md`  

**Exit:** Approved plan before implementation.  
**Follow-up:** L08 merge docs to `main` when approved.

---

## Phase 2 — Stabilize — High

**Tasks:** H01–H08 (landed on `cursor/docs-ssot-audit-plan`; merge to `main` still open)

**Exit criteria**

- `/dashboard/website-builder` loads without hang  
- Generate → save → download succeeds  
- No ThemeProvider script crash  
- UI does not falsely imply a live hosted site  

---

## Phase 3 — Product Clarity — Medium

**Tasks:** M01–M04 (done)

**Exit criteria**

- No conflicting “live website / live preview” claims without capability  
- One clear entry point per major product  

---

## Phase 4 — Generation UX — Medium

**Tasks:** M05 (+ regenerate/continue product work)

**Exit criteria**

- Users understand generation is still running (no fake completion)  
- Users can iterate (regenerate / continue) on saved projects  

---

## Phase 5 — Monetization — Medium–High when ready

**Tasks:** M06 (blocked on D-014), M07, F04–F06  

**Exit criteria**

- Pro plan not “Coming Soon” only if checkout works end-to-end  
- Credit behavior fair and decided  

---

## Phase 6 — Preview / Deploy / Publish — Decision-gated (P1 critical)

**Tasks:** F01, F02, F09  

Options (pick via `DECISIONS_LOG.md`):

- A) Safe static/sandboxed preview  
- B) One-click deploy / publish to user hosting  
- C) Remain export-only temporarily (honest), while still raising quality of the exported site  

**Exit criteria**

- Matches Accepted decision; no unsafe `npm install` on untrusted manifests  
- User journey approaches: create → preview → AI edit → export/publish  

---

## Phase 7 — Consolidate & Launch — Low then High for launch

**Tasks:** L01–L08, launch checklist  

**Exit criteria**

- Launch checklist green; docs status = production-ready (when earned)  
- Remote `main` includes docs pack + critical fixes  

---

## Priority mapping

| Priority | Focus |
|----------|--------|
| Product P1 gap | Phase 6 preview/publish decisions + Website Builder finished-product UX |
| High (ops) | Merge feature branch → `main`; prod env; authenticated E2E |
| Medium | Monetization (after D-014); App/Landing/Creative depth (P2) |
| Low | Cleanup L01/L03/L07 |
| Future | Full Marketing/Business hubs (P3), Enterprise (P4) |

---

## Explicit non-roadmap (unless decided)

- Full framework rewrite  
- Replacing Supabase  
- Enabling current unsafe preview builder as-is  
- Marketing unfinished stubs as complete products  

---

## Next action

1. Treat `PRODUCT_VISION.md` + D-015 as binding for new work.  
2. Prefer Website Builder **finished-product** gaps (safe preview decision, validation honesty, publish path) over new hub sprawl.  
3. Merge `cursor/docs-ssot-audit-plan` → `main` when approved (L08 + Phase 2 fixes).  
4. Do not auto-accept F01/F09 — stop for decision (see `AUTONOMOUS_EXECUTION.md` hard gates).
