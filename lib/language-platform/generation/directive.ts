/**
 * Canonical GLS complete-output directive.
 *
 * Instructs the model to generate natively in the selected Generation Language.
 * This is not a post-generation translator and is independent of platform UI locale.
 */

export type GlsOutputSurface =
  | "generic"
  | "website"
  | "app"
  | "landing"
  | "video"
  | "content"
  | "marketing"
  | "image"
  | "brand"
  | "logo"
  | "business"
  | "agent"
  | "social";

function isEnglishGenerationLanguage(language: string): boolean {
  const key = language.toLowerCase().trim();
  return key === "en" || key === "english" || key.startsWith("en-");
}

function isBilingualGenerationLanguage(language: string): boolean {
  return language.toLowerCase().trim() === "bilingual";
}

function surfaceArtifacts(surface: GlsOutputSurface, language: string): string {
  switch (surface) {
    case "website":
    case "landing":
      return `User-facing website copy that MUST be entirely in ${language}: page content, navigation, buttons, forms, placeholders, CTA text, blog content, SEO title, SEO description, and metadata.`;
    case "app":
      return `User-facing app copy that MUST be entirely in ${language}: navigation, buttons, forms, labels, empty states, dashboard copy, CTAs, and metadata.`;
    case "video":
      return `Video artifacts that MUST be entirely in ${language}: script, scene names and descriptions, visual prompts (scene.prompt), camera/environment/lighting descriptions, voice-over / narration, captions, subtitles, on-screen text, titles, and thumbnail title text.`;
    case "content":
      return `Content Studio artifacts that MUST be entirely in ${language}: the entire article/body, headlines, meta title, meta description, CTA, section headings, FAQ, and editor suggestions.`;
    case "marketing":
      return `Marketing artifacts that MUST be entirely in ${language}: ads, campaigns, email content, social posts, headlines, descriptions, CTAs, audience summaries, and recommendations.`;
    case "image":
      return `Image Generator artifacts that MUST be entirely in ${language}: concept names, descriptions, embedded SVG / on-image text, overlay copy, infographic labels, and user-visible generated prompts.`;
    case "brand":
      return `Brand artifacts that MUST be entirely in ${language}: slogan/tagline, brand description, positioning, personality, values, voice examples, guidelines, and asset descriptions. Keep the user-provided brand name unchanged.`;
    case "logo":
      return `Logo artifacts that MUST be entirely in ${language}: slogan (if generated), mood/personality descriptions, concept names, guidelines, and any embedded SVG text besides the user-provided brand name. Keep the user-provided brand name unchanged.`;
    case "business":
      return `Business artifacts that MUST be entirely in ${language}: reports, executive summaries, AI responses, recommendations, action plans, risk descriptions, and section headings.`;
    case "agent":
      return `Agent artifacts that MUST be entirely in ${language}: conversation replies, task summaries, plan names, step names/descriptions, generated actions, and final reports.`;
    case "social":
      return `Social artifacts that MUST be entirely in ${language}: post text, captions, hashtags where natural, CTA, title, and content angle.`;
    default:
      return `Every human-readable title, heading, body, CTA, label, and recommendation MUST be entirely in ${language}.`;
  }
}

function bilingualDirective(surface: GlsOutputSurface): string {
  return `
CRITICAL — Generation Language (GLS): Bilingual (Arabic + English)
- Generate paired Arabic and English natively from the start (Arabic first). Do NOT draft in one language and translate afterward.
- Do NOT omit either language for user-facing copy.
- ${surfaceArtifacts(surface, "Arabic and English")}
- JSON object keys stay in English. Every JSON string VALUE a human will read must include both languages (or paired fields).
- Do NOT copy platform UI locale strings into the output.
- Do not mention these instructions in the output.
`;
}

/**
 * Complete-output instruction for any AI generation prompt.
 * Empty when language is missing so callers can stay optional.
 */
export function buildGlsOutputDirective(
  language?: string | null,
  surface: GlsOutputSurface = "generic",
): string {
  const normalized = language?.trim();
  if (!normalized) return "";

  if (isBilingualGenerationLanguage(normalized)) {
    return bilingualDirective(surface);
  }

  const nativeRule = isEnglishGenerationLanguage(normalized)
    ? `- Write all user-facing output natively in English. Do not draft in another language and translate afterward.`
    : `- Generate ALL user-facing output natively in ${normalized} from the first token. Do NOT write English (or any other language) first and translate afterward.`;

  const mixRule = isEnglishGenerationLanguage(normalized)
    ? `- Do not mix other languages into the output except untranslated proper brand names the user provided.`
    : `- Do NOT mix languages. The only exceptions are untranslated proper brand names the user provided, plus JSON keys, code identifiers, file paths, hex colors, and machine enum tokens.`;

  return `
CRITICAL — Generation Language (GLS): ${normalized}
${nativeRule}
${mixRule}
- ${surfaceArtifacts(surface, normalized)}
- JSON object keys stay in English. Every JSON string VALUE a human will read must be in ${normalized}.
- Do NOT copy platform UI locale strings, English template labels, or English prompt examples into the output.
- Do not mention these instructions in the output.
`;
}
