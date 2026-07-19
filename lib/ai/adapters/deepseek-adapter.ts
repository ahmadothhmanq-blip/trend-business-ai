import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";
import { normalizeOpenAIUsage } from "@/lib/ai/usage";
import {
  isRetryableError,
  isStreamDisconnectError,
  parseJsonResponse,
  withRetry,
} from "@/lib/ai/retry";
import { getDeepSeekTimeoutMs } from "@/lib/ai/timeouts";
import { logger } from "@/lib/logger";
import { withTiming } from "@/lib/perf/timing";

const DEEPSEEK_RETRY_DELAYS_MS = [2000, 4000, 8000] as const;
const DEFAULT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
/** Partial stream body long enough to treat a disconnect as recoverable content. */
const PARTIAL_STREAM_MIN_CHARS = 80;
const DS_LOG = "deepseek";

function summarizePrompt(prompt: string) {
  return {
    promptChars: prompt.length,
    promptPreview: prompt.slice(0, 80),
  };
}

type OpenAIClient = Awaited<ReturnType<typeof createDeepSeekSdk>>;

async function createDeepSeekSdk() {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing required environment variable: DEEPSEEK_API_KEY");
  }

  return new OpenAI({
    apiKey,
    baseURL: DEEPSEEK_BASE_URL,
    timeout: getDeepSeekTimeoutMs(),
    maxRetries: 0,
  });
}

export class DeepSeekAdapter implements AIProvider {
  readonly name = "deepseek" as const;
  private lastUsage: TokenUsage | null = null;
  private clientPromise: Promise<OpenAIClient> | null = null;

  constructor(private readonly model = DEFAULT_MODEL) {}

  getLastUsage() {
    return this.lastUsage;
  }

  private getClient() {
    if (!this.clientPromise) {
      this.clientPromise = createDeepSeekSdk();
    }
    return this.clientPromise;
  }

  private recordUsage(
    usage:
      | {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        }
      | null
      | undefined,
  ) {
    this.lastUsage = normalizeOpenAIUsage(usage);
  }

  async generateJson<T>(request: JsonGenerationRequest): Promise<T> {
    const client = await this.getClient();
    const reqId = `json-${Date.now().toString(36)}`;

    return withTiming("deepseek.generateJson", () =>
      withRetry(
        async () => {
          const schemaHint = request.schema
            ? `\n\nRespond with JSON matching this schema:\n${JSON.stringify(request.schema, null, 2)}`
            : "";

          logger.info("DeepSeek request start", DS_LOG, {
            reqId,
            mode: "generateJson",
            model: this.model,
            timeoutMs: getDeepSeekTimeoutMs(),
            ...summarizePrompt(request.prompt),
          });

          let response;
          try {
            response = await client.chat.completions.create({
              model: this.model,
              temperature: request.temperature ?? 0.7,
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content: `${request.system ?? "Return only valid JSON matching the requested structure."}${schemaHint}`,
                },
                { role: "user", content: request.prompt },
              ],
            });
          } catch (error) {
            logger.error(
              "DeepSeek request error",
              DS_LOG,
              {
                reqId,
                mode: "generateJson",
                disconnect: isStreamDisconnectError(error),
              },
              error,
            );
            throw error;
          }

          this.recordUsage(response.usage);
          const content = response.choices[0]?.message?.content;
          logger.info("DeepSeek response received", DS_LOG, {
            reqId,
            mode: "generateJson",
            contentChars: content?.length ?? 0,
            finishReason: response.choices[0]?.finish_reason ?? null,
            usage: response.usage ?? null,
          });
          if (!content) {
            throw new Error("DeepSeek returned an empty response.");
          }

          return parseJsonResponse<T>(content);
        },
        { delaysMs: DEEPSEEK_RETRY_DELAYS_MS },
      ),
    );
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    const client = await this.getClient();
    const reqId = `text-${Date.now().toString(36)}`;

    return withTiming("deepseek.generateText", () =>
      withRetry(
        async () => {
          logger.info("DeepSeek request start", DS_LOG, {
            reqId,
            mode: "generateText",
            model: this.model,
            timeoutMs: getDeepSeekTimeoutMs(),
            ...summarizePrompt(request.prompt),
          });

          let response;
          try {
            response = await client.chat.completions.create({
              model: this.model,
              temperature: request.temperature ?? 0.7,
              messages: [
                ...(request.system
                  ? [{ role: "system" as const, content: request.system }]
                  : []),
                { role: "user", content: request.prompt },
              ],
            });
          } catch (error) {
            logger.error(
              "DeepSeek request error",
              DS_LOG,
              {
                reqId,
                mode: "generateText",
                disconnect: isStreamDisconnectError(error),
              },
              error,
            );
            throw error;
          }

          this.recordUsage(response.usage);
          const content = response.choices[0]?.message?.content;
          logger.info("DeepSeek response received", DS_LOG, {
            reqId,
            mode: "generateText",
            contentChars: content?.length ?? 0,
            finishReason: response.choices[0]?.finish_reason ?? null,
          });
          if (!content) {
            throw new Error("DeepSeek returned an empty response.");
          }

          return content;
        },
        { delaysMs: DEEPSEEK_RETRY_DELAYS_MS },
      ),
    );
  }

  async streamText(request: StreamTextRequest): Promise<string> {
    const client = await this.getClient();
    const reqId = `stream-${Date.now().toString(36)}`;
    return withTiming("deepseek.streamText", () =>
      withRetry(
        async () => {
          let text = "";
          let chunkCount = 0;
          try {
            logger.info("DeepSeek request start", DS_LOG, {
              reqId,
              mode: "streamText",
              model: this.model,
              timeoutMs: getDeepSeekTimeoutMs(),
              ...summarizePrompt(request.prompt),
            });

            const stream = await client.chat.completions.create({
              model: this.model,
              temperature: request.temperature ?? 0.7,
              stream: true,
              messages: [
                ...(request.system
                  ? [{ role: "system" as const, content: request.system }]
                  : []),
                { role: "user", content: request.prompt },
              ],
            });

            logger.info("DeepSeek response received", DS_LOG, {
              reqId,
              mode: "streamText",
              phase: "stream_opened",
            });

            for await (const chunk of stream) {
              if (chunk.usage) {
                this.recordUsage(chunk.usage);
              }
              const delta = chunk.choices[0]?.delta?.content ?? "";
              if (delta) {
                text += delta;
                chunkCount += 1;
                if (chunkCount === 1 || chunkCount % 25 === 0) {
                  logger.info("DeepSeek stream chunks received", DS_LOG, {
                    reqId,
                    chunkCount,
                    textChars: text.length,
                    lastDeltaChars: delta.length,
                  });
                }
                request.onChunk?.(delta);
              }
            }

            logger.info("DeepSeek stream close", DS_LOG, {
              reqId,
              mode: "streamText",
              chunkCount,
              textChars: text.length,
              reason: "iterator_done",
            });
          } catch (error) {
            logger.error(
              "DeepSeek stream error",
              DS_LOG,
              {
                reqId,
                mode: "streamText",
                chunkCount,
                textChars: text.length,
                disconnect: isStreamDisconnectError(error),
              },
              error,
            );
            // Mid-stream disconnect: keep usable partial output instead of failing the whole generation.
            if (
              text.trim().length >= PARTIAL_STREAM_MIN_CHARS &&
              isStreamDisconnectError(error)
            ) {
              logger.warn("DeepSeek stream close", DS_LOG, {
                reqId,
                mode: "streamText",
                reason: "disconnect_partial_kept",
                textChars: text.length,
              });
              return text;
            }
            throw error;
          }

          if (!text) {
            throw new Error("DeepSeek returned an empty streamed response.");
          }

          return text;
        },
        {
          delaysMs: DEEPSEEK_RETRY_DELAYS_MS,
          shouldRetry: (error) =>
            isRetryableError(error) || isStreamDisconnectError(error),
        },
      ),
    );
  }
}

export function createDeepSeekAdapter(model = DEFAULT_MODEL) {
  return new DeepSeekAdapter(model);
}
