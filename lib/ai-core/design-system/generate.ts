/**
 * AI Design System Generator.
 * Pipeline: business + template → DeepSeek refine → full design system.
 * Falls back to deterministic buildAiDesignSystemFromStrategy when AI unavailable.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type {
  CoreBrief,
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import {
  buildAiDesignSystemFromStrategy,
  type BuildAiDesignSystemInput,
} from "@/lib/ai-core/design-system/build";
import {
  DESIGN_PRESET_IDS,
  normalizeDesignPreset,
} from "@/lib/ai-core/design-system/presets";
import type {
  AiDesignSystem,
  DesignColorPalette,
  DesignPresetId,
} from "@/lib/ai-core/design-system/types";
import { persistGeneratedDesign } from "@/lib/ai-core/design-system/persist";

type DeepSeekDesignRefinement = {
  preset?: string;
  style?: string;
  colors?: Partial<DesignColorPalette>;
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    notes?: string;
  };
  spacing?: {
    sectionGap?: string;
    containerMax?: string;
    notes?: string;
  };
  borderRadius?: string;
  shadowStyle?: string;
  buttons?: string;
  cards?: string;
  sectionLayouts?: string[];
  layoutStyle?: string;
  layoutRules?: string[];
  reason?: string;
};

export type GenerateDesignSystemInput = BuildAiDesignSystemInput & {
  brief?: CoreBrief;
  userId?: string;
  websiteGenerationId?: string;
  aiRunId?: string;
  persist?: boolean;
};

export type GenerateDesignSystemResult = {
  design: AiDesignSystem;
  source: "deepseek" | "deterministic";
  designSystemId?: string;
  generatedDesignId?: string;
};

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function applyRefinement(
  base: AiDesignSystem,
  refinement: DeepSeekDesignRefinement,
): AiDesignSystem {
  const preset = refinement.preset
    ? normalizeDesignPreset(refinement.preset)
    : base.preset;

  const colors = { ...base.colors };
  if (refinement.colors) {
    for (const key of Object.keys(colors) as Array<keyof DesignColorPalette>) {
      const next = refinement.colors[key];
      if (isHexColor(next)) colors[key] = next;
    }
  }

  return {
    ...base,
    preset,
    style: refinement.style?.trim() || base.style,
    colors,
    typography: {
      ...base.typography,
      headingFont:
        refinement.typography?.headingFont?.trim() || base.typography.headingFont,
      bodyFont:
        refinement.typography?.bodyFont?.trim() || base.typography.bodyFont,
      notes: refinement.typography?.notes?.trim() || base.typography.notes,
    },
    spacing: {
      ...base.spacing,
      sectionGap: refinement.spacing?.sectionGap?.trim() || base.spacing.sectionGap,
      containerMax:
        refinement.spacing?.containerMax?.trim() || base.spacing.containerMax,
      notes: refinement.spacing?.notes?.trim() || base.spacing.notes,
    },
    borderRadius: refinement.borderRadius?.trim() || base.borderRadius,
    shadowStyle: refinement.shadowStyle?.trim() || base.shadowStyle,
    componentStyle: {
      ...base.componentStyle,
      buttons: refinement.buttons?.trim() || base.componentStyle.buttons,
      cards: refinement.cards?.trim() || base.componentStyle.cards,
      palette:
        Array.isArray(refinement.sectionLayouts) &&
        refinement.sectionLayouts.length > 0
          ? refinement.sectionLayouts.map(String).slice(0, 10)
          : base.componentStyle.palette,
    },
    layoutStyle: refinement.layoutStyle?.trim() || base.layoutStyle,
    layoutRules:
      Array.isArray(refinement.layoutRules) && refinement.layoutRules.length > 0
        ? refinement.layoutRules.map(String).slice(0, 8)
        : base.layoutRules,
  };
}

async function refineWithDeepSeek(params: {
  base: AiDesignSystem;
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  brief?: CoreBrief;
}): Promise<DeepSeekDesignRefinement | null> {
  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) return null;

  const business =
    params.brief?.prompt ||
    params.profile?.summary ||
    params.strategy.positioning ||
    "General business";

  try {
    return await providerManager.generateJson<DeepSeekDesignRefinement>(
      {
        system:
          "You are a senior brand/UI design system architect for a professional website builder. Refine a design system for the business and template. Respond with JSON only. Prefer hex colors. Choose preset from: luxury, modern, minimal, corporate, creative, tech.",
        prompt: `Business:
"""
${business}
"""

Industry: ${params.profile?.industry ?? params.base.industryPattern}
Industry design style: ${params.templateSelection?.industryIntelligence?.designStyle ?? params.base.style}
Tone: ${params.profile?.tone ?? params.templateSelection?.industryIntelligence?.contentStyle ?? "n/a"}
Positioning: ${params.strategy.positioning}
Template: ${params.templateSelection?.smartTemplateId ?? params.templateSelection?.industryPattern ?? "n/a"}
Template design preset: ${params.templateSelection?.designPreset ?? "n/a"}
Recommended sections: ${(params.templateSelection?.industryIntelligence?.requiredSections ?? params.templateSelection?.sections ?? []).slice(0, 8).join(", ") || "n/a"}
Current foundation preset: ${params.base.preset}
Available presets: ${DESIGN_PRESET_IDS.join(", ")}

Foundation (do not invent unrelated brands; refine for fit):
${JSON.stringify(
  {
    preset: params.base.preset,
    style: params.base.style,
    colors: params.base.colors,
    typography: params.base.typography,
    spacing: params.base.spacing,
    borderRadius: params.base.borderRadius,
    shadowStyle: params.base.shadowStyle,
    buttons: params.base.componentStyle.buttons,
    cards: params.base.componentStyle.cards,
    sectionLayouts: params.base.componentStyle.palette,
  },
  null,
  2,
)}

Return JSON:
{
  "preset": "<one of ${DESIGN_PRESET_IDS.join("|")}>",
  "style": "short style name",
  "colors": { "primary":"#hex","secondary":"#hex","accent":"#hex","neutral":"#hex","surface":"#hex","background":"#hex","foreground":"#hex" },
  "typography": { "headingFont":"...","bodyFont":"...","notes":"..." },
  "spacing": { "sectionGap":"...","containerMax":"...","notes":"..." },
  "borderRadius": "...",
  "shadowStyle": "...",
  "buttons": "button style description",
  "cards": "card style description",
  "sectionLayouts": ["Hero","..."],
  "layoutStyle": "...",
  "layoutRules": ["..."],
  "reason": "one short sentence"
}`,
        temperature: 0.35,
      },
      resolved,
    );
  } catch {
    return null;
  }
}

/**
 * Generate a full AI design system from strategy + template.
 * Uses DeepSeek when available; always returns a valid design system.
 */
export async function generateDesignSystem(
  input: GenerateDesignSystemInput,
): Promise<GenerateDesignSystemResult> {
  const base = buildAiDesignSystemFromStrategy(input);
  let design = base;
  let source: GenerateDesignSystemResult["source"] = "deterministic";

  const refinement = await refineWithDeepSeek({
    base,
    strategy: input.strategy,
    profile: input.profile,
    templateSelection: input.templateSelection,
    brief: input.brief,
  });

  if (refinement) {
    design = applyRefinement(base, refinement);
    // If DeepSeek picked a different preset, rebuild foundation from that preset
    // then re-apply color/type refinements so spacing/uiStyle stay coherent.
    const refinedPreset = normalizeDesignPreset(
      refinement.preset ?? design.preset,
    ) as DesignPresetId;
    if (refinedPreset !== base.preset) {
      const fromPreset = buildAiDesignSystemFromStrategy({
        ...input,
        preferredPreset: refinedPreset,
      });
      design = applyRefinement(fromPreset, refinement);
    }
    source = "deepseek";
  }

  let designSystemId: string | undefined;
  let generatedDesignId: string | undefined;

  if (input.persist !== false && input.userId) {
    const persisted = await persistGeneratedDesign({
      userId: input.userId,
      websiteGenerationId: input.websiteGenerationId,
      aiRunId: input.aiRunId,
      design,
      templateId:
        input.templateSelection?.smartTemplateId ??
        input.templateSelection?.industryPattern,
      source,
      summary:
        refinement && typeof refinement.reason === "string"
          ? refinement.reason
          : `${design.style} design system for ${design.industryPattern}`,
    });
    designSystemId = persisted.designSystemId;
    generatedDesignId = persisted.generatedDesignId;
  }

  return { design, source, designSystemId, generatedDesignId };
}
