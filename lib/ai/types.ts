export type AIProviderName = "deepseek" | "openai" | "anthropic" | (string & {});

export type GenerationProgressEvent = string;

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type JsonGenerationRequest = {
  prompt: string;
  schema?: object;
  temperature?: number;
  system?: string;
};

export type TextGenerationRequest = {
  prompt: string;
  temperature?: number;
  system?: string;
};

export type StreamTextRequest = TextGenerationRequest & {
  onChunk?: (chunk: string) => void;
};

export type GeneratedProjectFile = {
  path: string;
  content: string;
  language: string;
};

export type ValidationResult = {
  valid: boolean;
  reason?: string;
  issues: string[];
  filesToRegenerate?: string[];
};

export type ExportResult = {
  format: "zip" | "json" | "markdown" | "pdf" | "docx";
  data: Uint8Array | string | Record<string, unknown>;
  filename?: string;
};

export interface AIProvider {
  readonly name: AIProviderName;
  generateJson<T>(request: JsonGenerationRequest): Promise<T>;
  generateText?(request: TextGenerationRequest): Promise<string>;
  streamText?(request: StreamTextRequest): Promise<string>;
  /** Last recorded token usage from the most recent provider call. */
  getLastUsage?(): TokenUsage | null;
}

export type ProgressTracker = {
  emit: (event: GenerationProgressEvent) => void;
  getEvents: () => GenerationProgressEvent[];
};

export type UsageTracker = {
  add: (usage: TokenUsage | null | undefined) => void;
  get: () => TokenUsage;
};

export type GenerationContext = {
  provider: AIProvider;
  progress: ProgressTracker;
  usage: UsageTracker;
};
