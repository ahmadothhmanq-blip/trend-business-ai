# Historical Phase Reports (Read-Only)

**Policy:** Root `*_REPORT.md` files are **historical** (D-002). Living planning truth is under `docs/`.  
**Do not** treat these as the active task queue or architecture plan.  
**Files stay at repo root** so existing cross-links keep working.

---

## Index

| Report | Topic |
|--------|--------|
| [SECURITY_AUDIT_PHASE18.md](../SECURITY_AUDIT_PHASE18.md) | Phase 18 security audit |
| [PERFORMANCE_REPORT_PHASE19.md](../PERFORMANCE_REPORT_PHASE19.md) | Phase 19 performance work |
| [PHASE19_RELEASE_CANDIDATE_REPORT.md](../PHASE19_RELEASE_CANDIDATE_REPORT.md) | Phase 19 RC checklist |
| [QA_REPORT_PHASE20.md](../QA_REPORT_PHASE20.md) | Phase 20 QA (migration-focused) |
| [PHASE20_FUNCTIONAL_QA_REPORT.md](../PHASE20_FUNCTIONAL_QA_REPORT.md) | Phase 20 functional QA |
| [GROWTH_ENGINE_REPORT.md](../GROWTH_ENGINE_REPORT.md) | Phase 21 growth engine |
| [PHASE22_AI_SEARCH_REPORT.md](../PHASE22_AI_SEARCH_REPORT.md) | Phase 22 AI Search |
| [SEO_ENGINE_REPORT.md](../SEO_ENGINE_REPORT.md) | SEO engine module |
| [ENTERPRISE_AUDIT_REPORT.md](../ENTERPRISE_AUDIT_REPORT.md) | Enterprise-wide audit |
| [PRODUCTION_AUDIT_REPORT.md](../PRODUCTION_AUDIT_REPORT.md) | Production readiness |
| [DEEPSEEK_AUDIT_REPORT.md](../DEEPSEEK_AUDIT_REPORT.md) | DeepSeek integration audit |
| [FIX_REPORT.md](../FIX_REPORT.md) | Profile / API fix notes |
| [FUNCTIONAL_TEST_REPORT.md](../FUNCTIONAL_TEST_REPORT.md) | Functional test run |
| [REAL_GENERATION_FIX_REPORT.md](../REAL_GENERATION_FIX_REPORT.md) | Generation runaway mitigation |

---

## Related ops docs (not archives)

| Doc | Role |
|-----|------|
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Deployment runbook |
| [MASTER_PROJECT_DOCUMENTATION.md](../MASTER_PROJECT_DOCUMENTATION.md) | Full system reference |
| [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) | Phase 1 audit (in `docs/`) |

---

## Agent guidance

1. Prefer `TASK_QUEUE.md` + `PROJECT_STATUS.md` + `DECISIONS_LOG.md` for current work.  
2. Open a historical report only when re-auditing a past phase or tracing why a fix landed.  
3. If a report conflicts with `docs/`, **re-verify code**, then update `docs/` — do not invent features from old reports.
