const SESSION_PREFIX = "wb-copilot-session-";

export function createCopilotSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function readCopilotSessionId(generationId: string | null): string | null {
  if (!generationId || typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(`${SESSION_PREFIX}${generationId}`);
  } catch {
    return null;
  }
}

export function persistCopilotSessionId(
  generationId: string | null,
  sessionId: string,
): void {
  if (!generationId || typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${generationId}`, sessionId);
  } catch {
    /* ignore */
  }
}

export function resolveCopilotSessionId(generationId: string | null): string {
  const existing = readCopilotSessionId(generationId);
  if (existing) return existing;
  const created = createCopilotSessionId();
  persistCopilotSessionId(generationId, created);
  return created;
}
