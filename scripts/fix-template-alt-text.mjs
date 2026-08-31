import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const files = [
  "templates/website/restaurant-signature/components/restaurant-signature-atmosphere.tsx",
  "templates/website/restaurant-premium/components/restaurant-premium-chef-story.tsx",
  "templates/website/restaurant-premium/components/restaurant-premium-atmosphere.tsx",
  "templates/website/real-estate-prestige/components/real-estate-prestige-architecture.tsx",
  "templates/website/real-estate-premium/components/real-estate-premium-neighborhoods.tsx",
  "templates/website/real-estate-premium/components/real-estate-premium-hero.tsx",
  "templates/website/real-estate-premium/components/real-estate-premium-architecture.tsx",
  "templates/website/medical-premium/components/medical-premium-wellness.tsx",
  "templates/website/medical-premium/components/medical-premium-trust-hero.tsx",
  "templates/website/hotel-resort-premium/components/hotel-resort-premium-hero.tsx",
  "templates/website/hotel-resort-premium/components/hotel-resort-premium-chef-story.tsx",
  "templates/website/hotel-resort-premium/components/hotel-resort-premium-atmosphere.tsx",
  "templates/website/education-premium/components/education-premium-hero.tsx",
  "templates/website/ecommerce-premium/components/ecommerce-premium-hero.tsx",
  "templates/website/ecommerce-premium/components/ecommerce-premium-brand-story.tsx",
  "templates/website/creative-agency-premium/components/creative-agency-premium-hero.tsx",
];

for (const rel of files) {
  const file = join(ROOT, rel);
  const content = readFileSync(file, "utf8");
  const next = content.replace(/alt="[^"]*"/g, 'alt={title ?? ""}');
  if (next !== content) {
    writeFileSync(file, next);
    console.log("fixed", rel);
  }
}
