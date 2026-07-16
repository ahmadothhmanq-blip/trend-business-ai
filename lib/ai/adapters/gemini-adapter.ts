import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";

export class GeminiAdapter implements AIProvider {
  readonly name = "gemini" as const;

  async generateJson<T>(_request: JsonGenerationRequest): Promise<T> {
    void _request;
    throw new Error(
      "Gemini provider is not yet implemented. Set GEMINI_API_KEY and implement the adapter to enable it.",
    );
  }

  async generateText(_request: TextGenerationRequest): Promise<string> {
    void _request;
    throw new Error("Gemini provider is not yet implemented.");
  }

  async streamText(_request: StreamTextRequest): Promise<string> {
    void _request;
    throw new Error("Gemini provider is not yet implemented.");
  }

  getLastUsage(): TokenUsage | null {
    return null;
  }
}

export function createGeminiAdapter() {
  return new GeminiAdapter();
}
