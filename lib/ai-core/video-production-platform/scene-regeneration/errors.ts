export class SceneRegenerationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "scene_not_found"
      | "plan_not_found"
      | "foreign_project"
      | "foreign_plan"
      | "inactive_plan"
      | "invalid_scene_state"
      | "provider_unconfigured"
      | "provider_failed"
      | "artifact_invalid"
      | "duplicate_in_progress",
  ) {
    super(message);
    this.name = "SceneRegenerationError";
  }
}
