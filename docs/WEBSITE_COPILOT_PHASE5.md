# Website Copilot — Phase 5 Specification (SSOT)

**Document ID:** `WEBSITE_COPILOT_PHASE5`  
**Version:** 1.0.0  
**Status:** Approved — single source of truth for implementation  
**Builds on:** Phases 0–4 (`copilot-kernel`, `website-copilot`, `app-copilot`)

---

## 1. Purpose

Phase 5 adds **session memory**, **post-command review**, **cross-product compound detection**, and **multi-turn chat UI** — without replacing the command API or breaking Phases 1–4 defaults.

---

## 2. Scope (Phase 5 deliverables)

| # | Deliverable |
|---|-------------|
| P5-1 | Copilot Memory Engine — session turns persisted per generation (`sessionId`) |
| P5-2 | Copilot Review Engine — optional post-mutation quality review (`includeReview`) |
| P5-3 | Cross-product compound detection — website + app command split |
| P5-4 | Multi-turn chat UI — thread view in Copilot panels (commands API only) |
| P5-5 | App Copilot parity for memory, review, cross-product, chat |
| P5-6 | Migration `077_copilot_session_memory.sql` |
| P5-7 | `scripts/verify-website-copilot-phase5.mjs` |

## 3. Out of scope (future)

- Dedicated chat session REST endpoint (Phase 1 R1 unchanged)
- Autonomous multi-step planners / DAG execution
- Cross-product auto-execution on linked generations

---

## 4. API extensions (backward compatible)

```typescript
{
  // ...existing fields...
  sessionId?: string;           // enables memory when set
  useMemory?: boolean;          // default true when sessionId present
  includeReview?: boolean;      // default false
  linkedAppGenerationId?: string; // website cross-product hint
  linkedWebsiteGenerationId?: string; // app cross-product hint
}
```

Success response extensions:

```typescript
{
  review?: CopilotReviewResult;
  memoryTurnCount?: number;
  crossProductSplit?: {
    websiteCommand?: string;
    appCommand?: string;
    linkedGenerationId?: string;
  };
  thread?: CopilotChatTurn[]; // echo for client sync when sessionId set
}
```

---

## 5. Memory Engine

- Table `copilot_session_memory` scoped by `(user_id, product_id, generation_id, session_id)`
- Max 10 turns per session (kernel constant)
- `enrichCommandWithMemory(command, turns)` prepends concise prior context
- Appends user + assistant turns after each command when `sessionId` set

---

## 6. Review Engine

- `includeReview: true` runs product review after successful mutation
- Website: L1 validation + `suggestWebsiteImprovements`
- App: `runAppQualityChecks`
- Returns `{ score, grade, summary, recommendations }`

---

## 7. Cross-product compound commands

When command references both website and app intents:

- Returns advisory with `crossProductSplit` containing per-product sub-commands
- Does not auto-execute on linked generation (advisory only in Phase 5)
- Capability: `website.advisory.cross-product` / `app.advisory.cross-product`

---

## 8. Chat UI

- Toggle **Chat view** in Copilot panels
- Renders user/assistant thread from hook state + server memory echo
- Still uses `POST .../copilot/commands` / `stream` (no new chat endpoint)

---

## 9. Acceptance criteria

- [ ] Memory persists when `sessionId` provided; omitted = Phase 1–4 behavior
- [ ] `includeReview: true` returns review on mutations
- [ ] Cross-product commands return split advisory
- [ ] Chat thread UI in website + app Copilot panels
- [ ] Phase 1–4 verify scripts pass
- [ ] `verify-website-copilot-phase5.mjs` passes

---

**End of specification.**
