import { TBDP_CSS_VAR_PREFIX } from "@/lib/design-platform/constants";
import type { TbdpDesignTokens } from "@/lib/design-platform/tokens/types";

function varName(...segments: string[]): string {
  return `--${TBDP_CSS_VAR_PREFIX}-${segments.join("-")}`;
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix: string[] = [],
): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = [...prefix, key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      entries.push(...flattenObject(value as Record<string, unknown>, path));
    } else {
      entries.push([varName(...path), String(value)]);
    }
  }
  return entries;
}

/**
 * Emits framework-agnostic CSS custom properties from a TBDP token tree.
 * Consumers reference semantic vars — never raw primitives.
 */
export function emitTbdpCssVariables(tokens: TbdpDesignTokens): string {
  const lines: string[] = [
    `/* Trend Business AI Design Platform · ${tokens.meta.specVersion} · ${tokens.meta.phase} */`,
    ":root {",
  ];

  const colorEntries = flattenObject(tokens.color as unknown as Record<string, unknown>, [
    "color",
  ]);
  for (const [name, value] of colorEntries) {
    lines.push(`  ${name}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.opacity)) {
    lines.push(`  ${varName("opacity", key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.spacing.scale)) {
    lines.push(`  ${varName("spacing", key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.radius)) {
    lines.push(`  ${varName("radius", key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.shadow)) {
    lines.push(`  ${varName("shadow", key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.grid.containers)) {
    lines.push(`  ${varName("container", key)}: ${value};`);
  }

  const profile = tokens.typography.profiles[tokens.typographyProfile];
  lines.push(`  ${varName("font-display")}: ${profile.display.fontFamily};`);
  lines.push(`  ${varName("font-body")}: ${profile.body.fontFamily};`);
  lines.push(`  ${varName("font-mono")}: ${tokens.typography.fallbacks.mono};`);

  lines.push("}");

  if (tokens.mode === "dark") {
    lines.push("", '[data-tbdp-mode="dark"] { /* inherits :root dark build */ }');
  }

  return lines.join("\n");
}
