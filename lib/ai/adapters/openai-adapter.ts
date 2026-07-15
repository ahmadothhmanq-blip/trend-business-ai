import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";
import { normalizeOpenAIUsage } from "@/lib/ai/usage";
import { parseJsonResponse, withRetry } from "@/lib/ai/retry";
import { withTiming } from "@/lib/perf/timing";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 120_000;

type OpenAIClient = Awaited<ReturnType<typeof createOpenAISdk>>;

async function createOpenAISdk() {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  return new OpenAI({
    apiKey,
    timeout: DEFAULT_TIMEOUT_MS,
    maxRetries: 0,
  });
}

export class OpenAIAdapter implements AIProvider {
  readonly name = "openai" as const;
  private lastUsage: TokenUsage | null = null;
  private clientPromise: Promise<OpenAIClient> | null = null;

  constructor(private readonly model = DEFAULT_MODEL) {}

  getLastUsage() {
    return this.lastUsage;
  }

  private getClient() {
    if (!this.clientPromise) {
      this.clientPromise = createOpenAISdk();
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

    return withTiming("openai.generateJson", () =>
      withRetry(async () => {
        const response = await client.chat.completions.create({
          model: this.model,
          temperature: request.temperature ?? 0.7,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                request.system ??
                "Return only valid JSON matching the requested structure.",
            },
            { role: "user", content: request.prompt },
          ],
        });

        this.recordUsage(response.usage);
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("OpenAI returned an empty response.");
        }

        return parseJsonResponse<T>(content);
      }),
    );
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    const client = await this.getClient();

    return withTiming("openai.generateText", () =>
      withRetry(async () => {
        const response = await client.chat.completions.create({
          model: this.model,
          temperature: request.temperature ?? 0.7,
          messages: [
            ...(request.system
              ? [{ role: "system" as const, content: request.system }]
              : []),
            { role: "user", content: request.prompt },
          ],
        });

        this.recordUsage(response.usage);
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("OpenAI returned an empty response.");
        }

        return content;
      }),
    );
  }

  async streamText(request: StreamTextRequest): Promise<string> {
    const client = await this.getClient();
    return withTiming("openai.streamText", async () => {
      const stream = await client.chat.completions.create({
        model: this.model,
        temperature: request.temperature ?? 0.7,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          ...(request.system
            ? [{ role: "system" as const, content: request.system }]
            : []),
          { role: "user", content: request.prompt },
        ],
      });

      let text = "";
      for await (const chunk of stream) {
        if (chunk.usage) {
          this.recordUsage(chunk.usage);
        }
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          text += delta;
          request.onChunk?.(delta);
        }
      }

      if (!text) {
        throw new Error("OpenAI returned an empty streamed response.");
      }

      return text;
    });
  }
}

export function createOpenAIAdapter(model = DEFAULT_MODEL) {
  return new OpenAIAdapter(model);
}
