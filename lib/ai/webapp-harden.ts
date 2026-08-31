import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  hardenAuthOptions,
  hardenCanonicalSessionConsumers,
  hardenCryptoFile,
} from "@/lib/ai/webapp-harden-auth";
import {
  dropConflictingEslintConfigs,
  dropDuplicateNextConfig,
  dropDuplicatePostcss,
  dropHostPlatformFiles,
  ensureEslintFlatConfig,
  ensureForceDynamic,
  ensureIsolatedNextConfig,
  ensureUseClientWhenNeeded,
  hardenBrokenModuleSpecifiers,
  hardenEslintConfig,
  hardenNextLinkImports,
  hardenTailwindConfig,
  hardenTsConfig,
  hardenUseClientDirective,
  hardenUseServerDirective,
  needsForceDynamic,
  stripLeakingImports,
} from "@/lib/ai/webapp-harden-next";
import { hardenPackageJson } from "@/lib/ai/webapp-harden-package";
import {
  dropConflictingApiRoutes,
  dropConflictingAppPages,
  dropConflictingUiModules,
} from "@/lib/ai/webapp-harden-routes";
import {
  ensureRuntimeScaffolds,
  hardenPrismaSchema,
  splitServerClientBarrels,
  upsertEnvFiles,
} from "@/lib/ai/webapp-harden-runtime";
import { normalizePath } from "@/lib/ai/webapp-harden-shared";
import {
  hardenAsyncCookies,
  hardenAsyncFunctionReturnTypes,
  hardenAsyncHeaders,
  hardenNullishCoalescingPrecedenceAst,
} from "@/lib/ai/webapp-harden-typescript";
import {
  ensureUiBarrelCompatibility,
  ensureUsedUiImports,
  flattenCompoundCardUsage,
  hardenBadgeDangerVariants,
  hardenBadgeVariants,
  hardenButtonAsChildSupport,
  hardenUiTyping,
  mergeUiBarrelImports,
  projectUsesButtonAsChild,
  stripMisplacedAsChild,
  stripUnusedCnImport,
} from "@/lib/ai/webapp-harden-ui";

export { findAuthContractIssues } from "@/lib/ai/webapp-harden-auth";
export { findApiRouteConflictIssues } from "@/lib/ai/webapp-harden-routes";
export {
  assertGeneratedTypescriptParses,
  findTypescriptParseIssues,
  findWebAppTypeScriptContractIssues,
} from "@/lib/ai/webapp-harden-typescript";

/**
 * Deterministic compile/runtime fixes applied after LLM file generation.
 * Does not add product features — only makes `npm run build` succeed
 * and keeps the app fully isolated from the host platform.
 */
export function hardenGeneratedWebApp(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const hasPrisma = files.some(
    (file) => normalizePath(file.path) === "prisma/schema.prisma",
  );

  const usesButtonAsChild = projectUsesButtonAsChild(files);

  let next = stripLeakingImports(
    dropHostPlatformFiles(
      dropConflictingApiRoutes(
        dropConflictingAppPages(
          dropConflictingUiModules(
            dropConflictingEslintConfigs(
              dropDuplicateNextConfig(dropDuplicatePostcss(files)),
            ),
          ),
        ),
      ),
    ),
  ).map((file) => {
    const path = normalizePath(file.path);
    let content = file.content;

    if (path === "tsconfig.json") {
      content = hardenTsConfig(content);
    }

    if (path === "tailwind.config.ts" || path === "tailwind.config.js" || path === "tailwind.config.mjs") {
      content = hardenTailwindConfig(content);
    }

    if (path === "eslint.config.mjs" || path === "eslint.config.js" || path === ".eslintrc.json") {
      content = hardenEslintConfig(path, content);
    }

    if (path === "prisma/schema.prisma") {
      content = hardenPrismaSchema(content);
    }

    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      content = hardenBrokenModuleSpecifiers(content);
      content = hardenUseClientDirective(content);
      content = hardenUseServerDirective(content);
      content = hardenNextLinkImports(content);
      content = hardenAsyncCookies(content);
      content = hardenAsyncHeaders(content);
      content = hardenAsyncFunctionReturnTypes(content);
      content = hardenCryptoFile(content);
      content = hardenBadgeDangerVariants(content);
      content = hardenBadgeVariants(content);
      content = hardenCanonicalSessionConsumers(content);
      content = hardenAuthOptions(content);
      content = hardenNullishCoalescingPrecedenceAst(path, content);
    }

    if (path.endsWith(".tsx")) {
      content = ensureUseClientWhenNeeded(content);
    }

    if (path === "components/ui.tsx" || path === "components/ui.ts") {
      content = hardenUiTyping(content);
      content = stripMisplacedAsChild(content);
      if (usesButtonAsChild) {
        content = hardenButtonAsChildSupport(content);
        content = stripMisplacedAsChild(content);
      }
    }

    if (path.endsWith(".tsx")) {
      content = flattenCompoundCardUsage(content);
      content = ensureUsedUiImports(content);
      content = mergeUiBarrelImports(content);
      content = stripUnusedCnImport(content);
    }

    if (
      (/\/page\.(tsx|ts)$/.test(path) || /\/layout\.(tsx|ts)$/.test(path)) &&
      path.startsWith("app/") &&
      needsForceDynamic(content)
    ) {
      content = ensureForceDynamic(content);
    }

    return { ...file, path, content };
  });

  next = ensureIsolatedNextConfig(next);
  next = ensureUiBarrelCompatibility(next);
  next = splitServerClientBarrels(next);
  next = upsertEnvFiles(next);
  next = ensureEslintFlatConfig(next);
  next = ensureRuntimeScaffolds(next);
  next = next.map((file) => {
    const path = normalizePath(file.path);
    let content = file.content;
    if (path === "package.json") {
      content = hardenPackageJson(content, hasPrisma, next);
    } else if (path.endsWith(".tsx")) {
      content = ensureUseClientWhenNeeded(content);
    }
    return { ...file, path, content };
  });
  return next;
}
