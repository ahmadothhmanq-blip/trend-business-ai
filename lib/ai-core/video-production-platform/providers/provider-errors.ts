/**
 * Honest provider HTTP error classification. Never logs secrets.
 */

export type ProviderErrorCode =
  | "quota_exhausted"
  | "permissions"
  | "invalid_request"
  | "wrong_model_or_endpoint"
  | "provider_degraded"
  | "provider_timeout"
  | "provider_failed"
  | "unconfigured";

export type ClassifiedProviderError = {
  httpStatus: number | null;
  providerCode: string | null;
  providerStatus: string | null;
  message: string;
  errorCode: ProviderErrorCode;
  retryable: boolean;
};

const SECRET_RE = /(AIza[0-9A-Za-z_-]{8,}|sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+)/gi;

export function redactProviderText(text: string, max = 400): string {
  return text.replace(SECRET_RE, "[REDACTED]").slice(0, max);
}

export function parseProviderErrorBody(body: string): {
  message?: string;
  code?: number | string;
  status?: string;
} {
  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    const nested = (json.error && typeof json.error === "object" ? json.error : json) as Record<
      string,
      unknown
    >;
    return {
      message: typeof nested.message === "string" ? nested.message : undefined,
      code: typeof nested.code === "number" || typeof nested.code === "string" ? nested.code : undefined,
      status: typeof nested.status === "string" ? nested.status : undefined,
    };
  } catch {
    return { message: body.trim() || undefined };
  }
}

export function classifyProviderHttpError(input: {
  httpStatus: number;
  body?: string;
}): ClassifiedProviderError {
  const parsed = parseProviderErrorBody(input.body || "");
  const statusToken = (parsed.status || "").toUpperCase();
  const message = redactProviderText(parsed.message || input.body || `HTTP ${input.httpStatus}`);
  const providerCode = parsed.code != null ? String(parsed.code) : String(input.httpStatus);

  if (input.httpStatus === 429 || statusToken === "RESOURCE_EXHAUSTED" || /quota|billing/i.test(message)) {
    return {
      httpStatus: input.httpStatus,
      providerCode,
      providerStatus: parsed.status || "RESOURCE_EXHAUSTED",
      message,
      errorCode: "quota_exhausted",
      retryable: false,
    };
  }
  if (input.httpStatus === 401 || input.httpStatus === 403 || statusToken === "PERMISSION_DENIED") {
    return {
      httpStatus: input.httpStatus,
      providerCode,
      providerStatus: parsed.status || "PERMISSION_DENIED",
      message,
      errorCode: "permissions",
      retryable: false,
    };
  }
  if (input.httpStatus === 404 || statusToken === "NOT_FOUND") {
    return {
      httpStatus: input.httpStatus,
      providerCode,
      providerStatus: parsed.status || "NOT_FOUND",
      message,
      errorCode: "wrong_model_or_endpoint",
      retryable: false,
    };
  }
  if (input.httpStatus === 400 || statusToken === "INVALID_ARGUMENT") {
    return {
      httpStatus: input.httpStatus,
      providerCode,
      providerStatus: parsed.status || "INVALID_ARGUMENT",
      message,
      errorCode: "invalid_request",
      retryable: false,
    };
  }
  if (input.httpStatus >= 500) {
    return {
      httpStatus: input.httpStatus,
      providerCode,
      providerStatus: parsed.status || "UNAVAILABLE",
      message,
      errorCode: "provider_degraded",
      retryable: true,
    };
  }
  return {
    httpStatus: input.httpStatus,
    providerCode,
    providerStatus: parsed.status || null,
    message,
    errorCode: "provider_failed",
    retryable: input.httpStatus >= 500,
  };
}

export function isRetryableProviderError(errorCode: string | null | undefined): boolean {
  return errorCode === "provider_degraded" || errorCode === "provider_timeout" || errorCode === "network";
}
