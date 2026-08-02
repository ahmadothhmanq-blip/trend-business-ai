/**
 * Upgrade installed template packages to premium quality (9/10+).
 * Run: node scripts/upgrade-template-premium-quality.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { PREMIUM_TEMPLATE_LIBRARY } from "./premium-template-definitions.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = [
  join(root, "templates/website"),
  join(root, "templates/website-registry"),
];

const INDUSTRY_MAIN_COMPONENTS = {
  corporate: ["hero", "features", "services", "testimonials", "team", "cta", "contact", "custom"],
  enterprise: ["hero", "features", "services", "timeline", "team", "cta", "contact", "custom"],
  saas: ["hero", "features", "pricing", "faq", "testimonials", "cta", "contact", "custom"],
  "ai-startup": ["hero", "features", "gallery", "video", "team", "cta", "contact", "custom"],
  "creative-agency": ["hero", "gallery", "features", "team", "testimonials", "cta", "contact", "custom"],
  "marketing-agency": ["hero", "features", "gallery", "testimonials", "pricing", "cta", "contact", "custom"],
  portfolio: ["hero", "gallery", "features", "blog", "testimonials", "contact", "custom"],
  restaurant: ["hero", "gallery", "services", "team", "testimonials", "contact", "cta", "custom"],
  cafe: ["hero", "features", "gallery", "services", "testimonials", "contact", "custom"],
  hotel: ["hero", "gallery", "features", "services", "testimonials", "contact", "cta", "custom"],
  travel: ["hero", "gallery", "features", "pricing", "testimonials", "contact", "cta", "custom"],
  "real-estate": ["hero", "gallery", "features", "services", "team", "contact", "cta", "custom"],
  architecture: ["hero", "gallery", "features", "timeline", "team", "contact", "custom"],
  construction: ["hero", "features", "services", "timeline", "team", "contact", "cta", "custom"],
  medical: ["hero", "features", "services", "team", "testimonials", "contact", "cta", "custom"],
  dental: ["hero", "features", "services", "team", "testimonials", "contact", "cta", "custom"],
  pharmacy: ["hero", "features", "services", "faq", "contact", "cta", "custom"],
  "law-firm": ["hero", "services", "team", "testimonials", "timeline", "contact", "cta", "custom"],
  finance: ["hero", "features", "services", "pricing", "team", "contact", "cta", "custom"],
  insurance: ["hero", "features", "pricing", "faq", "testimonials", "contact", "cta", "custom"],
  education: ["hero", "features", "services", "team", "testimonials", "contact", "cta", "custom"],
  university: ["hero", "features", "timeline", "team", "blog", "contact", "cta", "custom"],
  ecommerce: ["hero", "gallery", "features", "pricing", "testimonials", "cta", "contact", "custom"],
  fashion: ["hero", "gallery", "video", "features", "testimonials", "contact", "custom"],
  beauty: ["hero", "gallery", "features", "services", "testimonials", "contact", "cta", "custom"],
  fitness: ["hero", "features", "pricing", "team", "testimonials", "cta", "contact", "custom"],
  automotive: ["hero", "gallery", "features", "pricing", "contact", "cta", "custom"],
  logistics: ["hero", "features", "services", "timeline", "contact", "cta", "custom"],
  manufacturing: ["hero", "features", "services", "timeline", "team", "contact", "cta", "custom"],
  nonprofit: ["hero", "features", "testimonials", "timeline", "team", "contact", "cta", "custom"],
};

const LAYOUT_REGION_ORDER_FIXES = {
  "ai-startup-signal": ["header", "overlay", "main", "footer"],
  "restaurant-bistro": ["header", "overlay", "main", "utility", "footer"],
  "fitness-pulse": ["header", "utility", "main", "footer"],
  "nonprofit-impact": ["header", "utility", "main", "footer"],
  "fashion-runway": ["header", "overlay", "main", "footer"],
};

function industryMainComponents(category) {
  return INDUSTRY_MAIN_COMPONENTS[category] ?? INDUSTRY_MAIN_COMPONENTS.corporate;
}

const COLOR_PATCHES = {
  "dental-smile": {
    secondary: "#67E8F9",
    accent: "#14B8A6",
    background: "#FFFFFF",
  },
  "automotive-showroom": {
    secondary: "#E11D48",
    accent: "#A1A1AA",
    background: "#111113",
  },
};

const CATEGORY_CONSTRAINTS = {
  corporate: [
    {
      id: "corporate-no-pricing-header",
      description: "Corporate headers stay navigation-focused",
      when: { region: "header" },
      deny: { componentTypes: ["pricing", "faq"] },
    },
  ],
  enterprise: [
    {
      id: "enterprise-no-gallery-header",
      description: "Enterprise header avoids gallery clutter",
      when: { region: "header" },
      deny: { componentTypes: ["gallery", "pricing"] },
    },
  ],
  saas: [
    {
      id: "saas-utility-pricing-band",
      description: "Pricing bands belong in utility or main, not header",
      when: { region: "header" },
      deny: { componentTypes: ["pricing", "testimonials"] },
    },
  ],
  restaurant: [
    {
      id: "restaurant-overlay-no-pricing",
      description: "Fine dining overlay is cinematic, not pricing",
      when: { region: "overlay" },
      deny: { componentTypes: ["pricing", "faq"] },
    },
  ],
  hotel: [
    {
      id: "hotel-overlay-cinematic",
      description: "Hotel overlay is immersive hero media",
      when: { region: "overlay" },
      deny: { componentTypes: ["pricing", "timeline"] },
    },
  ],
  fashion: [
    {
      id: "fashion-editorial-overlay",
      description: "Runway overlay is editorial hero only",
      when: { region: "overlay" },
      deny: { componentTypes: ["pricing", "faq", "contact"] },
    },
  ],
  medical: [
    {
      id: "medical-trust-main",
      description: "Medical main avoids pricing in hero band",
      when: { region: "header" },
      deny: { componentTypes: ["pricing"] },
    },
  ],
  dental: [
    {
      id: "dental-booking-focus",
      description: "Dental header stays calm and navigational",
      when: { region: "header" },
      deny: { componentTypes: ["pricing", "gallery"] },
    },
  ],
  "law-firm": [
    {
      id: "law-authority-header",
      description: "Legal header avoids commerce components",
      when: { region: "header" },
      deny: { componentTypes: ["pricing", "gallery", "video"] },
    },
  ],
  fitness: [
    {
      id: "fitness-energy-header",
      description: "Fitness header is high-conversion navigation",
      when: { region: "header" },
      deny: { componentTypes: ["faq", "blog"] },
    },
  ],
  nonprofit: [
    {
      id: "nonprofit-mission-first",
      description: "Nonprofit header supports donate journey",
      when: { region: "footer" },
      deny: { componentTypes: ["pricing"] },
    },
  ],
};

const BASE_CONSTRAINTS = [
  {
    id: "no-pricing-in-header",
    description: "Pricing belongs below the fold",
    when: { region: "header" },
    deny: { componentTypes: ["pricing"] },
  },
  {
    id: "no-navigation-in-main",
    description: "Navigation belongs in the header region",
    when: { region: "main" },
    deny: { componentTypes: ["navigation"] },
  },
  {
    id: "no-hero-in-footer",
    description: "Hero components belong above the fold",
    when: { region: "footer" },
    deny: { componentTypes: ["hero", "banner"] },
  },
  {
    id: "cta-in-header-allowed",
    description: "Header supports primary CTA placement",
    when: { region: "header" },
    allow: { componentTypes: ["navigation", "logo", "cta"] },
  },
];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function createBrandPng(width, height, primary, accent, background) {
  const [pr, pg, pb] = hexToRgb(primary);
  const [ar, ag, ab] = hexToRgb(accent);
  const [br, bg, bb] = hexToRgb(background);
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0;
    const t = y / Math.max(height - 1, 1);
    for (let x = 0; x < width; x++) {
      const u = x / Math.max(width - 1, 1);
      const blend = t * 0.65 + u * 0.35;
      const i = offset + 1 + x * 3;
      raw[i] = Math.round(br * (1 - blend) + pr * blend * 0.7 + ar * blend * 0.3);
      raw[i + 1] = Math.round(bg * (1 - blend) + pg * blend * 0.7 + ag * blend * 0.3);
      raw[i + 2] = Math.round(bb * (1 - blend) + pb * blend * 0.7 + ab * blend * 0.3);
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function resolveHeroRegion(regionOrder) {
  const overlayIdx = regionOrder.indexOf("overlay");
  const mainIdx = regionOrder.indexOf("main");
  if (overlayIdx >= 0 && (mainIdx < 0 || overlayIdx < mainIdx)) return "overlay";
  return "main";
}

function extendTypographyScale(scale, layoutKind) {
  const xl = parseFloat(scale.xl ?? "2rem");
  const unit = (scale.xl ?? "2rem").replace(/[\d.]/g, "") || "rem";
  const luxury = layoutKind === "full-bleed";
  return {
    ...scale,
    "2xl": `${(xl * 1.35).toFixed(3).replace(/\.?0+$/, "")}${unit}`,
    "3xl": `${(xl * (luxury ? 1.8 : 1.55)).toFixed(3).replace(/\.?0+$/, "")}${unit}`,
  };
}

function buildPlacementRules(config, heroRegion) {
  const extra = CATEGORY_CONSTRAINTS[config.category] ?? [];
  const constraints = [...BASE_CONSTRAINTS, ...extra];
  const regionOverrides = {
    header: {
      minComponents: 1,
      requiredTypes: ["navigation"],
      maxComponents: 6,
    },
    footer: {
      maxComponents: 8,
      allowedComponentTypes: ["navigation", "logo", "contact", "cta", "custom"],
    },
  };
  if (heroRegion === "main") {
    regionOverrides.main = {
      minComponents: 1,
      requiredTypes: ["hero"],
    };
  } else {
    regionOverrides.overlay = {
      minComponents: 1,
      requiredTypes: ["hero"],
    };
    regionOverrides.main = {
      minComponents: 0,
    };
  }
  if (config.regionIds.includes("utility")) {
    regionOverrides.utility = {
      maxComponents: 4,
      allowedComponentTypes: ["gallery", "testimonials", "contact", "pricing", "cta", "custom"],
    };
  }
  if (config.regionIds.includes("sidebar")) {
    regionOverrides.sidebar = {
      minComponents: 1,
      requiredTypes: ["navigation"],
    };
  }
  return {
    global: {
      maxComponentsPerPage: 36,
      allowDuplicateTypes: true,
      defaultOrdering: "vertical",
    },
    regionOverrides,
    constraints,
  };
}

function enhanceRegion(region, config, heroRegion) {
  const next = structuredClone(region);
  const luxury = config.layoutKind === "full-bleed";
  const contained = config.layoutKind === "single-column";

  if (region.id === "header") {
    next.placement.minComponents = 1;
    next.placement.requiredTypes = ["navigation"];
    next.placement.maxComponents = 6;
    next.layout.padding = luxury ? "1.25rem 2rem" : "1rem 1.75rem";
    next.responsive = { collapseBelow: "lg", stackOrder: "normal" };
  }

  if (region.id === heroRegion) {
    next.placement.minComponents = 1;
    next.placement.requiredTypes = ["hero"];
    if (region.id === "overlay") {
      next.layout.minHeight = luxury ? "min(100vh, 960px)" : "min(85vh, 820px)";
      next.layout.padding = "0";
    } else {
      next.layout.minHeight = luxury ? "auto" : "auto";
      next.layout.padding = contained ? "2rem 1.75rem" : luxury ? "0" : "1.75rem";
    }
  }

  if (region.id === "main") {
    const industryTypes = industryMainComponents(config.category);
    next.placement.allowedComponentTypes = industryTypes;
    if (heroRegion !== "main") {
      next.layout.padding = luxury ? "2.5rem 1.5rem" : "2rem 1.75rem";
      next.placement.minComponents = 0;
    }
  }

  if (region.id === "utility") {
    next.layout.padding = "1.25rem 1.75rem";
    next.placement.maxComponents = 4;
  }

  if (region.id === "footer") {
    next.layout.padding = luxury ? "2.5rem 1.75rem" : "2rem 1.75rem";
    next.placement.maxComponents = 8;
  }

  if (region.id === "sidebar") {
    next.placement.minComponents = 1;
    next.placement.requiredTypes = ["navigation"];
    next.layout.padding = "1.5rem 1.25rem";
  }

  return next;
}

function enhanceCanvas(canvas, config) {
  const colors = { ...canvas.visualIdentity.colors, ...(COLOR_PATCHES[config.id] ?? {}) };
  const required = ["primary", "secondary", "accent", "background", "foreground", "surface", "muted"];
  for (const key of required) {
    if (!colors[key] && config.canvas.colors[key]) colors[key] = config.canvas.colors[key];
  }
  const scale = extendTypographyScale(
    canvas.visualIdentity.typography.scale ?? config.canvas.typography.scale,
    config.layoutKind,
  );
  const primary = colors.primary ?? "#111827";
  const accent = colors.accent ?? colors.secondary ?? primary;
  const background = colors.background ?? "#ffffff";
  return {
    ...canvas,
    spacing: {
      ...canvas.spacing,
      scale: config.canvas.spacingScale,
    },
    visualIdentity: {
      ...canvas.visualIdentity,
      colors,
      typography: {
        ...canvas.visualIdentity.typography,
        scale,
      },
      shadows: {
        ...canvas.visualIdentity.shadows,
        elevated: canvas.visualIdentity.shadows?.elevated ?? "0 12px 40px rgba(15,23,42,0.12)",
        hero: canvas.visualIdentity.shadows?.hero ?? "0 24px 80px rgba(0,0,0,0.18)",
        cta: canvas.visualIdentity.shadows?.cta ?? `0 8px 28px ${accent}33`,
      },
      animation: canvas.visualIdentity.animation ?? config.canvas.animation,
    },
    designSystem: {
      ...canvas.designSystem,
      tier: "premium",
    },
  };
}

function enhanceLayout(layout, config) {
  const next = structuredClone(layout);
  const fixedOrder = LAYOUT_REGION_ORDER_FIXES[config.id];
  if (fixedOrder) {
    next.regionOrder = fixedOrder;
    if (next.grid) {
      next.grid.templateAreas = fixedOrder.map((id) => `"${id}"`).join(" ");
      const hasMain = fixedOrder.includes("main");
      next.grid.rows = fixedOrder
        .map((id) => (id === "main" && config.layoutKind === "full-bleed" ? "1fr" : "auto"))
        .join(" ");
      if (!hasMain) {
        next.grid.rows = fixedOrder.map(() => "auto").join(" ");
      }
    }
  }
  if (config.layoutKind === "full-bleed") {
    next.rules.minHeight = "100vh";
    next.rules.regionGap = "0";
  } else if (config.layoutKind === "sidebar-left" || config.layoutKind === "sidebar-right") {
    next.rules.regionGap = next.rules.regionGap ?? "1.5rem";
  } else {
    next.rules.regionGap = next.rules.regionGap ?? "1rem";
  }
  return next;
}

function upgradePackageDir(config, dir) {
  if (!existsSync(dir)) return null;
  const layout = JSON.parse(readFileSync(join(dir, "layouts/default.json"), "utf8"));
  const nextLayout = enhanceLayout(layout, config);
  const heroRegion = resolveHeroRegion(nextLayout.regionOrder);
  const changes = [];

  const canvasPath = join(dir, "canvas.json");
  const canvas = JSON.parse(readFileSync(canvasPath, "utf8"));
  const nextCanvas = enhanceCanvas(canvas, config);
  writeFileSync(canvasPath, `${JSON.stringify(nextCanvas, null, 2)}\n`);
  changes.push("canvas: extended typography, shadows, color tokens");

  const placementPath = join(dir, "placement-rules.json");
  const placement = buildPlacementRules(config, heroRegion);
  writeFileSync(placementPath, `${JSON.stringify(placement, null, 2)}\n`);
  changes.push(`placement: hero@${heroRegion}, header nav required, industry constraints`);

  writeFileSync(join(dir, "layouts/default.json"), `${JSON.stringify(nextLayout, null, 2)}\n`);
  changes.push("layout: premium region gaps and min-height");

  for (const regionId of config.regionIds) {
    const regionPath = join(dir, "regions", `${regionId}.json`);
    const region = JSON.parse(readFileSync(regionPath, "utf8"));
    const nextRegion = enhanceRegion(region, config, heroRegion);
    writeFileSync(regionPath, `${JSON.stringify(nextRegion, null, 2)}\n`);
  }
  changes.push("regions: hero/header/footer premium placement rules");

  for (const pageDef of config.pageDefs) {
    const pagePath = join(dir, "pages", `${pageDef.id}.json`);
    const page = JSON.parse(readFileSync(pagePath, "utf8"));
    page.regions = [...nextLayout.regionOrder];
    writeFileSync(pagePath, `${JSON.stringify(page, null, 2)}\n`);
  }
  changes.push("pages: region order aligned to layout");

  const colors = nextCanvas.visualIdentity.colors;
  const thumb = createBrandPng(640, 400, colors.primary, colors.accent, colors.background);
  const preview = createBrandPng(1280, 720, colors.primary, colors.accent, colors.background);
  writeFileSync(join(dir, "assets/thumbnail.png"), thumb);
  writeFileSync(join(dir, "assets/preview.png"), preview);
  changes.push("assets: branded gradient thumbnail and preview");

  return changes;
}

const report = [];
for (const config of PREMIUM_TEMPLATE_LIBRARY) {
  const changes = upgradePackageDir(config, join(TARGETS[0], config.id));
  upgradePackageDir(config, join(TARGETS[1], config.id));
  report.push({ id: config.id, name: config.name, changes });
}

console.log(JSON.stringify({ upgraded: report.length, report }, null, 2));
