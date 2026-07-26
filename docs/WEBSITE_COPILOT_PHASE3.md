# Website Copilot — Phase 3 Specification (SSOT)

**Document ID:** `WEBSITE_COPILOT_PHASE3`  
**Version:** 1.0.0  
**Status:** Approved — single source of truth for implementation  
**Builds on:** Phase 0 (`lib/website/platform/`), Phase 1–2 (`lib/ai-core/website-copilot/`)

---

## 1. Purpose

Phase 3 adds **LLM compound-command classification**, **SSE streaming progress**, **idempotency TTL cleanup**, and **cost-tier UX** — without changing Phase 1–2 command semantics when new flags are omitted.

---

## 2. Scope (Phase 3 deliverables)

| # | Deliverable |
|---|-------------|
| P3-1 | LLM classifier splits compound commands when `useClassifier: true` |
| P3-2 | `POST .../copilot/stream` — SSE `progress` / `complete` / `error` events |
| P3-3 | Idempotency TTL (7 days) + `expires_at` column + purge on store |
| P3-4 | Cost tier UX — `costHint` on responses + client preview badge |
| P3-5 | `scripts/verify-website-copilot-phase3.mjs` |

## 3. Out of scope (Phase 4+)

- Copilot runtime kernel extraction
- App Builder command API parity
- Multi-turn conversational chat UI

---

## 4. API extensions

### 4.1 `POST .../copilot/commands` — extended request

```typescript
{
  command: string;
  expectedRevision?: number;
  idempotencyKey?: string;
  applyAi?: boolean;
  selectionContext?: CopilotSelectionContext;
  useClassifier?: boolean; // default false — backward compatible
}
```

### 4.2 `POST .../copilot/commands` — extended success response

```typescript
{
  // ...existing fields...
  costHint?: {
    costTier: "free" | "ai-standard";
    creditCost: number;
    capability: string;
    label: string;
  };
  classifierUsed?: boolean;
  splitCommands?: string[];
  executedCommandIndex?: number;
  executedCommandCount?: number;
}
```

### 4.3 `POST .../copilot/stream` — new (SSE)

Request body: same as commands ( `useClassifier` defaults to `true` for compound split ).

Events:

| Event | Payload |
|-------|---------|
| `progress` | `{ message, step?, stepCount?, capability? }` |
| `complete` | Full `CopilotCommandSuccess` (last step when compound) |
| `error` | `{ error, code? }` |
| `ping` | heartbeat (ignored by clients) |

---

## 5. Classifier behavior

1. Rules router runs first (unchanged).
2. When `useClassifier: true` and rules return `website.advisory.compound`:
   - LLM splits into 1–5 sub-commands.
   - Each sub-command re-routed via rules.
   - `/commands`: executes **first** sub-command; returns `splitCommands` + `executedCommandIndex: 0`.
   - `/stream`: executes **all** sub-commands sequentially with progress events.
3. When classifier unavailable (no provider): fall back to Phase 2 advisory compound response.

---

## 6. Idempotency TTL

| Setting | Value |
|---------|-------|
| TTL | 7 days |
| Column | `expires_at timestamptz default now() + interval '7 days'` |
| Lookup | `findIdempotentCommit` ignores expired rows |
| Cleanup | `purgeExpiredIdempotentCommits` on store (best effort) |

Migration: `075_website_copilot_idempotency_ttl.sql`

---

## 7. Cost tier UX

| Tier | Credit cost | When |
|------|-------------|------|
| `free` | 0 | local / structure / advisory |
| `ai-standard` | 1 | ai-continue capabilities |

`estimateCopilotCost(match, plan)` powers server `costHint` and client preview badge.

---

## 8. Acceptance criteria

- [ ] Compound command + `useClassifier: true` executes first split sub-command via `/commands`
- [ ] `/copilot/stream` runs compound splits sequentially with SSE progress
- [ ] Expired idempotency records are not replayed
- [ ] `costHint` present on mutation and advisory responses
- [ ] Copilot panel shows cost badge before submit
- [ ] Phase 1 + Phase 2 verify scripts still pass
- [ ] `verify-website-copilot-phase3.mjs` passes

---

## 9. Implementation order

1. Types + cost-tier + classifier + resolve-route  
2. Processor + stream runner + idempotency TTL migration  
3. `/copilot/stream` route + commands route extensions  
4. UI: cost badge + streaming hook  
5. `verify-website-copilot-phase3.mjs`

---

**End of specification.**
