# Website Builder — Milestone Plan (SSOT)

**Document ID:** `WEBSITE_BUILDER_MILESTONES`  
**Version:** 1.0.0  
**Builds on:** Website Copilot Phases 0–5, `lib/website/platform`, visual editor

---

## Principles

1. Do not rewrite Website Copilot — extend only.
2. Reuse copilot-kernel, platform commit boundary, visual editor, management services.
3. One milestone at a time; verify before proceeding.
4. Business logic in `lib/website/builder/` services.

---

## Milestone map

| # | Milestone | Scope summary |
|---|-----------|---------------|
| **M1** | Unified Builder Workspace | Pages sidebar, workspace layout, canvas+copilot dock, autosave, local version history |
| **M2** | Design System & Tokens | Global design system panel, theme builder, typography/color tokens in builder |
| **M3** | Block system & DnD polish | Component blocks catalog UX, section templates, enhanced drag-drop |
| **M4** | AI generation surfaces | AI page/section/content/image/SEO generation UI in builder |
| **M5** | Professional features | Templates, blog, forms, booking, portfolio, pricing, FAQ, nav/footer builders |
| **M6** | Business features | E-commerce/membership foundation, CRM, analytics, marketing hooks |
| **M7** | Publishing & performance | Publish pipeline UI, domains, CDN, SSL, backup, SEO tools, a11y |
| **M8** | Enterprise | Collaboration, roles, white label, marketplace/plugin/API foundations |

---

## Milestone 1 — Unified Builder Workspace

### Deliverables

| ID | Deliverable |
|----|-------------|
| M1-1 | `lib/website/builder/` — structure, autosave, version-history services |
| M1-2 | `BuilderWorkspace` — pages sidebar + canvas + docked Copilot |
| M1-3 | Visual editor `chrome="workspace"` + imperative save API + autosave |
| M1-4 | Local version snapshots (restore) |
| M1-5 | Post-generation default tab → Canvas; Copilot apply stays on Canvas |
| M1-6 | `scripts/verify-website-builder-milestone1.mjs` |

### Acceptance criteria

- [x] Canvas tab renders unified workspace (pages + editor + copilot)
- [x] Pages list derived from blueprint structure
- [x] Section selection syncs between sidebar and visual editor
- [x] Autosave persists dirty canvas edits (debounced)
- [x] Version history stores/restores local snapshots
- [x] Copilot selection context still works from canvas
- [x] Phase 1–5 copilot verify scripts pass
- [x] `verify-website-builder-milestone1.mjs` passes
- [x] Build, typecheck, lint pass

### Out of scope (M2+)

- Design system / theme builder panels
- New AI generation endpoints
- Enterprise collaboration
- Database-backed version table (local only in M1)

---

**End of Milestone 1 specification.**

---

## Milestone 2 — Design System & Tokens (Phase 2)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M2-1 | `design-system.ts` — theme presets, spacing map, token resolver |
| M2-2 | `responsive.ts` — breakpoint SSOT |
| M2-3 | `DesignSystemPanel` — colors, typography, spacing, viewport |
| M2-4 | Visual editor imperative token/viewport API |

### Acceptance criteria

- [x] Theme presets apply to canvas tokens
- [x] Responsive viewport switching (desktop/tablet/mobile)
- [x] Design tool rail tab in unified workspace
- [x] Build, typecheck, lint pass

---

## Milestone 3 — Block system & DnD (Phase 3)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M3-1 | `blocks.ts` — marketplace-backed block catalog |
| M3-2 | `BlocksPanel` — searchable insert UI |
| M3-3 | Section drag-reorder in sidebar + `moveSection` API |
| M3-4 | `BuilderToolRail` — structure/design/blocks navigation |

### Acceptance criteria

- [x] Block library lists reusable components
- [x] Insert block via visual editor handle
- [x] Section reorder via drag-and-drop
- [x] Build, typecheck, lint pass

---

## Milestone 4 — AI Builder surfaces (Phase 4)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M4-1 | `ai-builder.ts` — action catalog mapped to Copilot commands |
| M4-2 | `AiBuilderPanel` — one-click AI generation actions |
| M4-3 | Commands routed through existing `/edit` + Copilot pipeline |

### Acceptance criteria

- [x] AI actions panel in workspace tool rail
- [x] Actions invoke website edit/Copilot flow
- [x] Website Copilot Phases 0–5 unchanged
- [x] Build, typecheck, lint pass

---

## Milestone 5 — Professional features (Phase 5)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M5-1 | `professional.ts` — feature catalog (blog, forms, FAQ, etc.) |
| M5-2 | `ProfessionalPanel` — links to management + Copilot shortcuts |

### Acceptance criteria

- [x] Professional features surfaced in builder
- [x] Deep links to site management dashboard
- [x] Build, typecheck, lint pass

---

## Milestone 6 — Business features (Phase 6)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M6-1 | `business.ts` — ecommerce, CRM, analytics catalog |
| M6-2 | `BusinessHubPanel` — workspace tab hooks |

### Acceptance criteria

- [x] Business hub panel with analytics/experiments navigation
- [x] Reuses existing management + analytics infrastructure
- [x] Build, typecheck, lint pass

---

## Milestone 7 — Publishing & performance (Phase 7)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M7-1 | `publishing.ts` — checklist + a11y heuristics |
| M7-2 | `PublishingHubPanel` — deploy + backup UX |
| M7-3 | `website_builder_snapshots` table + snapshots API |
| M7-4 | Migration `078_website_builder_extensions.sql` |

### Acceptance criteria

- [x] Publishing checklist visible in builder
- [x] Server backup endpoint
- [x] Deploy dashboard deep link
- [x] Build, typecheck, lint pass

---

## Milestone 8 — Enterprise (Phase 8)

### Deliverables

| ID | Deliverable |
|----|-------------|
| M8-1 | `enterprise.ts` — roles, permissions, capabilities |
| M8-2 | `EnterprisePanel` — team invite UI |
| M8-3 | `website_generation_members` table + members API |

### Acceptance criteria

- [x] Role model (owner/editor/viewer)
- [x] Collaborator invite API
- [x] Enterprise capabilities catalog in UI
- [x] Build, typecheck, lint pass

---

**Verification:** `scripts/verify-website-builder-phases.mjs`

**End of Website Builder milestone specification (M1–M8).**
