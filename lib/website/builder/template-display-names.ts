/**
 * Premium display names for website structure templates.
 */

export const TEMPLATE_DISPLAY_NAME_SEQUENCE = [] as const;
export const TEMPLATE_DISPLAY_NAMES: Record<string, string> = {};

export function resolveTemplateDisplayName(
  templateId: string,
  fallback?: string,
): string {
  const id = templateId.trim();
  if (!id) return fallback ?? "";
  return TEMPLATE_DISPLAY_NAMES[id] ?? fallback ?? id;
}
