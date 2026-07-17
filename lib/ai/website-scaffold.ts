import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { PlannedFileLike } from "@/lib/ai/validator";

/** Hard ceiling so Website Builder completes within a real user session. */
export const MAX_WEBSITE_FILES = 18;

const CATEGORY_PRIORITY: Record<string, number> = {
  configs: 0,
  layout: 1,
  lib: 2,
  types: 3,
  pages: 4,
  components: 5,
  hooks: 6,
  api: 7,
};

const MUST_KEEP = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.js",
  "tailwind.config.ts",
  "app/layout.tsx",
  "app/globals.css",
  "app/page.tsx",
  "lib/utils.ts",
  "components/ui/button.tsx",
];

export function capPlannedFiles<T extends PlannedFileLike>(
  files: T[],
  max = MAX_WEBSITE_FILES,
): T[] {
  if (files.length <= max) return files;

  const byPath = new Map(files.map((file) => [file.path, file]));
  const selected: T[] = [];
  const used = new Set<string>();

  for (const path of MUST_KEEP) {
    const file = byPath.get(path);
    if (file && !used.has(path)) {
      selected.push(file);
      used.add(path);
    }
  }

  const remaining = files
    .filter((file) => !used.has(file.path))
    .sort((a, b) => {
      const cat =
        (CATEGORY_PRIORITY[a.category] ?? 50) -
        (CATEGORY_PRIORITY[b.category] ?? 50);
      if (cat !== 0) return cat;
      return a.path.localeCompare(b.path);
    });

  for (const file of remaining) {
    if (selected.length >= max) break;
    selected.push(file);
    used.add(file.path);
  }

  return selected;
}

/** Static scaffold files — skip DeepSeek for these to keep generation fast. */
export function buildWebsiteScaffold(projectName = "generated-website"): GeneratedProjectFile[] {
  const pkg = {
    name: projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "generated-website",
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "^15.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.0",
      "lucide-react": "^0.460.0",
      zod: "^3.23.0",
    },
    devDependencies: {
      typescript: "^5.6.0",
      "@types/node": "^22.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      tailwindcss: "^3.4.0",
      postcss: "^8.4.0",
      autoprefixer: "^10.4.0",
      eslint: "^9.0.0",
      "eslint-config-next": "^15.0.0",
      prettier: "^3.3.0",
    },
  };

  return [
    {
      path: "package.json",
      language: "json",
      content: JSON.stringify(pkg, null, 2),
    },
    {
      path: "tsconfig.json",
      language: "json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2017",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2,
      ),
    },
    {
      path: "next.config.ts",
      language: "typescript",
      content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
    },
    {
      path: "postcss.config.js",
      language: "javascript",
      content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
    },
    {
      path: "tailwind.config.ts",
      language: "typescript",
      content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`,
    },
    {
      path: ".eslintrc.json",
      language: "json",
      content: JSON.stringify({ extends: "next/core-web-vitals" }, null, 2),
    },
    {
      path: ".prettierrc",
      language: "json",
      content: JSON.stringify(
        { semi: true, singleQuote: false, trailingComma: "all" },
        null,
        2,
      ),
    },
    {
      path: "app/globals.css",
      language: "css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  @apply bg-white text-slate-900 antialiased;
}
`,
    },
    {
      path: "lib/utils.ts",
      language: "typescript",
      content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
    },
    {
      path: "README.md",
      language: "markdown",
      content: `# ${projectName}

Generated with Trend Business AI Website Builder.

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    },
  ];
}

export const SCAFFOLD_PATHS = new Set(
  buildWebsiteScaffold().map((file) => file.path),
);
