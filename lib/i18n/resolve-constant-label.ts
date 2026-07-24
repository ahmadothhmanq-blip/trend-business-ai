import type { TranslateFn } from "@/lib/i18n/translate";

export type LabeledConstant = {
  label: string;
  labelKey?: string;
  description?: string;
  descriptionKey?: string;
};

export function resolveLabel(t: TranslateFn, item: LabeledConstant): string {
  if (item.labelKey) {
    const translated = t(item.labelKey);
    if (translated !== item.labelKey) return translated;
  }
  return item.label;
}

export function resolveDescription(t: TranslateFn, item: LabeledConstant): string {
  if (item.descriptionKey) {
    const translated = t(item.descriptionKey);
    if (translated !== item.descriptionKey) return translated;
  }
  return item.description ?? "";
}

export function resolveLabeledConstants<T extends LabeledConstant>(
  t: TranslateFn,
  items: readonly T[],
): (T & { label: string; description: string })[] {
  return items.map((item) => ({
    ...item,
    label: resolveLabel(t, item),
    description: resolveDescription(t, item),
  }));
}
