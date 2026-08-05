import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

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

const ROOT = join(process.cwd(), "templates", "website");

const FORBIDDEN_PATTERNS = [
  { name: "raw img tag", pattern: /<img\b/ },
  { name: "resolveSiteImage", pattern: /\bresolveSiteImage\b/ },
  { name: "template-images import", pattern: /template-images/ },
  { name: "hardcoded unsplash URL", pattern: /images\.unsplash\.com/i },
  { name: "HERO_IMAGE constant", pattern: /\bHERO_IMAGE\b/ },
  { name: "SECTION_IMAGES constant", pattern: /\bSECTION_IMAGES\b/ },
  { name: "TESTIMONIAL_IMAGES constant", pattern: /\bTESTIMONIAL_IMAGES\b/ },
  { name: "PREMIUM_IMAGES constant", pattern: /_PREMIUM_IMAGES\b/ },
  { name: "ENTERPRISE_IMAGES constant", pattern: /_ENTERPRISE_IMAGES\b/ },
  { name: "BUSINESS_IMAGES constant", pattern: /_BUSINESS_IMAGES\b/ },
];

function walkTsx(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) files.push(...walkTsx(p));
    else if (entry.endsWith(".tsx")) files.push(p);
  }
  return files;
}

describe("flagship template image independence", () => {
  for (const pkg of FLAGSHIPS) {
    it(`${pkg} components contain no hardcoded images`, () => {
      const dir = join(ROOT, pkg, "components");
      const violations: string[] = [];

      for (const file of walkTsx(dir)) {
        const content = readFileSync(file, "utf8");
        const rel = file.replace(process.cwd(), "").replace(/\\/g, "/");
        for (const { name, pattern } of FORBIDDEN_PATTERNS) {
          if (pattern.test(content)) {
            violations.push(`${rel}: ${name}`);
          }
        }
      }

      assert.deepEqual(violations, []);
    });
  }

  it("shared flagship about section uses SlotImage", () => {
    const content = readFileSync(
      join(process.cwd(), "lib/website/template-v2/flagship/about-section.tsx"),
      "utf8",
    );
    assert.match(content, /SlotImage/);
    assert.doesNotMatch(content, /<img\b/);
    assert.equal(content.includes("resolveSiteImage"), false);
  });
});
