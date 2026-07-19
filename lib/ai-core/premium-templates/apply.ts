import {
  getIndustryDetectionFromBrief,
  mergeIndustryIntelligenceIntoSelection,
} from "@/lib/ai-core/industry-intelligence/apply";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import type { ConfiguredPremiumTemplate } from "@/lib/ai-core/premium-templates/types";
import { getSmartTemplate } from "@/lib/website/smart-templates/catalog";
import { mergeSmartTemplateFeatures } from "@/lib/website/smart-templates/select";
import type { SmartTemplateSelectionResult } from "@/lib/website/smart-templates/types";

const WEBSITE_INPUT_KEY = "websiteGenerationInput";

/**
 * Map a configured premium template into TemplateSelection + Smart-compatible config.
 */
export function premiumToTemplateSelection(
  configured: ConfiguredPremiumTemplate,
): TemplateSelection {
  const t = configured.template;
  const smart = getSmartTemplate(t.smartTemplateId);

  const designConfiguration: Record<string, unknown> = {
    layoutStyle: configured.layoutStyle,
    designPreset: configured.designPreset,
    colorPalette: {
      ...smart.colorPalette,
      primary: t.colorHints.primary,
      secondary: t.colorHints.secondary,
      accent: t.colorHints.accent,
      background: t.colorHints.background,
    },
    typography: {
      display: t.typographyHints.display,
      body: t.typographyHints.body,
      scale: smart.typography.scale,
    },
    ctaStyle: {
      primaryLabel: configured.contentStrategy.ctaHierarchy[0] || smart.ctaStyle.primaryLabel,
      secondaryLabel:
        configured.contentStrategy.ctaHierarchy[1] || smart.ctaStyle.secondaryLabel,
      style: smart.ctaStyle.style,
    },
    navigation: smart.navigation,
    footer: smart.footer,
    sections: configured.sections.map((s) => s.label),
    requiredPages: configured.pageStructure.map((p) => p.name),
    requiredFeatures: smart.requiredFeatures,
    contentTone: configured.contentStrategy.brandVoice,
    // Premium Templates System payload for renderer / components / images / strategy
    premiumTemplate: {
      id: t.id,
      name: t.name,
      websiteGoal: configured.websiteGoal,
      brandStyle: configured.brandStyle,
      designStyle: configured.designStyle,
      designPreset: configured.designPreset,
      layoutStyle: configured.layoutStyle,
      pageStructure: configured.pageStructure,
      sections: configured.sections,
      recommendedComponents: configured.recommendedComponents,
      imageRequirements: configured.imageRequirements,
      contentStrategy: configured.contentStrategy,
      conversionPath: configured.conversionPath,
      layoutNotes: configured.layoutNotes,
      colorHints: t.colorHints,
      typographyHints: t.typographyHints,
      reason: configured.reason,
      source: configured.source,
    },
  };

  return {
    industryId: t.industryId,
    label: t.name,
    layoutStyle: configured.layoutStyle,
    sections: configured.sections.map((s) => s.label),
    designPreset: configured.designPreset,
    requiredFeatures: [...smart.requiredFeatures],
    suggestedPages: configured.pageStructure.map((p) => p.name),
    contentTone: configured.contentStrategy.brandVoice,
    industryPattern: `${t.industryId}-${t.id}`,
    confidence: configured.confidence,
    source:
      configured.source === "industry" ? "default" : configured.source,
    smartTemplateId: t.smartTemplateId,
    designConfiguration,
    industryIntelligence: {
      id: t.industryId,
      label: t.name,
      industryPattern: `${t.industryId}-${t.id}`,
      recommendedPages: configured.pageStructure.map((p) => p.name),
      requiredSections: configured.sections.map((s) => s.label),
      ctaTypes: configured.contentStrategy.ctaHierarchy,
      contentStyle: configured.contentStrategy.brandVoice,
      designStyle: configured.designStyle,
      imageRequirements: configured.imageRequirements.map((i) => i.brief),
    },
  };
}

/**
 * Apply Premium Templates System result onto a Core brief for Website Builder.
 * Keeps Smart Template compatibility fields so existing consumers keep working.
 */
export function applyPremiumTemplateToBrief(
  brief: CoreBrief,
  configured: ConfiguredPremiumTemplate,
): { brief: CoreBrief; selection: TemplateSelection } {
  let templateSelection = premiumToTemplateSelection(configured);
  const detection = getIndustryDetectionFromBrief(brief);
  if (detection) {
    templateSelection = mergeIndustryIntelligenceIntoSelection(
      templateSelection,
      detection,
    );
    // Prefer premium section order / pages when intelligence merge thins them.
    if (
      !templateSelection.sections?.length ||
      templateSelection.sections.length < configured.sections.length
    ) {
      templateSelection.sections = configured.sections.map((s) => s.label);
    }
    if (
      !templateSelection.suggestedPages?.length ||
      templateSelection.suggestedPages.length < configured.pageStructure.length
    ) {
      templateSelection.suggestedPages = configured.pageStructure.map(
        (p) => p.name,
      );
    }
    // Ensure premium payload survives merge.
    templateSelection.designConfiguration = {
      ...(templateSelection.designConfiguration ?? {}),
      ...(premiumToTemplateSelection(configured).designConfiguration ?? {}),
    };
    templateSelection.industryIntelligence = {
      ...(templateSelection.industryIntelligence ?? {
        recommendedPages: [],
        requiredSections: [],
        ctaTypes: [],
        contentStyle: "",
        designStyle: "",
        imageRequirements: [],
      }),
      recommendedPages: configured.pageStructure.map((p) => p.name),
      requiredSections: configured.sections.map((s) => s.label),
      ctaTypes: configured.contentStrategy.ctaHierarchy,
      contentStyle: configured.contentStrategy.brandVoice,
      designStyle: configured.designStyle,
      imageRequirements: [
        ...configured.imageRequirements.map((i) => i.brief),
        ...(templateSelection.industryIntelligence?.imageRequirements ?? []),
      ].slice(0, 10),
    };
  }

  const smartCompat = toSmartSelectionCompat(configured);
  const features = mergeSmartTemplateFeatures(brief.features, smartCompat);

  const metadata: Record<string, unknown> = {
    ...(brief.metadata ?? {}),
    templateSelection,
    premiumTemplateSelection: configured,
    smartTemplateSelection: smartCompat,
    templateId: configured.template.smartTemplateId,
    smartTemplateId: configured.template.smartTemplateId,
    premiumTemplateId: configured.template.id,
    websiteGoal: configured.websiteGoal,
    industryId: templateSelection.industryId,
    industry: templateSelection.label,
    premiumPageStructure: configured.pageStructure,
    premiumContentStrategy: configured.contentStrategy,
    premiumConversionPath: configured.conversionPath,
    premiumLayoutNotes: configured.layoutNotes,
  };

  const nested = metadata[WEBSITE_INPUT_KEY];
  if (nested && typeof nested === "object") {
    const row = { ...(nested as Record<string, unknown>) };
    row.templateId = configured.template.smartTemplateId;
    metadata[WEBSITE_INPUT_KEY] = row;
  }

  return {
    brief: {
      ...brief,
      features,
      metadata,
    },
    selection: templateSelection,
  };
}

function toSmartSelectionCompat(
  configured: ConfiguredPremiumTemplate,
): SmartTemplateSelectionResult {
  const smart = getSmartTemplate(configured.template.smartTemplateId);
  const t = configured.template;
  const source: SmartTemplateSelectionResult["source"] =
    configured.source === "explicit"
      ? "explicit"
      : configured.source === "analysis"
        ? "analysis"
        : configured.source === "keyword"
          ? "keyword"
          : "default";

  return {
    templateId: smart.id,
    confidence: configured.confidence,
    reason: configured.reason,
    source,
    designConfiguration: {
      layoutStyle: configured.layoutStyle,
      designPreset: configured.designPreset,
      colorPalette: {
        ...smart.colorPalette,
        primary: t.colorHints.primary,
        secondary: t.colorHints.secondary,
        accent: t.colorHints.accent,
        background: t.colorHints.background,
      },
      typography: {
        display: t.typographyHints.display,
        body: t.typographyHints.body,
        scale: smart.typography.scale,
      },
      ctaStyle: {
        primaryLabel:
          configured.contentStrategy.ctaHierarchy[0] ||
          smart.ctaStyle.primaryLabel,
        secondaryLabel:
          configured.contentStrategy.ctaHierarchy[1] ||
          smart.ctaStyle.secondaryLabel,
        style: smart.ctaStyle.style,
      },
      navigation: smart.navigation,
      footer: smart.footer,
      sections: configured.sections.map((s) => s.label),
      requiredPages: configured.pageStructure.map((p) => p.name),
      requiredFeatures: smart.requiredFeatures,
      contentTone: configured.contentStrategy.brandVoice,
    },
    template: smart,
  };
}
