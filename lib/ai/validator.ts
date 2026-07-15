import type { GeneratedProjectFile } from "@/lib/ai/types";

export type ProjectCapabilityFlags = {
  requiresAuth: boolean;
  requiresDatabase: boolean;
  requiresDashboard: boolean;
  isEcommerce: boolean;
  isSaas: boolean;
  databaseProvider: "prisma" | "supabase" | "none";
};

export type PlannedFileLike = {
  path: string;
  purpose: string;
  language: string;
  category: string;
};

export type ProjectValidationResult = {
  valid: boolean;
  issues: string[];
  filesToRegenerate: string[];
};

const PLACEHOLDER_CONTENT_PATTERN =
  /\b(TODO|FIXME|lorem ipsum|your (company|brand|name|text) here|coming soon|sample text only|fake data only)\b/i;

const EXTERNAL_PACKAGES = new Set([
  "react",
  "react-dom",
  "next",
  "next/link",
  "next/image",
  "next/navigation",
  "next/headers",
  "next/server",
  "next/font/google",
  "next/font/local",
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "zod",
  "@prisma/client",
  "@supabase/supabase-js",
  "@supabase/ssr",
  "recharts",
  "lucide-react",
  "date-fns",
]);

function dirname(filePath: string) {
  const parts = filePath.split("/");
  parts.pop();
  return parts.join("/");
}

function joinPath(base: string, segment: string) {
  if (!base) return segment;
  if (segment === "..") {
    const parts = base.split("/");
    parts.pop();
    return parts.join("/");
  }
  if (segment === ".") return base;
  return `${base}/${segment}`;
}

function resolveRelativeImport(fromFile: string, importPath: string) {
  const baseDir = dirname(fromFile);
  const segments = importPath.split("/");
  let resolved = baseDir;

  for (const segment of segments) {
    resolved = joinPath(resolved, segment);
  }

  return resolved;
}

function candidatePathsForImport(resolved: string) {
  const extensions = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
  return extensions.map((ext) => `${resolved}${ext}`);
}

function extractImportPaths(content: string) {
  const imports: string[] = [];
  const fromRegex = /from\s+['"]([^'"]+)['"]/g;
  const importRegex = /import\s+['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null = fromRegex.exec(content);
  while (match) {
    imports.push(match[1]);
    match = fromRegex.exec(content);
  }

  match = importRegex.exec(content);
  while (match) {
    imports.push(match[1]);
    match = importRegex.exec(content);
  }

  return imports;
}

export function getProductionRequirements(
  flags: ProjectCapabilityFlags,
): PlannedFileLike[] {
  const requirements: PlannedFileLike[] = [
    {
      path: ".eslintrc.json",
      purpose: "ESLint configuration for Next.js TypeScript project",
      language: "json",
      category: "configs",
    },
    {
      path: ".prettierrc",
      purpose: "Prettier formatting rules",
      language: "json",
      category: "configs",
    },
    {
      path: "tsconfig.json",
      purpose: "TypeScript compiler configuration with Next.js paths",
      language: "json",
      category: "configs",
    },
    {
      path: "next.config.ts",
      purpose: "Next.js configuration",
      language: "typescript",
      category: "configs",
    },
    {
      path: "postcss.config.js",
      purpose: "PostCSS configuration for Tailwind CSS",
      language: "javascript",
      category: "configs",
    },
    {
      path: "tailwind.config.ts",
      purpose: "Tailwind CSS theme and content paths",
      language: "typescript",
      category: "configs",
    },
    {
      path: "package.json",
      purpose: "Dependencies, scripts and project metadata",
      language: "json",
      category: "configs",
    },
    {
      path: "README.md",
      purpose: "Setup and run instructions",
      language: "markdown",
      category: "configs",
    },
    {
      path: "app/layout.tsx",
      purpose: "Root layout with metadata, responsive shell and global styles",
      language: "tsx",
      category: "layout",
    },
    {
      path: "app/globals.css",
      purpose: "Global Tailwind CSS styles and design tokens",
      language: "css",
      category: "configs",
    },
    {
      path: "app/not-found.tsx",
      purpose: "Custom 404 page with navigation back to home",
      language: "tsx",
      category: "pages",
    },
    {
      path: "app/loading.tsx",
      purpose: "Global loading UI for route transitions",
      language: "tsx",
      category: "pages",
    },
    {
      path: "app/error.tsx",
      purpose: "Global error boundary with recovery actions",
      language: "tsx",
      category: "pages",
    },
    {
      path: "lib/utils.ts",
      purpose: "Shared cn() utility for className merging",
      language: "typescript",
      category: "lib",
    },
    {
      path: "lib/seo.ts",
      purpose: "SEO metadata helpers and site defaults",
      language: "typescript",
      category: "lib",
    },
    {
      path: "components/ui/button.tsx",
      purpose: "Reusable accessible button component",
      language: "tsx",
      category: "components",
    },
    {
      path: "components/ui/card.tsx",
      purpose: "Reusable card container component",
      language: "tsx",
      category: "components",
    },
    {
      path: "components/ui/input.tsx",
      purpose: "Reusable form input component",
      language: "tsx",
      category: "components",
    },
  ];

  if (flags.requiresAuth) {
    requirements.push(
      {
        path: "app/login/page.tsx",
        purpose: "Login page with email/password form",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/register/page.tsx",
        purpose: "Registration page with validation",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/forgot-password/page.tsx",
        purpose: "Forgot password request page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "middleware.ts",
        purpose: "Protect dashboard routes and handle session redirects",
        language: "typescript",
        category: "configs",
      },
      {
        path: "lib/auth/session.ts",
        purpose: "Session helpers for reading and validating auth state",
        language: "typescript",
        category: "lib",
      },
      {
        path: "hooks/use-auth.ts",
        purpose: "Client hook for authentication state",
        language: "typescript",
        category: "hooks",
      },
    );
  }

  if (flags.requiresDatabase) {
    if (flags.databaseProvider === "prisma") {
      requirements.push(
        {
          path: "prisma/schema.prisma",
          purpose: "Prisma database schema for project entities",
          language: "prisma",
          category: "configs",
        },
        {
          path: "lib/db.ts",
          purpose: "Prisma client singleton",
          language: "typescript",
          category: "lib",
        },
      );
    } else {
      requirements.push(
        {
          path: "lib/supabase/client.ts",
          purpose: "Browser Supabase client",
          language: "typescript",
          category: "lib",
        },
        {
          path: "lib/supabase/server.ts",
          purpose: "Server Supabase client for RSC and API routes",
          language: "typescript",
          category: "lib",
        },
      );
    }

    requirements.push(
      {
        path: "lib/validations/index.ts",
        purpose: "Zod schemas for API and form validation",
        language: "typescript",
        category: "lib",
      },
      {
        path: "types/database.ts",
        purpose: "Database entity TypeScript types",
        language: "typescript",
        category: "types",
      },
    );
  }

  if (flags.requiresDashboard) {
    requirements.push(
      {
        path: "app/dashboard/layout.tsx",
        purpose: "Protected dashboard shell with sidebar and navbar",
        language: "tsx",
        category: "layout",
      },
      {
        path: "app/dashboard/page.tsx",
        purpose: "Dashboard overview with KPI cards and charts",
        language: "tsx",
        category: "pages",
      },
      {
        path: "components/dashboard/sidebar.tsx",
        purpose: "Responsive dashboard sidebar navigation",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/navbar.tsx",
        purpose: "Dashboard top navbar with search and user menu",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/stat-card.tsx",
        purpose: "Reusable KPI stat card",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/chart-panel.tsx",
        purpose: "Chart panel with sample metrics visualization",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/data-table.tsx",
        purpose: "Reusable data table with sorting",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/pagination.tsx",
        purpose: "Table pagination controls",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/search-bar.tsx",
        purpose: "Search input for dashboard lists",
        language: "tsx",
        category: "components",
      },
      {
        path: "components/dashboard/filter-bar.tsx",
        purpose: "Filter controls for dashboard data views",
        language: "tsx",
        category: "components",
      },
    );
  }

  if (flags.isEcommerce) {
    requirements.push(
      {
        path: "app/products/page.tsx",
        purpose: "Product listing with categories and filters",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/products/[slug]/page.tsx",
        purpose: "Product detail page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/categories/page.tsx",
        purpose: "Category browsing page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/cart/page.tsx",
        purpose: "Shopping cart page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/checkout/page.tsx",
        purpose: "Checkout flow page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/orders/page.tsx",
        purpose: "Order history page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/wishlist/page.tsx",
        purpose: "Saved wishlist page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/profile/page.tsx",
        purpose: "Customer profile and account settings",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/api/products/route.ts",
        purpose: "Products CRUD API",
        language: "typescript",
        category: "api",
      },
      {
        path: "app/api/cart/route.ts",
        purpose: "Cart API",
        language: "typescript",
        category: "api",
      },
      {
        path: "app/api/orders/route.ts",
        purpose: "Orders API",
        language: "typescript",
        category: "api",
      },
      {
        path: "app/api/payments/route.ts",
        purpose: "Payment intent and confirmation API",
        language: "typescript",
        category: "api",
      },
      {
        path: "hooks/use-cart.ts",
        purpose: "Cart state hook",
        language: "typescript",
        category: "hooks",
      },
      {
        path: "types/commerce.ts",
        purpose: "E-commerce domain types",
        language: "typescript",
        category: "types",
      },
    );
  }

  if (flags.isSaas) {
    requirements.push(
      {
        path: "app/page.tsx",
        purpose: "SaaS marketing landing page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/pricing/page.tsx",
        purpose: "Pricing plans page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/dashboard/settings/page.tsx",
        purpose: "Account settings page",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/dashboard/billing/page.tsx",
        purpose: "Billing and subscription management",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/dashboard/team/page.tsx",
        purpose: "Team members and roles management",
        language: "tsx",
        category: "pages",
      },
      {
        path: "app/api/team/route.ts",
        purpose: "Team management API",
        language: "typescript",
        category: "api",
      },
      {
        path: "app/api/billing/route.ts",
        purpose: "Billing and subscription API",
        language: "typescript",
        category: "api",
      },
    );
  }

  return requirements;
}

export function mergeProductionRequirements<T extends PlannedFileLike>(
  plannedFiles: T[],
  flags: ProjectCapabilityFlags,
): T[] {
  const byPath = new Map(plannedFiles.map((file) => [file.path, file]));

  for (const requirement of getProductionRequirements(flags)) {
    if (!byPath.has(requirement.path)) {
      byPath.set(requirement.path, requirement as T);
    }
  }

  return [...byPath.values()];
}

export function validateGeneratedFileContent(
  file: GeneratedProjectFile,
  plannedPath: string,
): { valid: boolean; reason?: string } {
  if (!file.content?.trim()) {
    return { valid: false, reason: "Generated file content is empty." };
  }

  if (file.path !== plannedPath) {
    return {
      valid: false,
      reason: `Generated path "${file.path}" does not match planned path "${plannedPath}".`,
    };
  }

  if (PLACEHOLDER_CONTENT_PATTERN.test(file.content)) {
    return {
      valid: false,
      reason: "Generated file contains placeholder or incomplete content.",
    };
  }

  if (plannedPath.endsWith(".json")) {
    try {
      JSON.parse(file.content);
    } catch {
      return { valid: false, reason: "Generated JSON file is invalid." };
    }
  }

  if (plannedPath === "package.json") {
    try {
      const pkg = JSON.parse(file.content) as {
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      if (!pkg.scripts?.dev || !pkg.scripts?.build || !pkg.scripts?.start) {
        return {
          valid: false,
          reason: "package.json must include dev, build and start scripts.",
        };
      }

      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      if (!deps.next || !deps.react) {
        return {
          valid: false,
          reason: "package.json must include next and react dependencies.",
        };
      }

      if (!deps.typescript || !deps.tailwindcss) {
        return {
          valid: false,
          reason:
            "package.json must include typescript and tailwindcss dependencies.",
        };
      }

      if (!deps.eslint && !deps["eslint-config-next"]) {
        return {
          valid: false,
          reason: "package.json must include ESLint dependencies.",
        };
      }

      if (!deps.prettier) {
        return {
          valid: false,
          reason: "package.json must include prettier dependency.",
        };
      }
    } catch {
      return { valid: false, reason: "package.json is not valid JSON." };
    }
  }

  if (plannedPath === "app/layout.tsx") {
    if (!/metadata|generateMetadata/.test(file.content)) {
      return {
        valid: false,
        reason: "Root layout must export metadata or generateMetadata for SEO.",
      };
    }
  }

  if (plannedPath.endsWith(".tsx") || plannedPath.endsWith(".ts")) {
    if (!/(export|import)\s/.test(file.content)) {
      return {
        valid: false,
        reason: "TypeScript file must include valid imports or exports.",
      };
    }
  }

  if (plannedPath.endsWith(".svg") && !file.content.includes("<svg")) {
    return { valid: false, reason: "SVG file must contain valid SVG markup." };
  }

  return { valid: true };
}

function validateImportsForFile(
  file: GeneratedProjectFile,
  projectPaths: Set<string>,
) {
  const issues: string[] = [];

  if (!file.path.endsWith(".ts") && !file.path.endsWith(".tsx")) {
    return issues;
  }

  for (const importPath of extractImportPaths(file.content)) {
    if (importPath.startsWith("@/")) {
      const resolved = importPath.slice(2);
      const candidates = candidatePathsForImport(resolved);
      const exists = candidates.some((candidate) => projectPaths.has(candidate));
      if (!exists && !projectPaths.has(resolved)) {
        issues.push(
          `${file.path}: missing project import "${importPath}" (resolved candidates not in tree).`,
        );
      }
      continue;
    }

    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const resolved = resolveRelativeImport(file.path, importPath);
      const candidates = candidatePathsForImport(resolved);
      const exists =
        candidates.some((candidate) => projectPaths.has(candidate)) ||
        projectPaths.has(resolved);
      if (!exists) {
        issues.push(
          `${file.path}: missing relative import "${importPath}" (resolved to ${resolved}).`,
        );
      }
      continue;
    }

    const packageRoot = importPath.startsWith("@")
      ? importPath.split("/").slice(0, 2).join("/")
      : importPath.split("/")[0];

    if (!EXTERNAL_PACKAGES.has(importPath) && !EXTERNAL_PACKAGES.has(packageRoot)) {
      continue;
    }
  }

  return issues;
}

function findDuplicateBasenames(files: GeneratedProjectFile[]) {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const file of files) {
    if (
      !file.path.startsWith("components/") &&
      !file.path.startsWith("lib/") &&
      !file.path.startsWith("hooks/") &&
      !file.path.startsWith("types/")
    ) {
      continue;
    }

    const basename = file.path.split("/").pop();
    if (!basename) continue;

    const prior = seen.get(basename);
    if (prior && prior !== file.path) {
      duplicates.push(`Duplicate basename "${basename}" in ${prior} and ${file.path}.`);
      continue;
    }

    seen.set(basename, file.path);
  }

  return duplicates;
}

function getPackageJsonDeps(files: GeneratedProjectFile[]) {
  const pkgFile = files.find((file) => file.path === "package.json");
  if (!pkgFile) return new Set<string>();

  try {
    const pkg = JSON.parse(pkgFile.content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ]);
  } catch {
    return new Set<string>();
  }
}

function validatePackageImports(files: GeneratedProjectFile[]) {
  const deps = getPackageJsonDeps(files);
  const issues: string[] = [];
  const importPattern = /from\s+['"]([^'"]+)['"]/g;

  for (const file of files) {
    if (!file.path.endsWith(".ts") && !file.path.endsWith(".tsx")) continue;

    let match = importPattern.exec(file.content);
    while (match) {
      const importPath = match[1];
      if (
        !importPath.startsWith(".") &&
        !importPath.startsWith("@/") &&
        !importPath.startsWith("next/") &&
        importPath !== "next"
      ) {
        const root = importPath.startsWith("@")
          ? importPath.split("/").slice(0, 2).join("/")
          : importPath.split("/")[0];

        if (!deps.has(root)) {
          issues.push(
            `${file.path}: imports "${importPath}" but package.json is missing "${root}".`,
          );
        }
      }

      match = importPattern.exec(file.content);
    }
  }

  return issues;
}

export function validateGeneratedProject(
  files: GeneratedProjectFile[],
  flags: ProjectCapabilityFlags,
): ProjectValidationResult {
  const issues: string[] = [];
  const filesToRegenerate = new Set<string>();
  const projectPaths = new Set(files.map((file) => file.path));

  for (const requirement of getProductionRequirements(flags)) {
    if (!projectPaths.has(requirement.path)) {
      issues.push(`Missing required production file: ${requirement.path}`);
      filesToRegenerate.add(requirement.path);
    }
  }

  for (const file of files) {
    const fileValidation = validateGeneratedFileContent(file, file.path);
    if (!fileValidation.valid) {
      issues.push(`${file.path}: ${fileValidation.reason}`);
      filesToRegenerate.add(file.path);
    }

    const importIssues = validateImportsForFile(file, projectPaths);
    for (const importIssue of importIssues) {
      issues.push(importIssue);
      filesToRegenerate.add(file.path);
    }
  }

  issues.push(...findDuplicateBasenames(files));
  issues.push(...validatePackageImports(files));

  for (const issue of issues) {
    const match = issue.match(/^([^:]+):/);
    if (match?.[1] && projectPaths.has(match[1])) {
      filesToRegenerate.add(match[1]);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    filesToRegenerate: [...filesToRegenerate],
  };
}
