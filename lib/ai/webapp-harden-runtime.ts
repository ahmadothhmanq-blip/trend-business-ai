import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  buildCanonicalAuthLoginRoute,
  buildCanonicalAuthLogoutRoute,
  buildCanonicalAuthSignupRoute,
  buildCanonicalLoginPage,
  buildCanonicalPasswordCryptoModule,
  buildCanonicalSignupPage,
} from "@/lib/ai/webapp-auth-scaffold";
import { buildCanonicalProviders } from "@/lib/ai/webapp-domain-scaffold";
import {
  canonicalAuthModuleContent,
  ensureCanonicalAuthModule,
} from "@/lib/ai/webapp-harden-auth";
import { isUseClient } from "@/lib/ai/webapp-harden-next";
import {
  PRISMA_DEFAULT_URL,
  escapeRegExp,
  extractStatement,
  normalizePath,
} from "@/lib/ai/webapp-harden-shared";
import { buildCanonicalMiddleware } from "@/lib/ai/webapp-runtime-scaffold";

export function isLikelyRelationFk(fieldName: string): boolean {
  if (fieldName === "id") return true;
  if (fieldName === "referenceId") return false;
  return /Id$/.test(fieldName);
}

export function convertPrismaEnumsToStrings(content: string): string {
  const enumNames: string[] = [];
  let next = content.replace(/enum\s+(\w+)\s*\{[^}]*\}/g, (_full, name: string) => {
    enumNames.push(name);
    return "";
  });

  for (const name of enumNames) {
    next = next.replace(
      new RegExp(`(\\s)(${name})(\\??)([\\s@])`, "g"),
      `$1String$3$4`,
    );
  }

  next = next.replace(/@default\(([A-Z][A-Z0-9_]*)\)/g, '@default("$1")');
  return next;
}

export function hardenPrismaSchema(content: string): string {
  let next = content
    .replace(/provider\s*=\s*"(postgresql|mysql|sqlserver|cockroachdb)"/g, 'provider = "sqlite"')
    .replace(/@db\.\w+(?:\([^)]*\))?/g, "")
    .replace(/\s+Decimal\b/g, " Float");

  next = convertPrismaEnumsToStrings(next);

  return next.replace(
    /^([ \t]+)([A-Za-z_][A-Za-z0-9_]*)[ \t]+(String|Int|Float|Boolean|DateTime)(?!\?)([ \t]+.*)?$/gm,
    (full, indent: string, name: string, type: string, rest = "") => {
      if (isLikelyRelationFk(name)) return full;
      if (/\?/.test(full)) return full;
      if (/@(id|default|updatedAt|unique|relation)\b/.test(full)) return full;

      const defaults: Record<string, string> = {
        String: '@default("")',
        Int: "@default(0)",
        Float: "@default(0)",
        Boolean: "@default(false)",
        DateTime: "@default(now())",
      };
      const suffix = rest.trim().length ? rest : "";
      return `${indent}${name} ${type} ${defaults[type]}${suffix}`;
    },
  );
}

export function isServerOnlyModule(content: string): boolean {
  return (
    /from\s+['"]next\/headers['"]/.test(content) ||
    /['"]use server['"]/.test(content)
  );
}

export function extractZodShared(content: string): { code: string; names: string[] } | null {
  if (!/\bfrom\s+['"]zod['"]/.test(content)) return null;

  const names: string[] = [];
  const statements: string[] = [];
  const constRe = /export const (\w+) = z\./g;
  let match: RegExpExecArray | null = constRe.exec(content);
  while (match) {
    const statement = extractStatement(content, match.index);
    if (statement) {
      names.push(match[1]);
      statements.push(statement);
    }
    match = constRe.exec(content);
  }

  const typeRe = /export type (\w+) = z\.infer<typeof \w+>;/g;
  match = typeRe.exec(content);
  while (match) {
    names.push(match[1]);
    statements.push(match[0]);
    match = typeRe.exec(content);
  }

  if (!statements.length) return null;
  return {
    names,
    code: `import { z } from "zod";\n\n${statements.join("\n\n")}\n`,
  };
}

export function aliasForPath(filePath: string): string {
  return `@/${filePath.replace(/\.tsx?$/, "")}`;
}

export function rewriteNamedImport(
  content: string,
  fromPath: string,
  moveNames: Set<string>,
  newFrom: string,
): string {
  const importRe = new RegExp(
    `import\\s+(type\\s+)?\\{([^}]+)\\}\\s+from\\s+['"]${escapeRegExp(fromPath)}['"];?`,
    "g",
  );

  return content.replace(importRe, (full, typePrefix: string | undefined, inner: string) => {
    const parts = inner
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const moved: string[] = [];
    const kept: string[] = [];

    for (const part of parts) {
      const ident = part.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (moveNames.has(ident)) moved.push(part);
      else kept.push(part);
    }

    if (moved.length === 0) return full;

    const lines: string[] = [];
    if (moved.length) {
      lines.push(
        `import ${typePrefix ?? ""}{ ${moved.join(", ")} } from '${newFrom}';`,
      );
    }
    if (kept.length) {
      lines.push(
        `import ${typePrefix ?? ""}{ ${kept.join(", ")} } from '${fromPath}';`,
      );
    }
    return lines.join("\n");
  });
}

export function splitServerClientBarrels(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  let next = [...files];
  const existing = new Set(next.map((file) => normalizePath(file.path)));

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!isServerOnlyModule(file.content)) continue;
    const extracted = extractZodShared(file.content);
    if (!extracted) continue;

    const sharedPath =
      path.endsWith("/index.ts") || path.endsWith("/index.tsx")
        ? path.replace(/\/index\.tsx?$/, "/shared-schema.ts")
        : path.replace(/\.tsx?$/, "-schema.ts");

    if (!existing.has(sharedPath)) {
      next.push({
        path: sharedPath,
        language: "typescript",
        content: extracted.code,
      });
      existing.add(sharedPath);
    }

    const fromAliases = [aliasForPath(path)];
    if (path === "lib/index.ts") {
      fromAliases.push("@/lib", "@/lib/index");
    }

    const sharedAlias = aliasForPath(sharedPath);
    const nameSet = new Set(extracted.names);

    next = next.map((entry) => {
      if (!isUseClient(entry.content)) return entry;
      let content = entry.content;
      for (const alias of fromAliases) {
        content = rewriteNamedImport(content, alias, nameSet, sharedAlias);
      }
      return { ...entry, content };
    });
  }

  return next;
}

export function upsertEnvFiles(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const hasPrisma = files.some((file) => normalizePath(file.path) === "prisma/schema.prisma");
  if (!hasPrisma) return files;

  const byPath = new Map(files.map((file) => [normalizePath(file.path), file]));
  const example = byPath.get(".env.example");
  const envBody = [
    `DATABASE_URL="${PRISMA_DEFAULT_URL}"`,
    'SESSION_SECRET="dev-session-secret-change-me"',
    'NEXTAUTH_SECRET="dev-session-secret-change-me"',
    'NEXTAUTH_URL="http://localhost:3000"',
    "",
  ].join("\n");

  function mergeEnv(existing: string): string {
    let nextEnv = existing.trim();
    if (!nextEnv.includes("DATABASE_URL=")) {
      nextEnv += `\nDATABASE_URL="${PRISMA_DEFAULT_URL}"`;
    } else {
      nextEnv = nextEnv.replace(
        /DATABASE_URL=.*/,
        `DATABASE_URL="${PRISMA_DEFAULT_URL}"`,
      );
    }
    if (!nextEnv.includes("SESSION_SECRET=")) {
      nextEnv += `\nSESSION_SECRET="dev-session-secret-change-me"`;
    }
    if (!nextEnv.includes("NEXTAUTH_SECRET=")) {
      nextEnv += `\nNEXTAUTH_SECRET="dev-session-secret-change-me"`;
    }
    if (!nextEnv.includes("NEXTAUTH_URL=")) {
      nextEnv += `\nNEXTAUTH_URL="http://localhost:3000"`;
    }
    return `${nextEnv}\n`;
  }

  if (!example) {
    files.push({
      path: ".env.example",
      language: "dotenv",
      content: envBody,
    });
  } else {
    example.content = mergeEnv(example.content);
  }

  if (!byPath.has(".env")) {
    files.push({
      path: ".env",
      language: "dotenv",
      content: envBody,
    });
  } else {
    byPath.get(".env")!.content = mergeEnv(byPath.get(".env")!.content);
  }

  return files;
}

export function upsertMissing(
  files: GeneratedProjectFile[],
  path: string,
  language: string,
  content: string,
): GeneratedProjectFile[] {
  if (files.some((file) => normalizePath(file.path) === path)) return files;
  files.push({ path, language, content });
  return files;
}

export function firstPrismaModel(schema: string): string | null {
  const names = [...schema.matchAll(/model\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g)].map(
    (match) => match[1],
  );
  const skip = new Set(["User", "Account", "Session", "VerificationToken"]);
  return names.find((name) => !skip.has(name)) ?? names[0] ?? null;
}

export function prismaClientDelegate(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

export function resourceSlug(model: string): string {
  const base = model
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
  return base.endsWith("s") ? base : `${base}s`;
}

export function hasApiRoute(files: GeneratedProjectFile[]): boolean {
  return files.some((file) =>
    /^app\/api\/(?!auth\/).+\/route\.(ts|js)$/.test(normalizePath(file.path)),
  );
}

export function importsPrismaAlias(files: GeneratedProjectFile[]): boolean {
  return files.some((file) => /from\s+['"]@\/lib\/prisma['"]/.test(file.content));
}

export function ensureRuntimeScaffolds(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  let next = [...files];
  const paths = new Set(next.map((file) => normalizePath(file.path)));
  const hasPrisma = paths.has("prisma/schema.prisma");
  const hasLogin = paths.has("app/login/page.tsx");
  const middlewareContent =
    next.find((file) => normalizePath(file.path) === "middleware.ts")?.content ?? "";
  const hasDashboardRoutes = [...paths].some(
    (path) => path.startsWith("app/dashboard/") || /\/\(dashboard\)\//.test(path),
  );
  const hasDashboardOverview =
    paths.has("app/dashboard/page.tsx") || paths.has("app/(dashboard)/page.tsx");
  const hasDashboardIntent =
    hasDashboardRoutes ||
    hasDashboardOverview ||
    /['"`]\/dashboard/.test(middlewareContent);
  const hasDashboard = hasDashboardIntent;

  next = upsertMissing(
    next,
    ".gitignore",
    "plaintext",
    `node_modules
.next
out
dev.db
dev.db-journal
.env
.env*.local
*.log
.DS_Store
`,
  );

  next = upsertMissing(
    next,
    "next-env.d.ts",
    "typescript",
    `/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`,
  );

  next = upsertMissing(
    next,
    "tsconfig.json",
    "json",
    `${JSON.stringify(
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
  );

  next = upsertMissing(
    next,
    "postcss.config.js",
    "javascript",
    `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`,
  );

  next = upsertMissing(
    next,
    "README.md",
    "markdown",
    `# Generated Web Application

This project is a standalone Next.js App Router application. It does not depend on the host platform.

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

## Deploy

Host on Node.js (\`npm run build && npm start\`) or Vercel. For Vercel, switch \`DATABASE_URL\` from SQLite to a hosted Postgres database before going live. Change \`SESSION_SECRET\` in production.
`,
  );

  // Deterministic DB-backed authentication for generated apps.
  const LOGIN_PAGE_PATH = "app/login/page.tsx";
  const loginEntry = next.find((f) => normalizePath(f.path) === LOGIN_PAGE_PATH);
  if (
    loginEntry &&
    !loginEntry.content.includes("/api/auth/login") &&
    /\breturn\s+null\s*;?/.test(loginEntry.content)
  ) {
    next = next.map((f) => {
      if (normalizePath(f.path) !== LOGIN_PAGE_PATH) return f;
      return {
        ...f,
        content: buildCanonicalLoginPage(),
      };
    });
  }

  next = upsertMissing(
    next,
    "app/providers.tsx",
    "tsx",
    buildCanonicalProviders(),
  );

  if (hasLogin) {
    next = upsertMissing(
      next,
      "lib/password.ts",
      "typescript",
      buildCanonicalPasswordCryptoModule(),
    );
    next = upsertMissing(
      next,
      "lib/auth.ts",
      "typescript",
      canonicalAuthModuleContent(),
    );
    next = upsertMissing(
      next,
      "lib/db.ts",
      "typescript",
      `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
`,
    );
    next = upsertMissing(
      next,
      "app/api/auth/login/route.ts",
      "typescript",
      buildCanonicalAuthLoginRoute(),
    );
    next = upsertMissing(
      next,
      "app/api/auth/signup/route.ts",
      "typescript",
      buildCanonicalAuthSignupRoute(),
    );
    next = upsertMissing(
      next,
      "app/api/auth/logout/route.ts",
      "typescript",
      buildCanonicalAuthLogoutRoute(),
    );
    next = upsertMissing(
      next,
      "app/signup/page.tsx",
      "tsx",
      buildCanonicalSignupPage(),
    );

    // Replace legacy any-password login routes if still present.
    next = next.map((file) => {
      if (normalizePath(file.path) !== "app/api/auth/login/route.ts") return file;
      if (/verifyPassword/.test(file.content) && /db\.user/.test(file.content)) {
        return file;
      }
      return { ...file, content: buildCanonicalAuthLoginRoute() };
    });
  } else if (hasPrisma) {
    next = upsertMissing(
      next,
      "lib/auth.ts",
      "typescript",
      canonicalAuthModuleContent(),
    );
  }

  if (hasPrisma) {
    next = upsertMissing(
      next,
      "lib/db.ts",
      "typescript",
      `import { PrismaClient } from "@prisma/client";

export const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
`,
    );

    if (importsPrismaAlias(next)) {
      next = upsertMissing(
        next,
        "lib/prisma.ts",
        "typescript",
        `export { db as prisma, db } from "@/lib/db";
`,
      );
    }

    if (!hasApiRoute(next)) {
      const schema = next.find(
        (file) => normalizePath(file.path) === "prisma/schema.prisma",
      )?.content;
      const model = schema ? firstPrismaModel(schema) : null;
      if (model) {
        const delegate = prismaClientDelegate(model);
        const slug = resourceSlug(model);
        next = upsertMissing(
          next,
          `app/api/${slug}/route.ts`,
          "typescript",
          `import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireSession() {
  const jar = await cookies();
  return jar.get("session")?.value ?? jar.get("app_session")?.value ?? null;
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await db.${delegate}.findMany({ take: 100 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const data = await db.${delegate}.create({ data: body as never });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { id?: string } & Record<string, unknown>;
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updated = await db.${delegate}.update({
    where: { id } as never,
    data: data as never,
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await db.${delegate}.delete({ where: { id } as never });
  return NextResponse.json({ ok: true });
}
`,
        );
      }
    }
  }

  if (!paths.has("middleware.ts") && !paths.has("proxy.ts")) {
    next = upsertMissing(
      next,
      "middleware.ts",
      "typescript",
      buildCanonicalMiddleware(),
    );
  }

  next = next.map((file) => {
    if (normalizePath(file.path) !== "app/globals.css") return file;
    if (/@import\s+["']tailwindcss["']/.test(file.content) || /@tailwind\s+base/.test(file.content)) {
      return file;
    }
    return {
      ...file,
      content: `@import "tailwindcss";\n\n${file.content}`,
    };
  });

  const homeRedirect = hasDashboard ? "/dashboard" : hasLogin ? "/login" : null;
  if (hasDashboardIntent && !hasDashboardOverview) {
    next = upsertMissing(
      next,
      "app/dashboard/page.tsx",
      "typescript",
      `export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Overview of your workspace.</p>
    </main>
  );
}
`,
    );
  }
  next = upsertMissing(
    next,
    "app/page.tsx",
    "typescript",
    homeRedirect
      ? `import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("${homeRedirect}");
}
`
      : `export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
      <p className="mt-2 text-muted-foreground">Your application is ready.</p>
    </main>
  );
}
`,
  );

  next = ensureCanonicalAuthModule(next);

  return next;
}
