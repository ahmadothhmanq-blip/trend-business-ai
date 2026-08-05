import type { Tbge2StructuredPlan } from "@/lib/ai-core/generation-engine/core/types";

/** Provider-independent LLM boundary — the only place planning may call an LLM. */
export type Tbge2LlmRequest = {
  systemPrompt: string;
  /** Structured planning context — never the raw user prompt. */
  userPrompt: string;
  schema: Record<string, unknown>;
  model?: string;
  temperature?: number;
};

export type Tbge2LlmResponse = {
  content: string;
  model: string;
};

export type Tbge2LlmClient = {
  complete(request: Tbge2LlmRequest): Promise<Tbge2LlmResponse>;
};

export type Tbge2StructuredOutputResult = {
  data: Tbge2StructuredPlan;
  model: string;
  raw: string;
};
