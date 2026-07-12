import type { AIProvider, JsonGenerationRequest, TextGenerationRequest } from "@/lib/ai/types";
import { parseJsonResponse, withRetry } from "@/lib/ai/retry";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
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

  constructor(private readonly model = DEFAULT_MODEL) {}

  async generateJson<T>(request: JsonGenerationRequest): Promise<T> {
    return withRetry(async () => {
      const response = await callAnthropic({
        model: this.model,
        max_tokens: 8192,
        temperature: request.temperature ?? 0.7,
        system: "Return only valid JSON matching the requested structure.",
        messages: [{ role: "user", content: request.prompt }],
      });

      return parseJsonResponse<T>(extractText(response));
    });
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    return withRetry(async () => {
      const response = await callAnthropic({
        model: this.model,
        max_tokens: 8192,
        temperature: request.temperature ?? 0.7,
        messages: [{ role: "user", content: request.prompt }],
      });

      return extractText(response);
    });
  }
}

export function createAnthropicAdapter(model = DEFAULT_MODEL) {
  return new AnthropicAdapter(model);
}
