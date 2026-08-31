import type { AIProvider } from "@/lib/ai/types";
import {
  logLlmParsedResult,
  logLlmRequest,
  type LlmAuditContext,
} from "@/lib/ai/llm-audit";
import { getActiveWebsiteProfilerSlot } from "@/lib/ai/profiler-slot";
import { appBuilderTimingSetWaiting } from "@/lib/webapp/stage-timing-context";
import { performance } from "node:perf_hooks";

export type GenerateJsonOptions<T> = {
  provider: AIProvider;
  prompt: string;
  schema: object;
  maxAttempts?: number;
  validate: (result: T) => { valid: boolean; reason?: string };
  audit?: LlmAuditContext;
  /** Optional hook to reinforce constraints on validation retry. */
  transformRetryPrompt?: (
    basePrompt: string,
    validationReason: string,
  ) => string;
};

export type GenerateFileOptions<T> = GenerateJsonOptions<T>;

/** Retry JSON generation until validate() passes (analyze/plan/file stages). */
export async function generateJsonWithValidation<T>(
  options: GenerateJsonOptions<T>,
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  let validationReason = "";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      appBuilderTimingSetWaiting(
        "repair",
        `generateJsonWithValidation attempt ${attempt + 1}: ${validationReason.slice(0, 200)}`,
      );
    }

    const prompt = validationReason
      ? options.transformRetryPrompt
        ? options.transformRetryPrompt(options.prompt, validationReason)
        : `${options.prompt}\n\nPrevious attempt failed validation: ${validationReason}`
      : options.prompt;

    const audit: LlmAuditContext | undefined = options.audit
      ? { ...options.audit, attempt: attempt + 1 }
      : undefined;

    if (audit) {
      logLlmRequest(audit, prompt);
    }

    const profiler = getActiveWebsiteProfilerSlot();
    const llmStart = performance.now();
    appBuilderTimingSetWaiting(
      "llm_response",
      `generateJsonWithValidation attempt ${attempt + 1}`,
    );
    const result = await options.provider.generateJson<T>({
      prompt,
      schema: options.schema,
      audit,
    });
    const llmDurationMs = Math.round(performance.now() - llmStart);

    if (profiler && audit) {
      profiler.recordLlm({
        stage: audit.stage,
        filePath: audit.filePath,
        durationMs: llmDurationMs,
        attempt: audit.attempt ?? attempt + 1,
        success: true,
        promptChars: prompt.length,
      });
    }

    if (audit) {
      logLlmParsedResult(audit, result);
    }

    appBuilderTimingSetWaiting(
      "json_validation",
      `generateJsonWithValidation validate attempt ${attempt + 1}`,
    );
    const validation = options.validate(result);
    if (validation.valid) {
      appBuilderTimingSetWaiting("idle", "generateJsonWithValidation passed");
      return result;
    }

    validationReason = validation.reason ?? "Generated output failed validation.";
  }

  throw new Error(`Generation failed after ${maxAttempts} attempts: ${validationReason}`);
}

export async function generateWithValidation<T>(
  options: GenerateFileOptions<T>,
): Promise<T> {
  return generateJsonWithValidation(options);
}
