# EDS-007 — Quality Assurance & Self-Healing Engine

**Status:** Implemented  
**Version:** 1.0.0  
**Depends on:** EDS-001 (AKB), EDS-002 (PRE), EDS-003 (CIE), EDS-004 (DIE), EDS-005 (IIE), EDS-006 (SAIE)

## Objective

Centralize validation, monitoring, correction, and continuous improvement of every artifact produced throughout the Trend Business AI generation pipeline into a **Quality Assurance & Self-Healing Engine (QASHE)** with **Quality Knowledge Base (QKB)**, structured validation traces, and locked **QualitySpecification**. The engine evaluates the entire pipeline as a unified system before production approval. No downstream component may bypass or override QASHE.

## Architecture

```
All engine traces (PRE, CIE, DIE, IIE, SAIE) + files + artifacts
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Quality Assurance & Self-Healing (QASHE) │
│  lib/ai-core/quality-assurance/         │
└─────────────────────────────────────────┘
        │
        ├── QKB policy resolution
        ├── Cross-engine consistency validation
        ├── Architectural integrity (PRE trace)
        ├── Per-engine validation replay (CIE/DIE/IIE/SAIE)
        ├── Content, design, media, SEO, performance dimensions
        ├── Hallucination + duplicate + broken reference detection
        ├── Security + compliance scans
        ├── Confidence scoring + root cause analysis
        ├── Self-healing (safe accessibility auto-fix)
        ├── Remediation planning (human review when needed)
        └── QualitySpecification lock + production approval
        │
        ▼
QualitySpecification → qualityReport (backward-compatible)
```

## Module Structure

| File | Purpose |
|------|---------|
| `knowledge-base/catalog.ts` | QKB industry quality policies (SSOT) |
| `qashe-types.ts` | Trace, policy, QualitySpecification contracts |
| `policies.ts` | `resolveQualityPolicy()` — QKB + plan merge |
| `validate-pipeline.ts` | Cross-engine, artifact, and spec validation |
| `self-heal.ts` | `applySelfHealing()` — safe automated remediations |
| `build-spec.ts` | `buildQualitySpecification()` — unified validation |
| `qashe-engine.ts` | `runQualityAssuranceEngine()` — authoritative entry |
| `quality/report-internal.ts` | Dimension checks (no QASHE import — avoids cycles) |

## Integration Points

| Consumer | Integration |
|----------|-------------|
| `quality/report.ts` | `buildAutoQualityReport()` delegates to QASHE |
| `adapters/website-builder.ts` | Runs QASHE with full plan context; persists trace |
| `layers/runner.ts` | `finalizeQualityForPublish()` routes through QASHE with brief |

## Trace Contract

Persisted on brief at `qualityAssuranceTrace`, `qualitySpecification`, and `qualityAssuranceValidation`.

## Public API

```typescript
import {
  runQualityAssuranceEngine,
  resolveQualityPolicy,
  buildQualitySpecification,
  QUALITY_ASSURANCE_TRACE_KEY,
  QUALITY_SPECIFICATION_KEY,
} from "@/lib/ai-core/quality-assurance";
```

`buildAutoQualityReport()` remains backward-compatible (returns `CoreAutoQualityReport` via QASHE `qualityReport`).

## Verification

```bash
npm run type-check
npx tsx --test lib/ai-core/quality-assurance/quality-assurance-engine.test.ts
node scripts/verify-quality-assurance.mjs
node scripts/verify-seo-aeo-intelligence.mjs
node scripts/verify-image-intelligence.mjs
node scripts/verify-design-intelligence.mjs
node scripts/verify-content-intelligence.mjs
```

## Stage Gate Checklist (EDS-007)

- [x] Quality Knowledge Base (QKB) as SSOT for industry quality policies
- [x] Cross-engine consistency validation (PRE, CIE, DIE, IIE, SAIE traces)
- [x] Architectural integrity, content, design, image, SEO/AEO dimension validation
- [x] Hallucination, duplicate, and broken reference detection
- [x] Security and compliance validation
- [x] Confidence scoring and root cause analysis
- [x] Self-healing workflows (accessibility auto-fix)
- [x] Remediation planning with human-review flags
- [x] Provider-independent QualitySpecification with production approval
- [x] Structured decision traces with `knowledgeEntryId`
- [x] Website builder adapter integration with trace persistence
- [x] Backward-compatible `buildAutoQualityReport()`
- [x] Automated tests and architecture documentation

## Next Stage

**EDS-008** — Multi-Agent Orchestration Engine (see `docs/EDS-008_MULTI_AGENT_ORCHESTRATION.md`). Platform architecture complete after EDS-008 sign-off.
