export class LipSyncError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unconfigured"
      | "invalid_artifact"
      | "ownership"
      | "idempotency"
      | "provider_failed"
      | "not_found"
      | "invalid_input",
  ) {
    super(message);
    this.name = "LipSyncError";
  }
}
