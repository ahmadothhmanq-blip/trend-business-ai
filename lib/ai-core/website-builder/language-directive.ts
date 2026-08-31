import { resolveContentLanguage } from "@/lib/ai-core/content/content-language";
import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
import { isArabicPrompt } from "@/lib/ai-core/website-builder/prompt-industry";
import { buildGcriDirective } from "@/lib/language-platform/gcri/directive";
import { resolveGcriProfile } from "@/lib/language-platform/gcri/resolve";

/** True when the selected output language requires RTL layout. */
export function isRtlWebsiteLanguage(language?: string | null): boolean {
  return resolveLocaleFromLanguage(language).rtl;
}

/** True when all user-facing copy must be Arabic. */
export function requiresArabicWebsiteCopy(
  language?: string | null,
  prompt?: string | null,
): boolean {
  if (resolveContentLanguage(language) === "ar") return true;
  return Boolean(prompt && isArabicPrompt(prompt));
}

/**
 * Client-safe language block for Website Builder AI prompts.
 * Request-scoped GCRI is applied on the server via `language-directive.server.ts`.
 */
export function buildWebsiteLanguageDirective(params: {
  language: string;
  prompt?: string;
  country?: string;
}): string {
  const { language } = params;
  const prompt = params.prompt ?? "";
  const locale = resolveLocaleFromLanguage(language);
  const arabic = requiresArabicWebsiteCopy(language, prompt);
  const gcri = params.country
    ? resolveGcriProfile({ language, country: params.country })
    : resolveGcriProfile({ language });
  const gcriBlock = buildGcriDirective(gcri);

  if (arabic) {
    return `
CRITICAL — Arabic website output (non-negotiable):
- Generate ALL copy natively in Modern Standard Arabic from the start. Do NOT write English and translate afterward.
- Navigation, buttons, headings, hero labels, section titles, card titles, CTAs, footer links, form labels, placeholders, metadata titles/descriptions, SEO keywords, and blog content must ALL be Arabic.
- Do NOT output English headings, buttons, navigation, placeholder text, metadata, or comments.
- Do NOT output mixed-language UI unless the brief explicitly requests Bilingual.
- Use natural, native Arabic phrasing — not literal word-for-word translation.
- Layout MUST support RTL: set html lang="ar" dir="rtl", mirror navigation order, and right-align form fields.
- Strategy page names, section names, and CTAs must also be Arabic.
- Upstream Strategy/Blueprint JSON may contain English planning labels — treat as STRUCTURE ONLY; never copy English into user-facing output.
${gcriBlock}`;
  }

  if (language.toLowerCase() === "bilingual") {
    return `
CRITICAL — Bilingual (Arabic + English) output:
- Provide paired Arabic and English for navigation, headings, buttons, CTAs, and key body copy (Arabic first).
- Set html lang="ar" dir="rtl" with an English toggle or mirrored sections where appropriate.
- Metadata should include both Arabic and English titles/descriptions.
${gcriBlock}`;
  }

  return `
CRITICAL — Language: ${language}
- Generate ALL copy natively in ${language} from the start. Do NOT write English templates and translate afterward.
- Navigation, buttons, headings, hero labels, section titles, card titles, CTAs, footer, form labels, placeholders, metadata, SEO title/description, blog content, and CTA text must ALL be in ${language}.
- Template metadata, premium template labels, industry intelligence, and strategy JSON may contain English planning text — treat them as STRUCTURE ONLY. Never copy English labels into user-facing output.
- Do not mix other languages except untranslated brand names explicitly requested in the brief.
- HTML lang="${locale.htmlLang}"${locale.rtl ? ` dir="${locale.dir}"` : ""}.
${gcriBlock}`;
}
