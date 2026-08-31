import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prepareWebsiteProjectForExport } from "./prepare-export";

/** Minimal AI Signal scaffold similar to QA Test Corp before export prep. */
function minimalGeneratedProject() {
  return [
    {
      path: "package.json",
      language: "json" as const,
      content: JSON.stringify(
        {
          name: "qa-test-corp",
          version: "0.1.0",
          private: true,
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: {
            next: "^15.0.0",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            clsx: "^2.1.1",
            "tailwind-merge": "^2.5.0",
            "lucide-react": "^0.460.0",
          },
        },
        null,
        2,
      ),
    },
    {
      path: "app/layout.tsx",
      language: "tsx" as const,
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Test Corp",
  description: "Digital transformation consulting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`,
    },
    {
      path: "app/globals.css",
      language: "css" as const,
      content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
    },
    {
      path: "app/page.tsx",
      language: "tsx" as const,
      content: `import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { buildPageTitle } from "@/lib/seo";

export const metadata = { title: buildPageTitle("Home") };

export default function HomePage() {
  return (
    <SiteShell title="QA AUTOSAVE TEST 2026 B">
      <Button>Book a strategy workshop</Button>
    </SiteShell>
  );
}
`,
    },
    {
      path: "app/about/page.tsx",
      language: "tsx" as const,
      content: `import { SiteShell } from "@/components/layout/site-shell";
export default function AboutPage() {
  return <SiteShell><h1>About</h1></SiteShell>;
}
`,
    },
    {
      path: "components/layout/site-shell.tsx",
      language: "tsx" as const,
      content: `export function SiteShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return <div><header>{title}</header><main>{children}</main></div>;
}
`,
    },
    {
      path: "lib/utils.ts",
      language: "typescript" as const,
      content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
`,
    },
  ];
}

describe("prepareWebsiteProjectForExport", () => {
  it("prepares minimal generated projects for export", () => {
    const result = prepareWebsiteProjectForExport(minimalGeneratedProject());

    assert.equal(result.ready, true);
    assert.deepEqual(result.blockingIssues, []);

    const paths = new Set(result.files.map((file) => file.path));
    assert.equal(paths.has("tsconfig.json"), true);
    assert.equal(paths.has("next.config.ts"), true);
    assert.equal(paths.has("tailwind.config.ts"), true);
    assert.equal(paths.has("app/not-found.tsx"), true);
    assert.equal(paths.has("components/ui/button.tsx"), true);
    assert.equal(paths.has("components/ui/card.tsx"), true);
    assert.equal(paths.has("lib/seo.ts"), true);

    const pkg = JSON.parse(
      result.files.find((file) => file.path === "package.json")!.content,
    ) as {
      devDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    assert.ok(deps.typescript);
    assert.ok(deps.tailwindcss);
    assert.ok(deps.eslint);
    assert.ok(deps.prettier);

    const page = result.files.find((file) => file.path === "app/page.tsx");
    assert.match(page?.content ?? "", /QA AUTOSAVE TEST 2026 B/);
  });
});
