# Website Copilot — Phase 2 Specification (SSOT)

**Document ID:** `WEBSITE_COPILOT_PHASE2`  
**Version:** 1.0.0  
**Status:** Approved — single source of truth for implementation  
**Builds on:** Phase 0 (`lib/website/platform/`), Phase 1 (`lib/ai-core/website-copilot/`)

---

## 1. Purpose

Phase 2 extends Website Copilot with **structure/SEO/image commands**, **visual-editor selection context**, **management assistant delegation**, and **client in-memory undo (5 deep)** — without changing the Phase 1 command API shape or breaking existing routes.

---

## 2. Scope (Phase 2 deliverables)

| # | Deliverable |
|---|-------------|
| P2-1 | Capability `website.page.add` → `executeWebsiteStructureMutation` (`pages.create`) |
| P2-2 | Capability `website.image.replace.all` → `executeWebsiteEdit` (AI continue) |
| P2-3 | Capability `website.seo.improve` → `executeWebsiteSeoImprove` (top SEO fix) |
| P2-4 | Capabilities `website.manage.catalog`, `website.manage.cms` → structure service |
| P2-5 | `selectionContext` on Copilot API; enriches command server-side |
| P2-6 | Visual selection badge in `CopilotCommandPanel` |
| P2-7 | Management dashboard assistant tab delegates to Copilot API |
| P2-8 | In-memory undo stack (5 deep) + `POST .../copilot/undo` |
| P2-9 | `scripts/verify-website-copilot-phase2.mjs` |

## 3. Out of scope (Phase 3+)

- LLM intent classifier, `copilot/stream`, idempotency TTL, compound-command auto-split

---

## 4. API extensions

### 4.1 `POST .../copilot/commands` — extended request

```typescript
{
  command: string;
  expectedRevision?: number;
  idempotencyKey?: string;
  applyAi?: boolean;
  selectionContext?: {
    source?: "visual-editor" | "none";
    nodeId?: string;
    nodeLabel?: string;
    sectionKind?: string;
    componentExportName?: string;
  };
}
```

### 4.2 `POST .../copilot/undo` — new

```typescript
{
  snapshot: { project: GeneratedWebsiteProject };
  expectedRevision?: number;
}
```

Response: same success shape as commands (`mutated: true`, `capability: "website.copilot.undo"`).

---

## 5. Capability catalog (Phase 2 additions)

| URI | Tier | Executor | Example |
|-----|------|----------|---------|
| `website.page.add` | local | structure | "Add an About page" |
| `website.image.replace.all` | ai-continue | ai-continue | "Replace all images" |
| `website.seo.improve` | ai-continue | seo | "Improve SEO" |
| `website.manage.catalog` | local | structure | "Add a new service to the catalog" |
| `website.manage.cms` | local | structure | "Add a blog post to CMS" |

Phase 1 capabilities unchanged.

### 5.1 Router priority (insert before color rule)

| Priority | Pattern | URI |
|----------|---------|-----|
| P2-6 | `/improve.*seo|seo.*improve|fix.*seo|optimize.*seo/i` | `website.seo.improve` |
| P2-7 | `/replace.*(all )?(images|photos)|refresh.*(images|photos)/i` | `website.image.replace.all` |
| P2-8 | `/add.*(page|about|contact|services|pricing)|create.*page/i` | `website.page.add` |
| P2-9 | `/cms|blog post|add.*article|publish.*post/i` | `website.manage.cms` |
| P2-10 | `/catalog|add.*(service|product|menu)|update.*price/i` | `website.manage.catalog` |

Compound detection: unchanged (multiple distinct URIs → advisory).

---

## 6. Acceptance criteria

- [ ] Five Phase 2 capabilities route correctly
- [ ] Structure + SEO paths use `website.copilot.command` operation
- [ ] Selection context enriches commands when provided
- [ ] Management assistant tab uses Copilot API
- [ ] Undo stack (5) + undo endpoint restores prior snapshot
- [ ] Phase 1 commands and tests still pass
- [ ] `verify-website-copilot-phase2.mjs` passes

---

## 7. Implementation order

1. Types + selection-context + router + composer extensions  
2. Executors: structure, seo; seo-service `executeWebsiteSeoImprove`  
3. Processor + undo module + undo route  
4. API schema + rate-limit updates  
5. UI: selection badge, undo, Phase 2 chips  
6. Management dashboard delegation  
7. `verify-website-copilot-phase2.mjs`
