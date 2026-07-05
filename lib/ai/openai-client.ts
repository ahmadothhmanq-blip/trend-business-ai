const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withOpenAIRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

export async function createOpenAIClient() {
  const { default: OpenAI } = await import("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function parseOpenAIJson<T>(content: string): T {
  const parsed = JSON.parse(content) as T;
  return parsed;
}
