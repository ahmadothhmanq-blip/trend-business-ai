import type {
  GenerationAttachmentMeta,
  GenerationMode,
  PromptVersion,
  TokenUsage,
  WorkspaceGeneration,
} from "@/types/database";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { WorkspaceOutput } from "@/lib/workspace/types";

export function createPromptVersion(
  prompt: string,
  mode: GenerationMode = "generate",
): PromptVersion {
  return {
    id: crypto.randomUUID(),
    prompt,
    createdAt: new Date().toISOString(),
    mode,
  };
}

export function appendPromptVersion(
  existing: PromptVersion[] | null | undefined,
  prompt: string,
  mode: GenerationMode = "generate",
): PromptVersion[] {
  const next = [...(existing ?? []), createPromptVersion(prompt, mode)];
  return next.slice(-40);
}

export type PersistableGenerationFields = {
  title: string;
  brief: string;
  template: string | null;
  language: string;
  theme: string;
  features: string[];
  output: WorkspaceOutput;
  project_id?: string | null;
  product_id?: string | null;
  status: WorkspaceGeneration["status"];
  mode: GenerationMode;
  parent_generation_id?: string | null;
  provider?: string | null;
  token_usage: TokenUsage;
  generation_time_ms: number;
  error_message?: string | null;
  prompt_versions: PromptVersion[];
  attachments: GenerationAttachmentMeta[];
  is_favorite?: boolean;
};

export function buildCompletedGenerationRow(params: {
  title: string;
  brief: string;
  template?: string | null;
  language: string;
  theme: string;
  features: string[];
  output: WorkspaceOutput;
  projectId?: string | null;
  productId?: string | null;
  mode?: GenerationMode;
  parentGenerationId?: string | null;
  provider?: string | null;
  usage?: TokenUsage;
  generationTimeMs?: number;
  promptVersions?: PromptVersion[];
  attachments?: GenerationAttachmentMeta[];
}): PersistableGenerationFields {
  return {
    title: params.title,
    brief: params.brief,
    template: params.template ?? null,
    language: params.language,
    theme: params.theme,
    features: params.features,
    output: params.output,
    project_id: params.projectId ?? null,
    product_id: params.productId ?? null,
    status: "completed",
    mode: params.mode ?? "generate",
    parent_generation_id: params.parentGenerationId ?? null,
    provider: params.provider ?? null,
    token_usage: params.usage ?? emptyTokenUsage(),
    generation_time_ms: params.generationTimeMs ?? 0,
    error_message: null,
    prompt_versions: params.promptVersions ?? [],
    attachments: params.attachments ?? [],
    is_favorite: false,
  };
}

export function sseEncode(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
