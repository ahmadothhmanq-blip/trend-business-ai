import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  CANONICAL_UI_PRIMITIVES,
  correctCanonicalButtonContracts,
  injectMissingCanonicalUiExports,
} from "@/lib/ai/webapp-ui-primitives";
import { recordUiHardenerFix } from "@/lib/webapp/ui-repair-metrics";
import { normalizePath } from "@/lib/ai/webapp-harden-shared";

export function hardenUiTyping(content: string): string {
  let next = content;
  next = next.replace(/\bHMLAttributes\b/g, "HTMLAttributes");
  next = next.replace(/\bHMLElement\b/g, "HTMLElement");
  next = correctCanonicalButtonContracts(next);

  if (
    /interface\s+SearchInputProps/.test(next) &&
    /\bonSubmit\s*\?\s*:\s*\(value:\s*string\)\s*=>\s*void/.test(next)
  ) {
    next = next.replace(
      /\bonSubmit\s*\?\s*:\s*\(value:\s*string\)\s*=>\s*void/g,
      "onSearchSubmit?: (value: string) => void",
    );
    next = next.replace(/\bonSubmit=\{/g, "onSearchSubmit={");
    next = next.replace(/\bprops\.onSubmit\b/g, "props.onSearchSubmit");
  }

  return next;
}

export function projectUsesButtonAsChild(files: GeneratedProjectFile[]): boolean {
  return files.some((file) => /<Button\b[^>]*\basChild\b/.test(file.content));
}

export function extractQuotedUnionMembers(union: string): string[] {
  const members = [
    ...union.matchAll(/"([^"]+)"/g),
    ...union.matchAll(/'([^']+)'/g),
  ].map((match) => match[1]);
  return [...new Set(members)];
}

export function extractBadgeVariantBlockBody(content: string): string {
  const cvaMatch = content.match(
    /const\s+badgeVariants[\s\S]*?variants:\s*\{\s*variant:\s*\{([\s\S]*?)\n\s*\}/,
  );
  if (cvaMatch) return cvaMatch[1];

  return (
    content.match(/const\s+badgeVariants[\s\S]*?=\s*\{([\s\S]*?)\n\};/)?.[1] ?? ""
  );
}

export function badgeVariantFallbackStyle(variant: string): string {
  const styles: Record<string, string> = {
    default: '"bg-primary text-primary-foreground border-transparent"',
    secondary: '"bg-secondary text-secondary-foreground border-transparent"',
    destructive: '"bg-red-100 text-red-800 border-transparent"',
    outline: '"border border-input bg-background"',
    danger: '"bg-red-100 text-red-800 border-transparent"',
  };
  return styles[variant] ?? styles.default;
}

export function injectMissingBadgeVariantEntries(
  block: string,
  variantMembers: string[],
  indent = "  ",
): string {
  let next = block;
  for (const variant of variantMembers) {
    if (new RegExp(`\\b${variant}\\s*:`).test(next)) continue;
    next = `${next.trimEnd()}${next.trim().endsWith(",") ? "" : ","}\n${indent}${variant}: ${badgeVariantFallbackStyle(variant)}`;
  }
  if (!variantMembers.includes("destructive") && !/\bdestructive\s*:/.test(next)) {
    next = `${next.trimEnd()}${next.trim().endsWith(",") ? "" : ","}\n${indent}destructive: ${badgeVariantFallbackStyle("destructive")}`;
  }
  return next;
}

export function hardenButtonAsChildSupport(content: string): string {
  if (!/\b(ButtonProps|export\s+const\s+Button|const\s+Button)\b/.test(content)) {
    return content;
  }

  let next = content;
  if (/interface\s+ButtonProps/.test(next) && !/\basChild\s*\??\s*:/.test(next.match(/interface\s+ButtonProps[^{]*\{[^}]*\}/)?.[0] ?? "")) {
    next = next.replace(/(interface\s+ButtonProps[^{]*\{)/, "$1\n  asChild?: boolean;");
  }

  next = next.replace(
    /((?:export\s+)?const\s+Button\s*=\s*React\.forwardRef[^(]*\(\s*\(\s*\{)([^}]*)(\}\s*,\s*ref\s*\))/g,
    (full, open: string, props: string, close: string) => {
      let trimmed = props.trim();
      trimmed = trimmed.replace(/\.\.\.(\w+)\s*,\s*asChild\b/g, "asChild, ...$1");
      trimmed = trimmed.replace(/\.\.\.(\w+)\s*,(?=\s*\}|\s*$)/g, "...$1");
      if (/\basChild\b/.test(trimmed)) {
        return trimmed === props.trim() ? full : `${open}${trimmed}${close}`;
      }
      const restMatch = trimmed.match(/\.\.\.(\w+)/);
      if (restMatch) {
        const rest = restMatch[0];
        const beforeRest = trimmed.replace(/\s*,?\s*\.\.\.\w+\s*/, "").replace(/,\s*$/, "").trim();
        const prefix = beforeRest.length ? `${beforeRest}, ` : "";
        return `${open}${prefix}asChild, ${rest}${close}`;
      }
      const prefix = trimmed.length ? (trimmed.endsWith(",") ? trimmed : `${trimmed}, `) : "";
      return `${open}${prefix}asChild${close}`;
    },
  );

  const buttonBlock = next.match(
    /(?:export\s+)?const\s+Button\s*=\s*React\.forwardRef[\s\S]*?Button\.displayName\s*=\s*["']Button["'];?/,
  )?.[0];
  if (buttonBlock && /\basChild\b/.test(buttonBlock) && /React\.cloneElement/.test(buttonBlock)) {
    if (!/\bReact\.ReactElement<\{\s*className\?\s*:\s*string\s*\}>/.test(buttonBlock)) {
      let patched = buttonBlock;
      patched = patched.replace(
        /React\.cloneElement\(\s*children\b/g,
        "React.cloneElement(children as React.ReactElement<{ className?: string }>",
      );
      patched = patched.replace(
        /React\.cloneElement\(\s*React\.Children\.only\(children\)\b/g,
        "React.cloneElement(React.Children.only(children) as React.ReactElement<{ className?: string }>",
      );
      patched = patched.replace(
        /\bchildren\.props\.className\b/g,
        "(children as React.ReactElement<{ className?: string }>).props.className",
      );
      patched = patched.replace(
        /\bchild\.props\.className\b/g,
        "(child as React.ReactElement<{ className?: string }>).props.className",
      );
      next = next.replace(buttonBlock, patched);
    }
  }

  return correctCanonicalButtonContracts(next);
}

export function stripMisplacedAsChild(content: string): string {
  let next = content;

  next = next.replace(
    /(const\s+(?!Button\b)\w+\s*=\s*React\.forwardRef[^(]*\(\s*\(\s*\{)([^}]*)(\}\s*,\s*ref\s*\))/g,
    (full, open: string, props: string, close: string) => {
      if (!/\basChild\b/.test(props)) return full;
      const trimmed = props
        .replace(/\basChild\s*,?\s*/g, "")
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, "")
        .trim();
      return `${open}${trimmed}${close}`;
    },
  );

  next = next.replace(
    /((?:export\s+)?function\s+(?!Button\b)\w+[^{]*\(\s*\{)([^}]*)(\})/g,
    (full, open: string, props: string, close: string) => {
      if (!/\basChild\b/.test(props)) return full;
      const trimmed = props
        .replace(/\basChild\s*,?\s*/g, "")
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, "")
        .trim();
      return `${open}${trimmed}${close}`;
    },
  );

  next = next.replace(
    /interface\s+(?!ButtonProps\b)(\w+)[^{]*\{([^}]*)\}/g,
    (full, _name: string, body: string) => {
      if (!/\basChild\b/.test(body)) return full;
      const cleaned = body.replace(/\n?\s*asChild\s*\??\s*:\s*boolean\s*;?/g, "");
      return full.replace(body, cleaned);
    },
  );

  return next;
}

export function findMisplacedAsChildIssues(content: string, path: string): string[] {
  const issues: string[] = [];

  const forwardRefRe =
    /const\s+(\w+)\s*=\s*React\.forwardRef[^(]*\(\s*\(\s*\{([^}]*)\}/g;
  for (const match of content.matchAll(forwardRefRe)) {
    const name = match[1];
    if (name !== "Button" && /\basChild\b/.test(match[2])) {
      issues.push(
        `${path}: ${name} must not destructure asChild — Button-only pattern.`,
      );
    }
  }

  const fnRe = /(?:export\s+)?function\s+(\w+)\s*\(\s*\{([^}]*)\}/g;
  for (const match of content.matchAll(fnRe)) {
    const name = match[1];
    if (name !== "Button" && /\basChild\b/.test(match[2])) {
      issues.push(
        `${path}: ${name} must not destructure asChild — Button-only pattern.`,
      );
    }
  }

  if (/const\s+Slot\b/.test(content) && /\bSlot[\s\S]{0,400}\basChild\b/.test(content)) {
    issues.push(`${path}: Slot must not use asChild.`);
  }

  return issues;
}

export function hardenBadgeDangerVariants(content: string): string {
  let next = content;
  next = next.replace(/\bvariant\s*=\s*(['"])danger\1/g, "variant=$1destructive$1");
  next = next.replace(/\bvariant\s*:\s*(['"])danger\1/g, "variant: $1destructive$1");
  next = next.replace(
    /((?:export )?type\s+BadgeVariant\s*=\s*)([^;]+);/,
    (full, prefix: string, union: string) => {
      if (!/['"]danger['"]/.test(union)) return full;
      let cleaned = union
        .replace(/\s*\|\s*['"]danger['"]/g, "")
        .replace(/['"]danger['"]\s*\|\s*/g, "")
        .replace(/['"]danger['"]/g, "")
        .trim();
      if (!/['"]destructive['"]/.test(cleaned)) {
        cleaned = cleaned ? `${cleaned} | "destructive"` : `"destructive"`;
      }
      return `${prefix}${cleaned};`;
    },
  );
  next = next.replace(
    /(const\s+badgeVariants[\s\S]*?(?:variant:\s*\{|=)\s*\{)([\s\S]*?)(\n\};|\n\s*\})/,
    (full, open: string, body: string, close: string) => {
      if (!/\bdanger\s*:/.test(body)) return full;
      const patched = body.replace(/\bdanger\s*:/g, "destructive:");
      return `${open}${patched}${close}`;
    },
  );
  return next;
}

export function findBadgeDangerVariantIssues(content: string, path: string): string[] {
  if (
    /\bvariant\s*=\s*['"]danger['"]/.test(content) ||
    /\bvariant\s*:\s*['"]danger['"]/.test(content)
  ) {
    return [`${path}: Badge variant "danger" is unsupported; use "destructive".`];
  }
  return [];
}

export function hardenBadgeVariants(content: string): string {
  if (!/\bBadgeVariant\b/.test(content) || !/\bbadgeVariants\b/.test(content)) {
    return content;
  }

  let next = content.replace(
    /((?:export )?type BadgeVariant\s*=\s*)([^;]+);/,
    (full, prefix: string, union: string) => {
      if (/['"]destructive['"]/.test(union)) return full;
      return `${prefix}${union} | "destructive";`;
    },
  );

  const variantUnion = next.match(/(?:export )?type\s+BadgeVariant\s*=\s*([^;]+);/)?.[1];
  const variantMembers = variantUnion ? extractQuotedUnionMembers(variantUnion) : [];

  if (/const\s+badgeVariants\s*=\s*cva\s*\(/.test(next)) {
    next = next.replace(
      /(const\s+badgeVariants\s*=\s*cva\s*\([\s\S]*?variants:\s*\{\s*variant:\s*\{)([\s\S]*?)(\n\s*\}[\s\S]*?\)\s*;)/,
      (full, open: string, variantBlock: string, close: string) => {
        const block = injectMissingBadgeVariantEntries(variantBlock, variantMembers, "        ");
        return `${open}${block}${close}`;
      },
    );
    return next;
  }

  next = next.replace(
    /const\s+badgeVariants(?:\s*:\s*Record<BadgeVariant,\s*string>)?\s*=\s*\{([\s\S]*?)\n\};/,
    (full, body: string) => {
      const block = injectMissingBadgeVariantEntries(body, variantMembers);
      return `const badgeVariants: Record<BadgeVariant, string> = {${block}\n};`;
    },
  );

  const buttonUnion = next.match(/type ButtonVariant\s*=([\s\S]*?);/);
  if (!buttonUnion || !/destructive/.test(buttonUnion[1])) {
    next = next.replace(
      /const buttonVariants(?:\s*:\s*[^=]+)?\s*=\s*\{[\s\S]*?\n\};/,
      (block) => block.replace(/\n\s*destructive:\s*['"][^'"]+['"],?/g, ""),
    );
  }

  return next;
}

export function flattenCompoundCardUsage(content: string): string {
  let next = content;
  if (next.includes("Card.")) {
    next = next
      .replace(/<Card\.(Header|Title|Description|Content|Footer)\b/g, "<Card$1")
      .replace(/<\/Card\.(Header|Title|Description|Content|Footer)>/g, "</Card$1>");
  }
  return next.replace(
    /<\/(Card(?:Header|Title|Description|Content|Footer))(?!\s*>)/g,
    "</$1>",
  );
}

export function ensureUsedUiImports(content: string): string {
  const uiNames = [...CANONICAL_UI_PRIMITIVES];
  const used = uiNames.filter((name) => new RegExp(`<${name}\\b`).test(content));
  if (!used.length) return content;

  const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui['"]/;
  const match = content.match(importRe);
  if (!match) {
    const importLine = `import { ${used.join(", ")} } from "@/components/ui";\n`;
    if (/^["']use client["'];?\r?\n/.test(content)) {
      return content.replace(/^(["']use client["'];?\r?\n)/, `$1${importLine}`);
    }
    if (/^["']use server["'];?\r?\n/.test(content)) {
      return content.replace(/^(["']use server["'];?\r?\n)/, `$1${importLine}`);
    }
    return `${importLine}${content}`;
  }

  const existing = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const existingNames = new Set(
    existing.map((part) => part.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim()),
  );
  const missing = used.filter((name) => !existingNames.has(name));
  if (!missing.length) return content;

  return content.replace(
    importRe,
    `import { ${[...existing, ...missing].join(", ")} } from "@/components/ui"`,
  );
}

/** Drop unused `cn` imports that only trigger ESLint warnings. */
export function stripUnusedCnImport(content: string): string {
  const cnImport = content.match(
    /import\s+\{\s*([^}]*\bcn\b[^}]*)\s*\}\s+from\s+['"]@\/lib\/utils['"]\s*;?\r?\n?/,
  );
  if (!cnImport) return content;

  const withoutImport = content.replace(cnImport[0], "");
  const cnUsages = withoutImport.match(/\bcn\b/g);
  if (cnUsages && cnUsages.length > 0) return content;

  const names = cnImport[1]
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part !== "cn");
  if (names.length === 0) {
    return withoutImport;
  }
  return content.replace(
    cnImport[0],
    `import { ${names.join(", ")} } from "@/lib/utils";\n`,
  );
}

export function mergeUiBarrelImports(content: string): string {
  const re = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui['"];?\r?\n?/g;
  const matches = [...content.matchAll(re)];
  if (matches.length === 0) return content;

  const names: string[] = [];
  const seen = new Set<string>();
  for (const match of matches) {
    for (const part of match[1].split(",")) {
      const name = part.trim();
      if (!name) continue;
      const key = name.replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
  }

  let replaced = false;
  return content.replace(re, () => {
    if (replaced) return "";
    replaced = true;
    return `import { ${names.join(", ")} } from "@/components/ui";\n`;
  });
}

export function collectUiBarrelImports(files: GeneratedProjectFile[]): Set<string> {
  const used = new Set<string>();
  const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui['"]/g;

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!/\.(ts|tsx|js|jsx)$/.test(path)) continue;
    if (path === "components/ui.tsx" || path === "components/ui.ts") continue;

    let match = importRe.exec(file.content);
    while (match) {
      for (const part of match[1].split(",")) {
        const ident = part
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]
          .trim();
        if (ident) used.add(ident);
      }
      match = importRe.exec(file.content);
    }
    importRe.lastIndex = 0;
  }

  return used;
}

export function ensureUiBarrelCompatibility(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const used = collectUiBarrelImports(files);
  const barrelIndex = files.findIndex((file) => {
    const path = normalizePath(file.path);
    return path === "components/ui.tsx" || path === "components/ui.ts";
  });

  // No UI barrel and no UI imports — nothing to inject.
  if (barrelIndex < 0 && used.size === 0) return files;

  const existing = barrelIndex >= 0 ? files[barrelIndex]!.content : null;
  const before = existing ?? "";
  const result = injectMissingCanonicalUiExports(existing, used);
  const changed =
    result.injected.length > 0 ||
    result.corrected.length > 0 ||
    result.createdBarrel ||
    result.content !== before;

  if (result.injected.length > 0 || result.corrected.length > 0 || result.createdBarrel) {
    recordUiHardenerFix({
      injected: [...result.injected, ...result.corrected.map((name) => `${name}:corrected`)],
      createdBarrel: result.createdBarrel,
      requiredCount: Math.max(used.size, result.injected.length),
    });
  }

  if (barrelIndex < 0) {
    return [
      ...files,
      {
        path: "components/ui.tsx",
        language: "tsx",
        content: result.content,
      },
    ];
  }

  if (!changed) return files;

  return files.map((file, index) =>
    index === barrelIndex
      ? { ...file, path: "components/ui.tsx", language: "tsx", content: result.content }
      : file,
  );
}
