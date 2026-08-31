export class DirectorError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid_input"
      | "llm_unconfigured"
      | "llm_failed"
      | "malformed_json"
      | "invalid_plan"
      | "persist_failed",
  ) {
    super(message);
    this.name = "DirectorError";
  }
}
