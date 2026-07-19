/**
 * Apply optimizer fixes — rewrite weak page/component files via DeepSeek.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebsiteAuditResult } from "@/lib/ai-core/optimizer/types";

export type ApplyOptimizerFixesResult = {
  files: GeneratedProjectFile[];
  appliedFixes: string[];
  filesChanged: boolean;
};

function pickTargets(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const ranked = files.filter(
    (f) =>
      f.path.includes("page.tsx") ||
      /components\/.*(Hero|Cta|CTA|Services|Header|Nav)/i.test(f.path),
  );
  return (ranked.length ? ranked : files.filter((f) => f.path.endsWith(".tsx"))).slice(
    0,
    4,
  );
}

/**
 * Apply content/layout/CTA improvements to key files.
 * Soft-fails per file; returns original content on error.
 */
export async function applyOptimizerFixes(params: {
  files: GeneratedProjectFile[];
  audit: WebsiteAuditResult;
  improveThemes: string[];
  userInstruction?: string;
  onProgress?: (message: string) => void;
}): Promise<ApplyOptimizerFixesResult> {
  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    return {
      files: params.files,
      appliedFixes: [],
      filesChanged: false,
    };
  }

  const targets = pickTargets(params.files);
  if (!targets.length) {
    return {
      files: params.files,
      appliedFixes: [],
      filesChanged: false,
    };
  }

  const instruction = [
    params.userInstruction?.trim(),
    "Optimize this website file for conversion and quality:",
    "- Improve headlines with clearer value propositions",
    "- Improve CTA button labels and placement",
    "- Improve service / feature descriptions",
    "- Add missing section content when relevant",
    "- Improve layout structure and mobile responsiveness",
    "- Keep brand colors/fonts consistent",
    "",
    "Top suggestions:",
    ...params.improveThemes.slice(0, 8).map((s) => `- ${s}`),
    "",
    "Critical issues:",
    ...params.audit.issues
      .filter((i) => i.severity !== "minor")
      .slice(0, 6)
      .map((i) => `- [${i.category}] ${i.title}: ${i.suggestion}`),
  ]
    .filter(Boolean)
    .join("\n");

  const appliedFixes: string[] = [];
  const nextFiles = [...params.files];

  for (const target of targets) {
    params.onProgress?.(`Optimizing ${target.path}…`);
    try {
      const improved = await providerManager.generateText(
        {
          system:
            "You improve Next.js/React/TSX website source files. Return ONLY the full updated file contents. No markdown fences. Preserve imports and structure unless a change is required for the optimization.",
          prompt: `File path: ${target.path}
Language: ${target.language}

Optimization instruction:
${instruction}

Current file:
\`\`\`
${target.content.slice(0, 14000)}
\`\`\`

Return the complete improved file source.`,
          temperature: 0.35,
        },
        resolved,
      );

      const content = String(improved ?? "")
        .replace(/^```(?:tsx|ts|jsx|js|css)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      if (content.length > 80 && content !== target.content.trim()) {
        const idx = nextFiles.findIndex((f) => f.path === target.path);
        if (idx >= 0) {
          nextFiles[idx] = {
            ...nextFiles[idx],
            content,
          };
          appliedFixes.push(`Improved ${target.path}`);
        }
      }
    } catch {
      // continue with remaining files
    }
  }

  return {
    files: nextFiles,
    appliedFixes,
    filesChanged: appliedFixes.length > 0,
  };
}

export function buildOptimizerImproveInstruction(
  audit: WebsiteAuditResult,
  themes: string[],
  userInstruction?: string,
): string {
  const parts = [
    "[optimize]",
    userInstruction?.trim() ||
      "Run a full AI website optimization pass before publish.",
    "",
    "Improve headlines, CTA buttons, service descriptions, layout structure, and brand consistency.",
    "",
    "Priority fixes:",
    ...audit.issues
      .slice(0, 8)
      .map((i) => `- (${i.severity}) ${i.title}: ${i.suggestion}`),
    "",
    "Themes:",
    ...themes.slice(0, 8).map((t) => `- ${t}`),
  ];
  if (audit.missingSections.length) {
    parts.push("", "Add missing sections:", ...audit.missingSections.map((s) => `- ${s}`));
  }
  return parts.join("\n");
}
