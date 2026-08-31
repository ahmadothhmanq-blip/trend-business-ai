import { readFileSync } from "node:fs";
import { renderV2PageMarkup } from "@/lib/website/template-v2/preview/v2-preview-compiler";

const page = readFileSync(
  "scripts/benchmark-results/car-preview-audit/app-page.tsx",
  "utf8",
);
const files = [{ path: "app/page.tsx", content: page }];
const html = renderV2PageMarkup(files, "https://images.unsplash.com/photo-1");
const bad = [
  "Hero Split",
  "Generating website",
  "AI-generated website product preview",
  "v2-preview-error",
];
console.log(
  JSON.stringify(
    {
      length: html.length,
      hasApex: html.includes("Apex Motors"),
      bad: bad.filter((p) => html.includes(p)),
      sample: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400),
    },
    null,
    2,
  ),
);
