import type { TranslateFn } from "@/lib/i18n/translate";

/** Translate a field that may be an i18n key or legacy English string. */
export function translateField(
  t: TranslateFn,
  value: string,
  key?: string,
): string {
  if (key) {
    const translated = t(key);
    if (translated !== key) return translated;
  }
  if (value.includes(".") && !value.includes(" ")) {
    const translated = t(value);
    if (translated !== value) return translated;
  }
  return value;
}

/** Map link items with labelKey to translated labels. */
export function translateLinkItems<
  T extends { href: string; labelKey?: string; label: string },
>(t: TranslateFn, items: readonly T[]): { href: string; label: string }[] {
  return items.map((item) => ({
    href: item.href,
    label: item.labelKey ? t(item.labelKey) : item.label,
  }));
}
