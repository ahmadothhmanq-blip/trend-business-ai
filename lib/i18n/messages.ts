export type TranslationValue = string | TranslationMessages | TranslationValue[];
export type TranslationMessages = { [key: string]: TranslationValue };

export function isTranslationMessages(
  value: TranslationValue,
): value is TranslationMessages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMergeMessages(
  base: TranslationMessages,
  override: TranslationMessages,
): TranslationMessages {
  const result: TranslationMessages = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overrideVal = override[key];
    if (
      isTranslationMessages(baseVal) &&
      isTranslationMessages(overrideVal)
    ) {
      result[key] = deepMergeMessages(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal;
    }
  }
  return result;
}

export function getNestedMessage(
  messages: TranslationMessages,
  key: string,
): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }
    if (isTranslationMessages(current as TranslationValue)) {
      current = (current as TranslationMessages)[part];
      continue;
    }
    return undefined;
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = values[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}
