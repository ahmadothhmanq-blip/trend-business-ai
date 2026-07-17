# Trend Business AI — Project Status

**Living status board** (update when work lands).  
**Based on:** `PROJECT_AUDIT.md` + docs review (2026-07-17)  
**Git HEAD (remote tip at audit):** `fa44510`  
**Branch:** `main`  
**Baseline rule:** Status reflects **local working tree** unless marked “HEAD only” (see D-011).  

---

## Snapshot

| Field | Value |
|-------|--------|
| Overall | **Beta / pre-production** |
| Product type today | Multi-AI SaaS + **code project** generator |
| Hosted live websites | **Not delivered** |
| Live Preview | **Frozen / off** (`LIVE_PREVIEW_ENABLED = false`) |
| Default AI | DeepSeek (real) |
| Dashboard routes | 40 dirs / 42 pages |
| API routes | 73 |
| Migrations | 30 |
| Docs on remote | **May be untracked** until L08 |
| Blocking for honest launch messaging | Preview honesty + ops env + commit critical WT fixes (H03–H05) |

---

## Status by Area

| Area | Status | Notes |
|------|--------|-------|
| Marketing site | **Completed** | Strong SEO surface |
| Auth & profiles | **Completed** | Supabase session + dashboard guard |
| Dashboard shell | **Completed** | Nav, theme, layout |
| Website Builder (code/ZIP) | **Completed** (core) | Generate/save/download works; preview not live |
| Landing / App builders | **Completed** (core) | Same family as website |
| Brand / Logo / Image / Video / Content | **Completed** (partial) | Tools exist; media depth limited |
| Business / Agents / Ideas / Reports | **Completed** (core) | Pipelines present |
| Billing code | **Completed** (code) | PayPal path env-gated |
| Pro plan marketing | **Pending** | “Coming Soon” |
| Orgs / Team | **Completed** (partial) | DB + UI; invite email ESP incomplete |
| SEO / AI Search / Growth | **Completed** (core) | Phase 17/22 |
| Security baseline | **Completed** (advanced) | RLS, rate limits, headers |
| Live Preview | **Pending** / frozen | Flag off; unsafe builder if enabled |
| Async generation jobs | **Future** | Not built |
| Placeholder AI providers | **Future** | Stubs only |
| Production launch checklist | **In Progress** (ops) | Env/migrations/E2E still open |

---

## Completed (Selected)

- Multi-product dashboard and marketing SEO hub  
- Supabase auth, profiles, preferences, avatars  
- ProviderManager + DeepSeek/OpenAI/Claude  
- Website/plugin generation pipelines + ZIP export  
- Billing schema + manager + PayPal adapters (code)  
- Org/team schema + platform panels  
- Phases 12–22 hardening work in-repo  
- Phase 1 audit documentation (`docs/PROJECT_AUDIT.md`)  
- Docs SSOT pack (this folder)  

### Working-tree fixes (not yet guaranteed on remote `main`)

Treat as **In Progress** until committed/pushed:

- Theme: React 19–safe provider (no `next-themes` script crash)  
- Website list SSR: slim columns, no full blueprint on list  
- Generation: 18-file cap + soft-pass validation  
- Dev: avoid immutable cache on `/_next/static` in development  

---

## In Progress

| Item | Owner | Notes |
|------|-------|-------|
| Reconcile WT critical fixes → `main` | Pending approval | Theme, SSR list, generation bounds |
| Ops production readiness | Pending | Env, migrations apply, Upstash, SITE_URL |
| Docs as SSOT | Active | This pack |

---

## Pending (Near Term)

See `TASK_QUEUE.md` High/Medium. Summary:

- Honest Live Preview / Download messaging  
- Hide placeholder providers  
- Align marketing copy with ZIP delivery  
- Collapse duplicate product routes  
- Authenticated smoke tests  
- Commit + verify Website Builder load + generate path  

---

## Future Versions

- Safe Live Preview or one-click deploy  
- Durable AI job queue + real progress  
- Pro billing live + credit fairness  
- Encrypted provider keys  
- Team invite email (ESP)  
- True image/video asset pipelines  
- Gemini/Grok/Llama real adapters (only if product needs them)  

---

## Known Risks (Open)

1. Preview UI trust gap (frozen but labeled Live Preview)  
2. Uncommitted fixes may diverge local vs GitHub  
3. Sequential DeepSeek latency; progress can look stuck  
4. Soft-pass may save incomplete trees  
5. Preview builder RCE if enabled carelessly  
6. Launch blocked on env/ops P0 from prior enterprise audits  

---

## How to Update This File

After each approved implementation batch:

1. Move items between Completed / In Progress / Pending / Future  
2. Refresh “Snapshot” table  
3. Link related `TASK_QUEUE.md` IDs  

**No application code changes in the docs-only phase.**
