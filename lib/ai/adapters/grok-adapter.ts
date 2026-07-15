import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";

export class GrokAdapter implements AIProvider {
  readonly name = "grok" as const;

  async generateJson<T>(_request: JsonGenerationRequest): Promise<T> {
    throw new Error(
      "Grok provider is not yet implemented. Set GROK_API_KEY and implement the adapter to enable it.",
    );
  }

  async generateText(_request: TextGenerationRequest): Promise<string> {
    throw new Error("Grok provider is not yet implemented.");
  }

  async streamText(_request: StreamTextRequest): Promise<string> {
    throw new Error("Grok provider is not yet implemented.");
  }

  getLastUsage(): TokenUsage | null {
    return null;
  }
}

export function createGrokAdapter() {
  return new GrokAdapter();
}
