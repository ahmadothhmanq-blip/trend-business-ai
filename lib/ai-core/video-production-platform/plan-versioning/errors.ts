export class PlanVersioningError extends Error {
  constructor(
    message: string,
    readonly code:
      | "plan_not_found"
      | "foreign_plan"
      | "active_plan_delete"
      | "implicit_activate_rejected"
      | "persist_failed",
  ) {
    super(message);
    this.name = "PlanVersioningError";
  }
}
