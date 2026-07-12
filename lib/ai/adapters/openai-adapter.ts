import type { AIProvider, JsonGenerationRequest, TextGenerationRequest } from "@/lib/ai/types";
import { parseJsonResponse, withRetry } from "@/lib/ai/retry";

const DEFAULT_MODEL = "gpt-4o-mini";

async function createClient() {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}

export class OpenAIAdapter implements AIProvider {
  readonly name = "openai" as const;

  constructor(private readonly model = DEFAULT_MODEL) {}

  async generateJson<T>(request: JsonGenerationRequest): Promise<T> {
    const client = await createClient();

    return withRetry(async () => {
      const response = await client.chat.completions.create({
        model: this.model,
        temperature: request.temperature ?? 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return only valid JSON matching the requested structure.",
          },
          { role: "user", content: request.prompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("OpenAI returned an empty response.");
      }

      return parseJsonResponse<T>(content);
    });
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    const client = await createClient();

    return withRetry(async () => {
      const response = await client.chat.completions.create({
        model: this.model,
        temperature: request.temperature ?? 0.7,
        messages: [{ role: "user", content: request.prompt }],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("OpenAI returned an empty response.");
      }

      return content;
    });
  }
}

export function createOpenAIAdapter(model = DEFAULT_MODEL) {
  return new OpenAIAdapter(model);
}
