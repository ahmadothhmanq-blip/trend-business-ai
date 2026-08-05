import type { GlsLanguageContext, GlsLanguageResolverInput } from "@/lib/language-platform/core/types";

export function validateGlsLanguageResolverInput(
  input: GlsLanguageResolverInput,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (input.direction && input.direction !== "ltr" && input.direction !== "rtl") {
    errors.push(`Invalid direction: ${input.direction}`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateGlsLanguageContext(ctx: GlsLanguageContext): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!ctx.meta.contextHash) errors.push("Missing contextHash");
  if (!ctx.website.localeCode) errors.push("Missing website.localeCode");
  if (!ctx.typography.profileId) errors.push("Missing typography.profileId");
  if (ctx.website.rtl !== (ctx.direction.direction === "rtl")) {
    errors.push("RTL flag mismatch with direction");
  }
  if (!ctx.ai.structuredOutputOnly) {
    errors.push("AI must use structured output only");
  }
  return { valid: errors.length === 0, errors };
}
