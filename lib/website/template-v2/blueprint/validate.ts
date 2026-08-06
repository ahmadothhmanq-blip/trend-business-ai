import { buildWebsiteBlueprint } from "@/lib/website/template-v2/blueprint/engine";
import { blueprintInputSchema } from "@/lib/website/template-v2/blueprint/schema";
import {
  isWebsiteBlueprint,
  parseWebsiteBlueprint,
} from "@/lib/website/template-v2/blueprint/serialize";
import type {
  BlueprintInput,
  BlueprintValidation,
  WebsiteBlueprint,
} from "@/lib/website/template-v2/blueprint/types";
import { BLUEPRINT_ENGINE_VERSION } from "@/lib/website/template-v2/blueprint/weights";
import { validateVariantRegistry } from "@/lib/website/template-v2/variants/registry";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

const REQUIRED_SECTIONS: SectionKind[] = ["hero", "cta", "footer"];

export function validateBlueprintInput(
  input: BlueprintInput,
): BlueprintValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = blueprintInputSchema.safeParse(input);
  if (!parsed.success) {
    errors.push(
      ...parsed.error.issues.map(
        (i) => `Input.${i.path.join(".")}: ${i.message}`,
      ),
    );
    return { valid: false, errors, warnings };
  }

  if (input.sectionOrder?.length === 0) {
    errors.push("sectionOrder must not be empty when provided");
  }

  if (input.imageAvailability === "none" && input.websiteGoal === "portfolio") {
    warnings.push("Portfolio goal with no images may produce weak visual sections");
  }

  if (input.languageDirection === "rtl" && input.visualStyle === "editorial") {
    warnings.push("Editorial style with RTL may need manual review");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateWebsiteBlueprint(
  blueprint: WebsiteBlueprint,
): BlueprintValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isWebsiteBlueprint(blueprint)) {
    try {
      parseWebsiteBlueprint(blueprint);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Schema validation failed");
      return { valid: false, errors, warnings };
    }
  }

  const registry = validateVariantRegistry();
  if (!registry.valid) {
    errors.push(...registry.errors.map((e) => `Registry: ${e}`));
  }

  if (blueprint.meta.version !== BLUEPRINT_ENGINE_VERSION) {
    warnings.push(
      `Blueprint version ${blueprint.meta.version} differs from engine ${BLUEPRINT_ENGINE_VERSION}`,
    );
  }

  for (const required of REQUIRED_SECTIONS) {
    if (!blueprint.sectionOrder.includes(required)) {
      errors.push(`sectionOrder missing required section: ${required}`);
    }
  }

  for (const section of blueprint.sectionVariants) {
    const inOrder = blueprint.sectionOrder.includes(section.sectionKind);
    if (!inOrder) {
      warnings.push(
        `sectionVariants includes ${section.sectionKind} not in sectionOrder`,
      );
    }
    if (section.score < 0) {
      warnings.push(`${section.sectionKind}: negative variant score`);
    }
  }

  const variantIds = new Set(
    blueprint.sectionVariants.map((s) => `${s.sectionKind}:${s.variantId}`),
  );
  if (variantIds.size !== blueprint.sectionVariants.length) {
    errors.push("Duplicate section variant entries in blueprint");
  }

  if (blueprint.heroComposition.variantId !== blueprint.sectionVariants.find((s) => s.sectionKind === "hero")?.variantId) {
    errors.push("heroComposition.variantId does not match sectionVariants hero");
  }

  if (blueprint.ctaStrategy.variantId !== blueprint.sectionVariants.find((s) => s.sectionKind === "cta")?.variantId) {
    errors.push("ctaStrategy.variantId does not match sectionVariants cta");
  }

  if (blueprint.footerStyle.variantId !== blueprint.sectionVariants.find((s) => s.sectionKind === "footer")?.variantId) {
    errors.push("footerStyle.variantId does not match sectionVariants footer");
  }

  if (
    blueprint.imageStrategy.availability === "none" &&
    blueprint.heroComposition.mediaPosition !== "none"
  ) {
    warnings.push("Image strategy is none but hero has media position");
  }

  if (
    blueprint.accessibilityProfile.level === "strict" &&
    blueprint.motionStrategy.intensity !== "none"
  ) {
    warnings.push("Strict accessibility with non-none motion intensity");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateBlueprintEngine(): BlueprintValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const registry = validateVariantRegistry();
  if (!registry.valid) errors.push(...registry.errors);

  const scenarios: BlueprintInput[] = [
    {
      industry: "saas",
      websiteGoal: "saas",
      targetAudience: "b2b",
      premiumLevel: "premium",
      seed: "engine-validate-saas",
    },
    {
      industry: "hotel-resort",
      websiteGoal: "booking",
      targetAudience: "luxury",
      premiumLevel: "luxury",
      visualStyle: "luxury",
      seed: "engine-validate-hotel",
    },
    {
      industry: "creative-agency",
      websiteGoal: "portfolio",
      imageAvailability: "rich",
      seed: "engine-validate-portfolio",
    },
    {
      imageAvailability: "none",
      accessibilityLevel: "strict",
      websiteGoal: "saas",
      seed: "engine-validate-strict",
    },
  ];

  for (const input of scenarios) {
    const inputValidation = validateBlueprintInput(input);
    if (!inputValidation.valid) {
      errors.push(...inputValidation.errors);
      continue;
    }

    const blueprint = buildWebsiteBlueprint(input);
    const blueprintValidation = validateWebsiteBlueprint(blueprint);
    if (!blueprintValidation.valid) {
      errors.push(
        ...blueprintValidation.errors.map(
          (e) => `[${input.seed}] ${e}`,
        ),
      );
    }
    warnings.push(...blueprintValidation.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}
