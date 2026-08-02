export type AIProviderName =
  | "deepseek"
  | "openai"
  | "gemini"
  | "claude"
  | "grok"
  | "llama"
  | (string & {});

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
  /** Website Builder audit — enables full prompt/response logging (wb-llm). */
  audit?: import("@/lib/ai/llm-audit").LlmAuditContext;
};

export type TextGenerationRequest = {
  prompt: string;
  temperature?: number;
  system?: string;
  audit?: import("@/lib/ai/llm-audit").LlmAuditContext;
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

export type GenerationCheckpointPayload = {
  message: string;
  files: GeneratedProjectFile[];
};

export type GenerationContext = {
  provider: AIProvider;
  progress: ProgressTracker;
  usage: UsageTracker;
  /** Optional mid-run file checkpoint (Website Builder stream resilience). */
  onFilesCheckpoint?: (
    files: GeneratedProjectFile[],
    meta: {
      message: string;
      waveCheckpoint?: {
        type: "task" | "wave-end";
        waveName: string;
        policy: import("@/lib/ai-core/file-generation/types").WaveCheckpointPolicy;
      };
    },
  ) => void | Promise<void>;
};
