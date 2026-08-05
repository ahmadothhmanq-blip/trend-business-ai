/**
 * Migrate V2 template components from hardcoded template-images to semantic slots.
 * Run: node scripts/migrate-template-image-slots.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TEMPLATES = path.join(ROOT, "templates", "website");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const SLOT_MAP = {
  hero: "hero",
  gallery: "gallery",
  dishes: "products",
  products: "products",
  chef: "about",
  studio: "about",
  clinic: "about",
  physician: "team",
  wellness: "about",
  atmosphereWide: "backgrounds",
  atmosphereDetail: "backgrounds",
  reservation: "backgrounds",
  caseStudies: "features",
  boardroom: "features",
  dashboard: "features",
  interior: "about",
  exterior: "features",
  diningRoom: "about",
  pool: "features",
  suite: "about",
  lifestyle: "about",
  work: "gallery",
};

function migrateFile(filePath) {
  let src = readFileSync(filePath, "utf8");
  if (!src.includes("template-images")) return false;

  src = src.replace(
    /import\s*\{[^}]*\}\s*from\s*["']@\/lib\/website\/template-v2\/flagship\/template-images["'];?\s*\n/g,
    "",
  );

  const needsSlot = /_IMAGES\.|pickImage\(/.test(src);
  const needsHero =
    /resolveSiteImage\([^)]*\)\s*\|\|\s*\w+_IMAGES\.\w+/.test(src) ||
    /resolveSiteImage\(imageUrl\s*\|\|\s*HERO_IMAGE/.test(src) ||
    /CREATIVE_AGENCY_PREMIUM_IMAGES\.hero/.test(src);

  if (!needsSlot && !needsHero) return false;

  const imports = new Set();
  if (needsSlot || needsHero) {
    imports.add("resolveSlotImage");
    if (/\.gallery|dishes|products|caseStudies|GALLERY|images\s*=\s*/.test(src)) {
      imports.add("slotImages");
    }
  }

  const importLine = `import { ${[...imports].join(", ")} } from "@/lib/site-images";\n`;
  if (!src.includes('from "@/lib/site-images"')) {
    src = importLine + src;
  } else {
    src = src.replace(
      /import\s*\{([^}]+)\}\s*from\s*["']@\/lib\/site-images["'];?/,
      (_, names) => {
        const set = new Set(
          names.split(",").map((n) => n.trim()).filter(Boolean),
        );
        for (const name of imports) set.add(name);
        return `import { ${[...set].join(", ")} } from "@/lib/site-images"`;
      },
    );
  }

  src = src.replace(
    /resolveSiteImage\(([^|]+)\|\|\s*HERO_IMAGE,\s*(\d+)\)\s*\|\|\s*\w+_IMAGES\.\w+/g,
    "resolveSlotImage(\"hero\", $2, $1)",
  );
  src = src.replace(
    /resolveSiteImage\(([^|]+)\|\|\s*SERVICE_IMAGE,\s*(\d+)\)\s*\|\|\s*\w+_IMAGES\.\w+/g,
    "resolveSlotImage(\"about\", $2, $1)",
  );
  src = src.replace(
    /resolveSiteImage\(imageUrl\s*\|\|\s*HERO_IMAGE,\s*0\)\s*\|\|\s*\w+_IMAGES\.hero/g,
    'resolveSlotImage("hero", 0, imageUrl)',
  );
  src = src.replace(
    /resolveSiteImage\(imageUrl\s*\|\|\s*HERO_IMAGE,\s*0\)/g,
    'resolveSlotImage("hero", 0, imageUrl)',
  );
  src = src.replace(
    /resolveSiteImage\(PRODUCT_IMAGE,\s*1\)\s*\|\|\s*pickImage\([^)]+\)/g,
    'resolveSlotImage("products", 1)',
  );
  src = src.replace(
    /src=\{CREATIVE_AGENCY_PREMIUM_IMAGES\.hero\}/g,
    'src={resolveSlotImage("hero", 0, imageUrl)}',
  );
  src = src.replace(
    /src=\{(\w+_PREMIUM_IMAGES)\.(\w+)\}/g,
    (_, _obj, key) => {
      const slot = SLOT_MAP[key] || "gallery";
      return `src={resolveSlotImage("${slot}", 0)}`;
    },
  );
  src = src.replace(
    /const images = \w+_PREMIUM_IMAGES\.gallery;/g,
    'const images = [...slotImages("gallery")];',
  );
  src = src.replace(
    /pickImage\(\w+_PREMIUM_IMAGES\.gallery,\s*([^,]+),\s*[^)]+\)/g,
    'resolveSlotImage("team", $1)',
  );
  src = src.replace(
    /pickImage\(\w+_PREMIUM_IMAGES\.products,\s*([^,]+),\s*[^)]+\)/g,
    'resolveSlotImage("products", $1)',
  );
  src = src.replace(
    /\w+_PREMIUM_IMAGES\.dishes\[([^\]]+)\]\s*\?\?\s*\w+_PREMIUM_IMAGES\.dishes\[0\]/g,
    'resolveSlotImage("products", $1)',
  );
  src = src.replace(
    /\w+_PREMIUM_IMAGES\.caseStudies\[index\]\s*\?\?\s*\w+_PREMIUM_IMAGES\.boardroom/g,
    'resolveSlotImage("features", index)',
  );
  src = src.replace(
    /resolveSiteImage\(imageUrl \|\| HERO_IMAGE, 0\) \|\| SAAS_ENTERPRISE_IMAGES\.dashboard/g,
    'resolveSlotImage("hero", 0, imageUrl)',
  );

  if (src.includes("template-images") || /\w+_IMAGES\./.test(src) || /pickImage\(/.test(src)) {
    console.warn("partial:", filePath);
  }

  writeFileSync(filePath, src, "utf8");
  return true;
}

let count = 0;
for (const file of walk(TEMPLATES)) {
  if (migrateFile(file)) {
    count += 1;
    console.log("migrated", path.relative(ROOT, file));
  }
}
console.log(`done: ${count} files`);
