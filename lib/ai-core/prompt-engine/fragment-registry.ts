import {
  COMPLEXITY_GUIDE,
  FILE_GENERATION_RULES,
  PRODUCTION_ARCHITECTURE_GUIDE,
} from "@/lib/ai/prompts/shared";
import type { PromptFragment, PromptFragmentId } from "@/lib/ai-core/prompt-engine/types";

const FRAGMENTS: Record<PromptFragmentId, PromptFragment> = {
  "production-architecture-guide": {
    id: "production-architecture-guide",
    content: PRODUCTION_ARCHITECTURE_GUIDE,
  },
  "file-generation-rules": {
    id: "file-generation-rules",
    content: FILE_GENERATION_RULES,
  },
  "complexity-guide": {
    id: "complexity-guide",
    content: COMPLEXITY_GUIDE,
  },
};

/** Canonical registry of shared static prompt fragments. */
export function getPromptFragment(id: PromptFragmentId): PromptFragment {
  return FRAGMENTS[id];
}

export function listPromptFragments(): PromptFragment[] {
  return Object.values(FRAGMENTS);
}

export function getPromptFragmentContent(id: PromptFragmentId): string {
  return FRAGMENTS[id].content;
}
