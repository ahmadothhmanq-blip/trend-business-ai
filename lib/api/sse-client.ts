/**
 * Browser SSE reader shared by workspace + Website Builder streams.
 * Resilient to disconnects: flushes trailing buffer, ignores heartbeats,
 * and returns structured status so callers can poll/recover.
 */

export type SseReadResult = {
  completed: boolean;
  error: string | null;
  /** Last generation id seen in progress/session/complete payloads. */
  generationId: string | null;
  lastProgressMessage: string | null;
  /** True when the transport closed without a terminal complete/error event. */
  endedEarly: boolean;
};

function extractGenerationId(payload: Record<string, unknown>): string | null {
  const direct = payload.generationId;
  if (typeof direct === "string" && direct.length > 0) return direct;
  const generation = payload.generation;
  if (generation && typeof generation === "object" && "id" in generation) {
    const id = (generation as { id?: unknown }).id;
    if (typeof id === "string" && id.length > 0) return id;
  }
  return null;
}

function parseSseChunk(chunk: string): { event: string; data: string } | null {
  const lines = chunk.split("\n");
  let event = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  if (!dataLines.length) return null;
  return { event, data: dataLines.join("\n") };
}

export async function readSseStream<TComplete extends Record<string, unknown>>(
  response: Response,
  handlers: {
    onProgress: (message: string, progress: number | null) => void;
    onComplete: (payload: TComplete) => Promise<void> | void;
    onError: (message: string) => void;
    /** Optional: session / generation id from early SSE events. */
    onSession?: (generationId: string) => void;
  },
): Promise<SseReadResult> {
  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  let error: string | null = null;
  let generationId: string | null = null;
  let lastProgressMessage: string | null = null;

  const handlePayload = async (event: string, data: string) => {
    if (event === "ping") return;

    let payload: TComplete & {
      message?: string;
      progress?: number | null;
      error?: string;
      generationId?: string;
    };
    try {
      payload = JSON.parse(data) as typeof payload;
    } catch {
      // Ignore malformed fragments; next chunk may complete the JSON.
      return;
    }

    const id = extractGenerationId(payload as Record<string, unknown>);
    if (id) {
      generationId = id;
      handlers.onSession?.(id);
    }

    if (event === "session" && id) {
      handlers.onProgress(
        payload.message ?? "Generation session started…",
        payload.progress ?? null,
      );
      return;
    }

    if (event === "progress") {
      lastProgressMessage = payload.message ?? "Working...";
      handlers.onProgress(lastProgressMessage, payload.progress ?? null);
      return;
    }

    if (event === "complete") {
      completed = true;
      await handlers.onComplete(payload);
      return;
    }

    if (event === "error") {
      error = payload.error ?? "Generation failed.";
      handlers.onError(error);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const parsed = parseSseChunk(chunk);
        if (!parsed) continue;
        await handlePayload(parsed.event, parsed.data);
        if (error && !completed) {
          // Stop reading after a terminal error — recovery may still poll.
          try {
            await reader.cancel();
          } catch {
            // ignore
          }
          return {
            completed,
            error,
            generationId,
            lastProgressMessage,
            endedEarly: false,
          };
        }
      }
    }

    // Flush trailing buffer (last event sometimes arrives without trailing \n\n).
    const trailing = buffer.trim();
    if (trailing) {
      const parsed = parseSseChunk(trailing);
      if (parsed) {
        await handlePayload(parsed.event, parsed.data);
      }
    }
  } catch (readError) {
    if (!completed && !error) {
      error =
        readError instanceof Error
          ? readError.message
          : "Stream connection interrupted.";
    }
  }

  return {
    completed,
    error,
    generationId,
    lastProgressMessage,
    endedEarly: !completed && !error,
  };
}
