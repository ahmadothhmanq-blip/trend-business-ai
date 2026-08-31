export class ProviderRouterError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unconfigured"
      | "preview_rejected"
      | "capability_mismatch"
      | "no_eligible_provider"
      | "health"
      | "degraded"
      | "idempotency",
  ) {
    super(message);
    this.name = "ProviderRouterError";
  }
}
