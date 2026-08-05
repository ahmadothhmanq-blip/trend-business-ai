import type {
  GlsDirection,
  GlsTypographyProfileId,
  GlsTypographyScriptFamily,
} from "@/lib/language-platform/core/types";
import { GLS_TYPOGRAPHY_PROFILES } from "@/lib/language-platform/typography/profiles";

export function resolveTypographyProfileId(
  scriptFamily: GlsTypographyScriptFamily,
  direction: GlsDirection,
): GlsTypographyProfileId {
  if (scriptFamily === "arabic") {
    return direction === "rtl" ? "arabic-rtl" : "arabic-ltr";
  }
  if (scriptFamily === "hebrew") return "hebrew-rtl";
  if (scriptFamily === "cjk") return "cjk-ltr";
  if (scriptFamily === "cyrillic") return "cyrillic-ltr";
  if (scriptFamily === "indic") return "indic-ltr";
  if (scriptFamily === "thai") return "thai-ltr";
  if (scriptFamily === "greek") return "greek-ltr";
  if (scriptFamily === "vietnamese") return "vietnamese-ltr";
  return direction === "rtl" ? "latin-rtl" : "latin-ltr";
}

export function resolveTypographyProfile(
  scriptFamily: GlsTypographyScriptFamily,
  direction: GlsDirection,
) {
  const id = resolveTypographyProfileId(scriptFamily, direction);
  return GLS_TYPOGRAPHY_PROFILES[id];
}

/** Fallback chain when a script-specific font is unavailable. */
export function resolveTypographyFallbackChain(profileId: GlsTypographyProfileId): string[] {
  const profile = GLS_TYPOGRAPHY_PROFILES[profileId];
  const chain = [
    profile.display.fontFamily,
    profile.body.fontFamily,
    profile.display.fallback,
    "system-ui",
    "sans-serif",
  ];
  return [...new Set(chain)];
}
