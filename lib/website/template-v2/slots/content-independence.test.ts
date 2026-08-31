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
  "ai-startup-signal",
];

const TEMPLATE_ROOT = join(process.cwd(), "templates", "website");
const FLAGSHIP_ROOT = join(process.cwd(), "lib", "website", "template-v2", "flagship");

const FORBIDDEN_PATTERNS = [
  { name: "DEFAULT_ constant", pattern: /\bDEFAULT_[A-Z_]+\b/ },
  { name: "TRUST_ constant", pattern: /\bTRUST_[A-Z_]+\b/ },
  { name: "inline items array in JSX", pattern: /\bitems=\{\[/ },
  { name: "inline stats array in JSX", pattern: /\bstats=\{\[/ },
  { name: "inline testimonials array in JSX", pattern: /\btestimonials=\{\[/ },
  { name: "resolveSlotImage", pattern: /\bresolveSlotImage\b/ },
  { name: "resolveSiteImage", pattern: /\bresolveSiteImage\b/ },
  { name: "raw img tag", pattern: /<img\b/ },
  { name: "hardcoded unsplash URL", pattern: /images\.unsplash\.com/i },
  { name: "demo business name Meridian", pattern: /Meridian (Atlas|Capital|Advisory)/ },
  { name: "demo resort name", pattern: /Azure Haven/ },
  { name: "demo brand Atelier Commerce", pattern: /Atelier Commerce/ },
];

const DEMO_PHRASES = [
  "Trusted by leaders worldwide",
  "Board-ready counsel for global enterprises",
  "The Evening Standard",
  "Investment advisory services offered through",
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

function hasParamStringDefaults(content: string): boolean {
  const fnMatch = content.match(/export function \w+\(\s*\{([\s\S]*?)\}\s*(?::|=\s*\{)/);
  if (!fnMatch) return false;
  const structural = new Set(["id", "align", "className", "componentId"]);
  const defaults = [...fnMatch[1].matchAll(/\b(\w+)\s*=\s*"([^"]*)"/g)];
  return defaults.some(([, name, value]) => !structural.has(name) && value.length >= 8);
}

describe("template content independence", () => {
  for (const pkg of FLAGSHIPS) {
    const componentDir = join(TEMPLATE_ROOT, pkg, "components");
    try {
      statSync(componentDir);
    } catch {
      continue;
    }

    it(`${pkg} components contain no embedded demo content`, () => {
      const violations: string[] = [];

      for (const file of walkTsx(componentDir)) {
        const content = readFileSync(file, "utf8");
        const rel = file.replace(process.cwd(), "").replace(/\\/g, "/");

        for (const { name, pattern } of FORBIDDEN_PATTERNS) {
          if (pattern.test(content)) {
            violations.push(`${rel}: ${name}`);
          }
        }

        for (const phrase of DEMO_PHRASES) {
          if (content.includes(phrase)) {
            violations.push(`${rel}: demo phrase "${phrase}"`);
          }
        }

        if (hasParamStringDefaults(content)) {
          violations.push(`${rel}: parameter string default`);
        }
      }

      assert.deepEqual(violations, []);
    });
  }

  it("shared flagship sections contain no DEFAULT_ constants or param string defaults", () => {
    const violations: string[] = [];
    for (const file of walkTsx(FLAGSHIP_ROOT)) {
      const content = readFileSync(file, "utf8");
      const rel = file.replace(process.cwd(), "").replace(/\\/g, "/");
      if (/\bDEFAULT_[A-Z_]+\b/.test(content)) {
        violations.push(`${rel}: DEFAULT_ constant`);
      }
      if (hasParamStringDefaults(content)) {
        violations.push(`${rel}: parameter string default`);
      }
    }
    assert.deepEqual(violations, []);
  });
});
