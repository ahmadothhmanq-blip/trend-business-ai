/**
 * Theme composition — deterministic mapping from GenerationSpec.design.
 */

import type { ComposedTheme } from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

export function composeTheme(spec: GenerationSpec): ComposedTheme {
  const { design } = spec;
  const tokens = design.tokens;

  return {
    templateId: design.templateId,
    tokens,
    typography: {
      headingFont: design.headingFont ?? "Inter, system-ui, sans-serif",
      bodyFont: design.bodyFont ?? "Inter, system-ui, sans-serif",
    },
    layoutProfile: design.layoutProfile ?? "marketing",
    imageStyle: design.imageStyle,
    cssVariables: {
      "--color-primary": tokens.primary,
      "--color-secondary": tokens.secondary,
      "--color-accent": tokens.accent,
      "--color-background": tokens.background,
      "--color-foreground": tokens.foreground,
      ...(tokens.surface ? { "--color-surface": tokens.surface } : {}),
      ...(tokens.neutral ? { "--color-neutral": tokens.neutral } : {}),
      "--font-heading": design.headingFont ?? "Inter, system-ui, sans-serif",
      "--font-body": design.bodyFont ?? "Inter, system-ui, sans-serif",
    },
  };
}
