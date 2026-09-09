import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  PlannedFileLike,
  ProjectCapabilityFlags,
  ProjectValidationResult,
} from "@/lib/ai/validator";
import { validateGeneratedProject } from "@/lib/ai/validator";

export type RequirementGroup = {
  preferred: string;
  anyOf: string[];
  purpose: string;
  language: string;
  category: string;
};

function firstBusinessTable(tables: string[]): string | undefined {
  return businessTables(tables)[0];
}

function businessTables(tables: string[]): string[] {
  return tables.filter((name) => {
    const normalized = name.trim().toLowerCase();
    return (
      normalized.length > 0 &&
      !["user", "users", "account", "session", "verificationtoken"].includes(
        normalized,
      )
    );
  });
}

function group(
  preferred: string,
  purpose: string,
  language: string,
  category: string,
  anyOf: string[] = [preferred],
): RequirementGroup {
  return { preferred, purpose, language, category, anyOf };
}

export function getWebAppRequirementGroups(
  flags: ProjectCapabilityFlags,
  tables: string[] = [],
): RequirementGroup[] {
  const groups: RequirementGroup[] = [
    group("package.json", "Dependencies, scripts and project metadata", "json", "configs"),
    group("tsconfig.json", "TypeScript compiler configuration with Next.js paths", "json", "configs"),
    group("next.config.ts", "Isolated Next.js configuration", "typescript", "configs"),
    group(
      "postcss.config.js",
      "PostCSS configuration for Tailwind CSS",
      "javascript",
      "configs",
      ["postcss.config.js", "postcss.config.mjs"],
    ),
    group(
      "tailwind.config.ts",
      "Tailwind CSS configuration with class darkMode",
      "typescript",
      "configs",
      ["tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs"],
    ),
    group(
      "eslint.config.mjs",
      "ESLint 9 flat config for Next.js TypeScript",
      "javascript",
      "configs",
      ["eslint.config.mjs", "eslint.config.js", ".eslintrc.json"],
    ),
    group(".gitignore", "Ignore node_modules, .next, and local databases", "plaintext", "configs"),
    group("README.md", "Setup, build, and deploy instructions", "markdown", "configs"),
    group("app/layout.tsx", "Root layout with metadata and global styles", "tsx", "layout"),
    group("app/providers.tsx", "Client providers shell for the App Router tree", "tsx", "layout"),
    group("app/globals.css", "Global Tailwind CSS styles", "css", "configs"),
    group("app/page.tsx", "Primary landing / home page", "tsx", "pages"),
    group("lib/utils.ts", "Shared cn() utility for className merging", "typescript", "lib"),
    group(
      "components/ui.tsx",
      "Reusable UI primitives (button, card, input)",
      "tsx",
      "components",
      ["components/ui.tsx", "components/ui/button.tsx"],
    ),
  ];

  if (flags.requiresAuth) {
    groups.push(
      group("app/login/page.tsx", "Login page with email/password form", "tsx", "pages"),
      group("app/signup/page.tsx", "Signup page with email/password form", "tsx", "pages"),
      group(
        "lib/auth.ts",
        "Session helpers for reading and validating auth state",
        "typescript",
        "lib",
        ["lib/auth.ts", "lib/auth/session.ts"],
      ),
      group(
        "lib/password.ts",
        "Password hashing helpers (scrypt)",
        "typescript",
        "lib",
      ),
      group(
        "hooks/use-auth.ts",
        "Client hook for login, signup, and logout flows",
        "typescript",
        "hooks",
      ),
      group(
        "app/api/auth/login/route.ts",
        "Verified password login API",
        "typescript",
        "api",
      ),
      group(
        "app/api/auth/signup/route.ts",
        "Account signup API with password hashing",
        "typescript",
        "api",
      ),
      group(
        "app/api/auth/logout/route.ts",
        "Session logout API",
        "typescript",
        "api",
      ),
      group(
        "middleware.ts",
        "Protect dashboard routes and handle session redirects",
        "typescript",
        "configs",
        ["middleware.ts", "proxy.ts"],
      ),
    );
  }

  if (flags.requiresDatabase || flags.requiresAuth) {
    groups.push(
      group("prisma/schema.prisma", "Prisma SQLite schema for project entities", "prisma", "configs"),
      group(
        "lib/db.ts",
        "Prisma client singleton",
        "typescript",
        "lib",
        ["lib/db.ts", "lib/prisma.ts"],
      ),
    );

    const table = firstBusinessTable(tables);
    if (table && flags.requiresDatabase) {
      const slug = entitySlug(table);
      groups.push(
        group(
          `app/api/${slug}/route.ts`,
          `Authenticated CRUD API for ${table}`,
          "typescript",
          "api",
        ),
        group(
          `app/dashboard/${slug}/page.tsx`,
          `${table} list and management page`,
          "tsx",
          "pages",
        ),
      );
    }

    // Additional business entities (cap to keep generation bounded).
    for (const extra of businessTables(tables).slice(1, 4)) {
      const slug = entitySlug(extra);
      groups.push(
        group(
          `app/api/${slug}/route.ts`,
          `Authenticated CRUD API for ${extra}`,
          "typescript",
          "api",
        ),
        group(
          `app/dashboard/${slug}/page.tsx`,
          `${extra} list and management page`,
          "tsx",
          "pages",
        ),
      );
    }
  }

  if (flags.requiresDashboard) {
    groups.push(
      group(
        "app/dashboard/layout.tsx",
        "Dashboard shell with navigation",
        "tsx",
        "layout",
      ),
      group(
        "app/dashboard/page.tsx",
        "Dashboard overview",
        "tsx",
        "pages",
        ["app/dashboard/page.tsx", "app/(dashboard)/page.tsx"],
      ),
    );
  }

  return groups;
}

const IRREGULAR_PLURALS: Record<string, string> = {
  company: "companies",
  activity: "activities",
  category: "categories",
  property: "properties",
  inquiry: "inquiries",
  staff: "staff",
  person: "people",
  child: "children",
  leaf: "leaves",
  quiz: "quizzes",
};

function pluralizeToken(token: string): string {
  if (!token) return token;
  const irregular = IRREGULAR_PLURALS[token];
  if (irregular) return irregular;
  if (/(?:s|x|z|ch|sh)$/.test(token)) return `${token}es`;
  if (/[^aeiou]y$/.test(token)) return `${token.slice(0, -1)}ies`;
  if (token.endsWith("s")) return token;
  return `${token}s`;
}

export function entitySlug(name: string): string {
  const base = name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (!base) return "records";
  const parts = base.split("-").filter(Boolean);
  if (parts.length === 0) return "records";
  parts[parts.length - 1] = pluralizeToken(parts[parts.length - 1]!);
  return parts.join("-");
}

export function mergeWebAppProductionRequirements<T extends PlannedFileLike>(
  plannedFiles: T[],
  flags: ProjectCapabilityFlags,
  tables: string[] = [],
): T[] {
  const byPath = new Map(plannedFiles.map((file) => [file.path, file]));

  for (const requirement of getWebAppRequirementGroups(flags, tables)) {
    const exists = requirement.anyOf.some((path) => byPath.has(path));
    if (exists) continue;
    byPath.set(requirement.preferred, {
      path: requirement.preferred,
      purpose: requirement.purpose,
      language: requirement.language,
      category: requirement.category,
    } as T);
  }

  return [...byPath.values()];
}

export function missingWebAppRequirementPaths(
  files: Array<{ path: string }>,
  flags: ProjectCapabilityFlags,
  tables: string[] = [],
): string[] {
  const paths = new Set(files.map((file) => file.path.replaceAll("\\", "/")));
  const missing: string[] = [];

  for (const requirement of getWebAppRequirementGroups(flags, tables)) {
    if (!requirement.anyOf.some((path) => paths.has(path))) {
      missing.push(requirement.preferred);
    }
  }

  return missing;
}

const REQUIRED_ROOT_FILES = ["app/page.tsx", "app/layout.tsx"] as const;

export function findRequiredRootFileIssues(
  files: Array<{ path: string }>,
): string[] {
  const paths = new Set(files.map((file) => file.path.replaceAll("\\", "/")));
  return REQUIRED_ROOT_FILES.filter((path) => !paths.has(path)).map(
    (path) => `Missing required root file: ${path}`,
  );
}

export function hasAuthenticatedApiRoute(files: Array<{ path: string; content?: string }>): boolean {
  return files.some((file) => {
    const path = file.path.replaceAll("\\", "/");
    return (
      /^app\/api\/.+\/route\.(ts|js)$/.test(path) ||
      /prisma\.\w+\.(create|update|delete|upsert|findMany)/.test(file.content ?? "")
    );
  });
}

export function validateWebAppProject(
  files: GeneratedProjectFile[],
  flags: ProjectCapabilityFlags,
  tables: string[] = [],
): ProjectValidationResult {
  const base = validateGeneratedProject(files, flags, { requiredPaths: [] });
  const missing = missingWebAppRequirementPaths(files, flags, tables);
  const issues = [...base.issues];
  const filesToRegenerate = new Set(base.filesToRegenerate);

  for (const path of missing) {
    issues.push(`Missing required production file: ${path}`);
    filesToRegenerate.add(path);
  }

  if (flags.requiresDatabase && !hasAuthenticatedApiRoute(files)) {
    issues.push("Database apps must include at least one Prisma-backed API route or mutation.");
    const table = firstBusinessTable(tables);
    if (table) filesToRegenerate.add(`app/api/${entitySlug(table)}/route.ts`);
  }

  return {
    valid: issues.length === 0,
    issues,
    filesToRegenerate: [...filesToRegenerate],
  };
}
