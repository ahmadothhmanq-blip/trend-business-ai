import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { sanitizeDesignScaffold } from "../lib/website/template-v2/loader/sanitize-design-scaffold.ts";
import { renderV2PageMarkup } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const heroPath = join(
  root,
  "templates/website/corporate-business/components/corporate-business-hero.tsx",
);
const raw = readFileSync(heroPath, "utf8");
const cleaned = sanitizeDesignScaffold(raw, "corporate-business-hero");

console.log("has TRUST_BRANDS ref", cleaned.includes("TRUST_BRANDS"));
console.log("has const TRUST", /const TRUST/.test(cleaned));

function preprocess(source) {
  return source
    .replace(/^"use client";\s*/m, "")
    .replace(/^import\s+type\s+.*?;?\s*$/gm, "")
    .replace(/^import\s+.*?from\s+["']next[^"']*["'];?\s*$/gm, "")
    .replace(/^export\s+const\s+metadata\s*=[\s\S]*?;\s*$/m, "")
    .replace(/^import\s+\{([^}]+)\}\s+from\s+["']react["'];?\s*$/gm, (_, imports) => `const { ${imports} } = React;`)
    .replace(/^import\s+\{[\s\S]*?\}\s+from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "");
}

const pre = preprocess(cleaned);
try {
  const out = ts.transpileModule(pre, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
    },
  });
  console.log("transpile ok", out.outputText.slice(0, 200));
} catch (e) {
  console.error("transpile fail", e);
}

const page = `import { CorporateBusinessHero } from "@/components/corporate-business-hero";
export default function Page() {
  return <CorporateBusinessHero title="T" subtitle="S" primaryCta="Go" secondaryCta="More" eyebrow="E" />;
}`;

try {
  const html = renderV2PageMarkup([
    { path: "app/page.tsx", content: page },
    { path: "components/corporate-business-hero.tsx", content: cleaned },
    { path: "app/globals.css", content: ":root{}" },
  ]);
  console.log("render ok", html.length, html.includes("data-v2-preview-error"));
} catch (e) {
  console.error("render fail", e);
}
