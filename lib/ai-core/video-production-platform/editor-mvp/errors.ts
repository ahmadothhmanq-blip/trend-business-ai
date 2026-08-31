export class EditorMvpError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unauthorized"
      | "not_found"
      | "ownership"
      | "foreign_scene"
      | "foreign_plan"
      | "inactive_plan"
      | "no_active_plan"
      | "invalid_scene"
      | "last_scene"
      | "idempotency"
      | "invalid_trim"
      | "plan_mixing",
  ) {
    super(message);
    this.name = "EditorMvpError";
  }
}
