# Website Copilot — Phase 1 Specification (SSOT)

**Document ID:** `WEBSITE_COPILOT_PHASE1`  
**Version:** 1.0.0  
**Status:** Approved — single source of truth for implementation  
**Last updated:** 2026-07-26  
**Supersedes:** Informal Architecture v1.0, Implementation Planning Analysis, Architecture Review v2.0 (as planning drafts only)  
**Builds on:** Phase 0 Platform Foundation (`lib/website/platform/`, migration `074_website_platform_foundation.sql`)

---

## 1. Purpose

Website Copilot Phase 1 introduces a **unified command API and minimal command UI** for natural-language website mutations. It orchestrates existing Website Builder capabilities (editor, management, SEO) through the Phase 0 commit boundary without replacing `/edit`, `/manage`, or `/seo/apply`.

Phase 1 delivers **rules-first command routing**, **blueprint materialized-view sync**, and **five supported MVP commands**. It does not introduce new AI pipelines, LLM intent classification, streaming, or a conversational chat product.

---

## 2. Scope

### 2.1 In scope

| Area | Phase 1 deliverable |
|------|---------------------|
| API | `POST /api/website-builder/[id]/copilot/commands` |
| Routing | Rules-based capability router (no LLM classifier) |
| Composition | Static single-step command recipes |
| Execution | Three executors: `Local`, `AiContinue`, `Advisory` |
| Commit | All mutations via `commitBlueprintRevision` |
| Sync | `syncBlueprintMaterializedView` on every commit |
| Validation | L0 structural + L1 generation validation (block/warn) |
| UI | Minimal Copilot Command Panel in `website-builder-tool` |
| Audit | `ai_runs` ledger entry per successful mutation |
| Testing | `scripts/verify-website-copilot.mjs` contract tests |

### 2.2 Out of scope (Phase 1)

See Section 20.

---

## 3. Non-goals

Phase 1 explicitly does **not**:

- Replace or remove `/edit`, `/manage`, `/seo/apply`, or visual editor save paths
- Add LLM-based intent classification or multi-step planners
- Add `copilot/stream` SSE endpoint
- Add Memory Engine, Review Engine, or Copilot Kernel extraction
- Migrate management dashboard assistant tab to Copilot API
- Support compound commands (“modernize and add testimonials”)
- Support: add page, replace all images, improve SEO (deferred to Phase 2)
- Add visual-editor selection context to Copilot (deferred to Phase 2)
- Change publish flow, template switching, or generation pipeline
- Introduce async job queue or background workers
- Modify CRM, ERP, App Builder, or other products

---

## 4. Reconciliation decisions (frozen)

These resolve all conflicts between Architecture v1.0, Review v2.0, and Phase 0 implementation.

| # | Conflict | **Frozen decision** |
|---|----------|---------------------|
| R1 | v1.0 chat-shaped `/copilot` vs v2.0 command API | **Command API only:** `POST .../copilot/commands`. No chat session endpoint. |
| R2 | v1.0 “Intent taxonomy” vs v2.0 “Capability URIs” | **Capability URIs** (`website.brand.color.set`, etc.). No `CHANGE_PRIMARY_COLOR` enum. |
| R3 | v1.0 “Planner” vs v2.0 “Command Composer” | **Command Composer** — static recipe lookup, single step per request. No DAG planner. |
| R4 | v1.0 five executors vs v2.0 three executors | **Three executors:** `Local`, `AiContinue`, `Advisory`. SEO/manage/edit paths map into these. |
| R5 | Blueprint sync in Phase 0 vs Phase 1 | **Phase 0 did not ship sync.** Phase 1 **must** add `syncBlueprintMaterializedView` and call it inside `commitBlueprintRevision` before persist. |
| R6 | v1.0 Copilot panel vs v2.0 “command-first, chat-second” | **Minimal Command Panel** — single input, command log, suggestion chips. Not a multi-turn chat UI. No streaming transcript. |
| R7 | LLM classifier timing | **Phase 2 only.** Phase 1 is rules-only. Unknown commands return advisory response. |
| R8 | Management assistant unification | **Phase 2.** Phase 1 Copilot does not handle catalog/CMS/page commands. |
| R9 | Existing routes | **Remain active unchanged.** Copilot is additive. Clients may use either path. |
| R10 | `expectedRevision` / `idempotencyKey` on Copilot | **Supported on Copilot API** using same Phase 0 semantics. |
| R11 | Review Engine | **Not built.** Use existing `suggestWebsiteImprovements` for advisory only. |
| R12 | Operation ledger type | Add `website.copilot.command` to `WebsiteMutationOperation`. |

---

## 5. Architecture

### 5.1 Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│  UI: CopilotCommandPanel (website-builder-tool.tsx)         │
└───────────────────────────┬─────────────────────────────────┘
                            │ POST /copilot/commands
┌───────────────────────────▼─────────────────────────────────┐
│  API Route: app/api/website-builder/[id]/copilot/commands/  │
│  (auth, rate limit, Zod validate, map errors)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  lib/ai-core/website-copilot/                               │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ Command     │→ │ Command Composer │→ │ Command        │ │
│  │ Router      │  │ (static recipes) │  │ Processor      │ │
│  └─────────────┘  └──────────────────┘  └───────┬────────┘ │
│                                                  │          │
│                     ┌────────────────────────────┼────────┐ │
│                     ▼                            ▼        ▼ │
│              Local Executor            AiContinue    Advisory│
│              (no LLM)                  Executor      Executor │
└───────────────────────────┬─────────────────────────────────┘
                            │ delegates to Phase 0 services
┌───────────────────────────▼─────────────────────────────────┐
│  lib/website/platform/                                      │
│  executeWebsiteEdit | executeWebsiteStructureMutation (N/A) │
│  executeWebsiteSeoApply (N/A Phase 1)                       │
│  commitBlueprintRevision → syncBlueprintMaterializedView      │
│  → persistWebsiteGeneration → recordWebsiteMutationRun      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Source of truth

`website_generations.blueprint` (JSONB) remains authoritative. `blueprint_revision` column and `platformRevision` embedded metadata are concurrency and audit layers.

---

## 6. Components (new in Phase 1)

All new code lives under `lib/ai-core/website-copilot/`.

| Module | Path | Responsibility |
|--------|------|----------------|
| Types | `types.ts` | `CopilotCommandRequest`, `CopilotCommandResult`, capability types |
| Router | `router.ts` | Normalize input → `CapabilityMatch` via rules |
| Composer | `composer.ts` | Capability → single `CopilotExecutionPlan` |
| Processor | `processor.ts` | Execute plan via executors; handle idempotency pre-check |
| Executors | `executors/local.ts`, `executors/ai-continue.ts`, `executors/advisory.ts` | Delegate to platform services |
| Sync | `sync-blueprint.ts` | `syncBlueprintMaterializedView` (also imported by `commit.ts`) |
| Validators | `validators/post-command.ts` | L0 + L1 gates |
| Index | `index.ts` | Public exports |

| API | Path | Responsibility |
|-----|------|----------------|
| Commands route | `app/api/website-builder/[id]/copilot/commands/route.ts` | HTTP entry |

| UI | Path | Responsibility |
|----|------|----------------|
| Panel | `components/dashboard/website-builder/copilot-command-panel.tsx` | Input, log, chips |
| Hook | `components/dashboard/website-builder/hooks/use-copilot-command.ts` | API client, preview refresh |

| Test | Path | Responsibility |
|------|------|----------------|
| Verify | `scripts/verify-website-copilot.mjs` | Contract + routing tests (no live AI) |

### 6.1 Phase 0 components (reused, not duplicated)

| Module | Path |
|--------|------|
| Commit boundary | `lib/website/platform/commit.ts` |
| Revision helpers | `lib/website/platform/revision.ts` |
| Idempotency | `lib/website/platform/idempotency.ts` |
| Mutation ledger | `lib/website/platform/mutation-run.ts` |
| Edit service | `lib/website/platform/services/edit-service.ts` |
| Load generation | `lib/website/platform/load-generation.ts` |

Phase 1 **extends** `commitBlueprintRevision` to call `syncBlueprintMaterializedView` before `persistWebsiteGeneration`. Phase 1 **extends** `WebsiteMutationOperation` with `website.copilot.command`.

---

## 7. Services

### 7.1 `runCopilotCommand` (new orchestrator)

**Entry:** `lib/ai-core/website-copilot/processor.ts` → `runCopilotCommand(params)`

**Inputs:**

```typescript
{
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: CopilotCommandRequest;
}
```

**Outputs:** `CopilotCommandResult` (see Section 9)

**Flow:**

1. If `idempotencyKey` present → `findIdempotentCommit`; if hit with `servicePayload.copilotResult`, return cached result immediately (no router, no AI).
2. `loadWebsiteGenerationForUser` + `toWebsiteProject` + `understandWebsite` (minimal context).
3. `routeCommand(command)` → `CapabilityMatch | null`.
4. If no match → `Advisory` executor (`suggestWebsiteImprovements` + examples).
5. `composePlan(capability)` → single-step plan.
6. Execute via `Local` or `AiContinue` executor.
7. `commitBlueprintRevision` with `operation: "website.copilot.command"`.
8. L0/L1 validation; block commit on L0 failure.
9. Return result; idempotency store includes full `copilotResult`.

### 7.2 Executor mapping

| Executor | When | Delegates to |
|----------|------|--------------|
| `Local` | Recipe `tier: "local"` | `applyWebsiteEditActions` only path inside `executeWebsiteEdit` with `applyAi: false` |
| `AiContinue` | Recipe `tier: "ai-continue"` | `executeWebsiteEdit` with `applyAi: true` |
| `Advisory` | Unknown command or `tier: "advisory"` | No mutation; returns suggestions |

Phase 1 does **not** call `executeWebsiteStructureMutation` or `executeWebsiteSeoApply`.

---

## 8. API contract

### 8.1 Endpoint

```
POST /api/website-builder/{generationId}/copilot/commands
```

| Property | Value |
|----------|-------|
| Auth | Required (`requireUser`) |
| Ownership | `generationId` must belong to `user_id` |
| Runtime | `nodejs` |
| `maxDuration` | `800` (same as `/edit`) |
| Content-Type | `application/json` |

### 8.2 Request schema

```typescript
{
  /** Natural language command. Required. Max 4000 chars. */
  command: string;

  /** Optional optimistic concurrency (Phase 0). */
  expectedRevision?: number;  // integer >= 0

  /** Optional idempotent replay key (Phase 0). Max 128 chars. */
  idempotencyKey?: string;

  /**
   * When true (default), allow AiContinue executor.
   * When false, Local executor only; AI-needed commands return advisory.
   */
  applyAi?: boolean;  // default: true
}
```

**Zod validation:**

- `command`: `z.string().trim().min(1).max(4000)`
- `expectedRevision`: `z.number().int().min(0).optional()`
- `idempotencyKey`: `z.string().trim().min(1).max(128).optional()`
- `applyAi`: `z.boolean().optional()`

### 8.3 Success response schema (HTTP 200)

```typescript
{
  ok: true;
  capability: string;           // Capability URI executed, or "website.advisory.unknown"
  tier: "local" | "ai-continue" | "advisory";
  mutated: boolean;             // false for advisory-only
  revision: number;               // blueprint_revision after commit
  aiRunId: string | null;       // ai_runs id if mutation occurred
  fromIdempotency: boolean;
  summary: string;                // Human-readable result
  project?: GeneratedWebsiteProject;      // present when mutated: true
  generation?: WebsiteGeneration;         // present when mutated: true
  editResult?: {                          // present when edit path used
    summary: string;
    actionsApplied: string[];
    appliedNotes: string[];
    suggestions: WebsiteImprovementSuggestion[];
    continueInstruction: string | null;
  };
  suggestions?: WebsiteImprovementSuggestion[];  // always on advisory
  examples?: string[];                            // on unknown command
  previewVersion: string;       // generation.updated_at ISO timestamp
}
```

### 8.4 Error response schema

Uses existing `apiErrorResponse` shape:

```typescript
{
  error: string;
  code?: ApiErrorCode;
  details?: string;
}
```

| HTTP | `code` | When |
|------|--------|------|
| 400 | `INVALID_INPUT` | Zod validation failure |
| 400 | `INVALID_JSON` | Malformed body |
| 401 | `UNAUTHORIZED` | Not authenticated |
| 404 | `GENERATION_NOT_FOUND` | Generation missing or wrong user |
| 409 | `CONFLICT` | `expectedRevision` mismatch |
| 429 | `RATE_LIMITED` | AI rate limit or credits |
| 500 | `SERVER_ERROR` | Persist/validation hard failure |
| 503 | `PROVIDER_UNAVAILABLE` | AI continue requested but no provider |

### 8.5 Rate limiting

| Condition | Enforcement |
|-----------|-------------|
| `tier` will be `ai-continue` (after routing, before execution) | `enforceAiUsage(supabase, userId, "website-builder")` — 10 req/min + 1 credit |
| `tier` is `local` or `advisory` | No `enforceAiUsage`; no credit charge |
| All requests | Standard Supabase RLS on `website_generations` |

When `applyAi: false` and recipe requires `ai-continue`, router still matches capability but processor returns **advisory** response explaining AI is required (HTTP 200, `mutated: false`). No credit charged.

---

## 9. Command execution flow

```
1. POST /copilot/commands
2. Auth + parse body
3. Idempotency pre-check (full copilot result cache)
4. Load generation + understandWebsite (files, home order, tokens)
5. routeCommand(command) → CapabilityMatch { uri, slots, confidence }
6. If confidence < 0.5 OR no match:
     → Advisory executor → 200 ok, mutated: false
7. composePlan(uri) → { executor, editRequest?, tier }
8. If tier === ai-continue → enforceAiUsage
9. Execute:
     Local/AiContinue → executeWebsiteEdit(...) 
10. commitBlueprintRevision:
      a. OCC check (expectedRevision)
      b. syncBlueprintMaterializedView(project)
      c. stamp platformRevision
      d. persistWebsiteGeneration
      e. recordWebsiteMutationRun
      f. storeIdempotentCommit (with copilotResult payload)
11. postCommandValidation (L0 block, L1 warn)
12. Return 200 success response
```

**Compound commands:** If router detects multiple capability keywords (e.g. “modernize” AND “testimonials”), return advisory with `examples` suggesting two separate commands. Do not execute.

---

## 10. Capability catalog (Phase 1)

Capabilities use URI format: `website.<domain>.<action>`.

| Capability URI | Tier | Executor | Example commands | Recipe |
|----------------|------|----------|------------------|--------|
| `website.brand.color.set` | `local` | Local | “Change the primary color”, “Set primary to #2563eb” | `update-colors` via `parseWebsiteEditCommand` |
| `website.design.style.modernize` | `ai-continue` | AiContinue | “Make the design more modern”, “Make it more minimal” | `change-design-style: modern` + AI continue |
| `website.section.add.testimonials` | `ai-continue` | AiContinue | “Add a testimonials section”, “Add reviews” | `add-section` testimonials + AI continue |
| `website.section.regenerate.hero` | `ai-continue` | AiContinue | “Regenerate only the hero section”, “Redo the hero” | `replace-section` hero + AI continue |
| `website.content.rewrite.home` | `ai-continue` | AiContinue | “Rewrite the homepage copy”, “Rewrite home page text” | `rewrite-content` home + AI continue |
| `website.advisory.unknown` | `advisory` | Advisory | Unrecognized input | Suggestions only |

### 10.1 Router rules (frozen)

Router **wraps** `parseWebsiteEditCommand` patterns — does not fork regex.

| Priority | Pattern (case-insensitive) | Capability URI |
|----------|---------------------------|----------------|
| 1 | `/regenerat.*hero|redo.*hero|hero.*regenerat/i` | `website.section.regenerate.hero` |
| 2 | `/rewrite.*(home|homepage)|rewrite.*copy/i` | `website.content.rewrite.home` |
| 3 | `/testimonial|review.*section|add.*testimonial/i` | `website.section.add.testimonials` |
| 4 | `/modern|minimal|corporate|make it more/i` | `website.design.style.modernize` |
| 5 | `/color|palette|primary color|#[0-9a-f]{3,8}/i` | `website.brand.color.set` |
| 6 | default | `website.advisory.unknown` |

**Compound detection:** If priorities 1–5 match more than one distinct URI, route to `website.advisory.compound` (advisory tier) with message to split commands.

### 10.2 Supported commands (user-facing guarantee)

Phase 1 **guarantees** correct routing and execution for these five intents:

1. Change the primary color  
2. Make the design more modern  
3. Add a Testimonials section  
4. Regenerate only the Hero section  
5. Rewrite the homepage copy  

All other inputs receive advisory responses without mutation.

---

## 11. Blueprint synchronization

### 11.1 Module

`lib/ai-core/website-copilot/sync-blueprint.ts` (exported; imported by `lib/website/platform/commit.ts`).

### 11.2 Function

`syncBlueprintMaterializedView(project: GeneratedWebsiteProject): GeneratedWebsiteProject`

**Updates derived fields only** (never deletes strategy/designSystem/assetManifest):

| Field | Source |
|-------|--------|
| `pages` | Parse `app/**/page.tsx` paths |
| `sections` | `parseHomeComponentOrder(app/page.tsx)` |
| `components` | Same as `sections` (home component export names) |
| `colorPalette` | CSS variables from `globals.css` via `understandWebsite.designTokens` |

### 11.3 Invocation

Called inside `commitBlueprintRevision` **after** executor produces `project`, **before** `persistWebsiteGeneration`. Applies to **all** commits (Copilot and existing services).

### 11.4 Failure

If sync throws or home page missing, commit returns `{ ok: false, code: "VALIDATION", error: "..." }`.

---

## 12. Revision handling

Uses Phase 0 implementation unchanged.

| Concept | Location |
|---------|----------|
| Counter | `website_generations.blueprint_revision` (integer, default 0) |
| Embedded audit | `blueprint.platformRevision` |
| Read | `readBlueprintRevisionFromGeneration(generation)` |
| Bump | `nextRevision(current)` on every successful commit |
| OCC | Client sends `expectedRevision`; server rejects with 409 if `generation.blueprint_revision !== expectedRevision` |
| Default | Omitting `expectedRevision` → last-write-wins (backward compatible) |

**Copilot response** always includes `revision` and `previewVersion` (`generation.updated_at`).

---

## 13. Idempotency

Uses Phase 0 `website_commit_idempotency` table.

| Rule | Value |
|------|-------|
| Key scope | `(user_id, generation_id, idempotency_key)` unique |
| Pre-check | Before router/AI in `runCopilotCommand` |
| Stored payload | `{ generation, project, revision, servicePayload: { copilotResult } }` |
| Replay | Return cached `copilotResult` verbatim; `fromIdempotency: true` |
| TTL | No automatic expiry in Phase 1 (table grows; Phase 3 adds cleanup job) |

Edit service idempotency (pre-Phase-1) remains for `/edit` path. Copilot maintains its own idempotency records with operation `website.copilot.command`.

---

## 14. Validation

### 14.1 Tiers

| Tier | Module | When | On failure |
|------|--------|------|------------|
| **L0** | `validators/post-command.ts` | After mutation, before response | **Block** — rollback not required; commit already succeeded only if L0 runs pre-return. L0 runs **before** persist in commit path. |
| **L1** | `generation-validation.ts` | After L0 pass | **Warn** — include `warnings[]` in response; do not block |

### 14.2 L0 checks (blocking)

- `files.length > 0`
- `app/page.tsx` exists in files
- Home page has ≥1 component in `parseHomeComponentOrder`
- No empty file content for `app/page.tsx`

### 14.3 L1 checks (non-blocking)

- `validateWebsiteGeneration(files, metadata)` — existing module
- Warnings returned in `warnings: string[]` on success response

Publish-quality gates (`pre-publish`, SEO readiness) are **not** run in Phase 1.

---

## 15. UI scope

### 15.1 Component

`CopilotCommandPanel` embedded in `website-builder-tool.tsx` as a collapsible side panel or bottom drawer. **Does not** modify management dashboard assistant tab.

### 15.2 Features

| Feature | Included |
|---------|----------|
| Text input for command | Yes |
| Submit button | Yes |
| Command history log (last 20, client-side) | Yes |
| Five suggestion chips (MVP commands) | Yes |
| Loading state during request | Yes |
| Error display | Yes |
| Preview iframe refresh on `previewVersion` change | Yes |
| Multi-turn chat thread | **No** |
| Streaming progress | **No** |
| Plan preview / confirm dialog | **No** |
| Visual editor selection badge | **No** (Phase 2) |

### 15.3 API client

`useCopilotCommand` hook calls `POST .../copilot/commands` only. Does not call `/edit` directly.

---

## 16. Security

| Concern | Mitigation |
|---------|------------|
| Authz | `generationId` + `user_id` scope on all reads/writes |
| Prompt injection | Existing `sanitizePromptInput` in generation path; Copilot passes command to same `executeWebsiteEdit` → `generateWebsite` chain |
| Raw actions[] from client | **Not accepted** on Copilot API. Only `command` string. Server-side routing only. |
| Idempotency key guessing | Scoped per user + generation |
| PII in audit | `ai_runs.brief` stores capability URI and revision metadata, not full command text longer than 200 chars |
| Rate abuse | `enforceAiUsage` on AI tier |

---

## 17. Credits

| Path | Credits |
|------|---------|
| `tier: local` | 0 |
| `tier: advisory` | 0 |
| `tier: ai-continue` | 1 credit per `enforceAiUsage` call (same as `/edit`) |

Failed AI continue after credit charge: existing platform behavior (no refund in Phase 1).

---

## 18. Testing requirements

### 18.1 Script: `scripts/verify-website-copilot.mjs`

| Test | Type | Requirement |
|------|------|-------------|
| Router maps 5 MVP commands to correct URI | Unit (inline or import) | PASS |
| Compound command → advisory | Unit | PASS |
| Unknown command → advisory | Unit | PASS |
| `syncBlueprintMaterializedView` updates sections from fixtures | Unit | PASS |
| Source files exist per Section 6 | Static | PASS |
| Commands route delegates to `runCopilotCommand` | Static | PASS |
| Panel + hook exist | Static | PASS |

### 18.2 Manual QA (staging)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | “Change primary color to #2563eb” on saved site | Colors update, preview refreshes, revision increments |
| 2 | “Make the design more modern” | AI continue runs, site updates |
| 3 | “Add testimonials section” | Section appears on home |
| 4 | “Regenerate hero” | Hero section changes |
| 5 | “Rewrite homepage copy” | Copy changes |
| 6 | Unknown command | 200 advisory, no mutation |
| 7 | Same `idempotencyKey` twice | Second response identical, no double AI |
| 8 | Stale `expectedRevision` | 409 CONFLICT |
| 9 | `/edit` still works without Copilot | Unchanged behavior |

### 18.3 CI gates

Phase 1 PR must pass:

- `npm run type-check`
- `npm run lint`
- `node scripts/verify-website-copilot.mjs`
- `node scripts/verify-website-platform-foundation.mjs`

Live AI tests are manual QA only.

---

## 19. Acceptance criteria

Phase 1 is **complete** when all are true:

- [ ] `POST /api/website-builder/[id]/copilot/commands` implemented per Section 8
- [ ] All five MVP commands route and execute correctly (Section 10.2)
- [ ] `syncBlueprintMaterializedView` integrated into every `commitBlueprintRevision`
- [ ] `website.copilot.command` recorded in `ai_runs` for Copilot mutations
- [ ] `CopilotCommandPanel` visible in website builder with suggestion chips
- [ ] Preview refreshes via `previewVersion` after mutation
- [ ] `/edit`, `/manage`, `/seo/apply` behavior unchanged (regression)
- [ ] `verify-website-copilot.mjs` passes
- [ ] No LLM intent classifier code in Phase 1 deliverables
- [ ] Migration 074 applied on target environment

---

## 20. Future phases (informative, not Phase 1 scope)

| Phase | Focus |
|-------|-------|
| **Phase 2** | Add page, replace images, improve SEO; visual selection context; management tab delegation; in-memory undo (5 deep) |
| **Phase 3** | LLM classifier for compound commands; `copilot/stream`; idempotency TTL; cost tier UX |
| **Phase 4** | Copilot runtime kernel extraction; App Builder command API parity |

---

## 21. Implementation order (frozen)

| Step | Deliverable |
|------|-------------|
| 1 | `sync-blueprint.ts` + wire into `commit.ts` |
| 2 | Add `website.copilot.command` to `WebsiteMutationOperation` |
| 3 | `website-copilot/types.ts`, `router.ts`, `composer.ts` |
| 4 | `executors/local.ts`, `executors/ai-continue.ts`, `executors/advisory.ts` |
| 5 | `processor.ts` (`runCopilotCommand`) |
| 6 | `validators/post-command.ts` |
| 7 | `app/api/website-builder/[id]/copilot/commands/route.ts` |
| 8 | `copilot-command-panel.tsx`, `use-copilot-command.ts` |
| 9 | Embed panel in `website-builder-tool.tsx` |
| 10 | `scripts/verify-website-copilot.mjs` |
| 11 | Manual QA on staging |

---

## 22. Glossary

| Term | Definition |
|------|------------|
| **Capability** | A named, routable website mutation identified by URI |
| **Command Composer** | Static map from capability URI to execution plan |
| **Command Processor** | Orchestrates router → composer → executor → commit |
| **Advisory** | Response with suggestions only; `mutated: false` |
| **Materialized view** | Derived blueprint fields synced from `files[]` |

---

## 23. References

| Document | Role |
|----------|------|
| `lib/website/platform/` | Phase 0 implementation |
| `supabase/migrations/074_website_platform_foundation.sql` | Revision + idempotency schema |
| `lib/ai-core/website-editor/parse-command.ts` | Router pattern source |
| `scripts/verify-website-platform-foundation.mjs` | Phase 0 verification |
| `docs/DECISIONS_LOG.md` D-015, D-016, D-017 | Product constraints |

---

**End of specification.**
