/**
 * DeepSeek analysis pass — pages → issues → improvement suggestions.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { AuditFile } from "@/lib/ai-core/optimizer/audit";
import type {
  WebsiteAuditIssue,
  WebsiteAuditResult,
} from "@/lib/ai-core/optimizer/types";

type DeepSeekAuditPayload = {
  issues?: Array<{
    category?: string;
    severity?: string;
    title?: string;
    detail?: string;
    suggestion?: string;
  }>;
  missingSections?: string[];
  suggestions?: string[];
  headlineImprovements?: string[];
  ctaImprovements?: string[];
  serviceDescriptionImprovements?: string[];
  layoutImprovements?: string[];
  brandNotes?: string[];
  summary?: string;
};

const CATEGORIES = new Set([
  "design",
  "ux",
  "content",
  "sections",
  "mobile",
  "conversion",
  "seo",
  "performance",
  "brand",
]);

function summarizeFiles(files: AuditFile[], maxChars = 12000): string {
  const pageLike = files
    .filter(
      (f) =>
        f.path.includes("page.tsx") ||
        f.path.includes("layout.tsx") ||
        f.path.includes("globals.css") ||
        f.path.includes("components/"),
    )
    .slice(0, 12);

  let budget = maxChars;
  const chunks: string[] = [];
  for (const file of pageLike) {
    const slice = file.content.slice(0, Math.min(1800, budget));
    chunks.push(`--- ${file.path} ---\n${slice}`);
    budget -= slice.length;
    if (budget <= 0) break;
  }
  return chunks.join("\n\n");
}

function normalizeIssue(
  raw: NonNullable<DeepSeekAuditPayload["issues"]>[number],
  index: number,
): WebsiteAuditIssue | null {
  const category = String(raw.category ?? "ux").toLowerCase();
  if (!CATEGORIES.has(category)) return null;
  const severityRaw = String(raw.severity ?? "major").toLowerCase();
  const severity =
    severityRaw === "critical" || severityRaw === "minor"
      ? severityRaw
      : "major";
  const title = String(raw.title ?? "").trim();
  if (!title) return null;
  return {
    id: `ai-${index}-${title.slice(0, 24).replace(/\s+/g, "-").toLowerCase()}`,
    category: category as WebsiteAuditIssue["category"],
    severity,
    title,
    detail: String(raw.detail ?? title).trim(),
    suggestion: String(raw.suggestion ?? "Improve this area for quality.").trim(),
  };
}

/**
 * Enrich heuristic audit with DeepSeek page analysis.
 * Soft-fails to the heuristic result when the model is unavailable.
 */
export async function analyzeWebsiteWithDeepSeek(params: {
  heuristic: WebsiteAuditResult;
  files: AuditFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  userInstruction?: string;
}): Promise<{
  audit: WebsiteAuditResult;
  improveThemes: string[];
  summary: string;
}> {
  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    return {
      audit: params.heuristic,
      improveThemes: params.heuristic.suggestions,
      summary: "Heuristic website audit (AI provider unavailable).",
    };
  }

  try {
    const payload = await providerManager.generateJson<DeepSeekAuditPayload>(
      {
        system:
          "You are a senior website QA and conversion optimizer. Analyze the generated Next.js site for design quality, UX, content, missing sections, mobile responsiveness, conversion, and brand consistency. Respond with JSON only.",
        prompt: `Business: ${params.profile?.summary ?? params.strategy?.positioning ?? "n/a"}
Industry: ${params.profile?.industry ?? "n/a"}
Expected sections for this industry: ${(params.profile?.requiredSections ?? []).slice(0, 10).join(", ") || "n/a"}
Design preset: ${params.designSystem?.stylePreset ?? "n/a"}
Design style: ${params.designSystem?.style ?? "n/a"}
Primary color: ${params.designSystem?.colors?.primary ?? "n/a"}
User instruction: ${params.userInstruction ?? "Full quality optimization pass"}
Judge missing pages/sections against industry expectations (e.g. Tourism needs Destinations/Tours/Booking; Healthcare needs Services/Doctors/Appointments).

Heuristic findings (merge + improve, do not ignore critical ones):
${JSON.stringify(
  {
    scores: params.heuristic.scores,
    issues: params.heuristic.issues.slice(0, 10),
    missingSections: params.heuristic.missingSections,
  },
  null,
  2,
)}

Generated files (truncated):
${summarizeFiles(params.files)}

Return JSON:
{
  "summary": "one short paragraph",
  "issues": [{"category":"design|ux|content|sections|mobile|conversion|seo|performance|brand","severity":"critical|major|minor","title":"...","detail":"...","suggestion":"..."}],
  "missingSections": ["..."],
  "suggestions": ["..."],
  "headlineImprovements": ["..."],
  "ctaImprovements": ["..."],
  "serviceDescriptionImprovements": ["..."],
  "layoutImprovements": ["..."],
  "brandNotes": ["..."]
}`,
        temperature: 0.3,
      },
      resolved,
    );

    const aiIssues = (payload.issues ?? [])
      .map((item, index) => normalizeIssue(item, index))
      .filter((item): item is WebsiteAuditIssue => Boolean(item));

    const mergedIssues = [
      ...params.heuristic.issues,
      ...aiIssues.filter(
        (ai) =>
          !params.heuristic.issues.some(
            (h) => h.title.toLowerCase() === ai.title.toLowerCase(),
          ),
      ),
    ].slice(0, 24);

    const missingSections = Array.from(
      new Set([
        ...params.heuristic.missingSections,
        ...(payload.missingSections ?? []).map(String),
      ]),
    ).slice(0, 12);

    const improveThemes = Array.from(
      new Set([
        ...(payload.suggestions ?? []).map(String),
        ...(payload.headlineImprovements ?? []).map(
          (s) => `Headline: ${s}`,
        ),
        ...(payload.ctaImprovements ?? []).map((s) => `CTA: ${s}`),
        ...(payload.serviceDescriptionImprovements ?? []).map(
          (s) => `Services: ${s}`,
        ),
        ...(payload.layoutImprovements ?? []).map((s) => `Layout: ${s}`),
        ...(payload.brandNotes ?? []).map((s) => `Brand: ${s}`),
        ...params.heuristic.suggestions,
      ]),
    ).slice(0, 16);

    const audit: WebsiteAuditResult = {
      ...params.heuristic,
      issues: mergedIssues,
      missingSections,
      suggestions: improveThemes,
      source: "hybrid",
      brandConsistent:
        params.heuristic.brandConsistent &&
        !(payload.brandNotes ?? []).some((n) =>
          /inconsist|mismatch|off-brand/i.test(String(n)),
        ),
    };

    return {
      audit,
      improveThemes,
      summary:
        typeof payload.summary === "string" && payload.summary.trim()
          ? payload.summary.trim()
          : `Found ${mergedIssues.length} optimization opportunities.`,
    };
  } catch {
    return {
      audit: params.heuristic,
      improveThemes: params.heuristic.suggestions,
      summary: "Heuristic website audit (DeepSeek analysis unavailable).",
    };
  }
}
