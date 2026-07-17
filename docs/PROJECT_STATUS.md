# Trend Business AI — Project Status

**Living status board** (update when work lands).  
**Based on:** `PROJECT_AUDIT.md` + docs review (2026-07-17)  
**Git HEAD (remote tip at audit):** `fa44510`  
**Branch:** `cursor/docs-ssot-audit-plan` (docs) / local WT may differ from remote `main`  
**Baseline rule:** Status reflects **local working tree** unless marked “HEAD only” (see D-011).  

---

## Snapshot

| Field | Value |
|-------|--------|
| Overall | **Beta / pre-production** |
| Product type today | Multi-AI SaaS + **code project** generator |
| Hosted live websites | **Not delivered** |
| Live Preview | **Off** — H07 UI honesty + **H08** production hard-disable of preview builder |
| Default AI | DeepSeek (real) |
| Dashboard routes | 40 dirs / 42 pages |
| API routes | 73 |
| Migrations | **30/30 applied** on configured `.env.local` DB (H01) |
| Local env (H02) | Core AI/Supabase **partial** — SITE_URL / service role / Upstash **missing**; anon key length WARN |
| Docs on remote | Feature branch; merge to `main` still L08 |
| Blocking for honest launch messaging | Fill prod env gaps (H02) + re-run H06 with confirmed user + merge Phase 2 to `main` |

---

## Status by Area

| Area | Status | Notes |
|------|--------|-------|
| Marketing site | **Completed** | Strong SEO surface; **M01** ZIP/source honesty (not hosted live sites) |
| Auth & profiles | **Completed** | Supabase session + dashboard guard |
| Dashboard shell | **Completed** | Nav, theme (H04 React 19–safe), layout |
| Website Builder (code/ZIP) | **Completed** (core) | Generate/save/download works; preview not live; **SSR list slim-list verified (H03)** |
| Landing / App builders | **Completed** (core) | Same family as website |
| Brand / Logo / Image / Video / Content | **Completed** (partial) | Tools exist; media depth limited |
| Business / Agents / Ideas / Reports | **Completed** (core) | Pipelines present |
| Billing code | **Completed** (code) | PayPal path env-gated |
| Pro plan marketing | **Pending** | “Coming Soon” |
| Orgs / Team | **Completed** (partial) | DB + UI; invite email ESP incomplete |
| SEO / AI Search / Growth | **Completed** (core) | Phase 17/22 |
| Security baseline | **Completed** (advanced) | RLS, rate limits, headers |
| Live Preview | **Off** (honest + guarded) | H07 Download UI; H08 hard-disables builder in production |
| Async generation jobs | **Future** | Not built |
| Placeholder AI providers | **Hidden in prod** | M02 — Gemini/Grok/Llama not in production settings UI; F08 for real adapters |
| Production launch checklist | **In Progress** (ops) | H01 OK; H02 local audit done — prod still needs SITE_URL, service role, Upstash; E2E open |

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
- **H01:** Migrations `001`–`030` confirmed on configured `.env.local` Supabase (`public.schema_migrations` = 30/30; platform `db:verify` PASS). Staging/prod not separately verified.  
- **H03:** Website Builder SSR slim-list **verified PASS** and pushed on `cursor/docs-ssot-audit-plan` (`f1f5549`). Merge to `main` still open.  
- **H04:** React 19–safe theme **verified and landed** on `cursor/docs-ssot-audit-plan` — `next-themes` removed; cookie SSR + custom provider. Merge to `main` still open.  
- **H05:** Generation **18-file cap + soft-pass** verified (committed on branch).  
- **H06:** Smoke **partial** — health + login redirect PASS; in-process generate→ZIP PASS (18 files/~77s). Cookie-auth HTTP generate blocked by Supabase email confirmation (ops), not app code.  
- **H07:** Live Preview honesty — frozen “Live Preview” replaced with **Download project / ZIP** messaging; preview remains off.  
- **H08:** Preview builder **production hard-disable** + fail-closed env policy until F01 sandbox redesign.  
- **M01:** Marketing/SEO/registry/tool copy aligned to ZIP + self-host delivery (D-003); no hosted-live claims.  
- **M02:** Placeholder AI providers (Gemini/Grok/Llama) hidden from production settings UI/API (D-009).  

### Working-tree fixes (not yet guaranteed on remote `main`)

Treat as **In Progress** until committed/pushed / merged:

- ~~Website list SSR~~ → **H03 on feature branch**  
- ~~Theme React 19–safe~~ → **H04 on feature branch**  
- ~~Generation 18-file cap + soft-pass~~ → **H05 on feature branch**  
- Dev: avoid immutable cache on `/_next/static` in development  

---

## In Progress

| Item | Owner | Notes |
|------|-------|-------|
| Reconcile WT critical fixes → `main` | Pending approval | H03–H05 on branch; merge still open |
| Ops production readiness | Pending | H01+H02 local done; **email confirm / full anon key** block full H06 HTTP path; SITE_URL / service role / Upstash for prod |
| Docs as SSOT | Active | This pack |

---

## Pending (Near Term)

See `TASK_QUEUE.md` High/Medium. Summary:

- ~~Honest Live Preview / Download messaging~~ → **H07 done**  
- ~~Align marketing copy with ZIP delivery~~ → **M01 done**  

- ~~Hide placeholder providers~~ → **M02 done**  
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

1. ~~Preview UI trust gap / unsafe builder~~ → mitigated by H07 + H08; F01 for safe preview later  

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
