# Trend Business AI — Docs Index (SSOT)

Living documentation for the **existing** Trend Business AI project.  
**Last reviewed:** 2026-07-17  

| Document | Purpose |
|----------|---------|
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | **North star** — Core Product Principle (production tools, not code generators), hubs & phases |
| [../MASTER_PROJECT_DOCUMENTATION.md](../MASTER_PROJECT_DOCUMENTATION.md) | Full system reference (all features, flows, DB, AI, APIs) |
| [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) | Phase 1 complete audit |
| [PROJECT_MASTER_BLUEPRINT.md](./PROJECT_MASTER_BLUEPRINT.md) | Architecture & current product map |
| [AI_DEVELOPMENT_CONSTITUTION.md](./AI_DEVELOPMENT_CONSTITUTION.md) | Rules for humans/agents |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Living status board |
| [TASK_QUEUE.md](./TASK_QUEUE.md) | Prioritized tasks |
| [DECISIONS_LOG.md](./DECISIONS_LOG.md) | Architecture/product decisions (incl. D-015) |
| [ROADMAP.md](./ROADMAP.md) | Product phases + engineering execution track |
| [FINAL_REVIEW.md](./FINAL_REVIEW.md) | Docs validation summary |
| [AUTONOMOUS_EXECUTION.md](./AUTONOMOUS_EXECUTION.md) | Agent loop: explain → implement → test → commit → continue |
| [HISTORICAL_REPORTS.md](./HISTORICAL_REPORTS.md) | Index of root phase `*_REPORT.md` files (read-only) |
| [PERFORMANCE_BUDGETS.md](./PERFORMANCE_BUDGETS.md) | Dashboard bundle budgets (advisory / warn-only) |
| [PRODUCTION_CLEANUP_REPORT.md](./PRODUCTION_CLEANUP_REPORT.md) | Latest production cleanup results |
| [WEBSITE_BUILDER_PHASE1_REPORT.md](./WEBSITE_BUILDER_PHASE1_REPORT.md) | Website Builder Phase 1 product gaps completed / remaining |

**How to use**

- **Day-to-day planning / agents:** start with `PRODUCT_VISION.md` + `PROJECT_MASTER_BLUEPRINT.md` + `TASK_QUEUE.md` + `DECISIONS_LOG.md`.  
- **Autonomous execution:** follow `AUTONOMOUS_EXECUTION.md` + next Pending task in `TASK_QUEUE.md`.  
- **Deep onboarding / full inventory:** read `MASTER_PROJECT_DOCUMENTATION.md`.  
- **Historical phase reports:** see `HISTORICAL_REPORTS.md` (do not use as the active plan).  
- **Docs health:** see `FINAL_REVIEW.md`.

**Rules**

1. Medium/Low Pending tasks may be implemented autonomously per `AUTONOMOUS_EXECUTION.md` (hard gates still apply).  
2. Inventories describe the **local working tree**; note WT vs HEAD gaps (D-011).  
3. Merge this docs branch to `main` when approved (task L08) so GitHub matches SSOT.
