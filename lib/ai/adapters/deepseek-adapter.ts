import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";
import { normalizeOpenAIUsage } from "@/lib/ai/usage";
import { parseJsonResponse, withRetry } from "@/lib/ai/retry";

const DEEPSEEK_RETRY_DELAYS_MS = [2000, 4000, 8000] as const;
const DEFAULT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

async function createClient() {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing required environment variable: DEEPSEEK_API_KEY");
  }

  return new OpenAI({
    apiKey,
    baseURL: DEEPSEEK_BASE_URL,
  });
}

export class DeepSeekAdapter implements AIProvider {
  readonly name = "deepseek" as const;
  private lastUsage: TokenUsage | null = null;

  constructor(private readonly model = DEFAULT_MODEL) {}

  getLastUsage() {
    return this.lastUsage;
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
    const client = await createClient();

    return withRetry(
      async () => {
        const schemaHint = request.schema
          ? `\n\nRespond with JSON matching this schema:\n${JSON.stringify(request.schema, null, 2)}`
          : "";

        const response = await client.chat.completions.create({
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

        this.recordUsage(response.usage);
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("DeepSeek returned an empty response.");
        }

        return parseJsonResponse<T>(content);
      },
      { delaysMs: DEEPSEEK_RETRY_DELAYS_MS },
    );
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    const client = await createClient();

    return withRetry(
      async () => {
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
          throw new Error("DeepSeek returned an empty response.");
        }

        return content;
      },
      { delaysMs: DEEPSEEK_RETRY_DELAYS_MS },
    );
  }

  async streamText(request: StreamTextRequest): Promise<string> {
    const client = await createClient();
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
      throw new Error("DeepSeek returned an empty streamed response.");
    }

    return text;
  }
}

export function createDeepSeekAdapter(model = DEFAULT_MODEL) {
  return new DeepSeekAdapter(model);
}
