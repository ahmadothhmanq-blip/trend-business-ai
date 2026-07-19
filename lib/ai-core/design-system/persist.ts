import { createAdminClient } from "@/lib/supabase/admin";
import type { AiDesignSystem } from "@/lib/ai-core/design-system/types";

export type PersistGeneratedDesignParams = {
  userId: string;
  websiteGenerationId?: string;
  aiRunId?: string;
  design: AiDesignSystem;
  templateId?: string;
  source?: string;
  summary?: string;
};

export type PersistGeneratedDesignResult = {
  designSystemId?: string;
  generatedDesignId?: string;
};

/**
 * Persist design_systems + generated_designs (soft-fail).
 */
export async function persistGeneratedDesign(
  params: PersistGeneratedDesignParams,
): Promise<PersistGeneratedDesignResult> {
  const admin = createAdminClient();
  if (!admin) return {};

  try {
    const { data: systemRow, error: systemError } = await admin
      .from("design_systems")
      .insert({
        user_id: params.userId,
        website_generation_id: params.websiteGenerationId ?? null,
        ai_run_id: params.aiRunId ?? null,
        preset_id: params.design.preset,
        template_id: params.templateId ?? null,
        name: `${params.design.style} · ${params.design.industryPattern}`,
        style: params.design.style,
        industry_pattern: params.design.industryPattern,
        layout_style: params.design.layoutStyle,
        color_palette: params.design.colors,
        typography: params.design.typography,
        spacing: params.design.spacing,
        border_radius: params.design.borderRadius,
        shadow_style: params.design.shadowStyle,
        button_styles: {
          primary: params.design.componentStyle.buttons,
          notes: params.design.componentStyle.buttons,
        },
        card_styles: {
          style: params.design.componentStyle.cards,
        },
        section_layouts: params.design.componentStyle.palette,
        ui_patterns: params.design.uiPatterns,
        animation_style: params.design.animationStyle,
        source: params.source ?? "engine",
        metadata: {
          layoutRules: params.design.layoutRules,
          uiStyle: params.design.uiStyle,
        },
      })
      .select("id")
      .single();

    if (systemError || !systemRow?.id) {
      console.error("AI Design System: persist system failed", systemError);
      return {};
    }

    const { data: generatedRow, error: generatedError } = await admin
      .from("generated_designs")
      .insert({
        user_id: params.userId,
        design_system_id: systemRow.id,
        website_generation_id: params.websiteGenerationId ?? null,
        ai_run_id: params.aiRunId ?? null,
        status: "ready",
        summary: params.summary ?? params.design.style,
        design_json: params.design,
        metadata: {
          preset: params.design.preset,
          source: params.source ?? "engine",
          templateId: params.templateId ?? null,
        },
      })
      .select("id")
      .single();

    if (generatedError) {
      console.error("AI Design System: persist generated failed", generatedError);
    }

    return {
      designSystemId: systemRow.id,
      generatedDesignId: generatedRow?.id,
    };
  } catch (error) {
    console.error("AI Design System: persist failed", error);
    return {};
  }
}
