/**
 * Map Website Builder API failures to localized user messages (client-safe).
 */

type TranslateFn = (key: string) => string;

export type WebsiteBuilderApiErrorInput = {
  status?: number;
  code?: string;
  message?: string;
  t: TranslateFn;
  wb: TranslateFn;
};

/**
 * Prefer stable i18n keys over raw API error strings for known billing/rate-limit cases.
 */
export function formatWebsiteBuilderApiError(
  input: WebsiteBuilderApiErrorInput,
): string {
  const { status, code, message, t, wb } = input;

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
    return wb("errors.api");
  }

  if (status === 401 || code === "UNAUTHORIZED") {
    return t("errors.unauthorized");
  }

  if (status === 403 || code === "FORBIDDEN") {
    return t("errors.forbidden");
  }

  if (message?.trim()) return message.trim();
  if (status) return wb("errors.api");
  return wb("errors.generic");
}

export async function readWebsiteBuilderApiError(
  response: Response,
  t: TranslateFn,
  wb: TranslateFn,
): Promise<string> {
  let body: { error?: string; code?: string; message?: string } = {};
  try {
    body = (await response.json()) as typeof body;
  } catch {
    // ignore parse errors
  }
  return formatWebsiteBuilderApiError({
    status: response.status,
    code: body.code,
    message: body.error ?? body.message,
    t,
    wb,
  });
}
