# Builder Lifecycle (Phase 6)

```mermaid
sequenceDiagram
  participant User
  participant Orchestrator
  participant TBDP as tbdp-wiring
  participant Adapter as website-builder adapter
  participant Template as apply-structure-template
  participant Preview as build-static-preview

  User->>Orchestrator: generateWebsite()
  Orchestrator->>TBDP: wireWebsiteGenerationStart()
  TBDP-->>Orchestrator: settingsPatch + suggestedComponents
  Orchestrator->>Adapter: layerRunner (brief with TBDP metadata)
  Adapter->>TBDP: applyTbdpToDesignSystem() in runDesign
  Orchestrator-->>User: project + TBDP settings

  User->>Template: applyStructureTemplateToProject()
  Template->>TBDP: wireTemplateApply()
  TBDP-->>Template: sector DNA settings patch

  User->>Preview: buildStaticPreviewHtml()
  Preview->>TBDP: wirePreviewContext()
  TBDP-->>Preview: unified design context + CSS layer
```

## Phases

| Phase | Hook | File |
|-------|------|------|
| Pre-generation | `wireWebsiteGenerationStart` | `orchestrator.ts` |
| Brief enrichment | `wireBriefMetadata` | `website-builder.ts` |
| Design | `applyTbdpToDesignSystem` | `website-builder.ts` |
| Template apply | `wireTemplateApply` | `apply-structure-template.ts` |
| Persist | `validateWebsiteAgainstTbdp` | `save-generation.ts` |
| Preview | `wirePreviewContext` | `build-static-preview.server.ts` |
