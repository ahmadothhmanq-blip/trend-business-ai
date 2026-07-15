import type {
  GenerationAttachmentMeta,
  GenerationMode,
  GenerationStatus,
  PromptVersion,
  TokenUsage,
  WorkspaceGeneration,
} from "@/types/database";
import type { WorkspaceOutput } from "@/lib/workspace/types";

export type WorkspaceProject = {
  id: string;
  title: string;
  brief: string;
  template: string;
  language: string;
  theme: string;
  features: string[];
  createdAt: string;
  favorite: boolean;
  output: WorkspaceOutput;
  projectId?: string | null;
  productId?: string | null;
  status?: GenerationStatus;
  mode?: GenerationMode;
  parentGenerationId?: string | null;
  provider?: string | null;
  tokenUsage?: TokenUsage;
  generationTimeMs?: number | null;
  errorMessage?: string | null;
  promptVersions?: PromptVersion[];
  attachments?: GenerationAttachmentMeta[];
  draftPrompt?: string | null;
};

export function formatWorkspaceDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeWorkspaceOutput(
  generation: WorkspaceGeneration,
): WorkspaceOutput {
  const raw = (generation.output ?? {}) as Partial<WorkspaceOutput>;
  return {
    ...raw,
    title: raw.title || generation.title,
    summary: raw.summary || generation.brief || "",
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    deliverables: Array.isArray(raw.deliverables) ? raw.deliverables : [],
    tokenUsage: raw.tokenUsage ?? generation.token_usage,
    generationTimeMs:
      raw.generationTimeMs ?? generation.generation_time_ms ?? undefined,
    productId: raw.productId ?? generation.product_id ?? undefined,
    mode: raw.mode ?? generation.mode,
  };
}

export function toWorkspaceProject(generation: WorkspaceGeneration): WorkspaceProject {
  const output = normalizeWorkspaceOutput(generation);
  return {
    id: generation.id,
    title: generation.title,
    brief: generation.brief,
    template: generation.template ?? "",
    language: generation.language,
    theme: generation.theme,
    features: generation.features ?? [],
    createdAt: formatWorkspaceDate(generation.created_at),
    favorite: Boolean(generation.is_favorite),
    output,
    projectId: generation.project_id,
    productId: generation.product_id,
    status: generation.status,
    mode: generation.mode,
    parentGenerationId: generation.parent_generation_id,
    provider: generation.provider,
    tokenUsage: generation.token_usage ?? output.tokenUsage,
    generationTimeMs: generation.generation_time_ms,
    errorMessage: generation.error_message,
    promptVersions: generation.prompt_versions ?? [],
    attachments: generation.attachments ?? [],
    draftPrompt: generation.draft_prompt,
  };
}
