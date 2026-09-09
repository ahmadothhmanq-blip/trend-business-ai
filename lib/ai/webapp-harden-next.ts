import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  ISOLATED_NEXT_CONFIG,
  extractImportSpecifiers,
  hasHostOrEscapingImport,
  isEffectivelyEmptyModule,
  isHostPlatformFilePath,
  relativeImportEscapesProject,
  shouldDropHostPlatformFile,
  stripHostPlatformImports,
} from "@/lib/ai/webapp-isolation";
import { insertAfterImports, normalizePath } from "@/lib/ai/webapp-harden-shared";

export function ensureIsolatedNextConfig(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const next = files.filter((file) => {
    const path = normalizePath(file.path);
    return (
      path !== "next.config.ts" &&
      path !== "next.config.js" &&
      path !== "next.config.mjs" &&
      path !== "next.config.cjs"
    );
  });

  next.push({
    path: "next.config.ts",
    language: "typescript",
    content: ISOLATED_NEXT_CONFIG,
  });

  return next;
}

export function dropHostPlatformFiles(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.filter((file) => {
    const path = normalizePath(file.path);
    if (shouldDropHostPlatformFile(path, file.content)) return false;
    if (isHostPlatformFilePath(path)) return false;
    return true;
  });
}

export function stripLeakingImports(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.flatMap((file) => {
    const path = normalizePath(file.path);
    if (
      !path.endsWith(".ts") &&
      !path.endsWith(".tsx") &&
      !path.endsWith(".js") &&
      !path.endsWith(".jsx")
    ) {
      return [file];
    }

    const specifiers = extractImportSpecifiers(file.content);
    if (specifiers.some((specifier) => relativeImportEscapesProject(path, specifier))) {
      return [];
    }

    if (!hasHostOrEscapingImport(path, file.content)) {
      return [file];
    }

    const content = stripHostPlatformImports(path, file.content);
    if (isEffectivelyEmptyModule(content)) {
      return [];
    }

    return [{ ...file, path, content }];
  });
}

export function hardenTsConfig(content: string): string {
  const isolatedPaths = { "@/*": ["./*"] };

  try {
    const parsed = JSON.parse(content) as {
      compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
        rootDir?: string;
      };
      include?: unknown;
      exclude?: string[];
    };
    parsed.compilerOptions = parsed.compilerOptions ?? {};
    parsed.compilerOptions.baseUrl = ".";
    parsed.compilerOptions.paths = isolatedPaths;
    if (
      typeof parsed.compilerOptions.rootDir === "string" &&
      parsed.compilerOptions.rootDir.includes("..")
    ) {
      delete parsed.compilerOptions.rootDir;
    }
    const exclude = new Set(parsed.exclude ?? ["node_modules"]);
    exclude.add("node_modules");
    exclude.add("mobile-store");
    parsed.exclude = [...exclude];
    return `${JSON.stringify(parsed, null, 2)}\n`;
  } catch {
    let next = content.replace(
      /"paths"\s*:\s*\{[\s\S]*?\}/,
      `"paths": ${JSON.stringify(isolatedPaths)}`,
    );
    if (!/"paths"\s*:/.test(next)) {
      next = next.replace(
        /"compilerOptions"\s*:\s*\{/,
        `"compilerOptions": {\n    "baseUrl": ".",\n    "paths": ${JSON.stringify(isolatedPaths)},`,
      );
    }
    next = next.replace(/"baseUrl"\s*:\s*"[^"]*"/, `"baseUrl": "."`);
    return next;
  }
}

export const ESLINT_RELIABILITY_RULES = {
  "react-hooks/set-state-in-effect": "off",
  "react-hooks/exhaustive-deps": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "import/no-anonymous-default-export": "off",
} as const;

export function hardenEslintConfig(path: string, content: string): string {
  const next = content
    .replace(
      /eslint-config-next\/core-web-vitals\.js/g,
      "eslint-config-next/core-web-vitals",
    )
    .replace(
      /eslint-config-next\/typescript\.js/g,
      "eslint-config-next/typescript",
    );

  if (path === "eslint.config.mjs" || path === "eslint.config.js") {
    if (next.includes("react-hooks/set-state-in-effect")) return next;
    return next.replace(
      /\]\s*;?\s*$/,
      `  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
];
`,
    );
  }

  if (path === ".eslintrc.json") {
    try {
      const parsed = JSON.parse(content) as { rules?: Record<string, unknown> };
      parsed.rules = { ...ESLINT_RELIABILITY_RULES, ...parsed.rules };
      return `${JSON.stringify(parsed, null, 2)}\n`;
    } catch {
      return content;
    }
  }

  return content;
}

export function hardenNextLinkImports(content: string): string {
  return content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]next\/navigation['"]/g,
    (full, inner: string) => {
      const parts = inner
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      const kept: string[] = [];
      let hasLink = false;

      for (const part of parts) {
        const ident = part.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
        if (ident === "Link") {
          hasLink = true;
          continue;
        }
        kept.push(part);
      }

      if (!hasLink) return full;

      const navImport = kept.length
        ? `import { ${kept.join(", ")} } from "next/navigation";`
        : "";
      const linkImport = 'import Link from "next/link";';
      return [navImport, linkImport].filter(Boolean).join("\n");
    },
  );
}

/** Tailwind v4 types reject `darkMode: ["class"]` — normalize to string form. */
export function hardenTailwindConfig(content: string): string {
  return content.replace(
    /darkMode\s*:\s*\[\s*["']class["']\s*\]/g,
    'darkMode: "class"',
  );
}

export function needsForceDynamic(content: string): boolean {
  return (
    /from\s+['"]@\/lib\/(prisma|db|auth)['"]/.test(content) ||
    /from\s+['"]@prisma\/client['"]/.test(content) ||
    /\bcookies\s*\(/.test(content) ||
    /\bheaders\s*\(/.test(content)
  );
}

export function ensureEslintFlatConfig(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  if (
    files.some(
      (file) =>
        normalizePath(file.path) === "eslint.config.mjs" ||
        normalizePath(file.path) === "eslint.config.js",
    )
  ) {
    return files;
  }

  files.push({
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
  });
  return files;
}

export function ensureForceDynamic(content: string): string {
  if (/export const dynamic\s*=/.test(content)) return content;
  return insertAfterImports(content, "export const dynamic = 'force-dynamic';\n");
}

export function dropDuplicateNextConfig(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const hasTs = files.some((file) => normalizePath(file.path) === "next.config.ts");
  if (!hasTs) return files;
  return files.filter((file) => {
    const path = normalizePath(file.path);
    return path !== "next.config.js" && path !== "next.config.mjs";
  });
}

export function dropConflictingEslintConfigs(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.filter((file) => {
    const path = normalizePath(file.path);
    return (
      path !== ".eslintrc.json" &&
      path !== ".eslintrc.js" &&
      path !== ".eslintrc.cjs" &&
      path !== ".eslintrc.yml" &&
      path !== ".eslintrc.yaml"
    );
  });
}

export function dropDuplicatePostcss(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  const hasJs = files.some((file) => normalizePath(file.path) === "postcss.config.js");
  const hasMjs = files.some((file) => normalizePath(file.path) === "postcss.config.mjs");
  if (hasJs && hasMjs) {
    return files.filter((file) => normalizePath(file.path) !== "postcss.config.mjs");
  }
  return files;
}

export function isUseClient(content: string): boolean {
  return /^\s*(?:['"]use client['"]|use client["'])\s*;?/m.test(content);
}

export function hardenUseClientDirective(content: string): string {
  return content.replace(
    /^(\s*)(?:['"]\s*)?use\s+client(?:\s*['"])?\s*;?/m,
    '$1"use client";',
  );
}

/** Add "use client" when client hooks are present — never leave login/forms as RSCs. */
export function ensureUseClientWhenNeeded(content: string): string {
  const next = hardenUseClientDirective(content);
  if (isUseClient(next)) return next;

  const needsClient =
    /\b(useState|useEffect|useLayoutEffect|useReducer|useRef|useMemo|useCallback|useContext|useTransition|useOptimistic|useRouter|usePathname|useSearchParams|useParams)\b/.test(
      next,
    );
  if (!needsClient) return next;
  return `"use client";\n\n${next.replace(/^\uFEFF/, "")}`;
}

/** Fix malformed module specifiers like `react\react` that break parse + install checks. */
export function hardenBrokenModuleSpecifiers(content: string): string {
  return content
    .replace(/from\s+(['"])react\\+react\1/g, "from $1react$1")
    .replace(/from\s+(['"])next\\+([^'"]+)\1/g, "from $1next/$2$1")
    .replace(/from\s+(['"])@\\\/([^'"]+)\1/g, "from $1@/$2$1");
}

export function hardenUseServerDirective(content: string): string {
  return content.replace(
    /^(\s*)(?:['"]\s*)?use\s+server(?:\s*['"])?\s*;?/m,
    '$1"use server";',
  );
}


export function findUseClientDirectiveIssues(content: string, path: string): string[] {
  for (const line of content.split(/\r?\n/).slice(0, 8)) {
    const trimmed = line.trim();
    if (!/\buse\s+client\b/.test(trimmed)) continue;
    if (
      trimmed === '"use client";' ||
      trimmed === "'use client';" ||
      trimmed === '"use client"' ||
      trimmed === "'use client'"
    ) {
      continue;
    }
    return [`${path}: invalid "use client" directive; must be exactly "use client";`];
  }
  return [];
}
