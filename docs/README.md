# Trend Business AI — Docs Index (SSOT)

Living documentation for the **existing** Trend Business AI project.  
**Last reviewed:** 2026-07-17  

| Document | Purpose |
|----------|---------|
| [../MASTER_PROJECT_DOCUMENTATION.md](../MASTER_PROJECT_DOCUMENTATION.md) | Full system reference (all features, flows, DB, AI, APIs) |
| [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) | Phase 1 complete audit |
| [PROJECT_MASTER_BLUEPRINT.md](./PROJECT_MASTER_BLUEPRINT.md) | Architecture & product map |
| [AI_DEVELOPMENT_CONSTITUTION.md](./AI_DEVELOPMENT_CONSTITUTION.md) | Rules for humans/agents |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Living status board |
| [TASK_QUEUE.md](./TASK_QUEUE.md) | Prioritized tasks |
| [DECISIONS_LOG.md](./DECISIONS_LOG.md) | Architecture/product decisions |
| [ROADMAP.md](./ROADMAP.md) | Phased implementation plan |
| [FINAL_REVIEW.md](./FINAL_REVIEW.md) | Docs validation summary |
| [AUTONOMOUS_EXECUTION.md](./AUTONOMOUS_EXECUTION.md) | Agent loop: explain → implement → test → commit → continue |

**How to use**

- **Day-to-day planning / agents:** start with `PROJECT_MASTER_BLUEPRINT.md` + `TASK_QUEUE.md` + `DECISIONS_LOG.md`.  
- **Autonomous execution:** follow `AUTONOMOUS_EXECUTION.md` + next Pending task in `TASK_QUEUE.md`.  
- **Deep onboarding / full inventory:** read `MASTER_PROJECT_DOCUMENTATION.md`.  
- **Docs health:** see `FINAL_REVIEW.md`.

**Rules**

1. Medium/Low Pending tasks may be implemented autonomously per `AUTONOMOUS_EXECUTION.md` (hard gates still apply).  
2. Inventories describe the **local working tree**; note WT vs HEAD gaps (D-011).  
3. Merge this docs branch to `main` when approved (task L08) so GitHub matches SSOT.
