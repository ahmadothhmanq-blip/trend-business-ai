import type { TranslateFn } from "@/lib/i18n/translate";

/** Slugify option value for i18n key lookup. */
export function optionKey(namespace: string, value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${namespace}.${slug}`;
}

export function translateOption(
  t: TranslateFn,
  namespace: string,
  value: string,
): string {
  const key = optionKey(namespace, value);
  const translated = t(key);
  return translated === key ? value : translated;
}

export function translateOptions<T extends string>(
  t: TranslateFn,
  namespace: string,
  values: readonly T[],
): { value: T; label: string }[] {
  return values.map((value) => ({
    value,
    label: translateOption(t, namespace, value),
  }));
}

/** Design style presets used across Website Builder and related tools. */
export const DESIGN_STYLE_VALUES = [
  "Luxury",
  "Minimal",
  "Corporate",
  "Startup",
  "Modern",
  "Glass",
  "Dark",
  "Light",
  "Creative",
  "Modern SaaS",
] as const;

export const TONE_VALUES = [
  "Professional",
  "Friendly",
  "Bold",
  "Luxury",
  "Casual",
  "Authoritative",
  "Playful",
  "Inspirational",
] as const;
