import { createClient } from "@supabase/supabase-js";
import {
  getSmartTemplate,
  isSmartTemplateId,
  listSmartTemplates,
} from "@/lib/website/smart-templates/catalog";
import type {
  SmartTemplateDefinition,
  SmartTemplateId,
} from "@/lib/website/smart-templates/types";

/**
 * Load templates from Supabase when available; fall back to in-code catalog.
 */
export async function loadSmartTemplatesFromDatabase(): Promise<
  SmartTemplateDefinition[]
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return listSmartTemplates();

  try {
    const supabase = createClient(url, anon);
    const { data: rows, error } = await supabase
      .from("templates")
      .select(
        "id, name, slug, category, description, industry_id, layout_style, navigation, footer, cta_style, required_pages, required_features, content_tone, keywords, sort_order, template_sections(section_key, label, sort_order), template_design_systems(design_preset, color_palette, typography, spacing, config)",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !rows?.length) return listSmartTemplates();

    const mapped: SmartTemplateDefinition[] = [];
    for (const row of rows) {
      const id = String(row.id);
      if (!isSmartTemplateId(id)) continue;
      const base = getSmartTemplate(id);
      const design = Array.isArray(row.template_design_systems)
        ? row.template_design_systems[0]
        : row.template_design_systems;
      const sectionsRaw = Array.isArray(row.template_sections)
        ? row.template_sections
        : [];

      mapped.push({
        ...base,
        name: row.name ?? base.name,
        description: row.description ?? base.description,
        category: row.category ?? base.category,
        navigation: Array.isArray(row.navigation)
          ? row.navigation.map(String)
          : base.navigation,
        footer:
          row.footer && typeof row.footer === "object"
            ? {
                columns: Array.isArray((row.footer as { columns?: unknown }).columns)
                  ? ((row.footer as { columns: string[] }).columns ?? base.footer.columns)
                  : base.footer.columns,
                newsletter: Boolean(
                  (row.footer as { newsletter?: boolean }).newsletter,
                ),
                trustBadges: Array.isArray(
                  (row.footer as { trustBadges?: unknown }).trustBadges,
                )
                  ? ((row.footer as { trustBadges: string[] }).trustBadges ??
                    base.footer.trustBadges)
                  : base.footer.trustBadges,
              }
            : base.footer,
        ctaStyle:
          row.cta_style && typeof row.cta_style === "object"
            ? { ...base.ctaStyle, ...(row.cta_style as object) }
            : base.ctaStyle,
        requiredPages: Array.isArray(row.required_pages)
          ? row.required_pages.map(String)
          : base.requiredPages,
        requiredFeatures: Array.isArray(row.required_features)
          ? row.required_features.map(String)
          : base.requiredFeatures,
        contentTone: row.content_tone ?? base.contentTone,
        keywords: Array.isArray(row.keywords)
          ? row.keywords.map(String)
          : base.keywords,
        sections: sectionsRaw.length
          ? sectionsRaw
              .map((s: { section_key?: string; label?: string; sort_order?: number }) => ({
                key: String(s.section_key ?? ""),
                label: String(s.label ?? ""),
                sortOrder: Number(s.sort_order ?? 0),
              }))
              .sort((a, b) => a.sortOrder - b.sortOrder)
          : base.sections,
        designPreset:
          (design?.design_preset as SmartTemplateDefinition["designPreset"]) ??
          base.designPreset,
        colorPalette:
          design?.color_palette && typeof design.color_palette === "object"
            ? { ...base.colorPalette, ...(design.color_palette as object) }
            : base.colorPalette,
        typography:
          design?.typography && typeof design.typography === "object"
            ? { ...base.typography, ...(design.typography as object) }
            : base.typography,
        spacing:
          design?.spacing && typeof design.spacing === "object"
            ? { ...base.spacing, ...(design.spacing as object) }
            : base.spacing,
      });
    }

    return mapped.length ? mapped : listSmartTemplates();
  } catch {
    return listSmartTemplates();
  }
}

export function getCatalogTemplate(id: SmartTemplateId): SmartTemplateDefinition {
  return getSmartTemplate(id);
}
