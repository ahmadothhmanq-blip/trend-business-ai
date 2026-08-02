/**
 * Shared deterministic helpers for built-in generators.
 */

import type { GenerationSpec } from "@/lib/tbge/spec/types";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "project";
}

export function specPackageName(spec: GenerationSpec): string {
  return slugify(spec.business.name);
}

export function pageByPath(spec: GenerationSpec, path: string) {
  return spec.structure.pages.find((page) => page.path === path);
}

export function homePage(spec: GenerationSpec) {
  return spec.structure.pages.find((page) => page.path === "/") ?? spec.structure.pages[0];
}

export function cssVariablesBlock(spec: GenerationSpec): string {
  const { tokens } = spec.design;
  return [
    ":root {",
    `  --color-primary: ${tokens.primary};`,
    `  --color-secondary: ${tokens.secondary};`,
    `  --color-accent: ${tokens.accent};`,
    `  --color-background: ${tokens.background};`,
    `  --color-foreground: ${tokens.foreground};`,
    "}",
  ].join("\n");
}
