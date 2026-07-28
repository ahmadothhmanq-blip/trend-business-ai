import { logger } from "@/lib/logger";

export type LlmAuditContext = {
  /** Pipeline stage id, e.g. strategy, file-generation */
  stage: string;
  /** Website output language from onboarding (Arabic, Spanish, …) */
  websiteLanguage?: string;
  /** Planned file path for per-file generation */
  filePath?: string;
  /** Whether buildWebsiteLanguageDirective block is present in the user prompt */
  languageDirectiveIncluded?: boolean;
  attempt?: number;
};

const WB_LLM_LOG = "wb-llm";

function fullPromptLoggingEnabled(): boolean {
  return process.env.WB_LOG_LLM_PROMPTS === "1";
}

function fullResponseLoggingEnabled(): boolean {
  return process.env.WB_LOG_LLM_RESPONSES === "1";
}

/** Log the exact prompt sent to the LLM (full text when WB_LOG_LLM_PROMPTS=1). */
export function logLlmRequest(
  audit: LlmAuditContext,
  prompt: string,
  system?: string,
): void {
  logger.info("Website LLM request", WB_LLM_LOG, {
    stage: audit.stage,
    websiteLanguage: audit.websiteLanguage ?? null,
    filePath: audit.filePath ?? null,
    attempt: audit.attempt ?? 1,
    languageDirectiveIncluded:
      audit.languageDirectiveIncluded ??
      prompt.includes("CRITICAL"),
    promptChars: prompt.length,
    systemChars: system?.length ?? 0,
    promptExcerpt: prompt.slice(0, 2400),
    ...(fullPromptLoggingEnabled()
      ? { promptFull: prompt, systemFull: system ?? null }
      : {}),
  });
}

/** Log raw model text before JSON parse / post-processing. */
export function logLlmRawResponse(audit: LlmAuditContext, raw: string): void {
  logger.info("Website LLM raw response", WB_LLM_LOG, {
    stage: audit.stage,
    websiteLanguage: audit.websiteLanguage ?? null,
    filePath: audit.filePath ?? null,
    attempt: audit.attempt ?? 1,
    rawChars: raw.length,
    rawExcerpt: raw.slice(0, 2400),
    ...(fullResponseLoggingEnabled() ? { rawFull: raw } : {}),
  });
}

/** Log parsed object (post-process) for correlation with raw response. */
export function logLlmParsedResult(audit: LlmAuditContext, parsed: unknown): void {
  const serialized = JSON.stringify(parsed);
  logger.info("Website LLM parsed result", WB_LLM_LOG, {
    stage: audit.stage,
    websiteLanguage: audit.websiteLanguage ?? null,
    filePath: audit.filePath ?? null,
    attempt: audit.attempt ?? 1,
    parsedChars: serialized.length,
    parsedExcerpt: serialized.slice(0, 2400),
    ...(fullResponseLoggingEnabled() ? { parsedFull: parsed } : {}),
  });
}
