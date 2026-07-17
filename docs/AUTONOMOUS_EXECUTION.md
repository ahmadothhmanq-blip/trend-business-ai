# Autonomous Project Execution Workflow

**Status:** Active (user-authorized 2026-07-17)  
**Branch:** `cursor/docs-ssot-audit-plan` (base: `main`)  
**Overrides:** `TASK_QUEUE.md` “wait for approval” and Constitution Art. VII §5 for **Pending Medium/Low** tasks only.

---

## Loop

For each next task in recommended order (`TASK_QUEUE.md`):

1. **Explain** — 1–3 sentences: goal, scope, risk  
2. **Implement** — surgical change; match existing patterns  
3. **Test** — relevant checks (`tsc`, targeted scripts, route smoke)  
4. **Document** — update `TASK_QUEUE.md` / `PROJECT_STATUS.md` / `DECISIONS_LOG.md` as needed  
5. **Commit** — scoped commit only (exclude unrelated WT)  
6. **Continue** — next task without asking

Push after each commit when remote tracking exists.

---

## Stop and ask (hard gates)

Do **not** auto-continue when the task requires:

| Gate | Examples |
|------|----------|
| Architecture / product promise | F01 Live Preview, F02 deploy, F09 hosted sites, L04 dual engines |
| Destructive ops | `migrate reset`, force-push, merge to `main` without explicit ask (L08) |
| Billing money path ambiguity | M06 credit fairness if refund semantics unclear |
| Missing secrets / external ops | M07 PayPal E2E, H06 cookie path if email confirm still blocks |
| Wide rename risk | L03 naming normalize — pause for plan if blast radius unclear |

Future (`F*`) tasks stay **Future** until a `DECISIONS_LOG.md` Accepted entry.

---

## Queue order (current)

1. M02 → M03 → M04 → M05  
2. M06 only if credit fail-path is clear and testable  
3. Skip M07 until PayPal + confirmed auth env  
4. L01, L07 (dead code) → L06 (docs archive) → L02 / L05 as capacity allows  
5. L03 / L04 / L08 / all `F*` — stop gates  

---

## Commit hygiene

- One task ID per commit when practical (`Complete M02: …`)  
- Never stage `.env*`, secrets, `.tmp/`, zip dumps, or unrelated WT  
- Update docs in the same commit as the task  

---

## Relation to Constitution

Articles I–VI, VIII–XI remain binding. This workflow only removes **between-task approval** for non-gated Pending work explicitly authorized by the user.
