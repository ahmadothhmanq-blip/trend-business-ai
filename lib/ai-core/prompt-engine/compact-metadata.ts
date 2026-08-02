function jsonSize(value: unknown): number {
  if (value === undefined) return 0;
  try {
    return JSON.stringify(value).length;
  } catch {
    return 0;
  }
}

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function truncateStrings(values: string[], maxItem = 160, maxItems = 24): string[] {
  return values.slice(0, maxItems).map((entry) => truncateText(entry, maxItem));
}

function pickRecord(
  source: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

/** Compact analysis metadata — preserve capability flags and business profile essentials. */
export function compactAnalysisMetadata(analysis: unknown): unknown {
  const record = asRecord(analysis);
  const businessProfile = asRecord(record.businessProfile);

  return {
    ...pickRecord(record, [
      "projectName",
      "projectType",
      "pages",
      "features",
      "designSystem",
      "technologies",
      "databaseProvider",
      "requiresAuth",
      "requiresDatabase",
      "requiresDashboard",
      "isEcommerce",
      "isSaas",
    ]),
    businessProfile: Object.keys(businessProfile).length
      ? {
          ...pickRecord(businessProfile, [
            "projectName",
            "industry",
            "targetAudience",
            "businessGoals",
            "tone",
            "geography",
            "requiredSections",
            "kpis",
          ]),
          offer: truncateText(String(businessProfile.offer ?? ""), 280),
          summary: truncateText(String(businessProfile.summary ?? ""), 420),
          competitors: truncateStrings(
            Array.isArray(businessProfile.competitors)
              ? businessProfile.competitors.map(String)
              : [],
            80,
            6,
          ),
        }
      : undefined,
  };
}

/** Compact blueprint — dedupe pages already present in analysis when provided. */
export function compactBlueprintMetadata(
  blueprint: unknown,
  analysis?: unknown,
): unknown {
  const record = asRecord(blueprint);
  const analysisRecord = asRecord(analysis);
  const compact = {
    title: record.title,
    description: truncateText(String(record.description ?? ""), 320),
    sections: truncateStrings(
      Array.isArray(record.sections) ? record.sections.map(String) : [],
    ),
    colorPalette: record.colorPalette,
    typography: record.typography,
    components: record.components,
    content: truncateStrings(
      Array.isArray(record.content) ? record.content.map(String) : [],
      140,
      16,
    ),
    seo: truncateStrings(
      Array.isArray(record.seo) ? record.seo.map(String) : [],
      120,
      12,
    ),
    roadmap: truncateStrings(
      Array.isArray(record.roadmap) ? record.roadmap.map(String) : [],
      120,
      8,
    ),
  } as Record<string, unknown>;

  const analysisPages = JSON.stringify(analysisRecord.pages ?? []);
  const blueprintPages = JSON.stringify(record.pages ?? []);
  if (analysisPages !== blueprintPages) {
    compact.pages = record.pages;
  }

  return compact;
}

/** Compact dynamic plan — keep path lists and complexity counts only. */
export function compactDynamicPlanMetadata(
  dynamicPlan: Record<string, unknown>,
): Record<string, unknown> {
  return pickRecord(dynamicPlan, [
    "complexity",
    "estimatedFileCount",
    "layouts",
    "pages",
    "components",
    "apiRoutes",
    "hooks",
    "utilities",
    "types",
    "configs",
  ]);
}

/** Compact project tree — truncate long purposes, preserve path/category. */
export function compactProjectTreeMetadata(projectTree: unknown): unknown {
  if (!Array.isArray(projectTree)) return projectTree;

  return projectTree.map((entry) => {
    const record = asRecord(entry);
    return {
      path: record.path,
      category: record.category,
      purpose: truncateText(String(record.purpose ?? ""), 120),
    };
  });
}

function sectionMatchesFile(section: Record<string, unknown>, filePath: string): boolean {
  const component = String(section.component ?? section.name ?? "").toLowerCase();
  const fileBase = filePath.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase() ?? "";
  return component.length > 0 && fileBase.includes(component.replace(/\s+/g, ""));
}

/** File-aware strategy compaction — preserve sections relevant to target file. */
export function compactStrategyMetadata(
  strategy: unknown,
  filePath?: string,
): unknown {
  const record = asRecord(strategy);
  if (!filePath) return record;

  const sectionPlan = Array.isArray(record.sectionPlan)
    ? record.sectionPlan.map((entry) => asRecord(entry))
    : [];

  const relevantSections = sectionPlan.filter((section) =>
    sectionMatchesFile(section, filePath),
  );

  const pages = Array.isArray(record.pages)
    ? record.pages.map((entry) => asRecord(entry))
    : [];

  const relevantPages = pages.filter((page) => {
    const path = String(page.path ?? "");
    return filePath.includes(path.replace(/^\//, "")) || path.includes(filePath);
  });

  return {
    positioning: record.positioning,
    sitemap: record.sitemap,
    ctas: record.ctas,
    seoFocus: record.seoFocus,
    contentStrategy: record.contentStrategy,
    pages: relevantPages.length > 0 ? relevantPages : pages.slice(0, 4),
    sectionPlan:
      relevantSections.length > 0
        ? relevantSections.map((section) => ({
            ...section,
            contentNotes: truncateText(String(section.contentNotes ?? ""), 220),
          }))
        : sectionPlan.slice(0, 8).map((section) => ({
            ...section,
            contentNotes: truncateText(String(section.contentNotes ?? ""), 180),
          })),
    conversionFunnel: record.conversionFunnel,
    contentStructure: record.contentStructure,
  };
}

/** File-aware design system compaction — drop heavy premium package on structural files. */
export function compactDesignSystemMetadata(
  designSystem: unknown,
  filePath?: string,
  category?: string,
): unknown {
  const record = asRecord(designSystem);
  const structural =
    category === "lib" ||
    category === "types" ||
    category === "hooks" ||
    category === "api" ||
    category === "configs" ||
    filePath?.startsWith("lib/") ||
    filePath?.startsWith("types/") ||
    filePath?.startsWith("hooks/") ||
    filePath?.startsWith("app/api/");

  const base = pickRecord(record, [
    "style",
    "stylePreset",
    "industryPattern",
    "colors",
    "typography",
    "layoutRules",
    "layoutStyle",
    "uiPatterns",
    "componentPalette",
    "homeComponentOrder",
    "spacingScale",
    "borderRadius",
    "shadowStyle",
    "sectionShellVariant",
    "compositionMode",
    "uiStyle",
  ]);

  if (structural) {
    return {
      stylePreset: base.stylePreset,
      colors: base.colors,
      typography: base.typography,
      borderRadius: base.borderRadius,
      shadowStyle: base.shadowStyle,
    };
  }

  return base;
}

/** Merge analysis + blueprint + dynamic plan into a deduplicated metadata object. */
export function compactMergedProjectMetadata(params: {
  analysis: unknown;
  blueprint: unknown;
  dynamicPlan: Record<string, unknown>;
}): Record<string, unknown> {
  const analysis = compactAnalysisMetadata(params.analysis) as Record<string, unknown>;
  const blueprint = compactBlueprintMetadata(
    params.blueprint,
    analysis,
  ) as Record<string, unknown>;
  const dynamicPlan = compactDynamicPlanMetadata(params.dynamicPlan);

  return {
    analysis,
    blueprint,
    plan: dynamicPlan,
  };
}

export function measureJsonChars(value: unknown): number {
  return jsonSize(value);
}
