import { requireUser } from "@/lib/api/helpers";
import { DESIGN_PRESET_IDS, getDesignPreset } from "@/lib/ai-core/design-system";
import { NextResponse } from "next/server";

/** GET /api/ai-core/design-presets — AI Design System presets (Phase 7). */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  return NextResponse.json({
    presets: DESIGN_PRESET_IDS.map((id) => {
      const preset = getDesignPreset(id);
      return {
        id: preset.preset,
        style: preset.style,
        colors: preset.colors,
        typography: preset.typography,
        spacing: preset.spacing,
        uiStyle: preset.uiStyle,
        componentStyle: preset.componentStyle,
        animationStyle: preset.animationStyle,
        layoutRules: preset.layoutRules,
        uiPatterns: preset.uiPatterns,
      };
    }),
  });
}
