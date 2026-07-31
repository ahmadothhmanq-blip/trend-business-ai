import type {
  SeoAeoValidation,
  SeoPolicy,
  SEOSpecification,
  SeoAeoTraceEntry,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";

let entryCounter = 0;

function trace(
  phase: SeoAeoTraceEntry["phase"],
  ruleId: string,
  passed: boolean,
  severity: SeoAeoTraceEntry["severity"],
  message: string,
  knowledgeEntryId?: string,
): SeoAeoTraceEntry {
  entryCounter += 1;
  return {
    id: `saie-${Date.now()}-${entryCounter}`,
    phase,
    ruleId,
    passed,
    severity,
    message,
    knowledgeEntryId,
    timestamp: new Date().toISOString(),
  };
}

export function resetSeoValidationTraceCounter(): void {
  entryCounter = 0;
}

export function validateSeoSpecification(
  spec: SEOSpecification,
  policy: SeoPolicy,
): SeoAeoValidation {
  const entries: SeoAeoTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const corrections: string[] = [];
  const kid = policy.knowledgeEntryId;

  const titleLen = spec.metadata.title.length;
  if (titleLen < policy.minTitleLength || titleLen > policy.maxTitleLength) {
    const msg = `Title length ${titleLen} outside SKB range ${policy.minTitleLength}–${policy.maxTitleLength}`;
    entries.push(trace("validation", "title-length", false, "error", msg, kid));
    errors.push(msg);
    corrections.push("adjust-title-length");
  } else {
    entries.push(
      trace("validation", "title-length", true, "info", `Title ${titleLen} chars within SKB range`, kid),
    );
  }

  const descLen = spec.metadata.description.length;
  if (descLen < policy.minDescriptionLength || descLen > policy.maxDescriptionLength) {
    const msg = `Description length ${descLen} outside SKB range`;
    entries.push(trace("validation", "description-length", false, "warning", msg, kid));
    warnings.push(msg);
  } else {
    entries.push(
      trace("validation", "description-length", true, "info", `Description ${descLen} chars OK`, kid),
    );
  }

  const schemaTypes = spec.structuredData.map((s) => s.type);
  const missingSchema = policy.requiredSchemaTypes.filter(
    (t) => !schemaTypes.includes(t),
  );
  if (missingSchema.length > 0) {
    const msg = `Missing required schema types: ${missingSchema.join(", ")}`;
    entries.push(trace("structured-data", "required-schema", false, "error", msg, kid));
    errors.push(msg);
    corrections.push(`add-schema:${missingSchema.join(",")}`);
  } else {
    entries.push(
      trace(
        "structured-data",
        "required-schema",
        true,
        "info",
        `Schema coverage: ${schemaTypes.join(", ")}`,
        kid,
      ),
    );
  }

  if (spec.internalLinks.length < policy.internalLinkingMin) {
    const msg = `Internal links ${spec.internalLinks.length} below minimum ${policy.internalLinkingMin}`;
    entries.push(trace("internal-linking", "min-links", false, "warning", msg, kid));
    warnings.push(msg);
  } else {
    entries.push(
      trace(
        "internal-linking",
        "min-links",
        true,
        "info",
        `${spec.internalLinks.length} internal links planned`,
        kid,
      ),
    );
  }

  const primaryKw = spec.keywordIntelligence.primary.toLowerCase();
  const titleHasKw = spec.metadata.title.toLowerCase().includes(primaryKw.slice(0, 12));
  entries.push(
    trace(
      "content-alignment",
      "primary-keyword-title",
      titleHasKw,
      titleHasKw ? "info" : "warning",
      titleHasKw
        ? "Primary keyword present in title"
        : "Primary keyword not clearly in title",
      kid,
    ),
  );
  if (!titleHasKw) {
    warnings.push("Primary keyword alignment weak in title");
  }

  if (!spec.headingHierarchy.expectedH1?.trim()) {
    const msg = "Missing expected H1 in heading hierarchy plan";
    entries.push(trace("heading-hierarchy", "h1-required", false, "error", msg, kid));
    errors.push(msg);
  } else {
    entries.push(
      trace(
        "heading-hierarchy",
        "h1-required",
        true,
        "info",
        `H1 planned: ${spec.headingHierarchy.expectedH1.slice(0, 40)}`,
        kid,
      ),
    );
  }

  for (const img of spec.imageSeo) {
    if (!img.altText?.trim()) {
      const msg = `Image ${img.imageId} missing alt text for SEO`;
      entries.push(trace("image-seo", "image-alt", false, "error", msg, kid));
      errors.push(msg);
    }
  }

  entries.push(
    trace(
      "aeo-optimization",
      "citation-readiness",
      spec.aeo.readinessScore >= 60,
      spec.aeo.readinessScore >= 60 ? "info" : "warning",
      `AEO readiness ${spec.aeo.readinessScore}/100`,
      policy.aeoKnowledgeEntryId,
    ),
  );

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
    corrections,
  };
}
