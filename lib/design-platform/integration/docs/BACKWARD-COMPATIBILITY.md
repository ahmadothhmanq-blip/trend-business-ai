# TBDP Phase 5 — Backward Compatibility

## Guarantee

Phase 5 is **purely additive**. No breaking changes.

| System | Status |
|--------|--------|
| V1 templates | Continue working unchanged |
| V2 templates | Continue working unchanged |
| Website Builder routing | Unmodified |
| Template apply paths | Unmodified |
| `lib/ai-core/website-design-platform` | Unmodified — parallel system |

## Integration Pattern

Website code **may** import from `@/lib/design-platform/integration` at lifecycle boundaries:

```ts
import { enrichBuilderInput, resolveTemplateBridge } from "@/lib/design-platform/integration";
```

If not imported, behavior is identical to pre-Phase 5.

## Project Settings

Optional keys (builder ignores unknown keys):

- `tbdpSectorDnaId`
- `tbdpDesignContextHash`
- `tbdpIntegrationVersion`

## Template Migration

**Not started.** Templates are not modified to read TBDP directly — the template bridge provides an advisory layer for future wiring.

## Visual Redesign

**None.** Phase 5 does not change any template visuals.
