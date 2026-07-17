# Trend Business AI — Decisions Log

**Purpose:** Record product and architecture decisions so agents do not re-litigate them.  
**Rule:** New decisions require a dated entry. Supersede old entries explicitly.  
**Last updated:** 2026-07-17  

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

## D-003 — Website Builder delivers code projects (ZIP), not hosted sites

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** (current product truth) |
| Context | Customer tests showed files + Download ZIP; no live URL |
| Decision | Treat Website Builder as an **AI source-project generator** until a separate decision ships preview/deploy/hosted mode. |
| Consequences | UI/marketing must not claim a ready hosted website without implementation. |
| Related | Tasks M01, H07, F01, F02, F09 |

---

## D-004 — Live Preview stays off until a safe design is approved

| Field | Value |
|-------|--------|
| Date | 2026-07-17 |
| Status | **Accepted** |
| Context | `LIVE_PREVIEW_ENABLED = false`; preview builder can run install/build on generated projects (RCE risk) |
| Decision | Keep preview disabled in production. Either (a) honest “Download / Deploy” messaging, or (b) a future **sandboxed** preview that does not execute arbitrary package installs. |
| Consequences | Do not flip `WEBSITE_PREVIEW_BUILDER_ENABLED=true` without security review. |
| Related | Tasks H07, H08, F01 |

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
| Status | **Accepted** (direction); code landing pending approval |
| Context | Unbounded production file lists caused multi-minute hangs / 92% UX freeze |
| Decision | Keep generation bounded (file cap ~18 + soft-pass / non-infinite validation). Prefer finishing a usable project over perfect trees. |
| Consequences | Soft-pass may save imperfect trees; document warnings if needed. |
| Related | Tasks H05, H06 |

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
| Consequences | Task M02 before enabling in settings. |
| Related | Task M02, F08 |

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
