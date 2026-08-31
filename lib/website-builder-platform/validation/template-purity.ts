/**
 * Template purity validation — ensures templates contain no embedded business data.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { TemplateRenderMode } from "@/lib/website-builder-platform/contracts/template-layer";

export type TemplatePurityViolation = {
  file: string;
  line?: number;
  rule: string;
  excerpt: string;
};

export type TemplatePurityReport = {
  ok: boolean;
  mode: TemplateRenderMode;
  filesScanned: number;
  violations: TemplatePurityViolation[];
};

/** Known demo-business phrases that must not appear in production templates. */
const FORBIDDEN_BUSINESS_PHRASES = [
  "Client retention",
  "Markets served",
  "Industry tenure",
  "Trusted by leaders worldwide",
  "Proof that compounds",
  "Ready to move forward?",
  "Let's start a conversation",
  "A partner built for lasting impact",
  "Join thousands of teams",
  "Build with confidence",
  "Lead with clarity",
];

const FORBIDDEN_PATTERNS: Array<{ rule: string; pattern: RegExp }> = [
  { rule: "hardcoded-unsplash-url", pattern: /images\.unsplash\.com\/photo-/ },
  { rule: "demo-metrics-constant", pattern: /DEFAULT_METRICS\s*=/ },
  { rule: "inline-business-email", pattern: /@[a-z]+\.(com|io|co)\b.*default/i },
];

const DESIGN_ONLY_PATHS = [
  /^components\//,
  /^lib\/website\/template-v2\/variants\//,
  /^lib\/website\/template-v2\/flagship\//,
];

function isDesignFile(filePath: string): boolean {
  return DESIGN_ONLY_PATHS.some((re) => re.test(filePath.replace(/\\/g, "/")));
}

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

/**
 * Scan generated project files for business data leakage into design components.
 * In production mode, any forbidden phrase or pattern in design files is a violation.
 */
export function validateTemplatePurity(
  files: GeneratedProjectFile[],
  mode: TemplateRenderMode = "production",
): TemplatePurityReport {
  const violations: TemplatePurityViolation[] = [];
  let filesScanned = 0;

  for (const file of files) {
    const normalized = file.path.replace(/\\/g, "/");
    if (!isDesignFile(normalized) && !normalized.includes("template-v2")) {
      continue;
    }
    filesScanned += 1;
    const content = file.content;

    for (const phrase of FORBIDDEN_BUSINESS_PHRASES) {
      const idx = content.indexOf(phrase);
      if (idx >= 0) {
        violations.push({
          file: file.path,
          line: lineNumberAt(content, idx),
          rule: "forbidden-business-phrase",
          excerpt: phrase,
        });
      }
    }

    if (mode === "production") {
      for (const { rule, pattern } of FORBIDDEN_PATTERNS) {
        const match = pattern.exec(content);
        if (match) {
          violations.push({
            file: file.path,
            line: lineNumberAt(content, match.index),
            rule,
            excerpt: match[0].slice(0, 80),
          });
        }
      }
    }
  }

  return {
    ok: violations.length === 0,
    mode,
    filesScanned,
    violations,
  };
}
