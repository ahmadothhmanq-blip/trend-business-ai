#!/usr/bin/env node
/** Add labelKey to option arrays in remaining constants files */
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

const NS = {
  "image-generator.ts": "constants.imageGenerator",
  "business-suite.ts": "constants.businessSuite",
  "video-studio.ts": "constants.videoStudio",
  "logo-designer.ts": "constants.logoDesigner",
  "landing-page-builder.ts": "constants.landingPageBuilder",
  "webapp-builder.ts": "constants.webappBuilder",
  "brand-identity-builder.ts": "constants.brandIdentity",
};

for (const rel of files) {
  const filePath = path.join(process.cwd(), rel);
  if (!fs.existsSync(filePath)) continue;
  let c = fs.readFileSync(filePath, "utf8");
  const ns = NS[path.basename(rel)];
  if (!ns || c.includes("labelKey:")) {
    console.log("skip", rel);
    continue;
  }

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)"(,|\s*\})/g,
    (_, id, label, tail) => {
      const key = id.replace(/-/g, "_");
      if (tail === ",") {
        return `{ id: "${id}", labelKey: "${ns}.options.${key}", label: "${label}",`;
      }
      return `{ id: "${id}", labelKey: "${ns}.options.${key}", label: "${label}" }`;
    },
  );

  c = c.replace(
    /\{ id: "([^"]+)", label: "([^"]+)", description: "([^"]+)"/g,
    (_, id, label, desc) => {
      const key = id.replace(/-/g, "_");
      return `{ id: "${id}", labelKey: "${ns}.types.${key}.label", descriptionKey: "${ns}.types.${key}.description", label: "${label}", description: "${desc}"`;
    },
  );

  fs.writeFileSync(filePath, c);
  console.log("patched", rel);
}
