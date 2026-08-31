import "server-only";

import {
  buildGlsOutputDirective,
  type GlsOutputSurface,
} from "@/lib/language-platform/generation/directive";
import { getGcriContext } from "@/lib/language-platform/gcri/context.server";
import { buildGcriDirective } from "@/lib/language-platform/gcri/directive";
import { resolveGcriProfile } from "@/lib/language-platform/gcri/resolve";

export type { GlsOutputSurface };

/** Instruction appended to AI generation prompts for complete GLS + GCRI output. */
export function aiOutputLanguageDirective(
  language?: string,
  surface: GlsOutputSurface = "generic",
  country?: string,
): string {
  const gls = buildGlsOutputDirective(language, surface);
  if (!gls) return "";
  const profile = country
    ? resolveGcriProfile({ language, country })
    : (getGcriContext() ?? resolveGcriProfile({ language }));
  return `${gls}${buildGcriDirective(profile)}`;
}
