import type { AIProvider } from "@/lib/ai/types";
import {
  logLlmParsedResult,
  logLlmRequest,
  type LlmAuditContext,
} from "@/lib/ai/llm-audit";

export type GenerateJsonOptions<T> = {
  provider: AIProvider;
  prompt: string;
  schema: object;
  maxAttempts?: number;
  validate: (result: T) => { valid: boolean; reason?: string };
  audit?: LlmAuditContext;
};

export type GenerateFileOptions<T> = GenerateJsonOptions<T>;

/** Retry JSON generation until validate() passes (analyze/plan/file stages). */
export async function generateJsonWithValidation<T>(
  options: GenerateJsonOptions<T>,
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  let validationReason = "";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const prompt = validationReason
      ? `${options.prompt}\n\nPrevious attempt failed validation: ${validationReason}`
      : options.prompt;

    const audit: LlmAuditContext | undefined = options.audit
      ? { ...options.audit, attempt: attempt + 1 }
      : undefined;

    if (audit) {
      logLlmRequest(audit, prompt);
    }

    const result = await options.provider.generateJson<T>({
      prompt,
      schema: options.schema,
      audit,
    });

    if (audit) {
      logLlmParsedResult(audit, result);
    }

    const validation = options.validate(result);
    if (validation.valid) {
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
