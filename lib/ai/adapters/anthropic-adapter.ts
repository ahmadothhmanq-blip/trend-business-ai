import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";
import { parseJsonResponse, withRetry } from "@/lib/ai/retry";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
};

function getApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return apiKey;
}

async function callAnthropic(body: Record<string, unknown>) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  return (await response.json()) as AnthropicResponse;
}

function extractText(response: AnthropicResponse) {
  const text = response.content?.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("Anthropic returned an empty response.");
  }
  return text;
}

export class AnthropicAdapter implements AIProvider {
  readonly name = "anthropic" as const;
  private lastUsage: TokenUsage | null = null;

  constructor(private readonly model = DEFAULT_MODEL) {}

  getLastUsage() {
    return this.lastUsage;
  }

  private recordUsage(usage: AnthropicResponse["usage"]) {
    if (!usage) {
      this.lastUsage = null;
      return;
    }
    const promptTokens = usage.input_tokens ?? 0;
    const completionTokens = usage.output_tokens ?? 0;
    this.lastUsage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  async generateJson<T>(request: JsonGenerationRequest): Promise<T> {
    return withRetry(async () => {
      const response = await callAnthropic({
        model: this.model,
        max_tokens: 8192,
        temperature: request.temperature ?? 0.7,
        system:
          request.system ?? "Return only valid JSON matching the requested structure.",
        messages: [{ role: "user", content: request.prompt }],
      });

      this.recordUsage(response.usage);
      return parseJsonResponse<T>(extractText(response));
    });
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    return withRetry(async () => {
      const response = await callAnthropic({
        model: this.model,
        max_tokens: 8192,
        temperature: request.temperature ?? 0.7,
        ...(request.system ? { system: request.system } : {}),
        messages: [{ role: "user", content: request.prompt }],
      });

      this.recordUsage(response.usage);
      return extractText(response);
    });
  }

  async streamText(request: StreamTextRequest): Promise<string> {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": getApiKey(),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        temperature: request.temperature ?? 0.7,
        stream: true,
        ...(request.system ? { system: request.system } : {}),
        messages: [{ role: "user", content: request.prompt }],
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`Anthropic stream error (${response.status}): ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: { type?: string; text?: string };
            message?: { usage?: { input_tokens?: number; output_tokens?: number } };
            usage?: { input_tokens?: number; output_tokens?: number };
          };
          if (event.type === "content_block_delta" && event.delta?.text) {
            text += event.delta.text;
            request.onChunk?.(event.delta.text);
          }
          if (event.message?.usage?.input_tokens) {
            inputTokens = event.message.usage.input_tokens;
          }
          if (event.usage?.output_tokens) {
            outputTokens = event.usage.output_tokens;
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }

    this.lastUsage = {
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
    };

    if (!text) {
      throw new Error("Anthropic returned an empty streamed response.");
    }

    return text;
  }
}

export function createAnthropicAdapter(model = DEFAULT_MODEL) {
  return new AnthropicAdapter(model);
}
