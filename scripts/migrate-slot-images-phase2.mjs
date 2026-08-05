/** Phase 2 — migrate SECTION_IMAGES/HERO_IMAGE direct usage to resolveSlotImage */
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

const REPLACEMENTS = [
  [/resolveSiteImage\(SECTION_IMAGES\[0\],\s*([^)]+)\)/g, 'resolveSlotImage("about", $1)'],
  [/resolveSiteImage\(HERO_IMAGE,\s*([^)]+)\)/g, 'resolveSlotImage("hero", $1)'],
  [/resolveSiteImage\(PRODUCT_IMAGE,\s*([^)]+)\)/g, 'resolveSlotImage("products", $1)'],
  [/resolveSiteImage\(SERVICE_IMAGE,\s*([^)]+)\)/g, 'resolveSlotImage("about", $1)'],
  [/resolveSiteImage\(imageUrl\s*\|\|\s*HERO_IMAGE,\s*0\)/g, 'resolveSlotImage("hero", 0, imageUrl)'],
  [/import \{([^}]*)\} from "@\/lib\/site-images"/g, (match, imports) => {
    const set = new Set(imports.split(",").map((s) => s.trim()).filter(Boolean));
    set.add("resolveSlotImage");
    set.delete("HERO_IMAGE");
    set.delete("PRODUCT_IMAGE");
    set.delete("SERVICE_IMAGE");
    set.delete("SECTION_IMAGES");
    if ([...set].some((n) => n.includes("slotImages"))) set.add("slotImages");
    return `import { ${[...set].join(", ")} } from "@/lib/site-images"`;
  }],
];

let count = 0;
for (const file of walk(TEMPLATES)) {
  let src = readFileSync(file, "utf8");
  const before = src;
  for (const [re, rep] of REPLACEMENTS) {
    src = src.replace(re, rep);
  }
  if (src !== before) {
    writeFileSync(file, src, "utf8");
    count += 1;
    console.log("updated", path.relative(ROOT, file));
  }
}
console.log(`phase2 complete: ${count} files`);
