import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
import type { TbdpLanguageContext } from "@/lib/design-platform/integration/core/types";

export type TbdpLanguageBridgeInput = {
  websiteLanguage?: string;
  generationLanguage?: string;
  templateLanguage?: string;
  direction?: "ltr" | "rtl";
};

function resolveTypographyProfile(
  direction: "ltr" | "rtl",
  localeCode: string,
): TbdpLanguageContext["typographyProfile"] {
  if (direction === "rtl") {
    if (localeCode === "ar" || localeCode.startsWith("ar")) return "arabic-rtl";
    return "latin-rtl";
  }
  return "latin-ltr";
}

/**
 * Unifies website language, generation language, template language,
 * RTL/LTR, and typography profile into one context.
 */
export function resolveLanguageContext(
  input: TbdpLanguageBridgeInput = {},
): TbdpLanguageContext {
  const websiteLanguage = input.websiteLanguage ?? "English";
  const generationLanguage = input.generationLanguage ?? websiteLanguage;
  const templateLanguage = input.templateLanguage ?? websiteLanguage;

  const locale = resolveLocaleFromLanguage(websiteLanguage);
  const direction = input.direction ?? locale.dir;
  const rtl = direction === "rtl";

  return {
    websiteLanguage,
    generationLanguage,
    templateLanguage,
    localeCode: locale.localeCode,
    htmlLang: locale.htmlLang,
    direction,
    rtl,
    typographyProfile: resolveTypographyProfile(direction, locale.localeCode),
    fontHint: locale.fontHint,
  };
}
