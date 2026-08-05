/**
 * Generate comparison screenshots for Corporate Command, AI Signal, and SaaS Enterprise V2.
 * Usage: node scripts/qa-template-v2-comparison.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/template-v2-comparison");
mkdirSync(outDir, { recursive: true });

const runnerDir = mkdtempSync(join(tmpdir(), "wb-v2-compare-"));
const runnerPath = join(runnerDir, "runner.mts");
const runner = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from ${JSON.stringify(pathToFileURL(join(root, "lib/website/builder/apply-structure-template.ts")).href)};
import type { GeneratedWebsiteProject } from ${JSON.stringify(pathToFileURL(join(root, "plugins/website/types.ts")).href)};

const baseProject = {
  projectKind: "website",
  title: "Comparison Corp",
  description: "Template comparison QA",
  pages: [{ id: "home", title: "Home", path: "/" }],
  sections: [], colorPalette: [], typography: [], components: [], content: [], seo: [], roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: ":root{--color-primary:#000;--color-background:#fff;--color-foreground:#111;--color-surface:#fff;--font-display:serif;--font-body:sans-serif}", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html><body>{children}</body></html>}", language: "tsx" },
  ],
} satisfies GeneratedWebsiteProject;

const templates = [
  { id: "modern-business", label: "Corporate Command" },
  { id: "ai-startup-signal", label: "AI Signal" },
  { id: "saas-enterprise", label: "SaaS Enterprise V2" },
  { id: "restaurant-signature", label: "Restaurant Signature V2" },
];

const outDir = ${JSON.stringify(outDir)};

for (const tpl of templates) {
  const result = await applyStructureTemplateToProject({
    project: baseProject,
    templatePackageId: tpl.id,
    language: "English",
  });
  const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
  const globals = result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
  const arch = (result.project.settings as Record<string, unknown>)?.templateArchitectureVersion ?? "v1";
  const html = \`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>\${tpl.label}</title>
<style>\${globals}</style>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
<div data-template="\${tpl.id}" data-architecture="\${arch}">
<pre style="font:12px monospace;padding:8px;background:#f5f5f5">Architecture: \${arch} | Components: \${(result.project.components ?? []).slice(0,4).join(", ")}</pre>
<div id="preview-root">\${page.replace(/export default function[^]+$/s, "").replace(/import[^;]+;/g, "")}</div>
</body>
</html>\`;
  const slug = tpl.id.replace(/[^a-z0-9-]/gi, "-");
  writeFileSync(join(outDir, \`\${slug}-comparison.html\`), html, "utf8");
  console.log("wrote", join(outDir, \`\${slug}-comparison.html\`));
}
`;

writeFileSync(runnerPath, runner, "utf8");
const result =
  process.platform === "win32"
    ? spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
        cwd: root,
        encoding: "utf8",
        env: process.env,
        shell: true,
      })
    : spawnSync("npx", ["--yes", "tsx", runnerPath], {
        cwd: root,
        encoding: "utf8",
        env: process.env,
      });

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
