import {
  buildGlsOutputDirective,
  type GlsOutputSurface,
} from "@/lib/language-platform/generation/directive";
import { buildGcriDirective } from "@/lib/language-platform/gcri/directive";
import { resolveGcriProfile } from "@/lib/language-platform/gcri/resolve";

export type { GlsOutputSurface };

/** Client-safe GLS + GCRI directive (no request-scoped GCRI store). */
export function aiOutputLanguageDirective(
  language?: string,
  surface: GlsOutputSurface = "generic",
  country?: string,
): string {
  const gls = buildGlsOutputDirective(language, surface);
  if (!gls) return "";
  const profile = country
    ? resolveGcriProfile({ language, country })
    : resolveGcriProfile({ language });
  return `${gls}${buildGcriDirective(profile)}`;
}
