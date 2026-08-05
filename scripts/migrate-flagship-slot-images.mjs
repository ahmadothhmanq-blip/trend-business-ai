/**
 * Migrate flagship V2 template components to image-independent SlotImage API.
 * Usage: node scripts/migrate-flagship-slot-images.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FLAGSHIPS = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
];

const SLOT_IMPORT =
  'import { SlotImage, slotImageList } from "@/lib/website/template-v2/slots";';

/** Per-file slot kind corrections (wrong slot → correct slot). */
const SLOT_FIXES = [
  [/resolveSlotImage\("about",\s*(\d+)\)/g, (m, idx) => {
    // handled per-file below
    return m;
  }],
];

const FILE_SLOT_OVERRIDES = {
  "real-estate-premium-neighborhoods.tsx": { about: "gallery" },
  "real-estate-premium-collection.tsx": { about: "gallery" },
  "real-estate-premium-advisors.tsx": { about: "team" },
  "real-estate-premium-architecture.tsx": { about: "gallery" },
  "medical-premium-physicians.tsx": { about: "team" },
  "medical-premium-wellness.tsx": { about: "about" },
  "creative-agency-premium-selected-work.tsx": { hero: "gallery" },
  "creative-agency-premium-case-grid.tsx": { hero: "gallery" },
  "restaurant-premium-reservation-cta.tsx": { backgrounds: "cta" },
  "hotel-resort-premium-reservation-cta.tsx": { backgrounds: "cta" },
};

function walkComponents(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) files.push(...walkComponents(p));
    else if (entry.endsWith(".tsx")) files.push(p);
  }
  return files;
}

function migrateFile(filePath) {
  let src = readFileSync(filePath, "utf8");
  const base = filePath.split(/[/\\]/).pop();
  const overrides = FILE_SLOT_OVERRIDES[base] ?? {};

  if (!src.includes("<img") && !src.includes("resolveSlotImage") && !src.includes("slotImages")) {
    return false;
  }

  // Remove old site-images imports
  src = src.replace(
    /import\s*\{[^}]*\}\s*from\s*["']@\/lib\/site-images["'];?\s*\n?/g,
    "",
  );

  // Apply slot overrides
  for (const [from, to] of Object.entries(overrides)) {
    src = src.replaceAll(`resolveSlotImage("${from}"`, `resolveSlotImage("${to}"`);
    src = src.replaceAll(`slotImages("${from}")`, `slotImageList("${to}")`);
  }

  // slotImages → slotImageList
  src = src.replace(/\[\.\.\.slotImages\(/g, "[...slotImageList(");
  src = src.replace(/slotImages\(/g, "slotImageList(");

  // Fix atmosphere second image index
  if (base?.includes("atmosphere")) {
    src = src.replace(
      /resolveSlotImage\("backgrounds",\s*0\)/g,
      'resolveSlotImage("backgrounds", 0)',
    );
    const matches = [...src.matchAll(/resolveSlotImage\("backgrounds",\s*0\)/g)];
    if (matches.length >= 2) {
      src = src.replace(
        /(resolveSlotImage\("backgrounds",\s*)0(\)[\s\S]*?resolveSlotImage\("backgrounds",\s*)0/,
        '$10$21',
      );
    }
    src = src.replace(
      /resolveSlotImage\("backgrounds", 0\)\s*\n([^]*?)resolveSlotImage\("backgrounds", 0\)/,
      'resolveSlotImage("backgrounds", 0)\n$1resolveSlotImage("backgrounds", 1)',
    );
  }

  // Convert const src = resolveSlotImage(...) + <img src={src} to SlotImage
  src = src.replace(
    /const\s+(\w+)\s*=\s*\n?\s*resolveSlotImage\("(\w+)",\s*(\d+)(?:,\s*(\w+))?\s*\)\s*;?\s*\n[\s\S]*?<img\s+([^>]*?)src=\{\1\}([^>]*)\/>/g,
    (match, _var, slot, index, preferred, before, after) => {
      const pref = preferred ? ` preferred={${preferred}}` : "";
      const attrs = extractImgAttrs(before + after);
      return `<SlotImage slot="${slot}" index={${index}}${pref} ${attrs} />`;
    },
  );

  // Simple img with inline resolveSlotImage
  src = src.replace(
    /<img\s+([^>]*?)src=\{resolveSlotImage\("(\w+)",\s*(\d+)(?:,\s*([^}]+))?\)\}([^>]*)\/>/g,
    (_m, before, slot, index, preferred, after) => {
      const pref = preferred ? ` preferred={${preferred.trim()}}` : "";
      const attrs = extractImgAttrs(before + after);
      return `<SlotImage slot="${slot}" index={${index}}${pref} ${attrs} />`;
    },
  );

  // img src={variable} where variable was resolveSlotImage - handle remaining
  src = src.replace(
    /<img\s+([^>]*?)src=\{(\w+)\}([^>]*)\/>/g,
    (match, before, varName, after) => {
      if (match.includes("SlotImage")) return match;
      const decl = new RegExp(
        `const\\s+${varName}\\s*=\\s*\\n?\\s*resolveSlotImage\\("(\\w+)",\\s*(\\d+)(?:,\\s*(\\w+))?`,
      );
      const d = src.match(decl);
      if (!d) return match;
      const pref = d[3] ? ` preferred={${d[3]}}` : "";
      const attrs = extractImgAttrs(before + after);
      return `<SlotImage slot="${d[1]}" index={${d[2]}}${pref} ${attrs} />`;
    },
  );

  // Remove orphaned const src = resolveSlotImage lines
  src = src.replace(
    /const\s+\w+\s*=\s*\n?\s*resolveSlotImage\([^)]+\)\s*;?\s*\n/g,
    "",
  );

  // Gallery map patterns: const src = resolveSlotImage in map
  src = src.replace(
    /const\s+src\s*=\s*resolveSlotImage\("(\w+)",\s*([^)]+)\)\s*;?\s*\n\s*<img/g,
    '<SlotImage slot="$1" index={$2} ',
  );

  // Add SlotImage import if needed
  if ((src.includes("SlotImage") || src.includes("slotImageList")) && !src.includes(SLOT_IMPORT)) {
    const useClient = src.startsWith('"use client"') ? '"use client";\n\n' : "";
    const rest = useClient ? src.replace(/^"use client";\s*\n?/, "") : src;
    src = useClient + SLOT_IMPORT + "\n" + rest;
  }

  // Clean double newlines
  src = src.replace(/\n{3,}/g, "\n\n");

  writeFileSync(filePath, src, "utf8");
  return true;
}

function extractImgAttrs(raw) {
  let alt = 'alt=""';
  const altM = raw.match(/alt=\{?"([^"]*)"?\}/) || raw.match(/alt="([^"]*)"/);
  if (altM) alt = `alt="${altM[1]}"`;

  let className = "";
  const clsM = raw.match(/className="([^"]*)"/) || raw.match(/className=\{`([^`]*)`\}/);
  if (clsM) className = `className="${clsM[1]}"`;

  let priority = "";
  if (raw.includes('fetchPriority="high"') || raw.includes("priority")) {
    priority = " priority";
  }

  let loading = "";
  if (raw.includes('loading="lazy"')) loading = ' loading="lazy"';

  return [alt, className, priority, loading].filter(Boolean).join(" ");
}

let count = 0;
for (const pkg of FLAGSHIPS) {
  const dir = join(root, "templates", "website", pkg, "components");
  try {
    for (const file of walkComponents(dir)) {
      if (migrateFile(file)) {
        console.log("migrated", file.replace(root + "\\", "").replace(root + "/", ""));
        count++;
      }
    }
  } catch (e) {
    console.error("skip", pkg, e.message);
  }
}

// Migrate shared flagship sections
for (const file of [
  "lib/website/template-v2/flagship/about-section.tsx",
  "lib/website/template-v2/flagship/testimonials-section.tsx",
]) {
  const p = join(root, file);
  if (migrateFile(p)) {
    console.log("migrated", file);
    count++;
  }
}

console.log(`\nDone. ${count} files migrated.`);
