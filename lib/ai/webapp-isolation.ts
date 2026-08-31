/**
 * Isolation rules for generated App Builder projects.
 * Generated apps must never import the host platform or escape their own tree.
 */

/**
 * Default turbopack.root / outputFileTracingRoot are this app directory so
 * nested builds never compile the host.
 *
 * When verify tooling links a shared Base Workspace node_modules (junction/
 * symlink outside the app), it writes `.webapp-turbopack-root` (or sets
 * WEBAPP_TURBOPACK_ROOT) to a common ancestor so Turbopack can resolve the
 * cache without copying modules or switching to Webpack.
 */
export const ISOLATED_NEXT_CONFIG = `import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.join(__dirname);

function resolveTurbopackRoot(): string {
  const fromEnv = process.env.WEBAPP_TURBOPACK_ROOT?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  const marker = path.join(projectRoot, ".webapp-turbopack-root");
  try {
    if (fs.existsSync(marker)) {
      const value = fs.readFileSync(marker, "utf8").trim();
      if (value) return path.resolve(value);
    }
  } catch {
    // fall through to project root
  }
  return projectRoot;
}

const turbopackRoot = resolveTurbopackRoot();

const nextConfig: NextConfig = {
  typedRoutes: false,
  reactStrictMode: true,
  poweredByHeader: false,
  // Next.js requires turbopack.root === outputFileTracingRoot when both are set.
  turbopack: { root: turbopackRoot },
  outputFileTracingRoot: turbopackRoot,
};

export default nextConfig;
`;

/** Import specifiers that exist only on the host Trend Business AI platform. */
const HOST_PLATFORM_IMPORT_PREFIXES = [
  "@/lib/supabase/proxy",
  "@/lib/ai-core",
  "@/lib/tbge",
  "@/lib/webapp-generator",
  "@/lib/language-platform",
  "@/lib/design-platform",
  "@/lib/billing",
  "@/lib/i18n/paths",
  "@/lib/i18n/middleware",
  "@/plugins/",
  "@/app/api/website-builder",
  "@/app/api/webapp-builder",
  "@/app/api/ai-core",
] as const;

const HOST_PLATFORM_PATH_PREFIXES = [
  "lib/ai-core/",
  "lib/tbge/",
  "lib/language-platform/",
  "lib/design-platform/",
  "lib/billing/",
  "plugins/",
] as const;

const HOST_PLATFORM_EXACT_PATHS = new Set([
  "lib/supabase/proxy.ts",
  "lib/supabase/proxy.js",
  "lib/i18n/paths.ts",
  "lib/i18n/paths.js",
  "lib/i18n/middleware.ts",
  "lib/ai-core.ts",
]);

const HOST_CONTENT_FINGERPRINTS = [
  "@/lib/supabase/proxy",
  "resolveHostToSlug",
  "@/lib/i18n/paths",
  "@/lib/ai-core",
];

function normalizeSpecifier(specifier: string): string {
  return specifier.replaceAll("\\", "/").trim();
}

export function isHostPlatformImport(specifier: string): boolean {
  const normalized = normalizeSpecifier(specifier);
  if (!normalized) return false;
  if (normalized.includes("trend-business-ai")) return true;

  for (const prefix of HOST_PLATFORM_IMPORT_PREFIXES) {
    if (normalized === prefix.replace(/\/$/, "")) return true;
    if (normalized.startsWith(prefix)) return true;
  }

  return false;
}

export function isHostPlatformFilePath(filePath: string): boolean {
  const path = normalizeSpecifier(filePath).replace(/^\.\//, "");
  if (HOST_PLATFORM_EXACT_PATHS.has(path)) return true;
  return HOST_PLATFORM_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function relativeImportEscapesProject(
  filePath: string,
  specifier: string,
): boolean {
  const importPath = normalizeSpecifier(specifier);
  if (!importPath.startsWith("./") && !importPath.startsWith("../")) {
    return false;
  }

  const fromDir = normalizeSpecifier(filePath).split("/").slice(0, -1);
  const stack = fromDir.filter(Boolean);

  for (const segment of importPath.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (stack.length === 0) return true;
      stack.pop();
      continue;
    }
    stack.push(segment);
  }

  return false;
}

export function fileContentLeaksHostPlatform(content: string): boolean {
  return HOST_CONTENT_FINGERPRINTS.some((marker) => content.includes(marker));
}

export function shouldDropHostPlatformFile(
  filePath: string,
  content: string,
): boolean {
  const path = normalizeSpecifier(filePath).replace(/^\.\//, "");
  if (isHostPlatformFilePath(path)) return true;

  if (
    (path === "proxy.ts" || path === "src/proxy.ts") &&
    (fileContentLeaksHostPlatform(content) ||
      hasHostOrEscapingImport(path, content))
  ) {
    return true;
  }

  return false;
}

export function hasHostOrEscapingImport(
  filePath: string,
  content: string,
): boolean {
  for (const specifier of extractImportSpecifiers(content)) {
    if (isHostPlatformImport(specifier)) return true;
    if (relativeImportEscapesProject(filePath, specifier)) return true;
  }
  return false;
}

export function extractImportSpecifiers(content: string): string[] {
  const specifiers: string[] = [];
  const fromRegex = /(?:from|import)\s+['"]([^'"]+)['"]/g;
  let match = fromRegex.exec(content);
  while (match) {
    specifiers.push(match[1]);
    match = fromRegex.exec(content);
  }
  return specifiers;
}

export function stripHostPlatformImports(
  filePath: string,
  content: string,
): string {
  const remove = (full: string, specifier: string) =>
    isHostPlatformImport(specifier) ||
    relativeImportEscapesProject(filePath, specifier)
      ? ""
      : full;

  return content
    .replace(
      /^[ \t]*export\s+(?:type\s+)?(?:\{[\s\S]*?\}|\*(?:\s+as\s+\w+)?)\s+from\s+['"]([^'"]+)['"];?[ \t]*\n?/gm,
      remove,
    )
    .replace(
      /^[ \t]*import(?:\s+type)?\s+[\s\S]*?from\s+['"]([^'"]+)['"];?[ \t]*\n?/gm,
      remove,
    )
    .replace(
      /^[ \t]*import\s+['"]([^'"]+)['"];?[ \t]*\n?/gm,
      remove,
    );
}

export function isEffectivelyEmptyModule(content: string): boolean {
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*['"]use (?:client|server)['"];?\s*/m, "")
    .trim();
  return stripped.length === 0;
}
