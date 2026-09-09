/**
 * Map Web App Builder / App Copilot API failures to localized user messages (client-safe).
 */

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export type WebappBuilderApiErrorInput = {
  status?: number;
  code?: string;
  message?: string;
  t: TranslateFn;
  p: TranslateFn;
};

const COPILOT_FALLBACK_PATTERNS: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /app copilot stream failed/i, key: "copilot.errors.streamFailed" },
  {
    pattern: /app copilot stream ended without a result/i,
    key: "copilot.errors.streamNoResult",
  },
  { pattern: /app copilot command failed/i, key: "copilot.errors.commandFailed" },
  { pattern: /app copilot undo failed/i, key: "copilot.errors.undoFailed" },
];

/**
 * Prefer stable i18n keys over raw API error strings for known billing/rate-limit cases.
 */
export function formatWebappBuilderApiError(
  input: WebappBuilderApiErrorInput,
): string {
  const { status, code, message, t, p } = input;

  if (
    status === 402 ||
    code === "INSUFFICIENT_CREDITS" ||
    /insufficient credits/i.test(message ?? "")
  ) {
    return t("errors.insufficientCredits");
  }

  if (
    status === 429 ||
    code === "RATE_LIMITED" ||
    /too many ai requests/i.test(message ?? "")
  ) {
    return t("errors.api.RATE_LIMITED");
  }

  if (status === 503 && code === "UNAVAILABLE") {
    return p("errors.requestFailed");
  }

  if (status === 401 || code === "UNAUTHORIZED") {
    return t("errors.unauthorized");
  }

  if (status === 403 || code === "FORBIDDEN") {
    return t("errors.forbidden");
  }

  if (status === 409 || code === "CONFLICT") {
    return p("copilot.errors.conflict");
  }

  if (status === 404 || code === "NOT_FOUND") {
    return p("copilot.errors.notFound");
  }

  for (const { pattern, key } of COPILOT_FALLBACK_PATTERNS) {
    if (pattern.test(message ?? "")) {
      return p(key);
    }
  }

  if (message?.trim()) return message.trim();
  if (status) return p("errors.requestFailed");
  return p("errors.actionFailed");
}
