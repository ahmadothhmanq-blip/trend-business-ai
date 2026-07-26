import { NextResponse } from "next/server";

/** Stable API error codes — clients map via `errors.api.*` translation keys. */
export const API_ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  MIGRATION_REQUIRED: "MIGRATION_REQUIRED",
  GENERATION_NOT_FOUND: "GENERATION_NOT_FOUND",
  VIDEO_NOT_FOUND: "VIDEO_NOT_FOUND",
  TEMPLATE_NOT_FOUND: "TEMPLATE_NOT_FOUND",
  CHECKOUT_FAILED: "CHECKOUT_FAILED",
  PAYMENT_INCOMPLETE: "PAYMENT_INCOMPLETE",
  INVALID_JSON: "INVALID_JSON",
  INVALID_PARAM: "INVALID_PARAM",
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  UNKNOWN_PROVIDER: "UNKNOWN_PROVIDER",
  LOAD_FAILED: "LOAD_FAILED",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiErrorBody = {
  error: string;
  code?: ApiErrorCode;
  details?: string;
};

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_INPUT: "Invalid input",
  NOT_FOUND: "Not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  RATE_LIMITED: "Too many requests",
  SERVER_ERROR: "Something went wrong",
  MIGRATION_REQUIRED: "Database migration required",
  GENERATION_NOT_FOUND: "Generation not found",
  VIDEO_NOT_FOUND: "Video not found",
  TEMPLATE_NOT_FOUND: "Template not found",
  CHECKOUT_FAILED: "Checkout failed",
  PAYMENT_INCOMPLETE: "Payment could not be completed",
  INVALID_JSON: "Invalid JSON body",
  INVALID_PARAM: "Invalid parameter",
  PROVIDER_UNAVAILABLE: "Provider is not available",
  UNKNOWN_PROVIDER: "Unknown provider",
  LOAD_FAILED: "Failed to load data",
};

export function apiErrorResponse(
  code: ApiErrorCode,
  status: number,
  message?: string,
  details?: string,
  extra?: Record<string, unknown>,
): NextResponse<ApiErrorBody & Record<string, unknown>> {
  return NextResponse.json(
    {
      error: message || DEFAULT_MESSAGES[code],
      code,
      ...(details ? { details } : {}),
      ...extra,
    },
    { status },
  );
}

export function apiValidationError(
  message?: string,
): NextResponse<ApiErrorBody> {
  return apiErrorResponse(
    API_ERROR_CODES.INVALID_INPUT,
    400,
    message || DEFAULT_MESSAGES.INVALID_INPUT,
  );
}

export function apiNotFoundError(
  code: ApiErrorCode = API_ERROR_CODES.NOT_FOUND,
  message?: string,
): NextResponse<ApiErrorBody> {
  return apiErrorResponse(code, 404, message);
}
