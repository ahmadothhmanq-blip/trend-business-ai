import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  buildCanonicalAuthModule,
  buildCanonicalAuthLoginRoute,
  buildCanonicalAuthLogoutRoute,
  buildCanonicalAuthSignupRoute,
  buildCanonicalLoginPage,
  buildCanonicalPasswordCryptoModule,
  buildCanonicalSignupPage,
  buildCanonicalUseAuthHook,
} from "@/lib/ai/webapp-auth-scaffold";
import {
  buildCanonicalCrudApiRoute,
  buildCanonicalDashboardLayout,
  buildCanonicalEntityDashboardPage,
  buildCanonicalPrismaSchema,
  buildCanonicalProviders,
  buildCanonicalTailwindConfig,
  businessEntityTables,
} from "@/lib/ai/webapp-domain-scaffold";
import { ISOLATED_NEXT_CONFIG } from "@/lib/ai/webapp-isolation";
import { entitySlug } from "@/lib/ai/webapp-requirements";
import {
  buildCanonicalDashboardPage,
  buildCanonicalDbModule,
  buildCanonicalHomePage,
  buildCanonicalMiddleware,
  buildCanonicalRootLayout,
} from "@/lib/ai/webapp-runtime-scaffold";
import { buildFullCanonicalUiBarrel } from "@/lib/ai/webapp-ui-primitives";

export type WebAppScaffoldOptions = {
  projectName?: string;
  /** When true, include password-hash + DB session auth. Implies database. */
  requiresAuth?: boolean;
  /** When true, include Prisma client singleton. */
  requiresDatabase?: boolean;
  /** When true, include dashboard overview page. */
  requiresDashboard?: boolean;
  /** Business entity table names for dashboard links / planning. */
  tables?: string[];
  /** Rich App Design Platform models — drive Prisma field fidelity. */
  dataModels?: AppDataModel[];
};

export { buildCanonicalAuthModule };

function packageNameFromTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "generated-webapp"
  );
}

/** Production UI barrel — full canonical set so AI pages never need UI LLM repair. */
export function buildWebAppUiBarrel(): string {
  return buildFullCanonicalUiBarrel();
}

/**
 * Static scaffold files — skip DeepSeek for these to keep App Builder fast
 * without weakening TypeScript / production validation.
 */
export function buildWebAppScaffold(
  options: WebAppScaffoldOptions = {},
): GeneratedProjectFile[] {
  const title = options.projectName?.trim() || "Generated Web Application";
  const pkgName = packageNameFromTitle(title);

  // Auth requires User/Session persistence — always pair with Prisma.
  const needsAuth = Boolean(options.requiresAuth);
  const needsDatabase = Boolean(options.requiresDatabase) || needsAuth;
  const pkg = {
    name: pkgName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: needsDatabase
        ? "prisma generate && next build"
        : "next build",
      start: "next start",
      lint: "eslint .",
      typecheck: "tsc --noEmit",
      ...(needsDatabase
        ? {
            postinstall: "prisma generate",
            "db:push": "prisma db push --accept-data-loss",
            "db:migrate": "prisma db push --accept-data-loss",
          }
        : {}),
    },
    dependencies: {
      next: "^16.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.0",
      "lucide-react": "^0.460.0",
      zod: "^3.23.0",
      "class-variance-authority": "^0.7.0",
      ...(needsDatabase ? { "@prisma/client": "^6.2.1" } : {}),
    },
    devDependencies: {
      typescript: "^5.7.0",
      "@types/node": "^22.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      tailwindcss: "^4.0.0",
      "@tailwindcss/postcss": "^4.0.0",
      postcss: "^8.4.0",
      eslint: "^9.0.0",
      "eslint-config-next": "^16.0.0",
      prettier: "^3.3.0",
      ...(needsDatabase ? { prisma: "^6.2.1" } : {}),
    },
  };

  const files: GeneratedProjectFile[] = [
    {
      path: "package.json",
      language: "json",
      content: `${JSON.stringify(pkg, null, 2)}\n`,
    },
    {
      path: "tsconfig.json",
      language: "json",
      content: `${JSON.stringify(
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
            jsx: "react-jsx",
            incremental: true,
            plugins: [{ name: "next" }],
            baseUrl: ".",
            paths: { "@/*": ["./*"] },
          },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
          exclude: ["node_modules"],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "next.config.ts",
      language: "typescript",
      content: ISOLATED_NEXT_CONFIG,
    },
    {
      path: "postcss.config.js",
      language: "javascript",
      content: `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`,
    },
    {
      path: "tailwind.config.ts",
      language: "typescript",
      content: buildCanonicalTailwindConfig(),
    },
    {
      path: "eslint.config.mjs",
      language: "javascript",
      content: `import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];
`,
    },
    {
      path: ".gitignore",
      language: "plaintext",
      content: `node_modules
.next
out
dev.db
dev.db-journal
.env
.env*.local
*.log
.DS_Store
`,
    },
    {
      path: "next-env.d.ts",
      language: "typescript",
      content: `/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`,
    },
    {
      path: "README.md",
      language: "markdown",
      content: `# ${title}

Standalone Next.js App Router application generated by Trend Business AI App Builder.

## Local setup

\`\`\`bash
npm install
npx prisma db push
npm run dev
\`\`\`

## Production checks

\`\`\`bash
npm run typecheck
npm run lint
npm run build
npm start
\`\`\`
`,
    },
    {
      path: "app/globals.css",
      language: "css",
      content: `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --primary: #0f172a;
  --primary-foreground: #f8fafc;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --destructive: #dc2626;
  --destructive-foreground: #fef2f2;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #0f172a;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
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
      path: "components/ui.tsx",
      language: "tsx",
      content: buildWebAppUiBarrel(),
    },
    {
      path: "app/providers.tsx",
      language: "tsx",
      content: buildCanonicalProviders(),
    },
  ];

  if (needsAuth) {
    files.push(
      {
        path: "lib/password.ts",
        language: "typescript",
        content: buildCanonicalPasswordCryptoModule(),
      },
      {
        path: "lib/auth.ts",
        language: "typescript",
        content: buildCanonicalAuthModule(),
      },
      {
        path: "hooks/use-auth.ts",
        language: "typescript",
        content: buildCanonicalUseAuthHook(),
      },
      {
        path: "middleware.ts",
        language: "typescript",
        content: buildCanonicalMiddleware(),
      },
      {
        path: "app/api/auth/login/route.ts",
        language: "typescript",
        content: buildCanonicalAuthLoginRoute(),
      },
      {
        path: "app/api/auth/signup/route.ts",
        language: "typescript",
        content: buildCanonicalAuthSignupRoute(),
      },
      {
        path: "app/api/auth/logout/route.ts",
        language: "typescript",
        content: buildCanonicalAuthLogoutRoute(),
      },
      {
        path: "app/login/page.tsx",
        language: "tsx",
        content: buildCanonicalLoginPage(),
      },
      {
        path: "app/signup/page.tsx",
        language: "tsx",
        content: buildCanonicalSignupPage(),
      },
    );
  }

  const entityTables = businessEntityTables(options.tables ?? []);

  if (needsDatabase) {
    files.push(
      {
        path: "lib/db.ts",
        language: "typescript",
        content: buildCanonicalDbModule(),
      },
      {
        path: "prisma/schema.prisma",
        language: "prisma",
        content: buildCanonicalPrismaSchema(
          options.tables ?? [],
          options.dataModels ?? [],
        ),
      },
    );

    for (const table of entityTables) {
      const slug = entitySlug(table);
      files.push(
        {
          path: `app/api/${slug}/route.ts`,
          language: "typescript",
          content: buildCanonicalCrudApiRoute(table),
        },
        {
          path: `app/dashboard/${slug}/page.tsx`,
          language: "tsx",
          content: buildCanonicalEntityDashboardPage(table),
        },
      );
    }
  }

  files.push({
    path: "app/layout.tsx",
    language: "tsx",
    content: buildCanonicalRootLayout(title),
  });

  files.push({
    path: "app/page.tsx",
    language: "tsx",
    content: buildCanonicalHomePage({
      requiresAuth: needsAuth,
      requiresDashboard: Boolean(options.requiresDashboard ?? true),
    }),
  });

  if (options.requiresDashboard !== false) {
    const entityLinks = entityTables.map((table) => ({
      label: table,
      href: `/dashboard/${entitySlug(table)}`,
    }));

    files.push({
      path: "app/dashboard/layout.tsx",
      language: "tsx",
      content: buildCanonicalDashboardLayout({
        title,
        entityLinks,
      }),
    });

    files.push({
      path: "app/dashboard/page.tsx",
      language: "tsx",
      content: buildCanonicalDashboardPage({
        title,
        entityLinks,
      }),
    });
  }

  return files;
}

/**
 * Paths covered by the full deterministic scaffold (auth + db + dashboard + sample entity).
 * generateWebApp skips DeepSeek for any planned file that matches a live scaffold path.
 */
export const WEBAPP_SCAFFOLD_PATHS = new Set(
  buildWebAppScaffold({
    requiresAuth: true,
    requiresDatabase: true,
    requiresDashboard: true,
    tables: ["Item"],
  }).map((file) => file.path),
);

/**
 * Planned files that still need AI when they are not present in the live scaffold.
 * With the expanded scaffold, the default deterministic plan yields zero AI files.
 */
export function listWebAppAiFilePlans(
  plannedPaths: string[],
  scaffoldPaths: Iterable<string>,
): string[] {
  const covered = new Set(
    [...scaffoldPaths].map((path) => path.replaceAll("\\", "/")),
  );
  return plannedPaths
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => !covered.has(path));
}

/**
 * Group planned AI files into dependency-friendly waves for parallel generation.
 * Files inside a wave share the same prior-wave snapshot as prompt context.
 *
 * Implementation: dependency-graph scheduler (see webapp-wave-scheduler.ts).
 * Independent categories at the same tier (components / hooks / api) run together.
 */
export {
  analyzeWebAppWaveSchedule,
  buildWebAppDependencyGraph,
  buildWebAppScaffoldAssemblyEdges,
  estimateWaveScheduleSpeedup,
  groupWebAppFilesIntoWaves,
  groupWebAppFilesIntoWavesLegacy,
} from "@/lib/ai/webapp-wave-scheduler";
