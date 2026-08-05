# Integration Flow

## Lifecycle

```
1. wireWebsiteGenerationStart()     → TBDP design context
2. wireMasterPlanIntegration()      → Master Plan authority
   ├── runMasterPlanPipeline()      → TBGE analysis + build
   ├── validateBeforeGeneration()   → plan validation
   ├── validateContentTasks()       → copy-only LLM request
   ├── resolveGlsLanguageContext()  → GLS language context
   ├── buildLockedSpecFromMasterPlan() → TBGE locked spec
   └── masterPlanToLegacyWebsitePlan() → legacy adapter bridge
3. Route: TBGE or Legacy
4. TBGE: orchestrator.run({ spec: lockedSpec }) — skips TBGE v1 planner
5. Content Provider: executeContent() — copy only
6. Assembly + Composer
7. validateBeforeExport()
8. Merge settings: TBDP + GLS + Master Plan
```

## Flag

| Env | Effect |
|-----|--------|
| `WB_MASTER_PLAN=1` | Master Plan is planning authority |
| unset | Existing behavior unchanged |
