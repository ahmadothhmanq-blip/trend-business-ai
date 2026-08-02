/**
 * Generate the premium website template library.
 * Run: node scripts/generate-premium-template-library.mjs
 */
import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_TEMPLATE_LIBRARY } from "./premium-template-definitions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const websiteRoot = path.join(root, "templates", "website");
const registryRoot = path.join(root, "templates", "website-registry");

/** 1×1 PNG placeholder */
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const REGION_COMPONENTS = {
  header: ["navigation", "logo", "cta", "custom"],
  footer: ["navigation", "logo", "contact", "cta", "custom"],
  sidebar: ["navigation", "services", "cta", "custom", "team"],
  overlay: ["banner", "gallery", "hero", "video", "custom"],
  utility: ["gallery", "testimonials", "contact", "pricing", "custom"],
  main: [
    "hero",
    "banner",
    "features",
    "gallery",
    "pricing",
    "faq",
    "team",
    "blog",
    "contact",
    "video",
    "timeline",
    "cta",
    "testimonials",
    "services",
    "custom",
  ],
};

function regionRole(regionId) {
  if (regionId === "overlay" || regionId === "utility") return regionId;
  return regionId;
}

function baseRegion(regionId, config) {
  const role = regionRole(regionId);
  const isSidebar = regionId === "sidebar";
  const isOverlay = regionId === "overlay";
  const canvas = config.canvas;

  return {
    id: regionId,
    role,
    label: `${regionId.charAt(0).toUpperCase()}${regionId.slice(1)} Region`,
    layout: {
      width: isSidebar ? "narrow" : isOverlay ? "full" : "contained",
      alignment: isOverlay ? "stretch" : "center",
      maxWidth: isSidebar ? "100%" : canvas.maxWidth,
      padding: isOverlay ? "0" : isSidebar ? "1.25rem" : "1.75rem",
    },
    placement: {
      allowedComponentTypes: REGION_COMPONENTS[regionId] ?? REGION_COMPONENTS.main,
      ordering:
        role === "header" || role === "footer" ? "horizontal" : "vertical",
      allowNesting: isOverlay,
      maxComponents: role === "main" ? 28 : isOverlay ? 6 : 10,
      minComponents: 0,
      allowCustomComponents: true,
    },
    responsive: {
      collapseBelow: isSidebar ? "lg" : "md",
      stackOrder: "normal",
    },
  };
}

function buildDefaultGrid(config) {
  const { layoutKind, regionIds } = config;

  if (config.grid) {
    return {
      templateAreas: config.grid.templateAreas,
      columns: config.grid.columns,
      rows: config.grid.rows,
      gap: config.grid.gap ?? "0",
      regionGap: config.grid.regionGap ?? "0",
      regionOrder: regionIds,
      rules: {
        gap: config.grid.gap ?? "0",
        regionGap: config.grid.regionGap ?? "0",
        minHeight: layoutKind === "full-bleed" ? "100vh" : "auto",
      },
    };
  }

  if (layoutKind === "sidebar-left") {
    return {
      templateAreas: '"header header" "sidebar main" "footer footer"',
      columns: "18rem 1fr",
      rows: "auto 1fr auto",
      gap: "0",
      regionGap: "1.5rem",
      regionOrder: regionIds,
      rules: { gap: "0", regionGap: "1.5rem", minHeight: "100vh" },
    };
  }

  if (layoutKind === "sidebar-right") {
    return {
      templateAreas: '"header header" "main sidebar" "footer footer"',
      columns: "1fr 18rem",
      rows: "auto 1fr auto",
      gap: "0",
      regionGap: "1.5rem",
      regionOrder: regionIds,
      rules: { gap: "0", regionGap: "1.5rem", minHeight: "100vh" },
    };
  }

  if (layoutKind === "full-bleed") {
    return {
      templateAreas: regionIds.map((id) => `"${id}"`).join(" "),
      columns: "1fr",
      rows: `repeat(${regionIds.length}, auto)`,
      gap: "0",
      regionGap: "0",
      regionOrder: regionIds,
      rules: { gap: "0", regionGap: "0", minHeight: "100vh" },
    };
  }

  return {
    templateAreas: regionIds.map((id) => `"${id}"`).join(" "),
    columns: "1fr",
    rows: `repeat(${regionIds.length}, auto)`,
    gap: "0",
    regionGap: "1rem",
    regionOrder: regionIds,
    rules: { gap: "0", regionGap: "1rem", minHeight: "auto" },
  };
}

function buildManifest(config) {
  const regions = config.regionIds.map((id) => ({
    id,
    file: `regions/${id}.json`,
    role: regionRole(id),
    label: `${id.charAt(0).toUpperCase()}${id.slice(1)} Region`,
    description: `Premium ${id} region for ${config.name}.`,
  }));

  const layouts = [
    {
      id: "default",
      file: "layouts/default.json",
      kind: config.layoutKind,
      label: "Default",
      description: `Premium ${config.layoutKind} layout for ${config.industry}.`,
    },
  ];

  const pages = config.pageDefs.map((page) => ({
    id: page.id,
    title: page.title,
    path: page.path,
    layoutId: "default",
    file: `pages/${page.id}.json`,
    description: `${page.title} — premium ${config.industry} page blueprint.`,
  }));

  return {
    specVersion: "2.0.0",
    id: config.id,
    version: "2.0.0",
    name: config.name,
    description: config.description,
    metadata: {
      category: config.category,
      industry: config.industry,
      tags: config.tags,
      author: {
        name: "Trend Business AI",
        organization: "Premium Template Studio",
      },
      license: "MIT",
      keywords: config.keywords,
      templateIntelligenceId: config.tiId,
      premium: true,
      tier: "agency",
    },
    media: {
      thumbnail: "assets/thumbnail.png",
      preview: "assets/preview.png",
    },
    compatibility: {
      engineVersion: ">=1.0.0",
      specVersion: "2.0.0",
      features: ["regions", "placement-rules", "responsive", "premium-canvas"],
    },
    update: {
      channel: "stable",
      releasedAt: new Date().toISOString(),
    },
    responsive: {
      breakpoints: [
        { name: "sm", minWidth: 640 },
        { name: "md", minWidth: 768 },
        { name: "lg", minWidth: 1024 },
        { name: "xl", minWidth: 1280 },
        { name: "2xl", minWidth: 1536 },
      ],
      containerMaxWidth: config.canvas.maxWidth,
      fluidTypography: true,
    },
    canvas: { file: "canvas.json" },
    placementRules: { file: "placement-rules.json" },
    layouts,
    regions,
    pages,
    entry: "package.entry.json",
  };
}

function buildCanvas(config) {
  const c = config.canvas;
  return {
    id: "canvas",
    grid: {
      columns: c.columns,
      gutter: c.gutter,
      margin: c.margin,
      maxWidth: c.maxWidth,
    },
    spacing: { unit: "rem", scale: c.spacingScale },
    visualIdentity: {
      colors: c.colors,
      typography: {
        display: c.typography.display,
        body: c.typography.body,
        scale: c.typography.scale,
      },
      radius: c.radius,
      shadows: c.shadows,
      borders: { default: "rgba(0,0,0,0.08)" },
      animation: c.animation,
    },
    designSystem: {
      tier: "premium",
      industry: config.industry,
      layoutKind: config.layoutKind,
      templateIntelligenceId: config.tiId,
    },
  };
}

function buildPlacementRules(_config) {
  return {
    global: {
      maxComponentsPerPage: 36,
      allowDuplicateTypes: true,
      defaultOrdering: "vertical",
    },
    constraints: [],
  };
}

async function writePackageToDir(config, dir) {
  await mkdir(path.join(dir, "assets"), { recursive: true });
  await mkdir(path.join(dir, "layouts"), { recursive: true });
  await mkdir(path.join(dir, "regions"), { recursive: true });
  await mkdir(path.join(dir, "pages"), { recursive: true });

  const manifest = buildManifest(config);
  const grid = buildDefaultGrid(config);

  await writeFile(
    path.join(dir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, "package.entry.json"),
    `${JSON.stringify({ defaultPageId: config.pageDefs[0].id, defaultLayoutId: "default" }, null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, "canvas.json"),
    `${JSON.stringify(buildCanvas(config), null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, "placement-rules.json"),
    `${JSON.stringify(buildPlacementRules(config), null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, "layouts/default.json"),
    `${JSON.stringify(
      {
        id: "default",
        kind: config.layoutKind,
        label: "Default Layout",
        regionOrder: grid.regionOrder,
        rules: grid.rules,
        grid: {
          templateAreas: grid.templateAreas,
          columns: grid.columns,
          rows: grid.rows,
          gap: grid.gap,
        },
      },
      null,
      2,
    )}\n`,
  );

  for (const regionId of config.regionIds) {
    await writeFile(
      path.join(dir, "regions", `${regionId}.json`),
      `${JSON.stringify(baseRegion(regionId, config), null, 2)}\n`,
    );
  }

  for (const page of config.pageDefs) {
    await writeFile(
      path.join(dir, "pages", `${page.id}.json`),
      `${JSON.stringify(
        {
          id: page.id,
          title: page.title,
          path: page.path,
          layoutId: "default",
          regions: config.regionIds,
        },
        null,
        2,
      )}\n`,
    );
  }

  await writeFile(path.join(dir, "assets/thumbnail.png"), TINY_PNG);
  await writeFile(path.join(dir, "assets/preview.png"), TINY_PNG);
}

async function writePackage(config) {
  const websiteDir = path.join(websiteRoot, config.id);
  const registryDir = path.join(registryRoot, config.id);
  await writePackageToDir(config, websiteDir);
  await writePackageToDir(config, registryDir);
  console.log(`✓ ${config.id} — ${config.name}`);
}

function codegenTemplatePackageIndex(templates) {
  const imports = templates
    .map(
      (t) =>
        `import ${toImportName(t.id)}Manifest from "@/templates/website/${t.id}/manifest.json";`,
    )
    .join("\n");

  const mappings = templates
    .map((t) => `  mapPackageManifestToStructureTemplate(${toImportName(t.id)}Manifest),`)
    .join("\n");

  return `// AUTO-GENERATED by scripts/generate-premium-template-library.mjs — do not edit manually.
${imports}

import { mapPackageManifestToStructureTemplate } from "@/lib/website/builder/template-catalog-mapping";
import type { WebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";

/** Sync index of ${templates.length} premium installed template packages. */
export const WEBSITE_STRUCTURE_TEMPLATES: WebsiteStructureTemplate[] = [
${mappings}
];

export const WEBSITE_STRUCTURE_TEMPLATE_INDEX: Record<string, WebsiteStructureTemplate> =
  Object.fromEntries(WEBSITE_STRUCTURE_TEMPLATES.map((template) => [template.id, template]));
`;
}

function codegenTiMapping(templates) {
  const entries = templates
    .map((t) => `  "${t.id}": "${t.tiId}",`)
    .join("\n");

  return `// AUTO-GENERATED by scripts/generate-premium-template-library.mjs — do not edit manually.
import { BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID } from "@/lib/website/builder/template-catalog-mapping";

/** Distinct Template Intelligence profile per premium structure package. */
export const STRUCTURE_TEMPLATE_INTELLIGENCE_MAP: Record<string, string> = {
${entries}
};

export function resolveStructureTemplateIntelligenceId(
  templatePackageId: string,
): string {
  const id = templatePackageId.trim();
  return (
    STRUCTURE_TEMPLATE_INTELLIGENCE_MAP[id] ??
    BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID
  );
}

export function isKnownStructureTemplatePackage(
  templatePackageId: string,
): boolean {
  return Boolean(
    STRUCTURE_TEMPLATE_INTELLIGENCE_MAP[templatePackageId.trim()],
  );
}
`;
}

function codegenRemoteCatalog(templates) {
  const seeds = templates.map((t) => ({
    id: t.id,
    version: "2.0.0",
    name: t.name,
    description: t.description,
    category: t.category,
    tags: t.tags,
    layout: t.layoutKind,
    regionCount: t.regionIds.length,
    pageCount: t.pageDefs.length,
    thumbnail: `remote/${t.id}/thumbnail.png`,
    preview: `remote/${t.id}/preview.png`,
    source: "remote",
    availability: "remote",
    featured: t.featured ?? false,
    featuredRank: t.featuredRank ?? 100,
    metadata: {
      author: {
        name: "Trend Business AI",
        organization: "Premium Template Studio",
      },
      license: "MIT",
      keywords: t.keywords,
      updateChannel: "stable",
      releasedAt: new Date().toISOString(),
      templateIntelligenceId: t.tiId,
      premium: true,
      compatibility: {
        engineVersion: ">=1.0.0",
        specVersion: "2.0.0",
        features: ["regions", "placement-rules", "responsive", "premium-canvas"],
      },
    },
    remote: {
      registryId: t.id,
      publisher: "trend-business-ai",
      publishedAt: new Date().toISOString(),
    },
  }));

  return `// AUTO-GENERATED by scripts/generate-premium-template-library.mjs — do not edit manually.
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";

export const PREMIUM_REMOTE_TEMPLATE_SEEDS: WbTemplateMarketplaceListing[] = ${JSON.stringify(seeds, null, 2)} as WbTemplateMarketplaceListing[];
`;
}

function toImportName(id) {
  return id.replace(/[^a-zA-Z0-9]/g, "_");
}

function validateUniqueness(templates) {
  const tiIds = templates.map((t) => t.tiId);
  const uniqueTi = new Set(tiIds);
  if (uniqueTi.size !== templates.length) {
    const dupes = tiIds.filter((id, i) => tiIds.indexOf(id) !== i);
    throw new Error(`Duplicate TI mappings: ${dupes.join(", ")}`);
  }

  const layoutSignatures = templates.map(
    (t) =>
      `${t.layoutKind}:${t.regionIds.join(",")}:${t.grid?.templateAreas ?? "default"}:${t.grid?.columns ?? "1fr"}`,
  );
  const uniqueLayouts = new Set(layoutSignatures);
  if (uniqueLayouts.size !== templates.length) {
    throw new Error("Duplicate layout signatures detected");
  }

  const colorSignatures = templates.map((t) => t.canvas.colors.primary);
  const uniqueColors = new Set(colorSignatures);
  if (uniqueColors.size !== templates.length) {
    throw new Error("Duplicate primary colors detected");
  }
}

async function main() {
  if (PREMIUM_TEMPLATE_LIBRARY.length < 1) {
    throw new Error("Premium template library must define at least one template");
  }

  validateUniqueness(PREMIUM_TEMPLATE_LIBRARY);

  console.log(`Generating ${PREMIUM_TEMPLATE_LIBRARY.length} premium templates...\n`);

  for (const config of PREMIUM_TEMPLATE_LIBRARY) {
    await writePackage(config);
  }

  await writeFile(
    path.join(root, "lib/website/builder/template-package-index.ts"),
    codegenTemplatePackageIndex(PREMIUM_TEMPLATE_LIBRARY),
  );
  await writeFile(
    path.join(root, "lib/website/builder/template-package-ti-mapping.ts"),
    codegenTiMapping(PREMIUM_TEMPLATE_LIBRARY),
  );
  await writeFile(
    path.join(
      root,
      "lib/website/template-marketplace/premium-remote-catalog.generated.ts",
    ),
    codegenRemoteCatalog(PREMIUM_TEMPLATE_LIBRARY),
  );

  console.log(`\n✓ Generated ${PREMIUM_TEMPLATE_LIBRARY.length} premium templates`);
  console.log("✓ Updated template-package-index.ts");
  console.log("✓ Updated template-package-ti-mapping.ts");
  console.log("✓ Updated premium-remote-catalog.generated.ts");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
