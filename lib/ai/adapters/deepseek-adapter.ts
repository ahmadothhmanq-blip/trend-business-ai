import type { AIProvider, JsonGenerationRequest, TextGenerationRequest } from "@/lib/ai/types";
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

  constructor(private readonly model = DEFAULT_MODEL) {}

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
              content: `Return only valid JSON matching the requested structure.${schemaHint}`,
            },
            { role: "user", content: request.prompt },
          ],
        });

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
          messages: [{ role: "user", content: request.prompt }],
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("DeepSeek returned an empty response.");
        }

        return content;
      },
      { delaysMs: DEEPSEEK_RETRY_DELAYS_MS },
    );
  }
}

export function createDeepSeekAdapter(model = DEFAULT_MODEL) {
  return new DeepSeekAdapter(model);
}
