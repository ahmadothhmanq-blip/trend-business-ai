import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { PlannedFileLike } from "@/lib/ai/validator";

/** Hard ceiling so Website Builder completes within a real user session. */
export const MAX_WEBSITE_FILES = 48;

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

export type ScaffoldDesignTokens = {
  cssVariables: string;
  primary?: string;
  background?: string;
  foreground?: string;
};

/** Static scaffold files — skip DeepSeek for these to keep generation fast. */
export function buildWebsiteScaffold(
  projectName = "generated-website",
  design?: ScaffoldDesignTokens,
): GeneratedProjectFile[] {
  const rootCss = design?.cssVariables?.trim()
    ? design.cssVariables.trim()
    : `:root {
  color-scheme: light;
}`;
  const bodyBg = design?.background ?? "#ffffff";
  const bodyFg = design?.foreground ?? "#0f172a";
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

${rootCss}

body {
  background: ${bodyBg};
  color: ${bodyFg};
  font-family: var(--font-body, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading, Georgia, serif);
}

.bg-brand-primary { background-color: var(--color-primary); }
.text-brand-primary { color: var(--color-primary); }
.bg-brand-accent { background-color: var(--color-accent); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slowReveal {
  from { opacity: 0; transform: translateY(28px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@media (prefers-reduced-motion: reduce) {
  .motion-safe {
    animation: none !important;
  }
}

.bg-gradient-hero {
  background: var(--gradient-hero, linear-gradient(135deg, var(--color-primary), var(--color-secondary, #333)));
}
.bg-gradient-cta {
  background: var(--gradient-cta, linear-gradient(135deg, var(--color-primary), var(--color-accent, var(--color-secondary, #333))));
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

/** Conservative versions for packages commonly imported by generated Next apps. */
const KNOWN_PACKAGE_VERSIONS: Record<string, { version: string; dev?: boolean }> = {
  next: { version: "^15.0.0" },
  react: { version: "^19.0.0" },
  "react-dom": { version: "^19.0.0" },
  clsx: { version: "^2.1.1" },
  "tailwind-merge": { version: "^2.5.0" },
  "lucide-react": { version: "^0.460.0" },
  zod: { version: "^3.23.0" },
  "framer-motion": { version: "^11.0.0" },
  "class-variance-authority": { version: "^0.7.0" },
  "date-fns": { version: "^3.6.0" },
  recharts: { version: "^2.12.0" },
  sonner: { version: "^1.5.0" },
  "@radix-ui/react-slot": { version: "^1.1.0" },
  "@radix-ui/react-dialog": { version: "^1.1.0" },
  "@radix-ui/react-dropdown-menu": { version: "^2.1.0" },
  "@supabase/supabase-js": { version: "^2.45.0" },
  "@supabase/ssr": { version: "^0.5.0" },
  typescript: { version: "^5.6.0", dev: true },
  "@types/node": { version: "^22.0.0", dev: true },
  "@types/react": { version: "^19.0.0", dev: true },
  "@types/react-dom": { version: "^19.0.0", dev: true },
  tailwindcss: { version: "^3.4.0", dev: true },
  postcss: { version: "^8.4.0", dev: true },
  autoprefixer: { version: "^10.4.0", dev: true },
  eslint: { version: "^9.0.0", dev: true },
  "eslint-config-next": { version: "^15.0.0", dev: true },
  prettier: { version: "^3.3.0", dev: true },
};

/**
 * Merge missing npm imports from generated source into package.json.
 * Only known packages are added (no arbitrary registry names).
 */
export function syncPackageJsonDependencies(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const pkgIndex = files.findIndex((file) => file.path === "package.json");
  if (pkgIndex < 0) return files;

  let pkg: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
  };
  try {
    pkg = JSON.parse(files[pkgIndex]!.content) as typeof pkg;
  } catch {
    return files;
  }

  const dependencies = { ...(pkg.dependencies ?? {}) };
  const devDependencies = { ...(pkg.devDependencies ?? {}) };
  const declared = new Set([
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
  ]);

  const importPattern = /from\s+['"]([^'"]+)['"]/g;
  const needed = new Set<string>();

  for (const file of files) {
    if (!file.path.endsWith(".ts") && !file.path.endsWith(".tsx")) continue;
    let match = importPattern.exec(file.content);
    while (match) {
      const importPath = match[1] ?? "";
      if (
        importPath.startsWith(".") ||
        importPath.startsWith("@/") ||
        importPath.startsWith("next/") ||
        importPath === "next" ||
        importPath === "react" ||
        importPath === "react-dom" ||
        importPath.startsWith("react/") ||
        importPath.startsWith("react-dom/")
      ) {
        match = importPattern.exec(file.content);
        continue;
      }
      const root = importPath.startsWith("@")
        ? importPath.split("/").slice(0, 2).join("/")
        : importPath.split("/")[0]!;
      needed.add(root);
      match = importPattern.exec(file.content);
    }
  }

  let changed = false;
  for (const name of needed) {
    if (declared.has(name)) continue;
    const known = KNOWN_PACKAGE_VERSIONS[name];
    if (!known) continue;
    if (known.dev) {
      devDependencies[name] = known.version;
    } else {
      dependencies[name] = known.version;
    }
    declared.add(name);
    changed = true;
  }

  // Ensure next/react always present
  for (const [name, meta] of Object.entries(KNOWN_PACKAGE_VERSIONS)) {
    if (!["next", "react", "react-dom"].includes(name)) continue;
    if (declared.has(name)) continue;
    dependencies[name] = meta.version;
    changed = true;
  }

  if (!changed) return files;

  const nextFiles = [...files];
  nextFiles[pkgIndex] = {
    ...files[pkgIndex]!,
    content: JSON.stringify(
      { ...pkg, dependencies, devDependencies },
      null,
      2,
    ),
  };
  return nextFiles;
}
