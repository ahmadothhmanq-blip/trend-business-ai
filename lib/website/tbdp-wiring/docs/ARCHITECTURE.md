# TBDP Phase 6 — Website Builder Wiring Architecture

## Overview

Phase 6 wires the Website Builder lifecycle to TBDP as the official design source. All wiring is **additive** — identical behavior when TBDP signals are absent.

```
Website Builder Lifecycle
    ↓
lib/website/tbdp-wiring/     ← Phase 6 wiring module
    ↓
lib/design-platform/integration/  ← Phase 5 integration layer
    ↓
TBDP Phases 1–4 (Foundations, Components, Experience, Sector DNA)
```

## Wired Systems

| System | Hook Location | Wiring Function |
|--------|---------------|-----------------|
| Generation | `orchestrator.ts` | `wireWebsiteGenerationStart()` |
| Brief metadata | `website-builder.ts` | `wireBriefMetadata()` |
| Design system | `website-builder.ts` `runDesign` | `applyTbdpToDesignSystem()` |
| Template apply | `apply-structure-template.ts` | `wireTemplateApply()` |
| Save/persist | `save-generation.ts` | `validateWebsiteAgainstTbdp()` |
| Static preview | `build-static-preview.server.ts` | `wirePreviewContext()` |
| Live preview | `live-preview.ts` | settings pass-through |

## Design Context Lifecycle

1. **Pre-generation** — sector DNA resolved from industry/template
2. **Brief** — metadata stamped with `tbdpVisualAuthority`
3. **Design** — TBDP applies component palette and spacing
4. **Persist** — settings patch stored on project
5. **Preview** — same design context from settings

## Version

- Phase: `wiring-6`
- Version: `6.0.0`
