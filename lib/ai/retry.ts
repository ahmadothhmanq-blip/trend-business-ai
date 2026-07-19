export type RetryOptions = {
  maxAttempts?: number;
  delaysMs?: readonly number[];
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_DELAYS_MS = [800, 1600, 3200] as const;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isBillingOrAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; code?: number; message?: string };
  return (
    e.status === 401 ||
    e.status === 402 ||
    e.status === 403 ||
    e.message?.includes("Insufficient Balance") === true ||
    e.message?.includes("invalid_api_key") === true
  );
}

/** Network / stream disconnects that may succeed on retry. */
export function isStreamDisconnectError(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "object") {
    const e = error as {
      name?: string;
      status?: number;
      code?: string | number;
      message?: string;
      cause?: unknown;
    };

    const code = String(e.code ?? "").toUpperCase();
    const name = String(e.name ?? "");
    const message = String(e.message ?? "").toLowerCase();
    const causeMessage =
      e.cause && typeof e.cause === "object" && "message" in e.cause
        ? String((e.cause as { message?: string }).message ?? "").toLowerCase()
        : "";
    const hay = `${message} ${causeMessage}`;

    if (
      name === "AbortError" ||
      name === "APIConnectionError" ||
      name === "APIConnectionTimeoutError" ||
      code === "ECONNRESET" ||
      code === "ECONNABORTED" ||
      code === "ETIMEDOUT" ||
      code === "ENOTFOUND" ||
      code === "EPIPE" ||
      code === "EAI_AGAIN" ||
      code === "UND_ERR_SOCKET" ||
      code === "UND_ERR_CONNECT_TIMEOUT" ||
      code === "UND_ERR_HEADERS_TIMEOUT" ||
      code === "UND_ERR_BODY_TIMEOUT"
    ) {
      return true;
    }

    if (
      hay.includes("fetch failed") ||
      hay.includes("socket hang up") ||
      hay.includes("network") ||
      hay.includes("connection reset") ||
      hay.includes("connection error") ||
      hay.includes("connection refused") ||
      hay.includes("timed out") ||
      hay.includes("timeout") ||
      hay.includes("premature close") ||
      hay.includes("aborted") ||
      hay.includes("disconnected") ||
      (hay.includes("stream") && hay.includes("closed"))
    ) {
      return true;
    }

    // OpenAI SDK / HTTP transport timeouts
    if (e.status === 408 || e.status === 499 || e.status === 524 || e.status === 529) {
      return true;
    }
  }

  return false;
}

export function isRetryableError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  if (isBillingOrAuthError(error)) return false;

  if (error instanceof SyntaxError) return true;

  if (isStreamDisconnectError(error)) return true;

  const maybeError = error as {
    status?: number;
    code?: number;
    message?: string;
  };

  return (
    maybeError.status === 429 ||
    maybeError.status === 500 ||
    maybeError.status === 502 ||
    maybeError.status === 503 ||
    maybeError.status === 504 ||
    maybeError.code === 503 ||
    maybeError.message?.includes("503") === true ||
    maybeError.message?.includes("overloaded") === true
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const delaysMs = options.delaysMs ?? DEFAULT_DELAYS_MS;
  const shouldRetry = options.shouldRetry ?? isRetryableError;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = delaysMs[attempt];
      if (!shouldRetry(error, attempt) || delay === undefined) {
        throw error;
      }
      await wait(delay);
    }
  }

  throw lastError;
}

export function cleanJsonResponse(text: string) {
  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1);
  }

  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned;
}

function repairTruncatedJson(text: string): string {
  let opens = 0;
  let closes = 0;
  let bracketOpens = 0;
  let bracketCloses = 0;
  let inString = false;
  let escaped = false;

  for (const ch of text) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") opens++;
    else if (ch === "}") closes++;
    else if (ch === "[") bracketOpens++;
    else if (ch === "]") bracketCloses++;
  }

  if (inString) text += '"';
  while (bracketCloses < bracketOpens) {
    text += "]";
    bracketCloses++;
  }
  while (closes < opens) {
    text += "}";
    closes++;
  }

  return text;
}

export function parseJsonResponse<T>(text: string): T {
  const cleaned = cleanJsonResponse(text);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const repaired = repairTruncatedJson(cleaned);
    return JSON.parse(repaired) as T;
  }
}
