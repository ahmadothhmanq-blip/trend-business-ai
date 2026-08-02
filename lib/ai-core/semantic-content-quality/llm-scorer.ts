import { z } from "zod";
import type { AIProvider } from "@/lib/ai/types";
import { extractUserFacingCopyFromSource } from "@/lib/ai-core/website-builder/llm-language";
import {
  isSemanticLlmScorerEnabled,
  SEMANTIC_LLM_MAX_CHARS,
  SEMANTIC_LLM_MAX_FILES,
} from "@/lib/ai-core/semantic-content-quality/flags";
import type {
  SemanticLlmScoreResult,
  SemanticQualityContext,
} from "@/lib/ai-core/semantic-content-quality/types";

const llmScoreSchema = z.object({
  genericScore: z.number().min(0).max(100),
  industryScore: z.number().min(0).max(100),
  notes: z.array(z.string()).max(4).optional(),
});

function selectLlmFiles(context: SemanticQualityContext) {
  const priority = [
    /app\/page\.tsx$/,
    /components\/sections\/Hero/i,
    /layout\.tsx$/,
  ];
  const selected: Array<{ path: string; content: string }> = [];
  for (const pattern of priority) {
    const file = context.files.find((f) => pattern.test(f.path));
    if (file && !selected.some((s) => s.path === file.path)) {
      selected.push(file);
    }
    if (selected.length >= SEMANTIC_LLM_MAX_FILES) break;
  }
  if (!selected.length && context.files[0]) {
    selected.push(context.files[0]);
  }
  return selected.slice(0, SEMANTIC_LLM_MAX_FILES);
}

/**
 * Bounded LLM-lite scorer — optional, max 2 files / 2500 chars.
 */
export async function runSemanticLlmScorer(params: {
  context: SemanticQualityContext;
  provider?: AIProvider;
}): Promise<SemanticLlmScoreResult> {
  if (!isSemanticLlmScorerEnabled() || !params.provider) {
    return { applied: false, filesScored: 0, promptChars: 0 };
  }

  const files = selectLlmFiles(params.context);
  const excerpts = files
    .map((file) => {
      const copy = extractUserFacingCopyFromSource(file.content).slice(0, 1200);
      return `### ${file.path}\n${copy}`;
    })
    .join("\n\n")
    .slice(0, SEMANTIC_LLM_MAX_CHARS);

  if (excerpts.length < 40) {
    return { applied: false, filesScored: 0, promptChars: 0 };
  }

  const prompt = [
    "Score website copy quality. Return JSON only.",
    `Industry: ${params.context.industry ?? params.context.industryId ?? "business"}`,
    `Language: ${params.context.language ?? "en"}`,
    "genericScore: 0-100 (higher = less generic/filler)",
    "industryScore: 0-100 (higher = more industry-relevant)",
    "notes: up to 4 short improvement bullets",
    "",
    excerpts,
  ].join("\n");

  try {
    const result = await params.provider.generateJson({
      prompt,
      schema: llmScoreSchema,
      temperature: 0.1,
      system:
        "You are a website copy quality scorer. Respond with valid JSON matching the schema.",
    });

    const parsed = llmScoreSchema.parse(result);
    return {
      applied: true,
      filesScored: files.length,
      promptChars: prompt.length,
      genericScore: parsed.genericScore,
      industryScore: parsed.industryScore,
      notes: parsed.notes,
    };
  } catch {
    return {
      applied: false,
      filesScored: files.length,
      promptChars: prompt.length,
    };
  }
}
