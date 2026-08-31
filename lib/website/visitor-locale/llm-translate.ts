import { listConfiguredProviders } from "@/lib/ai/adapters";
import { providerManager } from "@/lib/ai/provider-manager";
import { PRIMARY_SITE_LANGUAGE } from "@/lib/language-platform/generation/options";
import { translateVisiblePhrases, translateArabicPhrasesToEnglish } from "@/lib/website/visitor-locale/phrase-dictionary";

export type TranslatableSegment = {
  id: string;
  text: string;
};

const MAX_SEGMENTS_PER_REQUEST = 40;
const MAX_SEGMENT_CHARS = 280;

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

/** When true (default if unset), use LLM for visitor locale HTML when a provider is configured. */
export function isVisitorLocaleLlmEnabled(): boolean {
  const value = process.env.WB_LOCALE_LLM;
  if (value === "false" || value === "0") return false;
  return true;
}

function stripHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

/** Extract visible text + key meta strings for translation. */
export function extractTranslatableSegments(html: string): TranslatableSegment[] {
  const segments: TranslatableSegment[] = [];
  const seen = new Set<string>();
  let index = 0;

  const push = (text: string) => {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed || trimmed.length < 2) return;
    if (/^[\d\s\W]+$/.test(trimmed)) return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    segments.push({
      id: `s${index++}`,
      text: trimmed.slice(0, MAX_SEGMENT_CHARS),
    });
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch?.[1]) push(titleMatch[1]);

  for (const match of html.matchAll(
    /<meta[^>]+(?:name|property)=["'](?:description|og:title|og:description)["'][^>]+content=["']([^"']*)["'][^>]*>/gi,
  )) {
    if (match[1]) push(match[1]);
  }

  const body = stripHtmlComments(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  for (const match of body.matchAll(/>([^<>{}\n][^<]{1,200})</g)) {
    push(match[1] ?? "");
    if (segments.length >= MAX_SEGMENTS_PER_REQUEST) break;
  }

  return segments.slice(0, MAX_SEGMENTS_PER_REQUEST);
}

export function applyTranslatedSegments(
  html: string,
  segments: TranslatableSegment[],
  translations: Record<string, string>,
): string {
  let result = html;
  for (const segment of segments) {
    const translated = translations[segment.id];
    if (!translated || translated === segment.text) continue;
    result = result.split(segment.text).join(translated);
  }
  return result;
}

async function translateSegmentsWithLlm(params: {
  segments: TranslatableSegment[];
  targetLanguage: string;
  sourceLanguage: string;
}): Promise<Record<string, string> | null> {
  if (!params.segments.length) return {};
  if (!isVisitorLocaleLlmEnabled()) return null;
  if (listConfiguredProviders().length === 0) return null;

  const payload = params.segments.map((s) => ({
    id: s.id,
    text: s.text,
  }));

  try {
    const result = await providerManager.generateJson<{
      translations?: Array<{ id: string; text: string }>;
    }>({
      temperature: 0.2,
      system: `You translate website UI copy. Source: ${params.sourceLanguage}. Target: ${params.targetLanguage}. Return JSON only: {"translations":[{"id":"s0","text":"..."}]}. Preserve brand names. Do not translate URLs or code.`,
      prompt: JSON.stringify({ segments: payload }),
    });

    const map: Record<string, string> = {};
    for (const item of result.translations ?? []) {
      if (item.id && item.text) map[item.id] = item.text;
    }
    return map;
  } catch {
    return null;
  }
}

/**
 * Translate visible HTML copy via LLM when configured; phrase dictionary fallback otherwise.
 */
export async function translateHtmlForLanguage(params: {
  html: string;
  targetLanguage: string;
  sourceLanguage?: string;
}): Promise<string> {
  const source = params.sourceLanguage ?? PRIMARY_SITE_LANGUAGE;
  if (params.targetLanguage === source) return params.html;

  const segments = extractTranslatableSegments(params.html);
  const llmMap = await translateSegmentsWithLlm({
    segments,
    targetLanguage: params.targetLanguage,
    sourceLanguage: source,
  });

  if (llmMap && Object.keys(llmMap).length > 0) {
    return applyTranslatedSegments(params.html, segments, llmMap);
  }

  if (
    params.targetLanguage === PRIMARY_SITE_LANGUAGE &&
    params.sourceLanguage === "Arabic"
  ) {
    return translateArabicPhrasesToEnglish(params.html);
  }

  return translateVisiblePhrases(params.html, params.targetLanguage);
}
