/**
 * Browser SSE reader shared by workspace + Website Builder streams.
 */
export async function readSseStream<TComplete extends Record<string, unknown>>(
  response: Response,
  handlers: {
    onProgress: (message: string, progress: number | null) => void;
    onComplete: (payload: TComplete) => Promise<void> | void;
    onError: (message: string) => void;
  },
) {
  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      try {
        const payload = JSON.parse(data) as TComplete & {
          message?: string;
          progress?: number | null;
          error?: string;
        };

        if (event === "progress") {
          handlers.onProgress(payload.message ?? "Working...", payload.progress ?? null);
        } else if (event === "complete") {
          await handlers.onComplete(payload);
        } else if (event === "error") {
          handlers.onError(payload.error ?? "Generation failed.");
        }
      } catch {
        // ignore malformed event
      }
    }
  }
}
