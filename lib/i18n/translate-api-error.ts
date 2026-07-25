import type { TranslateFn } from "@/lib/i18n/translate";
import type { ApiErrorBody, ApiErrorCode } from "@/lib/i18n/api-errors";

/**
 * Map API error responses to localized user-facing messages.
 * Falls back to server `error` string, then generic message.
 */
export function translateApiError(
  t: TranslateFn,
  payload: Partial<ApiErrorBody> | null | undefined,
  fallbackKey = "errors.api.SERVER_ERROR",
): string {
  if (!payload) return t(fallbackKey);

  const code = payload.code;
  if (code) {
    const key = `errors.api.${code}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }

  if (payload.error?.trim()) return payload.error.trim();
  return t(fallbackKey);
}

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && /^[A-Z_]+$/.test(value);
}

/**
 * Parse fetch response JSON and return localized error message.
 */
export async function readLocalizedApiError(
  t: TranslateFn,
  response: Response,
  fallbackKey = "errors.api.SERVER_ERROR",
): Promise<string> {
  try {
    const data = (await response.json()) as Partial<ApiErrorBody>;
    return translateApiError(t, data, fallbackKey);
  } catch {
    return t(fallbackKey);
  }
}
