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
    if (isJsonResponse(response)) {
      body = (await response.json()) as typeof body;
    }
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

export function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/json") || contentType.includes("+json")
  );
}

/** Parse a Website Builder API response once, with safe handling for HTML/error pages. */
export async function readWebsiteBuilderApiJson<T>(
  response: Response,
  options: {
    t: TranslateFn;
    wb: TranslateFn;
    /** Shown when the server returns HTML or another non-JSON body. */
    nonJsonMessage?: string;
  },
): Promise<T> {
  if (!isJsonResponse(response)) {
    const text = (await response.text()).trim();
    const looksLikeHtml =
      text.startsWith("<!DOCTYPE") ||
      text.startsWith("<html") ||
      text.startsWith("<");
    const routeMissing =
      response.status === 404 && looksLikeHtml;
    throw new Error(
      options.nonJsonMessage ??
        (routeMissing
          ? `Website Builder API route is unavailable (HTTP 404). Restart the dev server with: npm run dev:stop && npm run dev`
          : looksLikeHtml
            ? `Analysis API endpoint is missing or returned an error (HTTP ${response.status}).`
            : `Unexpected API response (HTTP ${response.status}).`),
    );
  }

  const body = (await response.json()) as T & {
    error?: string;
    code?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      formatWebsiteBuilderApiError({
        status: response.status,
        code: body.code,
        message: body.error ?? body.message,
        t: options.t,
        wb: options.wb,
      }),
    );
  }

  return body as T;
}
