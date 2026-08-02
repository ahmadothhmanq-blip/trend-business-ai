import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { importWebsiteProjectFromZip } from "../lib/website/import-project.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const zipPath = path.join(root, "qa-test-corp-export.zip");
const extractDir = path.join(root, "qa-test-corp-extracted");

const pageTsx = `import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { buildPageTitle } from "@/lib/seo";
export const metadata = {
  title: buildPageTitle("Home"),
  description: "Establish trust with executive buyers and move them toward consultation bookings.",
};
export default function HomePage() {
  return (
    <SiteShell
        title="QA AUTOSAVE TEST 2026 B">
      <h1>Home</h1>
      <p>Establish trust with executive buyers and move them toward consultation bookings.</p>
      <section><h2>hero</h2></section>
      <Button>Book a strategy workshop</Button>
    </SiteShell>
  );
}
`;

const files = [
  {
    path: "app/page.tsx",
    content: pageTsx,
    language: "tsx",
  },
  {
    path: "app/about/page.tsx",
    content: `import { SiteShell } from "@/components/layout/site-shell";\nexport default function AboutPage() { return <SiteShell><h1>About</h1></SiteShell>; }\n`,
    language: "tsx",
  },
  {
    path: "app/layout.tsx",
    content: `export default function RootLayout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }\n`,
    language: "tsx",
  },
  {
    path: "app/globals.css",
    content: "body { margin: 0; }\n",
    language: "css",
  },
  {
    path: "components/layout/site-shell.tsx",
    content: `export function SiteShell({ children, title }: { children: React.ReactNode; title?: string }) { return <div><header>{title}</header><main>{children}</main></div>; }\n`,
    language: "tsx",
  },
  {
    path: "components/ui/button.tsx",
    content: `export function Button({ children }: { children: React.ReactNode }) { return <button>{children}</button>; }\n`,
    language: "tsx",
  },
  {
    path: "lib/seo.ts",
    content: `export const siteName = "QA Test Corp";\nexport function buildPageTitle(pageTitle?: string) { return pageTitle ? \`\${pageTitle} | \${siteName}\` : siteName; }\n`,
    language: "ts",
  },
  {
    path: "package.json",
    content: JSON.stringify(
      {
        name: "qa-test-corp",
        version: "0.1.0",
        private: true,
        scripts: { dev: "next dev", build: "next build", start: "next start" },
      },
      null,
      2,
    ),
    language: "json",
  },
];

const zip = new JSZip();
for (const file of files) zip.file(file.path, file.content);
const buffer = await zip.generateAsync({ type: "nodebuffer" });
fs.writeFileSync(zipPath, buffer);

const imported = await importWebsiteProjectFromZip(buffer, "QA Import Test");
const loaded = await JSZip.loadAsync(buffer);
const entries = Object.keys(loaded.files).filter((k) => !loaded.files[k].dir);

fs.mkdirSync(extractDir, { recursive: true });
for (const name of entries) {
  const content = await loaded.file(name).async("nodebuffer");
  const out = path.join(extractDir, name);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
}

const b64 = buffer.toString("base64");
fs.writeFileSync(path.join(root, "qa-test-corp-export.b64"), b64);

console.log(
  JSON.stringify(
    {
      zipPath,
      zipSize: buffer.length,
      entryCount: entries.length,
      entries,
      importReady: imported.ready,
      importBlocking: imported.blockingIssues,
      hasEditedHeadline: pageTsx.includes("QA AUTOSAVE TEST 2026 B"),
      b64Path: path.join(root, "qa-test-corp-export.b64"),
      b64Length: b64.length,
    },
    null,
    2,
  ),
);
