export { withRetry as withOpenAIRetry, parseJsonResponse as parseOpenAIJson } from "@/lib/ai/retry";

export async function createOpenAIClient() {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}
