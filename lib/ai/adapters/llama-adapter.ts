import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";

export class LlamaAdapter implements AIProvider {
  readonly name = "llama" as const;
  private readonly model = "llama-3.3-70b";

  getModelName(): string {
    return this.model;
  }

  async generateJson<T>(_request: JsonGenerationRequest): Promise<T> {
    void _request;
    throw new Error(
      "Llama provider is not yet implemented. Set LLAMA_API_KEY and implement the adapter to enable it.",
    );
  }

  async generateText(_request: TextGenerationRequest): Promise<string> {
    void _request;
    throw new Error("Llama provider is not yet implemented.");
  }

  async streamText(_request: StreamTextRequest): Promise<string> {
    void _request;
    throw new Error("Llama provider is not yet implemented.");
  }

  getLastUsage(): TokenUsage | null {
    return null;
  }
}

export function createLlamaAdapter() {
  return new LlamaAdapter();
}
