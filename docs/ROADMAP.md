# Trend Business AI — Roadmap

**Based on:** `PROJECT_AUDIT.md` priorities  
**Constraint:** Continue the current project; no architecture replacement  
**Last updated:** 2026-07-17  

---

## Vision (aligned with current product)

Ship a reliable, honest multi-AI business platform where:

1. Auth, dashboard, and generators are stable  
2. Website/App/Landing builders reliably produce **downloadable projects**  
3. Messaging matches delivery (ZIP/code vs hosted live)  
4. Billing and ops are production-ready  
5. Preview/deploy depth is added only via explicit decisions  

---

## Phase overview

| Phase | Name | Goal | Gate |
|-------|------|------|------|
| **1** | Audit | Understand system | Done — `PROJECT_AUDIT.md` |
| **1b** | Docs SSOT | Plan & constitution | Done — this docs pack |
| **2** | Stabilize | Land critical fixes + honesty | **Needs approval** |
| **3** | Clarify | Copy, routes, providers UX | After Phase 2 |
| **4** | Generation UX | Progress + optional async | After Phase 3 |
| **5** | Monetize | Pro live + credit fairness | Env + Phase 2 ops |
| **6** | Preview/Deploy (optional) | Safe preview or deploy | Decision D-004 / D-010 |
| **7** | Consolidate & launch | Dead code, E2E, monitoring | Launch checklist |

---

## Phase 1 — Audit (Completed)

- [x] Full codebase audit  
- [x] `docs/PROJECT_AUDIT.md`  

**Exit:** Understanding without code changes.

---

## Phase 1b — Documentation SSOT (Completed)

- [x] `PROJECT_MASTER_BLUEPRINT.md`  
- [x] `AI_DEVELOPMENT_CONSTITUTION.md`  
- [x] `PROJECT_STATUS.md`  
- [x] `TASK_QUEUE.md`  
- [x] `DECISIONS_LOG.md`  
- [x] `ROADMAP.md`  
- [x] Docs validation pass + `FINAL_REVIEW.md`  

**Exit:** Approved plan before implementation.  
**Follow-up:** L08 commit docs to remote when approved.

---

## Phase 2 — Stabilize (Pending approval) — High

**Tasks:** H01–H08  

1. Ops: migrations + env verification  
2. Land working-tree critical fixes (SSR slim list, theme, generation bounds)  
3. Smoke Website Builder authenticated path  
4. Preview honesty / keep unsafe builder off  

**Exit criteria**

- `/dashboard/website-builder` loads without hang  
- Generate → save → download succeeds  
- No ThemeProvider script crash  
- UI does not falsely imply a live hosted site  

---

## Phase 3 — Product Clarity (Pending) — Medium

**Tasks:** M01–M04, M07 (partial)  

1. Align marketing/tool copy with ZIP delivery  
2. Hide placeholder providers  
3. Collapse duplicate dashboard routes  
4. Refresh README  

**Exit criteria**

- No conflicting “live website / live preview” claims without capability  
- One clear entry point per major product  

---

## Phase 4 — Generation UX (Pending) — Medium

**Tasks:** M05, F03  

1. Clearer progress / status during long DeepSeek runs  
2. Evaluate durable job queue (Future if large)  

**Exit criteria**

- Users understand generation is still running (no fake completion)  

---

## Phase 5 — Monetization (Pending / Future mix) — Medium–High when ready

**Tasks:** M06, F04, F05, F06  

1. PayPal/Pro E2E when credentials present  
2. Credit fairness on failures  
3. Optional: encrypt keys; invite email  

**Exit criteria**

- Pro plan not “Coming Soon” only if checkout works end-to-end  

---

## Phase 6 — Preview / Deploy (Future) — Decision-gated

**Tasks:** F01, F02, F09  

Options (pick via `DECISIONS_LOG.md`):

- A) Safe static/sandboxed preview  
- B) One-click deploy to user hosting  
- C) Remain ZIP-only (valid product)  

**Exit criteria**

- Matches Accepted decision; no unsafe `npm install` on untrusted manifests  

---

## Phase 7 — Consolidate & Launch (Pending) — Low then High for launch

**Tasks:** L01–L08, M07, launch checklist  

1. Dead code / orphan dirs / empty plugin stubs  
2. Engine consolidation design  
3. Commit docs SSOT to `main`  
4. Staging E2E + monitoring  
5. Final production audit sign-off  

**Exit criteria**

- Launch checklist green; docs status = production-ready (when earned)  
- Remote `main` includes docs pack + critical WT fixes 

---

## Priority mapping

| Priority | Phases |
|----------|--------|
| High | Phase 2 |
| Medium | Phases 3–5 |
| Low | Phase 7 cleanup |
| Future | Phase 6 + advanced media/providers |

---

## Explicit non-roadmap (unless decided)

- Full framework rewrite  
- Replacing Supabase  
- Enabling current unsafe preview builder as-is  
- Inventing products outside Create/Design/Content/Business + platform already present  

---

## Next action

**Stop and wait for approval.**  
When approved, begin **Phase 2** using High tasks in `TASK_QUEUE.md`, following `AI_DEVELOPMENT_CONSTITUTION.md`.
