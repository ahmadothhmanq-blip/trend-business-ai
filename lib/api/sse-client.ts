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

  /** True when the read was aborted via AbortSignal. */

  aborted: boolean;

};



export type SseProgressMeta = {

  fileCount?: number;

  generationId?: string;

};



export type SseSessionMeta = {
  generationId: string;
  incrementalPreview?: boolean;
  generationProfile?: string;
};



export type SseReadOptions = {

  signal?: AbortSignal;

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



function isAbortError(error: unknown): boolean {

  if (!error) return false;

  if (error instanceof DOMException && error.name === "AbortError") return true;

  return error instanceof Error && error.name === "AbortError";

}



async function releaseSseReader(

  reader: ReadableStreamDefaultReader<Uint8Array>,

): Promise<void> {

  try {

    await reader.cancel();

  } catch {

    // Stream may already be closed.

  }

  try {

    reader.releaseLock();

  } catch {

    // Lock may already be released.

  }

}



export async function readSseStream<TComplete extends Record<string, unknown>>(

  response: Response,

  handlers: {

    onProgress: (

      message: string,

      progress: number | null,

      meta?: SseProgressMeta,

    ) => void;

    onComplete: (payload: TComplete) => Promise<void> | void;

    onError: (message: string) => void;

    /** Optional: session / generation id from early SSE events. */

    onSession?: (session: SseSessionMeta) => void;

  },

  options?: SseReadOptions,

): Promise<SseReadResult> {

  if (!response.body) {

    throw new Error("Streaming is not supported by this browser.");

  }



  const reader = response.body.getReader();

  const decoder = new TextDecoder();

  const signal = options?.signal;

  let buffer = "";

  let completed = false;

  let error: string | null = null;

  let generationId: string | null = null;

  let lastProgressMessage: string | null = null;

  let aborted = false;



  const onAbort = () => {

    aborted = true;

    void releaseSseReader(reader);

  };

  signal?.addEventListener("abort", onAbort, { once: true });



  const handlePayload = async (event: string, data: string) => {

    if (event === "ping") return;



    let payload: TComplete & {

      message?: string;

      progress?: number | null;

      error?: string;

      generationId?: string;

      fileCount?: number;

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

      if (event === "session") {

        handlers.onSession?.({

          generationId: id,

          incrementalPreview: payload.incrementalPreview === true,

          generationProfile:

            typeof payload.generationProfile === "string"

              ? payload.generationProfile

              : undefined,

        });

      } else {

        handlers.onSession?.({ generationId: id });

      }

    }



    if (event === "session" && id) {

      handlers.onProgress(

        payload.message ?? "Generation session started…",

        payload.progress ?? null,

        { generationId: id },

      );

      return;

    }



    if (event === "progress") {

      lastProgressMessage = payload.message ?? "Working...";

      const fileCount =

        typeof payload.fileCount === "number" ? payload.fileCount : undefined;

      handlers.onProgress(lastProgressMessage, payload.progress ?? null, {

        fileCount,

        generationId: id ?? undefined,

      });

      return;

    }



    if (event === "complete") {

      try {

        await handlers.onComplete(payload);

        completed = true;

      } catch (completeError) {

        // Server may have saved before the client applied the payload — allow DB recovery.

        error =

          completeError instanceof Error

            ? completeError.message

            : "Failed to apply completed generation.";

      }

      return;

    }



    if (event === "error") {

      error = payload.error ?? "Generation failed.";

      handlers.onError(error);

    }

  };



  try {

    while (true) {

      if (signal?.aborted) {

        aborted = true;

        break;

      }



      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });



      const chunks = buffer.split("\n\n");

      buffer = chunks.pop() ?? "";



      for (const chunk of chunks) {

        const parsed = parseSseChunk(chunk);

        if (!parsed) continue;

        await handlePayload(parsed.event, parsed.data);

        if ((error && !completed) || completed) {

          break;

        }

      }



      if ((error && !completed) || completed) {

        break;

      }

    }



    if (!completed && !error && !aborted) {

      const trailing = buffer.trim();

      if (trailing) {

        const parsed = parseSseChunk(trailing);

        if (parsed) {

          await handlePayload(parsed.event, parsed.data);

        }

      }

    }

  } catch (readError) {

    if (isAbortError(readError) || signal?.aborted) {

      aborted = true;

    } else if (!completed && !error) {

      error =

        readError instanceof Error

          ? readError.message

          : "Stream connection interrupted.";

    }

  } finally {

    signal?.removeEventListener("abort", onAbort);

    await releaseSseReader(reader);

  }



  return {

    completed,

    error,

    generationId,

    lastProgressMessage,

    endedEarly: !completed && !error && !aborted,

    aborted,

  };

}


