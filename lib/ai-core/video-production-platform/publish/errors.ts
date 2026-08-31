export class VideoPublishError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_found"
      | "ownership"
      | "missing_plan"
      | "invalid_state"
      | "missing_artifact"
      | "invalid_artifact"
      | "qc_blocked"
      | "unconfigured",
  ) {
    super(message);
    this.name = "VideoPublishError";
  }
}
