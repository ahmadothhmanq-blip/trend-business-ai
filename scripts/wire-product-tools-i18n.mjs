#!/usr/bin/env node
/**
 * Wire product tool components to useProductT + common i18n keys.
 */
import fs from "node:fs";
import path from "node:path";

const TOOLS = [
  {
    file: "components/dashboard/content-studio/content-studio-tool.tsx",
    product: "contentStudio",
  },
  {
    file: "components/dashboard/image-generator/image-generator-tool.tsx",
    product: "imageGenerator",
  },
  {
    file: "components/dashboard/video-studio/video-studio-tool.tsx",
    product: "videoStudio",
  },
  {
    file: "components/dashboard/webapp-builder/webapp-builder-tool.tsx",
    product: "webappBuilder",
  },
  {
    file: "components/dashboard/logo-designer/logo-designer-tool.tsx",
    product: "logoDesigner",
  },
  {
    file: "components/dashboard/brand-identity/brand-identity-tool.tsx",
    product: "brandIdentity",
  },
  {
    file: "components/dashboard/business-suite/business-suite-tool.tsx",
    product: "businessSuite",
  },
  {
    file: "components/dashboard/ai-agents/ai-agents-tool.tsx",
    product: "aiAgents",
  },
  {
    file: "components/dashboard/landing-page-builder/landing-page-builder-tool.tsx",
    product: "landingPageBuilder",
  },
  {
    file: "components/dashboard/market-analysis-tool.tsx",
    product: "marketAnalysis",
  },
];

const COMMON_REPLACEMENTS = [
  [">Generate<", ">{p(\"actions.generate\")}<"],
  [">Regenerate<", ">{p(\"actions.regenerate\")}<"],
  [">Save<", ">{p(\"actions.save\")}<"],
  [">Export<", ">{p(\"actions.export\")}<"],
  [">Download<", ">{p(\"actions.download\")}<"],
  [">Preview<", ">{p(\"actions.preview\")}<"],
  [">Publish<", ">{p(\"actions.publish\")}<"],
  [">Duplicate<", ">{p(\"actions.duplicate\")}<"],
  [">Delete<", ">{p(\"actions.delete\")}<"],
  [">Back<", ">{t(\"common.back\")}<"],
  [">Continue<", ">{t(\"common.next\")}<"],
  [">Copy<", ">{t(\"common.copy\")}<"],
  [">Cancel<", ">{t(\"common.cancel\")}<"],
  [">Refresh<", ">{t(\"common.refresh\")}<"],
  ['title="Generate"', 'title={p("actions.generate")}'],
  ['placeholder="Describe what you want to create…"', 'placeholder={p("labels.promptPlaceholder")}'],
  ['"Generating..."', 'p("status.generating")'],
  ['"Generating…"', 'p("status.generating")'],
  ['toast.success("Saved successfully")', 'toast.success(p("toasts.saved"))'],
  ['toast.success("Generated successfully")', 'toast.success(p("toasts.generated"))'],
  ['toast.success("Deleted successfully")', 'toast.success(p("toasts.deleted"))'],
  ['toast.success("Copied to clipboard")', 'toast.success(p("toasts.copied"))'],
  ['"Something went wrong. Please try again."', 'p("toasts.errorGeneric")'],
  ['"No content to preview"', 'p("emptyStates.noProjects")'],
];

for (const tool of TOOLS) {
  const filePath = path.join(process.cwd(), tool.file);
  if (!fs.existsSync(filePath)) {
    console.log("skip", tool.file);
    continue;
  }
  let c = fs.readFileSync(filePath, "utf8");
  let changed = 0;

  if (!c.includes("useProductT")) {
    const importAnchor = c.includes('from "@/lib/utils"')
      ? 'import { cn } from "@/lib/utils";'
      : c.includes('"use client"')
        ? '"use client";\n'
        : null;
    if (importAnchor) {
      const extra =
        'import { useTranslation } from "@/lib/i18n/client";\nimport { useProductT } from "@/lib/i18n/use-scoped-t";';
      if (importAnchor === '"use client";\n') {
        c = c.replace('"use client";\n', `"use client";\n\n${extra}\n`);
      } else {
        c = c.replace(importAnchor, `${importAnchor}\n${extra}`);
      }
      changed++;
    }
  }

  const hookName = `useProductT("${tool.product}")`;
  if (!c.includes(hookName)) {
    const fnMatch = c.match(/export function \w+[^{]*\{/);
    if (fnMatch) {
      c = c.replace(fnMatch[0], `${fnMatch[0]}\n  const { t } = useTranslation();\n  const p = useProductT("${tool.product}");`);
      changed++;
    }
  }

  for (const [from, to] of COMMON_REPLACEMENTS) {
    if (c.includes(from)) {
      c = c.split(from).join(to);
      changed++;
    }
  }

  if (changed > 0) {
    fs.writeFileSync(filePath, c);
    console.log(`wired ${tool.file} (${changed} changes)`);
  } else {
    console.log(`unchanged ${tool.file}`);
  }
}
