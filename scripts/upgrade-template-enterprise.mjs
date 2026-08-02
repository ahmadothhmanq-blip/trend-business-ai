/**
 * Enterprise-grade template upgrade — unique visual identity per template.
 * Run: node scripts/upgrade-template-enterprise.mjs
 */
import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { PREMIUM_TEMPLATE_LIBRARY } from "./premium-template-definitions.mjs";
import { ENTERPRISE_TEMPLATE_PROFILES } from "./enterprise-template-profiles.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = [
  join(root, "templates/website"),
  join(root, "templates/website-registry"),
];

const COMPONENT_CATALOG = [
  { id: "hero", category: "content", nestable: false, description: "Primary hero section" },
  { id: "banner", category: "content", nestable: false, description: "Promotional banner" },
  { id: "features", category: "content", nestable: false, description: "Feature grid or list" },
  { id: "gallery", category: "media", nestable: false, description: "Image or media gallery" },
  { id: "pricing", category: "commerce", nestable: false, description: "Pricing table or plans" },
  { id: "faq", category: "content", nestable: false, description: "Frequently asked questions" },
  { id: "team", category: "content", nestable: false, description: "Team member profiles" },
  { id: "blog", category: "content", nestable: false, description: "Blog or journal entries" },
  { id: "contact", category: "content", nestable: false, description: "Contact form or details" },
  { id: "video", category: "media", nestable: false, description: "Video embed section" },
  { id: "timeline", category: "content", nestable: false, description: "Timeline or milestones" },
  { id: "cta", category: "content", nestable: false, description: "Call-to-action band" },
  { id: "testimonials", category: "content", nestable: false, description: "Social proof quotes" },
  { id: "services", category: "content", nestable: false, description: "Services overview" },
  { id: "navigation", category: "navigation", nestable: false, description: "Site navigation" },
  { id: "logo", category: "content", nestable: false, description: "Brand logo" },
  { id: "custom", category: "custom", nestable: true, description: "Custom component slot" },
];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
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
  const h = (hex ?? "#111827").replace("#", "");
  if (h.length !== 6) return [17, 24, 39];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function blend(c1, c2, t) {
  return [
    Math.round(c1[0] * (1 - t) + c2[0] * t),
    Math.round(c1[1] * (1 - t) + c2[1] * t),
    Math.round(c1[2] * (1 - t) + c2[2] * t),
  ];
}

function setPixel(raw, rowSize, width, x, y, rgb) {
  if (x < 0 || y < 0 || x >= width) return;
  const offset = y * rowSize + 1 + x * 3;
  raw[offset] = rgb[0];
  raw[offset + 1] = rgb[1];
  raw[offset + 2] = rgb[2];
}

function fillRect(raw, rowSize, width, x, y, w, h, rgb) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) setPixel(raw, rowSize, width, px, py, rgb);
  }
}

function createWireframePng(width, height, colors, profile) {
  const bg = hexToRgb(colors.background);
  const primary = hexToRgb(colors.primary);
  const accent = hexToRgb(colors.accent);
  const surface = hexToRgb(colors.surface ?? colors.background);
  const muted = blend(primary, bg, 0.85);
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < width; x++) {
      const t = y / height;
      setPixel(raw, rowSize, width, x, y, blend(bg, surface, t * 0.35));
    }
  }

  const pad = Math.round(width * 0.06);
  const innerW = width - pad * 2;
  const headerH = Math.round(height * 0.08);
  const footerH = Math.round(height * 0.07);
  const heroRegion = profile.hero.region;
  const heroH =
    heroRegion === "overlay"
      ? Math.round(height * 0.42)
      : Math.round(height * 0.32);
  const y0 = pad;

  fillRect(raw, rowSize, width, pad, y0, innerW, headerH, blend(primary, bg, 0.25));
  fillRect(raw, rowSize, width, pad + innerW * 0.55, y0 + headerH * 0.25, innerW * 0.35, headerH * 0.5, accent);

  let cursor = y0 + headerH + Math.round(height * 0.02);
  if (profile.regionOrder.includes("utility")) {
    const utilH = Math.round(height * 0.05);
    fillRect(raw, rowSize, width, pad, cursor, innerW, utilH, blend(accent, bg, 0.6));
    cursor += utilH + Math.round(height * 0.015);
  }

  if (heroRegion === "overlay" || heroRegion === "main") {
    fillRect(raw, rowSize, width, pad, cursor, innerW, heroH, blend(primary, bg, 0.15));
    fillRect(raw, rowSize, width, pad + innerW * 0.08, cursor + heroH * 0.35, innerW * 0.45, heroH * 0.2, accent);
    fillRect(raw, rowSize, width, pad + innerW * 0.55, cursor + heroH * 0.55, innerW * 0.32, heroH * 0.12, muted);
    cursor += heroH + Math.round(height * 0.02);
  }

  const cardH = Math.round(height * 0.07);
  const gap = Math.round(height * 0.015);
  for (let i = 0; i < 3; i++) {
    const cw = Math.round((innerW - gap * 2) / 3);
    fillRect(raw, rowSize, width, pad + i * (cw + gap), cursor, cw, cardH, blend(surface, primary, 0.08));
  }
  cursor += cardH + gap * 2;

  fillRect(raw, rowSize, width, pad, cursor, innerW, Math.round(height * 0.06), blend(accent, bg, 0.45));
  fillRect(raw, rowSize, width, height - pad - footerH, innerW, footerH, blend(primary, bg, 0.3));

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([signature, pngChunk("IHDR", ihdr), pngChunk("IDAT", compressed), pngChunk("IEND", Buffer.alloc(0))]);
}

function extendTypography(scale, layoutKind) {
  const xl = parseFloat(scale.xl ?? "2rem");
  const unit = (scale.xl ?? "2rem").replace(/[\d.]/g, "") || "rem";
  const luxury = layoutKind === "full-bleed";
  return {
    ...scale,
    "2xl": `${(xl * 1.4).toFixed(2)}${unit}`,
    "3xl": `${(xl * (luxury ? 1.85 : 1.6)).toFixed(2)}${unit}`,
    "4xl": `${(xl * (luxury ? 2.2 : 1.9)).toFixed(2)}${unit}`,
  };
}

function buildEnterpriseCanvas(config, profile) {
  const c = config.canvas;
  const colors = { ...c.colors };
  const accent = colors.accent ?? colors.primary;
  return {
    id: "canvas",
    grid: {
      columns: c.columns,
      gutter: c.gutter,
      margin: c.margin,
      maxWidth: c.maxWidth,
    },
    spacing: {
      unit: "rem",
      scale: c.spacingScale,
    },
    visualIdentity: {
      colors,
      typography: {
        display: c.typography.display,
        body: c.typography.body,
        scale: extendTypography(c.typography.scale, config.layoutKind),
      },
      radius: c.radius,
      shadows: {
        ...c.shadows,
        surface: c.shadows?.surface ?? "0 1px 3px rgba(0,0,0,0.08)",
        elevated: "0 16px 48px rgba(15,23,42,0.14)",
        hero: "0 32px 96px rgba(0,0,0,0.22)",
        cta: `0 12px 32px ${accent}40`,
        card: "0 4px 24px rgba(15,23,42,0.08)",
      },
      borders: {
        default: colors.background === "#FFFFFF" || colors.background?.startsWith("#F")
          ? "rgba(15,23,42,0.08)"
          : "rgba(255,255,255,0.1)",
        focus: `2px solid ${accent}`,
      },
      animation: profile.animation,
    },
    designSystem: {
      tier: "enterprise",
      industry: config.industry,
      layoutKind: config.layoutKind,
      templateIntelligenceId: config.tiId,
    },
  };
}

function buildPlacementRules(config, profile) {
  const heroRegion = profile.hero.region;
  const constraints = [
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
      id: `${config.id}-home-section-flow`,
      description: `Home flow: ${profile.sectionFlow.join(" → ")}. Imagery: ${profile.imagery}. ${profile.conversion}`,
      when: { page: "home", region: "main" },
      allow: { componentTypes: profile.sectionFlow },
    },
    {
      id: `${config.id}-hero-pattern`,
      description: `Hero pattern: ${profile.hero.pattern} (${profile.hero.style}). ${profile.luxury}`,
      when: { page: "home", region: heroRegion },
      allow: { componentTypes: ["hero", "banner", "video", "gallery", "custom"] },
    },
    {
      id: `${config.id}-a11y`,
      description: profile.a11y,
      when: { region: "main" },
      allow: { componentTypes: profile.sectionFlow },
    },
  ];

  const regionOverrides = {
    header: {
      minComponents: 1,
      requiredTypes: ["navigation"],
      maxComponents: 6,
      allowedComponentTypes: ["navigation", "logo", "cta", "custom"],
    },
    footer: {
      maxComponents: 8,
      allowedComponentTypes: ["navigation", "logo", "contact", "cta", "custom"],
    },
  };

  regionOverrides[heroRegion] = {
    minComponents: 1,
    requiredTypes: ["hero"],
    maxComponents: heroRegion === "overlay" ? 4 : 3,
  };

  regionOverrides.main = {
    minComponents: heroRegion === "main" ? 1 : 0,
    ...(heroRegion === "main" ? { requiredTypes: ["hero"] } : {}),
    allowedComponentTypes: profile.sectionFlow.includes("custom")
      ? profile.sectionFlow
      : [...profile.sectionFlow, "custom"],
    maxComponents: 24,
  };

  if (profile.regionOrder.includes("utility")) {
    regionOverrides.utility = {
      maxComponents: 3,
      allowedComponentTypes: ["cta", "pricing", "testimonials", "contact", "gallery", "custom"],
    };
  }
  if (profile.regionOrder.includes("sidebar")) {
    regionOverrides.sidebar = {
      minComponents: 1,
      requiredTypes: ["navigation"],
      maxComponents: 8,
      allowedComponentTypes: ["navigation", "services", "cta", "contact", "custom", "team"],
    };
  }

  return {
    global: {
      maxComponentsPerPage: 40,
      allowDuplicateTypes: false,
      defaultOrdering: "vertical",
    },
    regionOverrides,
    constraints,
  };
}

function buildLayout(config, profile) {
  const g = profile.grid;
  return {
    id: "default",
    kind: config.layoutKind,
    label: "Default Layout",
    regionOrder: profile.regionOrder,
    rules: {
      gap: "0",
      regionGap: g.regionGap,
      minHeight: g.minHeight,
    },
    grid: {
      templateAreas: g.templateAreas,
      columns: g.columns,
      rows: g.rows,
      gap: "0",
    },
  };
}

function enhanceRegion(region, config, profile) {
  const next = structuredClone(region);
  const heroRegion = profile.hero.region;
  const luxury = config.layoutKind === "full-bleed";

  if (region.id === "header") {
    next.placement.minComponents = 1;
    next.placement.requiredTypes = ["navigation"];
    next.placement.maxComponents = 6;
    next.layout.padding = luxury ? "1.25rem 2.5rem" : "1rem 2rem";
    next.responsive = { collapseBelow: "lg", stackOrder: "normal" };
  }

  if (region.id === heroRegion) {
    next.placement.minComponents = 1;
    next.placement.requiredTypes = ["hero"];
    next.layout.minHeight = profile.hero.minHeight;
    next.layout.padding = region.id === "overlay" ? "0" : luxury ? "3rem 2rem" : "2.5rem 1.75rem";
    next.layout.width = region.id === "overlay" ? "full" : next.layout.width;
  }

  if (region.id === "main") {
    next.placement.allowedComponentTypes = profile.sectionFlow.includes("custom")
      ? profile.sectionFlow
      : [...profile.sectionFlow, "custom"];
    next.placement.maxComponents = 24;
    next.layout.padding = luxury ? "3rem 2rem" : "2.5rem 1.75rem";
    if (heroRegion !== "main") next.placement.minComponents = 0;
  }

  if (region.id === "utility") {
    next.layout.padding = "1rem 2rem";
    next.placement.maxComponents = 3;
    next.placement.allowedComponentTypes = ["cta", "pricing", "testimonials", "contact", "gallery", "custom"];
  }

  if (region.id === "footer") {
    next.layout.padding = luxury ? "3rem 2rem" : "2.5rem 1.75rem";
    next.placement.maxComponents = 8;
  }

  if (region.id === "sidebar") {
    next.placement.minComponents = 1;
    next.placement.requiredTypes = ["navigation"];
    next.layout.padding = "1.5rem 1.25rem";
    next.responsive = { collapseBelow: "lg", stackOrder: "normal" };
  }

  if (region.id === "overlay" && region.id !== heroRegion) {
    next.placement.minComponents = 0;
    next.layout.minHeight = "auto";
  }

  return next;
}

function writeFileWithRetry(filePath, data, attempts = 5) {
  const tmpPath = `${filePath}.tmp`;
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      writeFileSync(tmpPath, data);
      renameSync(tmpPath, filePath);
      return;
    } catch (error) {
      lastError = error;
      try {
        if (existsSync(tmpPath)) renameSync(tmpPath, filePath);
      } catch {
        // ignore cleanup errors between retries
      }
    }
  }
  throw lastError;
}

function buildComponentTypes(profile) {
  const flowSet = new Set(profile.sectionFlow);
  return {
    types: COMPONENT_CATALOG.map((type) => ({
      ...type,
      description: flowSet.has(type.id)
        ? `${type.description} — part of ${profile.hero.pattern} flow`
        : type.description,
    })),
  };
}

function upgradePackageDir(config, dir) {
  if (!existsSync(dir)) return null;
  const profile = ENTERPRISE_TEMPLATE_PROFILES[config.id];
  if (!profile) throw new Error(`Missing enterprise profile for ${config.id}`);

  const layout = buildLayout(config, profile);
  const canvas = buildEnterpriseCanvas(config, profile);
  const placement = buildPlacementRules(config, profile);
  const componentTypes = buildComponentTypes(profile);

  writeFileWithRetry(join(dir, "layouts/default.json"), `${JSON.stringify(layout, null, 2)}\n`);
  writeFileWithRetry(join(dir, "canvas.json"), `${JSON.stringify(canvas, null, 2)}\n`);
  writeFileWithRetry(join(dir, "placement-rules.json"), `${JSON.stringify(placement, null, 2)}\n`);
  writeFileWithRetry(join(dir, "component-types.json"), `${JSON.stringify(componentTypes, null, 2)}\n`);

  for (const regionId of config.regionIds) {
    const regionPath = join(dir, "regions", `${regionId}.json`);
    const region = JSON.parse(readFileSync(regionPath, "utf8"));
    writeFileWithRetry(regionPath, `${JSON.stringify(enhanceRegion(region, config, profile), null, 2)}\n`);
  }

  for (const pageDef of config.pageDefs) {
    const pagePath = join(dir, "pages", `${pageDef.id}.json`);
    const page = JSON.parse(readFileSync(pagePath, "utf8"));
    page.regions = [...profile.regionOrder];
    writeFileWithRetry(pagePath, `${JSON.stringify(page, null, 2)}\n`);
  }

  const thumb = createWireframePng(640, 400, canvas.visualIdentity.colors, profile);
  const preview = createWireframePng(1280, 720, canvas.visualIdentity.colors, profile);
  writeFileWithRetry(join(dir, "assets/thumbnail.png"), thumb);
  writeFileWithRetry(join(dir, "assets/preview.png"), preview);

  const manifestPath = join(dir, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!manifest.componentTypes) {
    manifest.componentTypes = { file: "component-types.json" };
    writeFileWithRetry(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  return {
    heroPattern: profile.hero.pattern,
    sectionFlow: profile.sectionFlow.join(" → "),
    layoutFingerprint: `${config.layoutKind}|${profile.regionOrder.join("+")}|${profile.grid.columns}|${profile.grid.rows}|${profile.grid.templateAreas}`,
  };
}

const report = [];
for (const config of PREMIUM_TEMPLATE_LIBRARY) {
  const meta = upgradePackageDir(config, join(TARGETS[0], config.id));
  upgradePackageDir(config, join(TARGETS[1], config.id));
  report.push({ id: config.id, name: config.name, ...meta });
}

const fingerprints = new Set(report.map((r) => r.layoutFingerprint));
const heroPatterns = new Set(report.map((r) => r.heroPattern));
const flows = new Set(report.map((r) => r.sectionFlow));

console.log(
  JSON.stringify(
    {
      upgraded: report.length,
      uniqueLayouts: fingerprints.size,
      uniqueHeroPatterns: heroPatterns.size,
      uniqueSectionFlows: flows.size,
      report,
    },
    null,
    2,
  ),
);
