export type RetryOptions = {
  maxAttempts?: number;
  delaysMs?: readonly number[];
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_DELAYS_MS = [800, 1600, 3200] as const;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isServiceUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    status?: number;
    code?: number;
    message?: string;
  };

  return (
    maybeError.status === 503 ||
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
  const shouldRetry = options.shouldRetry ?? isServiceUnavailable;

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
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseJsonResponse<T>(text: string): T {
  return JSON.parse(cleanJsonResponse(text)) as T;
}
