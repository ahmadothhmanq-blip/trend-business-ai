import { z } from "zod";
import { reportInputSchema } from "@/lib/validations/reports";
import {
  reportsSystemPrompt,
  reportsUserPrompt,
} from "@/lib/ai/prompts/legacy-services";

export type ReportInput = z.infer<typeof reportInputSchema>;

export type GeneratedReport = {
  title: string;
  report_type: string;
  content: string;
  insights: string[];
};

export async function generateReport(
  input: ReportInput,
): Promise<{
  report: GeneratedReport;
  source: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  generationTimeMs?: number;
}> {
  const startedAt = Date.now();
  const { providerManager } = await import("@/lib/ai/provider-manager");
  const { getDefaultTextProvider } = await import("@/lib/ai/provider-config");
  const providerName = providerManager.resolve(getDefaultTextProvider());

  if (!providerName) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable report generation.",
    );
  }

  const parsed = await providerManager.generateJson<GeneratedReport>(
    {
      system: reportsSystemPrompt,
      prompt: reportsUserPrompt(input),
      temperature: 0.7,
    },
    providerName,
  );

  if (!parsed.content?.trim()) {
    throw new Error("Invalid AI report response from provider.");
  }

  return {
    report: {
      title: parsed.title?.trim() || `${input.reportType}: ${input.topic}`,
      report_type: parsed.report_type?.trim() || input.reportType,
      content: parsed.content.trim(),
      insights: Array.isArray(parsed.insights)
        ? parsed.insights.map(String).slice(0, 8)
        : [],
    },
    source: providerName,
    usage: providerManager.getLastUsage(providerName) ?? undefined,
    generationTimeMs: Date.now() - startedAt,
  };
}
