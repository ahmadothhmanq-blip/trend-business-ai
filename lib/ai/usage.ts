import type { TokenUsage, UsageTracker } from "@/lib/ai/types";

export function emptyTokenUsage(): TokenUsage {
  return { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
}

export function mergeTokenUsage(
  a: TokenUsage,
  b: TokenUsage | null | undefined,
): TokenUsage {
  if (!b) return a;
  return {
    promptTokens: a.promptTokens + (b.promptTokens || 0),
    completionTokens: a.completionTokens + (b.completionTokens || 0),
    totalTokens: a.totalTokens + (b.totalTokens || 0),
  };
}

export function normalizeOpenAIUsage(
  usage:
    | {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      }
    | null
    | undefined,
): TokenUsage | null {
  if (!usage) return null;
  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens:
      usage.total_tokens ??
      (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
  };
}

export function createUsageTracker(): UsageTracker {
  let total = emptyTokenUsage();
  return {
    add(usage) {
      total = mergeTokenUsage(total, usage);
    },
    get() {
      return { ...total };
    },
  };
}
