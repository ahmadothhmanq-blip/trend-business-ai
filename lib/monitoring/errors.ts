/**
 * Error monitoring preparation (Phase 10).
 * Structured logging today; optional Sentry hook when DSN is configured later.
 */

import { logger } from "@/lib/logger";

export type MonitoredErrorContext = {
  area: string;
  userId?: string;
  productId?: string;
  path?: string;
  extra?: Record<string, unknown>;
};

/**
 * Capture an operational error for launch diagnostics.
 * When SENTRY_DSN is introduced, wire the SDK here without changing call sites.
 */
export function captureOperationalError(
  error: unknown,
  context: MonitoredErrorContext,
): void {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

  logger.error(message, context.area, {
    userId: context.userId,
    productId: context.productId,
    path: context.path,
    ...context.extra,
  }, error instanceof Error ? error : undefined);

  // Future: if (process.env.SENTRY_DSN) Sentry.captureException(error, { tags: … })
}

export function isErrorMonitoringConfigured() {
  return Boolean(
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
  );
}
