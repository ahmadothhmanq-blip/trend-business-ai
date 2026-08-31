import type { GeneratedProjectFile } from "@/lib/ai/types";

export function hardenPackageJson(
  content: string,
  hasPrisma: boolean,
  allFiles: GeneratedProjectFile[] = [],
): string {
  let pkg: {
    type?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    eslintConfig?: unknown;
  };
  try {
    pkg = JSON.parse(content);
  } catch {
    return content;
  }

  pkg.scripts = pkg.scripts ?? {};
  pkg.devDependencies = pkg.devDependencies ?? {};
  pkg.dependencies = pkg.dependencies ?? {};
  if (!pkg.scripts.lint || pkg.scripts.lint === "next lint") {
    pkg.scripts.lint = "eslint .";
  }
  if (!pkg.scripts.typecheck) {
    pkg.scripts.typecheck = "tsc --noEmit";
  }
  if (pkg.type === "module") {
    delete pkg.type;
  }
  delete pkg.eslintConfig;
  pkg.devDependencies.eslint = "^9.0.0";
  pkg.devDependencies.typescript = pkg.devDependencies.typescript ?? "^5.7.0";
  pkg.devDependencies.prettier =
    pkg.devDependencies.prettier ??
    pkg.dependencies.prettier ??
    "^3.3.0";
  if (pkg.dependencies.prettier) {
    // Prefer prettier as a toolchain/devDependency.
    delete pkg.dependencies.prettier;
  }
  pkg.devDependencies["@tailwindcss/postcss"] =
    pkg.devDependencies["@tailwindcss/postcss"] ?? "^4.0.0";
  // Auth scaffolding uses Zod for input validation.
  pkg.dependencies.zod = pkg.dependencies.zod ?? "^4.4.3";
  if (pkg.dependencies?.next) {
    pkg.devDependencies["eslint-config-next"] = pkg.dependencies.next;
  }
  if (hasPrisma) {
    if (!pkg.scripts.postinstall?.includes("prisma generate")) {
      pkg.scripts.postinstall = "prisma generate";
    }
    if (!pkg.scripts["db:push"]?.includes("prisma db push")) {
      pkg.scripts["db:push"] = "prisma db push --accept-data-loss";
    }
    if (!pkg.scripts["db:migrate"]?.includes("prisma")) {
      pkg.scripts["db:migrate"] = "prisma db push --accept-data-loss";
    }
    const build = pkg.scripts.build || "next build";
    if (!build.includes("prisma generate")) {
      pkg.scripts.build = /\bnext build\b/.test(build)
        ? build.replace(/\bnext build\b/, "prisma generate && next build")
        : `prisma generate && ${build}`;
    }
    pkg.dependencies = pkg.dependencies ?? {};
    pkg.devDependencies = pkg.devDependencies ?? {};
    if (!pkg.dependencies["@prisma/client"] && !pkg.devDependencies["@prisma/client"]) {
      pkg.dependencies["@prisma/client"] = "^6.2.1";
    }
    if (!pkg.devDependencies.prisma && !pkg.dependencies.prisma) {
      pkg.devDependencies.prisma = "^6.2.1";
    }
  }

  const usesBcrypt = allFiles.some(
    (file) =>
      /from\s+['"]bcryptjs['"]/.test(file.content) ||
      /require\s*\(\s*['"]bcryptjs['"]/.test(file.content),
  );
  if (usesBcrypt) {
    pkg.dependencies.bcryptjs = pkg.dependencies.bcryptjs ?? "^2.4.3";
    pkg.devDependencies["@types/bcryptjs"] =
      pkg.devDependencies["@types/bcryptjs"] ?? "^2.4.6";
  }

  const usesJose = allFiles.some(
    (file) =>
      /from\s+['"]jose['"]/.test(file.content) ||
      /require\s*\(\s*['"]jose['"]/.test(file.content),
  );
  if (usesJose) {
    pkg.dependencies.jose = pkg.dependencies.jose ?? "^5.9.6";
  }

  return `${JSON.stringify(pkg, null, 2)}\n`;
}
