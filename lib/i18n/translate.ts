import {
  getNestedMessage,
  interpolate,
  type TranslationMessages,
} from "@/lib/i18n/messages";

export type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function createTranslator(
  messages: TranslationMessages,
  fallbackMessages?: TranslationMessages,
): TranslateFn {
  return (key, values) => {
    const primary = getNestedMessage(messages, key);
    if (primary) return interpolate(primary, values);

    if (fallbackMessages) {
      const fallback = getNestedMessage(fallbackMessages, key);
      if (fallback) return interpolate(fallback, values);
    }

    return key;
  };
}
