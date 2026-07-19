import { sseEncode } from "@/lib/workspace/persist";
import {
  SSE_HEARTBEAT_INTERVAL_MS,
} from "@/lib/ai/timeouts";
import { logger } from "@/lib/logger";

type SseSend = (event: string, data: unknown) => boolean;

/**
 * Create a safe SSE sender + heartbeat for long-running generation streams.
 * Heartbeat uses event "ping" (ignored by existing clients) to avoid idle proxy closes.
 */
export function createSseStreamHelpers(
  controller: ReadableStreamDefaultController<Uint8Array>,
  logContext = "wb-sse",
) {
  const encoder = new TextEncoder();
  let closed = false;
  let enqueueFailures = 0;

  const send: SseSend = (event, data) => {
    if (closed) return false;
    try {
      const payload = sseEncode(event, data);
      controller.enqueue(encoder.encode(payload));
      if (event !== "ping") {
        logger.info("SSE event enqueued", logContext, {
          event,
          bytes: payload.length,
        });
      }
      return true;
    } catch (error) {
      closed = true;
      enqueueFailures += 1;
      logger.error(
        "SSE stream close/error",
        logContext,
        {
          reason: "enqueue_failed_client_likely_disconnected",
          event,
          enqueueFailures,
        },
        error,
      );
      return false;
    }
  };

  const heartbeat = setInterval(() => {
    send("ping", { t: Date.now() });
  }, SSE_HEARTBEAT_INTERVAL_MS);

  const close = () => {
    if (closed) {
      logger.info("SSE stream close", logContext, {
        reason: "already_closed",
        enqueueFailures,
      });
      return;
    }
    closed = true;
    clearInterval(heartbeat);
    try {
      controller.close();
      logger.info("SSE stream close", logContext, {
        reason: "controller_close",
        enqueueFailures,
      });
    } catch (error) {
      logger.error(
        "SSE stream close/error",
        logContext,
        { reason: "controller_close_threw", enqueueFailures },
        error,
      );
    }
  };

  return { send, close, isClosed: () => closed };
}
