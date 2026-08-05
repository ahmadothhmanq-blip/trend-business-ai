/**
 * Restore flagship image components from benchmark snapshots and migrate to SlotImage.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BENCHMARK = join(root, "scripts/benchmark-results/generated-flagship-websites");

const PROJECT_TO_PACKAGE = {
  "saas-pm-fr": "saas-enterprise",
  "corporate-ai-en": "corporate-business",
  "restaurant-ar": "restaurant-premium",
  "medical-clinic-en": "medical-premium",
  "real-estate-luxury-en": "real-estate-premium",
  "creative-agency-en": "creative-agency-premium",
  "education-university-en": "education-premium",
  "finance-wealth-en": "finance-premium",
  "azure-haven-resort-en": "hotel-resort-premium",
};

const SLOT_IMPORT =
  'import { SlotImage, slotImageList } from "@/lib/website/template-v2/slots";';

const IMAGE_COMPONENT_PATTERNS = [
  /resolveSiteImage/,
  /resolveSlotImage/,
  /slotImages/,
  /HERO_IMAGE/,
  /SECTION_IMAGES/,
  /TESTIMONIAL_IMAGES/,
  /GALLERY_IMAGES/,
  /FEATURE_IMAGES/,
  /TEAM_IMAGES/,
  /PRODUCT_IMAGE/,
  /BACKGROUND_IMAGE/,
  /template-images/,
  /<img\b/,
];

const FILE_SLOT_OVERRIDES = {
  "real-estate-premium-neighborhoods.tsx": { about: "gallery" },
  "real-estate-premium-collection.tsx": { about: "gallery" },
  "real-estate-premium-advisors.tsx": { about: "team" },
  "real-estate-premium-architecture.tsx": { about: "gallery" },
  "medical-premium-physicians.tsx": { about: "team" },
  "creative-agency-premium-selected-work.tsx": { hero: "gallery" },
  "creative-agency-premium-case-grid.tsx": { hero: "gallery" },
  "restaurant-premium-reservation-cta.tsx": { backgrounds: "cta" },
  "hotel-resort-premium-reservation-cta.tsx": { backgrounds: "cta" },
};

function needsImageMigration(content) {
  return IMAGE_COMPONENT_PATTERNS.some((re) => re.test(content));
}

function migrateContent(content, fileName) {
  let src = content.replace(/\r\n/g, "\n");
  const overrides = FILE_SLOT_OVERRIDES[fileName] ?? {};

  src = src.replace(
    /import\s*\{[^}]*\}\s*from\s*["']@\/lib\/website\/template-v2\/flagship\/template-images["'];?\s*\n?/g,
    "",
  );
  src = src.replace(
    /import\s*\{[^}]*\}\s*from\s*["']@\/lib\/site-images["'];?\s*\n?/g,
    "",
  );

  for (const [from, to] of Object.entries(overrides)) {
    src = src.replaceAll(`"${from}"`, `"${to}"`);
  }

  // Remove any const src = ... assignment (hero, gallery item, etc.)
  src = src.replace(/const\s+src\s*=[\s\S]*?;\s*\n/g, (block) => {
    if (/resolve(Site|Slot)Image|HERO_IMAGE|template-images/i.test(block)) return "";
    return block;
  });

  // Remove avatar = resolveSiteImage(...)
  src = src.replace(/const\s+avatar\s*=[\s\S]*?;\s*\n/g, (block) => {
    if (/resolveSiteImage|TESTIMONIAL_IMAGES/i.test(block)) return "";
    return block;
  });

  // slotImages → slotImageList
  src = src.replace(/\[\.\.\.slotImages\(/g, "[...slotImageList(");
  src = src.replace(/slotImages\(/g, "slotImageList(");

  // Hero img with src variable (after removing const src)
  src = src.replace(
    /<img\s+([^>]*?)src=\{src\}([^>]*)\/>/g,
    (_m, before, after) => {
      const attrs = parseImgAttrs(before + after);
      const pref = src.includes("imageUrl") ? " preferred={imageUrl}" : "";
      return `<SlotImage slot="hero" index={0}${pref} ${attrs} />`;
    },
  );

  // Inline resolveSlotImage in img
  src = src.replace(
    /<img\s+([^>]*?)src=\{resolveSlotImage\("(\w+)",\s*([^,)]+)(?:,\s*([^}]+))?\)\}([^>]*)\/>/g,
    (_m, before, slot, index, preferred, after) => {
      const pref = preferred ? ` preferred={${preferred.trim()}}` : "";
      const attrs = parseImgAttrs(before + after);
      return `<SlotImage slot="${slot}" index={${index.trim()}}${pref} ${attrs} />`;
    },
  );

  // Conditional src ? img : div → SlotImage (SlotImage handles empty)
  src = src.replace(
    /\{src\s*\?\s*\(\s*<img\s+([^>]*?)src=\{src\}([^>]*)\/>\s*\)\s*:\s*\([^)]+\)\s*\}/g,
    (_m, before, after) => {
      const attrs = parseImgAttrs(before + after);
      return `{<SlotImage slot="hero" index={0} preferred={imageUrl} ${attrs} />}`;
    },
  );

  // Gallery/atmosphere: const src = resolveSlotImage in map - replace img in map
  src = src.replace(
    /const\s+src\s*=\s*resolveSlotImage\("(\w+)",\s*([^)]+)\);?\s*\n\s*return\s*\([\s\S]*?<img\s+([^>]*?)src=\{src\}([^>]*)\/>/g,
    (match, slot, index, before, after) => {
      const attrs = parseImgAttrs(before + after);
      return match.replace(
        /<img\s+[^>]*src=\{src\}[^>]*\/>/,
        `<SlotImage slot="${slot}" index={${index.trim()}} ${attrs} />`,
      ).replace(/const\s+src\s*=\s*resolveSlotImage\([^)]+\);?\s*\n/, "");
    },
  );

  // Portfolio/features grid: src={resolveSlotImage(...)}
  src = src.replace(
    /<img\s+([^>]*?)src=\{resolveSlotImage\("(\w+)",\s*([^)]+)\)\}([^>]*)\/>/g,
    (_m, before, slot, index, after) => {
      const attrs = parseImgAttrs(before + after);
      return `<SlotImage slot="${slot}" index={${index.trim()}} ${attrs} />`;
    },
  );

  // Remaining img with src={images[index]} in gallery - use SlotImage
  src = src.replace(
    /<img\s+([^>]*?)src=\{src\}([^>]*)\/>/g,
    (_m, before, after) => {
      const attrs = parseImgAttrs(before + after);
      return `<SlotImage slot="gallery" index={index} ${attrs} />`;
    },
  );

  src = src.replace(
    /<img\s+([^>]*?)src=\{images\[activeIndex\]!\}([^>]*)\/>/g,
    (_m, before, after) => {
      const attrs = parseImgAttrs(before + after);
      return `<SlotImage slot="gallery" index={activeIndex} ${attrs} />`;
    },
  );

  // src = resolveSlotImage in map with fallback pattern
  src = src.replace(
    /const\s+src\s*=\s*\n?\s*resolveSlotImage\("(\w+)",\s*([^)]+)\)\s*\|\|\s*\n?\s*resolveSlotImage\("[^"]+",\s*[^)]+\);?\s*\n/g,
    "",
  );

  // Remaining img tags with src={src} for team/products
  src = src.replace(
    /<img\s+src=\{src\}\s+([^>]*)\/>/g,
    (_m, rest) => {
      const attrs = parseImgAttrs(rest);
      return `<SlotImage slot="team" index={doc.imageIndex} ${attrs} />`;
    },
  );

  // About section: resolveSiteImage(imageUrl || SECTION_IMAGES[0], 0)
  src = src.replace(
    /const\s+src\s*=\s*resolveSiteImage\(imageUrl\s*\|\|\s*SECTION_IMAGES\[0\],\s*0\);?\s*\n/g,
    "",
  );
  src = src.replace(
    /\{src\s*\?\s*\(\s*<img\s+([^>]*?)src=\{src\}([^>]*)\/>\s*\)\s*:\s*\(\s*<div[^>]*aria-hidden[^>]*\/>\s*\)\s*\}/g,
    (_m, before, after) => {
      const attrs = parseImgAttrs(before + after);
      return `{<SlotImage slot="about" index={0} preferred={imageUrl} ${attrs} />}`;
    },
  );

  // Testimonials: resolveSiteImage(item.imageUrl || TESTIMONIAL_IMAGES[index], index)
  src = src.replace(
    /const\s+avatar\s*=\s*resolveSiteImage\(item\.imageUrl\s*\|\|\s*TESTIMONIAL_IMAGES\[index\],\s*index\);?\s*\n/g,
    "",
  );
  src = src.replace(
    /\{avatar\s*\?\s*\(\s*<img\s+([^>]*?)src=\{avatar\}([^>]*)\/>\s*\)\s*:\s*\(\s*<span[\s\S]*?\{item\.name\.charAt\(0\)\}[\s\S]*?<\/span>\s*\)\s*\}/g,
    (_m, before, after) => {
      const attrs = parseImgAttrs(before + after);
      return `{<SlotImage slot="testimonials" index={index} preferred={item.imageUrl} containerClassName="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--color-surface)]" ${attrs} />}`;
    },
  );

  // Background image style patterns for CTA
  src = src.replace(
    /backgroundImage:\s*`url\(\$\{resolveSlotImage\("(\w+)",\s*(\d+)\)\}\)`/g,
    'backgroundImage: resolveSlotImageStrict("$1", $2) ? `url(${resolveSlotImageStrict("$1", $2)})` : undefined',
  );

  // Add imports
  if (
    (src.includes("SlotImage") || src.includes("slotImageList")) &&
    !src.includes(SLOT_IMPORT)
  ) {
    const useClient = src.startsWith('"use client"') ? '"use client";\n\n' : "";
    const rest = useClient ? src.replace(/^"use client";\s*\n?/, "") : src;
    src = useClient + SLOT_IMPORT + "\n" + rest;
  }

  if (src.includes("resolveSlotImageStrict") && !src.includes("resolveSlotImageStrict")) {
    // handled via slot-image - for CTA backgrounds use SlotImage as bg child instead
  }

  src = src.replace(/\n{3,}/g, "\n\n");
  return src;
}

function parseImgAttrs(raw) {
  let alt = 'alt=""';
  const altM =
    raw.match(/alt=\{?"([^"]*)"?\}/) || raw.match(/alt="([^"]*)"/);
  if (altM) alt = `alt="${altM[1]}"`;

  let className = "";
  const clsM =
    raw.match(/className="([^"]*)"/) ||
    raw.match(/className=\{`([^`]*)`\}/) ||
    raw.match(/className=\{"([^"]*)"\}/);
  if (clsM) className = `className="${clsM[1]}"`;

  let priority = "";
  if (raw.includes('fetchPriority="high"') || raw.includes("priority")) {
    priority = " priority";
  }

  let loading = "";
  if (raw.includes('loading="lazy"')) loading = ' loading="lazy"';

  let width = "";
  const wM = raw.match(/width=\{(\d+)\}/);
  const hM = raw.match(/height=\{(\d+)\}/);
  if (wM) width = ` width={${wM[1]}}`;
  if (hM) width += ` height={${hM[1]}}`;

  return [alt, className, priority, loading, width].filter(Boolean).join(" ");
}

function extractFromBenchmark(projectId, packageId) {
  const projectPath = join(BENCHMARK, projectId, "project.json");
  if (!existsSync(projectPath)) return 0;
  const project = JSON.parse(readFileSync(projectPath, "utf8"));
  let count = 0;

  for (const file of project.files ?? []) {
    if (!file.path?.includes("components/") || !file.path.endsWith(".tsx")) continue;
    const content = file.content;
    if (!content || !needsImageMigration(content)) continue;

    const fileName = basename(file.path);
    const outPath = join(root, "templates", "website", packageId, "components", fileName);
    const migrated = migrateContent(content, fileName);
    writeFileSync(outPath, migrated, "utf8");
    console.log("restored+migrated", packageId, fileName);
    count++;
  }
  return count;
}

let total = 0;
for (const [projectId, packageId] of Object.entries(PROJECT_TO_PACKAGE)) {
  total += extractFromBenchmark(projectId, packageId);
}

// Migrate ecommerce-premium from current files (no benchmark snapshot)
const ecommerceDir = join(root, "templates/website/ecommerce-premium/components");
for (const fileName of readdirSync(ecommerceDir)) {
  if (!fileName.endsWith(".tsx")) continue;
  const p = join(ecommerceDir, fileName);
  let content = readFileSync(p, "utf8");
  if (!needsImageMigration(content)) continue;
  // Try to fix broken files by reading from creative-agency or similar patterns
  content = migrateContent(content, fileName);
  writeFileSync(p, content, "utf8");
  console.log("migrated ecommerce", fileName);
  total++;
}

// Shared flagship sections
for (const rel of [
  "lib/website/template-v2/flagship/about-section.tsx",
  "lib/website/template-v2/flagship/testimonials-section.tsx",
]) {
  const p = join(root, rel);
  if (!existsSync(p)) continue;
  const content = readFileSync(p, "utf8");
  const migrated = migrateContent(content, basename(p));
  writeFileSync(p, migrated, "utf8");
  console.log("migrated", rel);
  total++;
}

console.log(`\nDone. ${total} files processed.`);
