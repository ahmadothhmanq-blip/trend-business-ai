export class AudioEngineError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unconfigured"
      | "invalid_audio"
      | "ownership"
      | "idempotency"
      | "mix_failed"
      | "provider_failed"
      | "not_found"
      | "ffmpeg_unavailable",
  ) {
    super(message);
    this.name = "AudioEngineError";
  }
}
