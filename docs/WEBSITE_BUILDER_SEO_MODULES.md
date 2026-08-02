# Website Builder SEO Modules

SEO functionality is split by **lifecycle phase**. Import from `@/lib/website/seo` for a single facade, or from the underlying module when extending a specific engine.

| Phase | Module | Entry | When |
|-------|--------|-------|------|
| **Generation** | `seo-aeo-intelligence` | `runSeoAeoIntelligenceEngine` | Adapter `runSeo` — SAIE agent |
| **Core package** | `seo` | `buildSeoPackageFromStrategy` | LayerRunner SEO layer fallback |
| **Finalize** | `seo-performance` | `runSeoPerformanceEngine` | Adapter `finalize` stack |
| **Dashboard** | `seo-agent` | `runSeoAgent` | Post-publish SEO panel API |
| **Dashboard** | `seo-analysis` | `runSeoAnalysis` | Intelligence / audit routes |
| **Dashboard** | `seo-optimizer` | `runSeoOptimizer` | Apply SEO improvements via platform |

## Rules

1. **Do not merge modules** — each serves a distinct lifecycle; the facade provides discoverability only.
2. **Generation path** uses SAIE + core `seo` package; dashboard tools use `seo-agent` / `seo-analysis` / `seo-optimizer`.
3. **Validation** for generation delivery is Rung 3 in [WEBSITE_BUILDER_VALIDATION_LADDER.md](./WEBSITE_BUILDER_VALIDATION_LADDER.md).

## Import

```typescript
import {
  runSeoAeoIntelligenceEngine,
  buildSeoPackageFromStrategy,
  runSeoAgent,
} from "@/lib/website/seo";
```
