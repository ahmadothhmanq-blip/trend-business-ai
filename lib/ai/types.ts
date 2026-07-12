export type AIProviderName = "deepseek" | "openai" | "anthropic";

export type GenerationProgressEvent = string;

export type JsonGenerationRequest = {
  prompt: string;
  schema?: object;
  temperature?: number;
};

export type TextGenerationRequest = {
  prompt: string;
  temperature?: number;
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
  format: "zip" | "json" | "markdown";
  data: Uint8Array | string | Record<string, unknown>;
  filename?: string;
};

export interface AIProvider {
  readonly name: AIProviderName;
  generateJson<T>(request: JsonGenerationRequest): Promise<T>;
  generateText?(request: TextGenerationRequest): Promise<string>;
}

export type ProgressTracker = {
  emit: (event: GenerationProgressEvent) => void;
  getEvents: () => GenerationProgressEvent[];
};

export type GenerationContext = {
  provider: AIProvider;
  progress: ProgressTracker;
};
