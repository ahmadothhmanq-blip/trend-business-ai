import type { AgencyContentPack } from "@/lib/ai-core/content-intelligence/generate";
import { findContentCliches } from "@/lib/ai-core/content-intelligence/cliches";
import type {
  ContentIntelligenceValidation,
  ContentPolicy,
  ContentTraceEntry,
} from "@/lib/ai-core/content-intelligence/types";

let entryCounter = 0;

function trace(
  phase: ContentTraceEntry["phase"],
  ruleId: string,
  passed: boolean,
  severity: ContentTraceEntry["severity"],
  message: string,
  knowledgeEntryId?: string,
): ContentTraceEntry {
  entryCounter += 1;
  return {
    id: `cie-${Date.now()}-${entryCounter}`,
    phase,
    ruleId,
    passed,
    severity,
    message,
    knowledgeEntryId,
    timestamp: new Date().toISOString(),
  };
}

function collectText(content: AgencyContentPack): string {
  return [
    content.hero.headline,
    content.hero.subheadline,
    content.about.mission,
    content.about.story,
    ...content.services.map((s) => `${s.title} ${s.body}`),
    ...content.features.map((f) => `${f.title} ${f.body}`),
    ...content.testimonials.map((t) => t.quote),
    content.cta.body,
    content.seo.description,
    content.seo.title,
  ]
    .join(" ")
    .toLowerCase();
}

function sectionCoverage(
  content: AgencyContentPack,
  requiredSections: string[],
): { covered: string[]; missing: string[] } {
  const blob = collectText(content);
  const pageTitles = Object.values(content.pageTitles ?? {})
    .join(" ")
    .toLowerCase();
  const serviceTitles = content.services.map((s) => s.title.toLowerCase()).join(" ");
  const combined = `${blob} ${pageTitles} ${serviceTitles}`;

  const covered: string[] = [];
  const missing: string[] = [];
  for (const section of requiredSections) {
    const token = section.toLowerCase().replace(/[^a-z0-9]+/g, " ");
    const words = token.split(/\s+/).filter((w) => w.length > 3);
    const hit =
      combined.includes(token) ||
      words.some((w) => combined.includes(w));
    if (hit) covered.push(section);
    else missing.push(section);
  }
  return { covered, missing };
}

/**
 * Validate content against Content Knowledge Base policy — no hardcoded industry rules.
 */
export function validateAgencyContent(
  content: AgencyContentPack,
  policy: ContentPolicy,
): ContentIntelligenceValidation {
  const entries: ContentTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const kid = policy.knowledgeEntryId;

  if (content.services.length < policy.minServices) {
    const msg = `Services count ${content.services.length} below CKB minimum ${policy.minServices}`;
    entries.push(
      trace("section-alignment", "min-services", false, "warning", msg, kid),
    );
    warnings.push(msg);
  } else {
    entries.push(
      trace(
        "section-alignment",
        "min-services",
        true,
        "info",
        `${content.services.length} services meet CKB minimum`,
        kid,
      ),
    );
  }

  if (content.testimonials.length < policy.minTestimonials) {
    const msg = `Testimonials count ${content.testimonials.length} below CKB minimum ${policy.minTestimonials}`;
    entries.push(
      trace("section-alignment", "min-testimonials", false, "warning", msg, kid),
    );
    warnings.push(msg);
  } else {
    entries.push(
      trace(
        "section-alignment",
        "min-testimonials",
        true,
        "info",
        `${content.testimonials.length} testimonials meet CKB minimum`,
        kid,
      ),
    );
  }

  if (content.faq.length < policy.minFaq) {
    const msg = `FAQ count ${content.faq.length} below CKB minimum ${policy.minFaq}`;
    entries.push(
      trace("section-alignment", "min-faq", false, "warning", msg, kid),
    );
    warnings.push(msg);
  } else {
    entries.push(
      trace(
        "section-alignment",
        "min-faq",
        true,
        "info",
        `${content.faq.length} FAQ items meet CKB minimum`,
        kid,
      ),
    );
  }

  const blob = collectText(content);
  const clichesFound = findContentCliches(blob);
  if (clichesFound.length > 0) {
    const msg = `AI clichés detected: ${clichesFound.join(", ")}`;
    entries.push(trace("anti-cliche", "cliche-filter", false, "warning", msg, kid));
    warnings.push(msg);
  } else {
    entries.push(
      trace("anti-cliche", "cliche-filter", true, "info", "No AI clichés detected", kid),
    );
  }

  const forbiddenHits = policy.forbiddenSubjects.filter((subject) => {
    const s = subject.toLowerCase().trim();
    return s.length > 2 && blob.includes(s);
  });
  if (forbiddenHits.length > 0) {
    const msg = `Forbidden subjects in copy: ${forbiddenHits.join(", ")}`;
    entries.push(
      trace("policy-check", "forbidden-subjects", false, "error", msg, kid),
    );
    errors.push(msg);
  } else {
    entries.push(
      trace(
        "policy-check",
        "forbidden-subjects",
        true,
        "info",
        `No forbidden subjects (${policy.forbiddenSubjects.length} rules checked)`,
        kid,
      ),
    );
  }

  if (policy.requiredSections.length > 0) {
    const { covered, missing } = sectionCoverage(content, policy.requiredSections);
    if (missing.length > 0) {
      const msg = `Missing section coverage: ${missing.join(", ")} (covered: ${covered.join(", ") || "none"})`;
      entries.push(
        trace("section-alignment", "required-sections", false, "warning", msg, kid),
      );
      warnings.push(msg);
    } else {
      entries.push(
        trace(
          "section-alignment",
          "required-sections",
          true,
          "info",
          `All ${covered.length} required sections represented in copy`,
          kid,
        ),
      );
    }
  }

  if (!content.hero.headline?.trim()) {
    const msg = "Hero headline is empty";
    entries.push(trace("policy-check", "hero-headline", false, "error", msg, kid));
    errors.push(msg);
  } else {
    entries.push(
      trace(
        "policy-check",
        "hero-headline",
        true,
        "info",
        `Hero headline present (${content.hero.headline.length} chars)`,
        kid,
      ),
    );
  }

  if (content.seo.description.length < policy.minSeoDescriptionLength) {
    const msg = `SEO description too short (${content.seo.description.length}/${policy.minSeoDescriptionLength} chars)`;
    entries.push(trace("policy-check", "seo-description", false, "warning", msg, kid));
    warnings.push(msg);
  } else {
    entries.push(
      trace(
        "policy-check",
        "seo-description",
        true,
        "info",
        `SEO description length OK (${content.seo.description.length} chars)`,
        kid,
      ),
    );
  }

  if (policy.heroKeywords.length > 0) {
    const heroBlob = `${content.hero.headline} ${content.hero.subheadline}`.toLowerCase();
    const keywordHits = policy.heroKeywords.filter((k) =>
      heroBlob.includes(k.toLowerCase().slice(0, 12)),
    );
    entries.push(
      trace(
        "policy-check",
        "hero-keyword-alignment",
        keywordHits.length > 0,
        keywordHits.length > 0 ? "info" : "warning",
        keywordHits.length > 0
          ? `Hero aligns with plan keywords: ${keywordHits.slice(0, 3).join(", ")}`
          : "Hero copy may not reflect locked image/plan keywords",
        kid,
      ),
    );
    if (keywordHits.length === 0) {
      warnings.push("Hero copy may not reflect locked plan image keywords");
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
  };
}

/** Reset trace counter between test runs. */
export function resetContentValidationTraceCounter(): void {
  entryCounter = 0;
}
