import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { CONTENT_INTELLIGENCE_TRACE_KEY } from "@/lib/ai-core/content-intelligence/types";
import { DESIGN_INTELLIGENCE_TRACE_KEY } from "@/lib/ai-core/design-intelligence/die-types";
import { IMAGE_INTELLIGENCE_TRACE_KEY } from "@/lib/ai-core/image-intelligence/iie-types";
import { PLANNING_REASONING_TRACE_KEY } from "@/lib/ai-core/planning-reasoning-engine/types";
import { SEO_AEO_INTELLIGENCE_TRACE_KEY } from "@/lib/ai-core/seo-aeo-intelligence/saie-types";
import type {
  QualityAssuranceValidation,
  QualityPolicy,
  QualityTraceEntry,
  ValidationResult,
} from "@/lib/ai-core/quality-assurance/qashe-types";

let entryCounter = 0;

function trace(
  phase: QualityTraceEntry["phase"],
  ruleId: string,
  passed: boolean,
  severity: QualityTraceEntry["severity"],
  message: string,
  knowledgeEntryId?: string,
  engineId?: string,
): QualityTraceEntry {
  entryCounter += 1;
  return {
    id: `qashe-${Date.now()}-${entryCounter}`,
    phase,
    ruleId,
    passed,
    severity,
    message,
    knowledgeEntryId,
    engineId,
    timestamp: new Date().toISOString(),
  };
}

export function resetQualityValidationTraceCounter(): void {
  entryCounter = 0;
}

const ENGINE_TRACE_MAP: Record<string, string> = {
  planningReasoningTrace: "PRE",
  contentIntelligenceTrace: "CIE",
  designIntelligenceTrace: "DIE",
  imageIntelligenceTrace: "IIE",
  seoAeoIntelligenceTrace: "SAIE",
};

export function validateCrossEngineConsistency(
  brief: CoreBrief | null | undefined,
  policy: QualityPolicy,
): { results: ValidationResult[]; entries: QualityTraceEntry[] } {
  const entries: QualityTraceEntry[] = [];
  const results: ValidationResult[] = [];
  const metadata = brief?.metadata ?? {};
  const kid = policy.knowledgeEntryId;

  const missing: string[] = [];
  for (const key of policy.requiredEngineTraces) {
    const present = Boolean(metadata[key]);
    if (!present) missing.push(key);
    entries.push(
      trace(
        "cross-engine-consistency",
        `engine-trace-${key}`,
        present,
        present ? "info" : "warning",
        present
          ? `${ENGINE_TRACE_MAP[key] || key} trace present`
          : `Missing ${ENGINE_TRACE_MAP[key] || key} trace (${key})`,
        kid,
        ENGINE_TRACE_MAP[key],
      ),
    );
  }

  const industryMismatches: string[] = [];
  const industries = [
    (metadata[DESIGN_INTELLIGENCE_TRACE_KEY] as { industryId?: string } | undefined)
      ?.industryId,
    (metadata[CONTENT_INTELLIGENCE_TRACE_KEY] as { industryId?: string } | undefined)
      ?.industryId,
    (metadata[IMAGE_INTELLIGENCE_TRACE_KEY] as { industryId?: string } | undefined)
      ?.industryId,
    (metadata[SEO_AEO_INTELLIGENCE_TRACE_KEY] as { industryId?: string } | undefined)
      ?.industryId,
  ].filter(Boolean) as string[];

  const uniqueIndustries = [...new Set(industries)];
  if (uniqueIndustries.length > 1) {
    industryMismatches.push(
      `Industry drift across engines: ${uniqueIndustries.join(", ")}`,
    );
  }

  entries.push(
    trace(
      "cross-engine-consistency",
      "industry-alignment",
      industryMismatches.length === 0,
      industryMismatches.length === 0 ? "info" : "warning",
      industryMismatches[0] || `Industry aligned: ${policy.industryId}`,
      kid,
    ),
  );

  const engineValidations = [
    { key: "contentIntelligenceValidation", engine: "CIE", phase: "content-quality" as const },
    { key: "designIntelligenceValidation", engine: "DIE", phase: "design-consistency" as const },
    { key: "imageIntelligenceValidation", engine: "IIE", phase: "image-quality" as const },
    { key: "seoAeoIntelligenceValidation", engine: "SAIE", phase: "seo-aeo" as const },
  ];

  for (const { key, engine, phase } of engineValidations) {
    const raw = metadata[key];
    if (!raw || typeof raw !== "object") continue;
    const valid = (raw as { valid?: boolean }).valid !== false;
    entries.push(
      trace(
        phase,
        `${engine.toLowerCase()}-validation`,
        valid,
        valid ? "info" : "error",
        `${engine} validation ${valid ? "passed" : "failed"}`,
        kid,
        engine,
      ),
    );
    results.push({
      dimension: phase,
      passed: valid,
      score: valid ? 90 : 40,
      issues: valid
        ? []
        : [`${engine} validation failed`],
      engineSource: engine,
    });
  }

  const preTrace = metadata[PLANNING_REASONING_TRACE_KEY];
  if (preTrace && typeof preTrace === "object") {
    const entriesCount = (preTrace as { entries?: unknown[] }).entries?.length ?? 0;
    entries.push(
      trace(
        "architectural-integrity",
        "pre-trace",
        entriesCount > 0,
        "info",
        `PRE trace: ${entriesCount} decision entries`,
        kid,
        "PRE",
      ),
    );
  }

  results.push({
    dimension: "cross-engine",
    passed: missing.length === 0 && industryMismatches.length === 0,
    score: missing.length === 0 ? 95 : Math.max(40, 95 - missing.length * 10),
    issues: [...missing.map((m) => `Missing trace: ${m}`), ...industryMismatches],
    engineSource: "QASHE",
  });

  return { results, entries };
}

export function validateArtifactContent(
  files: Array<{ path: string; content: string }>,
  policy: QualityPolicy,
): { results: ValidationResult[]; entries: QualityTraceEntry[] } {
  const entries: QualityTraceEntry[] = [];
  const combined = files.map((f) => f.content).join("\n").toLowerCase();
  const kid = policy.knowledgeEntryId;

  const hallucinations: string[] = [];
  for (const phrase of policy.forbiddenPlaceholderPhrases) {
    if (combined.includes(phrase.toLowerCase())) {
      hallucinations.push(`Placeholder/hallucination: "${phrase}"`);
    }
  }
  entries.push(
    trace(
      "hallucination-detection",
      "forbidden-placeholders",
      hallucinations.length === 0,
      hallucinations.length === 0 ? "info" : "error",
      hallucinations.length === 0
        ? "No forbidden placeholders detected"
        : hallucinations[0],
      kid,
    ),
  );

  const brokenRefs: string[] = [];
  const hrefRe = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRe.exec(combined)) !== null) {
    const href = match[1];
    if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) {
      continue;
    }
    if (href.includes("undefined") || href.includes("null") || href === "/#") {
      brokenRefs.push(`Broken href: ${href}`);
    }
  }
  entries.push(
    trace(
      "broken-references",
      "href-integrity",
      brokenRefs.length === 0,
      brokenRefs.length === 0 ? "info" : "warning",
      brokenRefs[0] || "No broken href references detected",
      kid,
    ),
  );

  const duplicateH1 = (combined.match(/<h1\b/gi) || []).length;
  const dupIssues: string[] = [];
  if (duplicateH1 > 1) {
    dupIssues.push(`Duplicate H1 headings (${duplicateH1})`);
  }
  entries.push(
    trace(
      "duplicate-detection",
      "heading-duplicates",
      dupIssues.length === 0,
      dupIssues.length === 0 ? "info" : "warning",
      dupIssues[0] || "Heading hierarchy OK",
      kid,
    ),
  );

  const securityIssues: string[] = [];
  if (/dangerouslySetInnerHTML/i.test(combined) && /<script/i.test(combined)) {
    securityIssues.push("Inline script with dangerouslySetInnerHTML detected");
  }
  if (/api[_-]?key\s*[:=]\s*["'][^"']+["']/i.test(combined)) {
    securityIssues.push("Possible exposed API key in source");
  }
  entries.push(
    trace(
      "security",
      "security-scan",
      securityIssues.length === 0,
      securityIssues.length === 0 ? "info" : "critical",
      securityIssues[0] || "Security baseline passed",
      kid,
    ),
  );

  return {
    results: [
      {
        dimension: "content",
        passed: hallucinations.length === 0,
        score: hallucinations.length === 0 ? 90 : 30,
        issues: hallucinations,
        engineSource: "QASHE",
      },
      {
        dimension: "security",
        passed: securityIssues.length === 0,
        score: securityIssues.length === 0 ? 95 : 20,
        issues: securityIssues,
        engineSource: "QASHE",
      },
      {
        dimension: "completeness",
        passed: brokenRefs.length === 0 && dupIssues.length === 0,
        score: brokenRefs.length + dupIssues.length === 0 ? 88 : 55,
        issues: [...brokenRefs, ...dupIssues],
        engineSource: "QASHE",
      },
    ],
    entries,
  };
}

export function validateQualitySpecification(
  spec: {
    confidenceScore: number;
    productionApproved: boolean;
    validationResults: ValidationResult[];
  },
  policy: QualityPolicy,
): QualityAssuranceValidation {
  const entries: QualityTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const corrections: string[] = [];
  const kid = policy.knowledgeEntryId;

  if (spec.confidenceScore < policy.minConfidenceScore) {
    const msg = `Confidence ${spec.confidenceScore} below QKB minimum ${policy.minConfidenceScore}`;
    entries.push(trace("confidence-scoring", "min-confidence", false, "error", msg, kid));
    errors.push(msg);
    corrections.push("improve-validation-dimensions");
  } else {
    entries.push(
      trace(
        "confidence-scoring",
        "min-confidence",
        true,
        "info",
        `Confidence ${spec.confidenceScore} meets threshold`,
        kid,
      ),
    );
  }

  for (const dim of policy.requiredDimensions) {
    const found = spec.validationResults.find((r) => r.dimension.includes(dim));
    if (!found) {
      warnings.push(`Missing validation dimension: ${dim}`);
      entries.push(
        trace("completeness", "required-dimension", false, "warning", `Missing ${dim}`, kid),
      );
    }
  }

  const failedCritical = spec.validationResults.filter(
    (r) => !r.passed && r.score < 50,
  );
  if (failedCritical.length > 0 && !spec.productionApproved) {
    entries.push(
      trace(
        "validation",
        "production-approval",
        false,
        "error",
        `Production not approved: ${failedCritical.length} critical dimension(s) failed`,
        kid,
      ),
    );
  } else {
    entries.push(
      trace(
        "validation",
        "production-approval",
        spec.productionApproved,
        spec.productionApproved ? "info" : "warning",
        spec.productionApproved
          ? "Production approved by QASHE"
          : "Production approval withheld",
        kid,
      ),
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
    corrections,
  };
}
