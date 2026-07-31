/**
 * Bootstrap distributable website template packages for the remote marketplace registry.
 * Run: node scripts/bootstrap-website-registry-packages.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const registryRoot = path.join(root, "templates", "website-registry");

/** 1×1 PNG */
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function baseRegion(id, role, label, componentTypes) {
  return {
    id,
    role,
    label,
    layout: {
      width: role === "sidebar" ? "narrow" : "contained",
      alignment: "center",
      maxWidth: "72rem",
      padding: "1.5rem",
    },
    placement: {
      allowedComponentTypes: componentTypes,
      ordering: role === "header" || role === "footer" ? "horizontal" : "vertical",
      allowNesting: false,
      maxComponents: role === "main" ? 24 : 8,
      minComponents: 0,
      allowCustomComponents: true,
    },
    responsive: { collapseBelow: "md", stackOrder: "normal" },
  };
}

function buildManifest(config) {
  return {
    specVersion: "2.0.0",
    id: config.id,
    version: config.version ?? "1.0.0",
    name: config.name,
    description: config.description,
    metadata: {
      category: config.category,
      tags: config.tags,
      author: {
        name: "Trend Business AI",
        organization: "Template Platform",
      },
      license: "MIT",
      keywords: config.keywords,
    },
    media: {
      thumbnail: "assets/thumbnail.png",
      preview: "assets/preview.png",
    },
    compatibility: {
      engineVersion: ">=1.0.0",
      specVersion: "2.0.0",
      features: ["regions", "placement-rules", "responsive"],
    },
    update: {
      channel: "stable",
      releasedAt: "2026-07-30T00:00:00.000Z",
    },
    responsive: {
      breakpoints: [
        { name: "sm", minWidth: 640 },
        { name: "md", minWidth: 768 },
        { name: "lg", minWidth: 1024 },
        { name: "xl", minWidth: 1280 },
      ],
      containerMaxWidth: "72rem",
      fluidTypography: true,
    },
    canvas: { file: "canvas.json" },
    placementRules: { file: "placement-rules.json" },
    layouts: config.layouts,
    regions: config.regions,
    pages: config.pages,
    entry: "package.entry.json",
  };
}

const PACKAGES = [
  {
    id: "saas-starter",
    name: "SaaS Starter",
    description:
      "Conversion-focused SaaS landing layout with hero, features, pricing, and CTA regions.",
    category: "saas",
    tags: ["saas", "startup", "pricing", "modern"],
    keywords: ["saas-starter", "product-led", "pricing"],
    layoutKind: "single-column",
    regionIds: ["header", "main", "utility", "footer"],
    pageDefs: [
      { id: "home", title: "Home", path: "/" },
      { id: "pricing", title: "Pricing", path: "/pricing" },
      { id: "features", title: "Features", path: "/features" },
    ],
    colors: {
      primary: "#2563eb",
      secondary: "#1e40af",
      accent: "#3b82f6",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "rgba(15,23,42,0.62)",
    },
  },
  {
    id: "restaurant-bistro",
    name: "Restaurant Bistro",
    description:
      "Warm hospitality layout with menu highlights, gallery, and reservation CTA regions.",
    category: "restaurant",
    tags: ["restaurant", "hospitality", "menu", "booking"],
    keywords: ["restaurant-bistro", "menu", "reservations"],
    layoutKind: "full-bleed",
    regionIds: ["header", "main", "overlay", "utility", "footer"],
    pageDefs: [
      { id: "home", title: "Home", path: "/" },
      { id: "menu", title: "Menu", path: "/menu" },
      { id: "reservations", title: "Reservations", path: "/reservations" },
      { id: "contact", title: "Contact", path: "/contact" },
    ],
    colors: {
      primary: "#7c2d12",
      secondary: "#9a3412",
      accent: "#ea580c",
      background: "#fffbeb",
      foreground: "#292524",
      muted: "rgba(41,37,36,0.62)",
    },
  },
  {
    id: "agency-portfolio",
    name: "Agency Portfolio",
    description:
      "Creative agency layout with case-study, services, and team showcase regions.",
    category: "agency",
    tags: ["agency", "portfolio", "creative", "case-study"],
    keywords: ["agency-portfolio", "case-study", "services"],
    layoutKind: "sidebar-left",
    regionIds: ["header", "sidebar", "main", "footer"],
    pageDefs: [
      { id: "home", title: "Home", path: "/" },
      { id: "work", title: "Work", path: "/work" },
      { id: "services", title: "Services", path: "/services" },
      { id: "about", title: "About", path: "/about" },
      { id: "contact", title: "Contact", path: "/contact" },
    ],
    colors: {
      primary: "#18181b",
      secondary: "#27272a",
      accent: "#a16207",
      background: "#fafafa",
      foreground: "#18181b",
      muted: "rgba(24,24,27,0.62)",
    },
  },
];

function regionComponents(role) {
  if (role === "header") return ["navigation", "logo", "cta", "custom"];
  if (role === "footer") return ["navigation", "logo", "contact", "cta", "custom"];
  if (role === "sidebar") return ["navigation", "services", "cta", "custom"];
  if (role === "overlay") return ["banner", "gallery", "cta", "custom"];
  if (role === "utility") return ["gallery", "testimonials", "contact", "custom"];
  return [
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
  ];
}

async function writePackage(config) {
  const dir = path.join(registryRoot, config.id);
  await mkdir(path.join(dir, "assets"), { recursive: true });
  await mkdir(path.join(dir, "layouts"), { recursive: true });
  await mkdir(path.join(dir, "regions"), { recursive: true });
  await mkdir(path.join(dir, "pages"), { recursive: true });

  const regions = config.regionIds.map((id) => ({
    id,
    file: `regions/${id}.json`,
    role: id === "utility" || id === "overlay" ? id : id,
    label: `${id.charAt(0).toUpperCase()}${id.slice(1)} Region`,
    description: `${id} region for ${config.name}.`,
  }));

  const layouts = [
    {
      id: "default",
      file: "layouts/default.json",
      kind: config.layoutKind,
      label: "Default",
      description: `Default ${config.layoutKind} layout.`,
    },
  ];

  const pages = config.pageDefs.map((page) => ({
    id: page.id,
    title: page.title,
    path: page.path,
    layoutId: "default",
    file: `pages/${page.id}.json`,
    description: `${page.title} page blueprint.`,
  }));

  const manifest = buildManifest({
    ...config,
    layouts,
    regions,
    pages,
  });

  await writeFile(
    path.join(dir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, "package.entry.json"),
    `${JSON.stringify({ defaultPageId: pages[0].id, defaultLayoutId: "default" }, null, 2)}\n`,
  );
  await writeFile(
    path.join(dir, "canvas.json"),
    `${JSON.stringify(
      {
        id: "canvas",
        grid: { columns: 12, gutter: "1.5rem", margin: "1rem", maxWidth: "72rem" },
        spacing: { unit: "rem", scale: ["0.25", "0.5", "1", "1.5", "2", "3", "4"] },
        visualIdentity: {
          colors: config.colors,
          typography: {
            display: "Inter, ui-sans-serif, system-ui, sans-serif",
            body: "Inter, ui-sans-serif, system-ui, sans-serif",
            scale: { sm: "0.875rem", base: "1rem", lg: "1.25rem", xl: "1.5rem" },
          },
          radius: { sm: "6px", md: "10px", lg: "16px" },
          shadows: { surface: "0 1px 3px rgba(0,0,0,0.08)" },
          borders: { default: "rgba(0,0,0,0.1)" },
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    path.join(dir, "placement-rules.json"),
    `${JSON.stringify(
      {
        global: {
          maxComponentsPerPage: 32,
          allowDuplicateTypes: true,
          defaultOrdering: "vertical",
        },
        constraints: [],
      },
      null,
      2,
    )}\n`,
  );

  const layoutRegionOrder = config.regionIds;
  const gridAreas =
    config.layoutKind === "sidebar-left"
      ? '"header header" "sidebar main" "footer footer"'
      : config.layoutKind === "full-bleed"
        ? layoutRegionOrder.map((id) => `"${id}"`).join(" ")
        : layoutRegionOrder.map((id) => `"${id}"`).join(" ");

  await writeFile(
    path.join(dir, "layouts/default.json"),
    `${JSON.stringify(
      {
        id: "default",
        kind: config.layoutKind,
        label: "Default Layout",
        regionOrder: layoutRegionOrder,
        rules: { gap: "0", regionGap: "0", minHeight: "100vh" },
        grid: {
          templateAreas: gridAreas,
          columns: config.layoutKind === "sidebar-left" ? "18rem 1fr" : "1fr",
          rows:
            config.layoutKind === "sidebar-left"
              ? "auto 1fr auto"
              : `repeat(${layoutRegionOrder.length}, auto)`,
        },
      },
      null,
      2,
    )}\n`,
  );

  for (const regionId of config.regionIds) {
    await writeFile(
      path.join(dir, "regions", `${regionId}.json`),
      `${JSON.stringify(baseRegion(regionId, regionId, `${regionId} region`, regionComponents(regionId)), null, 2)}\n`,
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
          regions: layoutRegionOrder,
        },
        null,
        2,
      )}\n`,
    );
  }

  await writeFile(path.join(dir, "assets/thumbnail.png"), TINY_PNG);
  await writeFile(path.join(dir, "assets/preview.png"), TINY_PNG);
  console.log(`created ${config.id}`);
}

for (const pkg of PACKAGES) {
  await writePackage(pkg);
}

console.log("registry packages ready:", PACKAGES.map((p) => p.id).join(", "));
