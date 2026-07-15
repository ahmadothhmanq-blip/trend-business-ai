import type {
  AIProvider,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";

export class LlamaAdapter implements AIProvider {
  readonly name = "llama" as const;

  async generateJson<T>(_request: JsonGenerationRequest): Promise<T> {
    throw new Error(
      "Llama provider is not yet implemented. Set LLAMA_API_KEY and implement the adapter to enable it.",
    );
  }

  async generateText(_request: TextGenerationRequest): Promise<string> {
    throw new Error("Llama provider is not yet implemented.");
  }

  async streamText(_request: StreamTextRequest): Promise<string> {
    throw new Error("Llama provider is not yet implemented.");
  }

  getLastUsage(): TokenUsage | null {
    return null;
  }
}

export function createLlamaAdapter() {
  return new LlamaAdapter();
}
