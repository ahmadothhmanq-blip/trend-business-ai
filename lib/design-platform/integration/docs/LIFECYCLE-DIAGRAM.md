# Lifecycle Diagram

```mermaid
sequenceDiagram
  participant User
  participant Builder
  participant Lifecycle as TBDP Lifecycle
  participant AI as AI Bridge
  participant Template as Template Bridge
  participant TBDP as Design Resolver

  User->>Builder: Start generation
  Builder->>Lifecycle: preGeneration(input)
  Lifecycle->>TBDP: resolveDesignContext()
  TBDP-->>Lifecycle: DesignContext
  Lifecycle-->>Builder: enrichment (additive)

  User->>Builder: Select template
  Builder->>Lifecycle: templateSelected(input)
  Lifecycle->>Template: resolveTemplateBridge()
  Template->>TBDP: resolveDesignContext()
  TBDP-->>Template: DesignContext + CSS layer
  Template-->>Builder: advisory layer

  Builder->>Lifecycle: postApply(input)
  Note over Builder,Lifecycle: No routing change

  Builder->>Lifecycle: preview(input)
  Lifecycle-->>Builder: lifecycle event
```

## Phases

| Phase | Hook | Effect |
|-------|------|--------|
| `pre-generation` | `tbdpBuilderLifecycle.preGeneration()` | Enrich input with sector DNA metadata |
| `template-selected` | `tbdpBuilderLifecycle.templateSelected()` | Resolve template + TBDP advisory layer |
| `post-apply` | `tbdpBuilderLifecycle.postApply()` | Emit lifecycle event only |
| `preview` | `tbdpBuilderLifecycle.preview()` | Emit lifecycle event only |

All hooks are **opt-in**. Builder behavior is unchanged when hooks are not called.
