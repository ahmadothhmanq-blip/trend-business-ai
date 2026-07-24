#!/usr/bin/env node
/** Add optional labelKey/descriptionKey to constants type definitions */
import fs from "node:fs";
import path from "node:path";

const files = [
  "lib/constants/image-generator.ts",
  "lib/constants/business-suite.ts",
  "lib/constants/video-studio.ts",
  "lib/constants/logo-designer.ts",
  "lib/constants/landing-page-builder.ts",
  "lib/constants/webapp-builder.ts",
  "lib/constants/brand-identity-builder.ts",
];

for (const rel of files) {
  let c = fs.readFileSync(rel, "utf8");
  c = c.replace(
    /export type (\w+) = \{(\s+)id: string;/g,
    "export type $1 = {$2id: string;\n$2labelKey?: string;\n$2descriptionKey?: string;",
  );
  c = c.replace(
    /\{ id: string; label: string; category: string \}/g,
    "{ id: string; labelKey?: string; label: string; category: string }",
  );
  c = c.replace(
    /\{ id: string; label: string \}/g,
    "{ id: string; labelKey?: string; label: string }",
  );
  fs.writeFileSync(rel, c);
  console.log("fixed types", rel);
}
