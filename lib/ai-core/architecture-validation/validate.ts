import type {
  ArchitectureValidationCorrection,
  ArchitectureValidationResult,
  ArchitectureValidationTraceEntry,
  WebsiteGenerationPlan,
} from "@/lib/ai-core/architecture-validation/types";
import { traceEntry } from "@/lib/ai-core/architecture-validation/rules";
import {
  getBusinessRulesKnowledge,
  isEditorialLayoutIndustry,
  isEditorialLayoutStructure,
  isEditorialPageTopology,
  isForbiddenPremiumTemplate,
  isForbiddenStructureTemplate,
  isLayoutFamilyAllowed,
  normalizeRoutingIndustryId,
  resolveIndustryKnowledge,
  resolveIndustryLayoutFamily,
  resolveStructureTemplateIdForIndustry,
  resolveVisualThemePresetForIndustry,
} from "@/lib/ai-core/architecture-knowledge-base";
import { getWebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";

/**
 * Validate cross-dependencies on a WebsiteGenerationPlan draft.
 * All rules are resolved from the Architecture Knowledge Base — no hardcoded industry logic.
 */
export function validateWebsiteGenerationPlan(
  plan: WebsiteGenerationPlan,
  attempt = 1,
): ArchitectureValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const reasoning: string[] = [];
  const recommendedCorrections: ArchitectureValidationCorrection[] = [];
  const trace: ArchitectureValidationTraceEntry[] = [];

  const industryLookup = resolveIndustryKnowledge(plan.industryId);
  const industryId = normalizeRoutingIndustryId(plan.industryId);
  const industryEntry = industryLookup.value;
  const expectedFamily = resolveIndustryLayoutFamily(industryId).value;
  const businessRules = getBusinessRulesKnowledge();

  reasoning.push(
    `AKB industry:${industryLookup.entryId}@${industryLookup.entryVersion}`,
  );

  // --- Industry ↔ layout family ---
  const familyOk = isLayoutFamilyAllowed(industryId, plan.layoutFamily);
  trace.push(
    traceEntry(
      "industry-layout-family",
      "layout",
      familyOk,
      familyOk ? "warning" : "error",
      familyOk
        ? `${industryId} → ${plan.layoutFamily} allowed per AKB`
        : `${industryId} → ${plan.layoutFamily} forbidden (AKB expects ${expectedFamily})`,
      industryLookup.entryId,
    ),
  );
  if (!familyOk) {
    errors.push(
      `Industry "${industryId}" cannot use layout family "${plan.layoutFamily}".`,
    );
    recommendedCorrections.push({
      field: "layoutFamily",
      currentValue: plan.layoutFamily,
      recommendedValue: expectedFamily,
      reason: `AKB industry ${industryLookup.entryId} requires layout family ${expectedFamily}`,
    });
  }

  // --- Editorial layout guard (from layout-taxonomy-global) ---
  const editorialIndustry = isEditorialLayoutIndustry(industryId);
  const editorialStructure = isEditorialLayoutStructure(plan.layoutStructure);
  const editorialTopology = isEditorialPageTopology(plan.pageTopology);
  const editorialBlocked =
    !editorialIndustry && (editorialStructure || editorialTopology);
  trace.push(
    traceEntry(
      "editorial-layout-guard",
      "layout",
      !editorialBlocked,
      editorialBlocked ? "error" : "warning",
      editorialBlocked
        ? `AKB blocks editorial layout for ${industryId} (${plan.layoutStructure}/${plan.pageTopology})`
        : `Editorial layout check passed for ${industryId}`,
      "layout-taxonomy-global",
    ),
  );
  if (editorialBlocked) {
    errors.push(
      `Industry "${industryId}" cannot use editorial layout structure "${plan.layoutStructure}".`,
    );
    const structureLookup = resolveStructureTemplateIdForIndustry(industryId);
    const structureTemplate = getWebsiteStructureTemplate(structureLookup.value);
    recommendedCorrections.push({
      field: "structureTemplateId",
      currentValue: plan.structureTemplateId,
      recommendedValue: structureLookup.value,
      reason: `AKB default structure for ${industryLookup.entryId}`,
    });
    if (structureTemplate) {
      recommendedCorrections.push({
        field: "layoutTemplateIntelligenceId",
        currentValue: plan.layoutTemplateIntelligenceId,
        recommendedValue: structureTemplate.templateIntelligenceId,
        reason: "Align layout TI with AKB industry structure",
      });
    }
  }

  // --- Structure template ↔ industry ---
  const structureForbidden = isForbiddenStructureTemplate(
    industryId,
    plan.structureTemplateId,
  );
  trace.push(
    traceEntry(
      "structure-industry",
      "structure",
      !structureForbidden,
      structureForbidden ? "error" : "warning",
      structureForbidden
        ? `AKB forbids structure ${plan.structureTemplateId} for ${industryId}`
        : `Structure ${plan.structureTemplateId} allowed by AKB`,
      industryLookup.entryId,
    ),
  );
  if (structureForbidden) {
    errors.push(
      `Structure template "${plan.structureTemplateId}" is incompatible with industry "${industryId}".`,
    );
    const structureLookup = resolveStructureTemplateIdForIndustry(industryId);
    recommendedCorrections.push({
      field: "structureTemplateId",
      currentValue: plan.structureTemplateId,
      recommendedValue: structureLookup.value,
      reason: `AKB industry ${industryLookup.entryId} structure default`,
    });
  }

  // --- Premium template ↔ industry ---
  const premiumForbidden = isForbiddenPremiumTemplate(
    industryId,
    plan.premiumTemplateId,
  );
  trace.push(
    traceEntry(
      "premium-industry",
      "template",
      !premiumForbidden,
      premiumForbidden ? "error" : "warning",
      premiumForbidden
        ? `AKB forbids premium ${plan.premiumTemplateId} for ${industryId}`
        : `Premium ${plan.premiumTemplateId} allowed by AKB`,
      industryLookup.entryId,
    ),
  );
  if (premiumForbidden) {
    errors.push(
      `Premium template "${plan.premiumTemplateId}" is incompatible with industry "${industryId}".`,
    );
  }

  // --- Visual theme editorial guard ---
  const themeEditorial =
    plan.visualThemePresetId === "editorial" && !editorialIndustry;
  trace.push(
    traceEntry(
      "visual-theme-editorial",
      "theme",
      !themeEditorial,
      themeEditorial ? "error" : "warning",
      themeEditorial
        ? `AKB forbids editorial visual theme for ${industryId}`
        : `Visual theme ${plan.visualThemePresetId} acceptable`,
      industryLookup.entryId,
    ),
  );
  if (themeEditorial) {
    errors.push(
      `Visual theme "editorial" is not allowed for industry "${industryId}".`,
    );
    const corrected = resolveVisualThemePresetForIndustry(
      industryId,
      plan.industryLabel,
    );
    recommendedCorrections.push({
      field: "visualThemePresetId",
      currentValue: plan.visualThemePresetId,
      recommendedValue: corrected.value,
      reason: `AKB style-rule / default theme via ${corrected.entryId}`,
    });
  }

  // --- Sections (business-rules-default) ---
  const sectionsOk = plan.sections.length >= businessRules.minSections;
  trace.push(
    traceEntry(
      "sections-minimum",
      "sections",
      sectionsOk,
      sectionsOk ? "warning" : "error",
      sectionsOk
        ? `${plan.sections.length} sections`
        : `Only ${plan.sections.length} sections (AKB min ${businessRules.minSections})`,
      businessRules.id,
    ),
  );
  if (!sectionsOk) {
    errors.push(
      `Website plan requires at least ${businessRules.minSections} sections (got ${plan.sections.length}).`,
    );
  }

  // --- Components ---
  const componentsOk = plan.components.length >= businessRules.minComponents;
  trace.push(
    traceEntry(
      "components-minimum",
      "components",
      componentsOk,
      componentsOk ? "warning" : "error",
      componentsOk
        ? `${plan.components.length} components`
        : `Only ${plan.components.length} components`,
      businessRules.id,
    ),
  );
  if (!componentsOk) {
    errors.push(
      `Website plan requires at least ${businessRules.minComponents} layout components.`,
    );
  }

  // --- Image policy (image-policy-default) ---
  const imagePolicy = industryEntry.imagePolicyId ?? "image-policy-default";
  const routingAligned =
    normalizeRoutingIndustryId(plan.imagePolicy.routingIndustryId) ===
      industryId ||
    normalizeRoutingIndustryId(plan.imagePolicy.routingIndustryId) ===
      normalizeRoutingIndustryId(plan.routingIndustryId);
  trace.push(
    traceEntry(
      "image-routing-industry",
      "image",
      routingAligned,
      routingAligned ? "warning" : "error",
      routingAligned
        ? `Image routing id ${plan.imagePolicy.routingIndustryId} aligned with AKB`
        : `Image routing id ${plan.imagePolicy.routingIndustryId} mismatches ${industryId}`,
      imagePolicy,
    ),
  );
  if (!routingAligned) {
    errors.push(
      `Image routing industry "${plan.imagePolicy.routingIndustryId}" does not match plan industry "${industryId}".`,
    );
    recommendedCorrections.push({
      field: "routingIndustryId",
      currentValue: plan.imagePolicy.routingIndustryId,
      recommendedValue: industryId,
      reason: "AKB image policy requires routing alignment with locked industry",
    });
  }

  const keywordsOk = plan.imageKeywords.length >= 2;
  trace.push(
    traceEntry(
      "image-keywords",
      "image",
      keywordsOk,
      keywordsOk ? "warning" : "error",
      keywordsOk
        ? `${plan.imageKeywords.length} image keywords`
        : "Insufficient image keywords",
      imagePolicy,
    ),
  );
  if (!keywordsOk) {
    warnings.push("Image keyword list is shorter than recommended minimum.");
  }

  // --- Business rules ---
  if (businessRules.requireHero && !plan.hero?.trim()) {
    errors.push("Hero messaging is required.");
    trace.push(
      traceEntry(
        "hero-required",
        "business",
        false,
        "error",
        "Missing hero",
        businessRules.id,
      ),
    );
  } else {
    trace.push(
      traceEntry(
        "hero-required",
        "business",
        true,
        "warning",
        "Hero present",
        businessRules.id,
      ),
    );
  }

  if (plan.businessRules.confidence < businessRules.minConfidenceWarning) {
    warnings.push(
      `Business intelligence confidence low (${plan.businessRules.confidence.toFixed(2)}).`,
    );
    trace.push(
      traceEntry(
        "bi-confidence",
        "business",
        false,
        "warning",
        `Low BI confidence: ${plan.businessRules.confidence}`,
        businessRules.id,
      ),
    );
  }

  // --- Reasoning consistency ---
  const routeFamilyMatch =
    plan.route.layoutFamily === plan.layoutFamily ||
    isLayoutFamilyAllowed(industryId, plan.route.layoutFamily);
  trace.push(
    traceEntry(
      "reasoning-route-family",
      "reasoning",
      routeFamilyMatch,
      routeFamilyMatch ? "warning" : "error",
      routeFamilyMatch
        ? "Route and plan layout families consistent with AKB"
        : `Route family ${plan.route.layoutFamily} ≠ plan family ${plan.layoutFamily}`,
      industryLookup.entryId,
    ),
  );
  if (!routeFamilyMatch) {
    errors.push("Route layout family and plan layout family are inconsistent.");
  }

  const status =
    errors.length > 0 ? "failed" : warnings.length > 0 ? "warning" : "passed";

  reasoning.push(
    `Validation attempt ${attempt}: ${status} · ${errors.length} errors · ${warnings.length} warnings · AKB entries: ${industryLookup.entryId}, ${businessRules.id}`,
  );
  for (const entry of trace.filter((t) => !t.passed)) {
    reasoning.push(
      `[${entry.ruleId}${entry.knowledgeEntryId ? `@${entry.knowledgeEntryId}` : ""}] ${entry.message}`,
    );
  }

  const confidence = Math.max(
    0,
    plan.confidence - errors.length * 0.12 - warnings.length * 0.04,
  );

  return {
    status,
    errors,
    warnings,
    confidence,
    reasoning,
    recommendedCorrections: dedupeCorrections(recommendedCorrections),
    trace,
    plan: status !== "failed" ? plan : undefined,
    attempt,
    validatedAt: new Date().toISOString(),
  };
}

function dedupeCorrections(
  rows: ArchitectureValidationCorrection[],
): ArchitectureValidationCorrection[] {
  const seen = new Set<string>();
  const out: ArchitectureValidationCorrection[] = [];
  for (const row of rows) {
    const key = `${row.field}:${row.recommendedValue}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}
