import type { TranslateFn } from "@/lib/i18n/translate";

const TOOL_KEY_MAP: Record<string, { label: string; description: string }> = {
  "content-writer": { label: "contentStudio.tools.contentWriter.label", description: "contentStudio.tools.contentWriter.description" },
  "blog-writer": { label: "contentStudio.tools.blogWriter.label", description: "contentStudio.tools.blogWriter.description" },
  "article-writer": { label: "contentStudio.tools.articleWriter.label", description: "contentStudio.tools.articleWriter.description" },
  "social-writer": { label: "contentStudio.tools.socialWriter.label", description: "contentStudio.tools.socialWriter.description" },
  "ad-copy": { label: "contentStudio.tools.adCopy.label", description: "contentStudio.tools.adCopy.description" },
  "email-writer": { label: "contentStudio.tools.emailWriter.label", description: "contentStudio.tools.emailWriter.description" },
  "newsletter-builder": { label: "contentStudio.tools.newsletterBuilder.label", description: "contentStudio.tools.newsletterBuilder.description" },
  "product-description": { label: "contentStudio.tools.productDescription.label", description: "contentStudio.tools.productDescription.description" },
  "landing-copy": { label: "contentStudio.tools.landingCopy.label", description: "contentStudio.tools.landingCopy.description" },
  "script-writer": { label: "contentStudio.tools.scriptWriter.label", description: "contentStudio.tools.scriptWriter.description" },
  "content-calendar": { label: "contentStudio.tools.contentCalendar.label", description: "contentStudio.tools.contentCalendar.description" },
  "campaign-planner": { label: "contentStudio.tools.campaignPlanner.label", description: "contentStudio.tools.campaignPlanner.description" },
};

export function getTranslatedContentToolLabel(t: TranslateFn, id: string, fallback?: string) {
  const keys = TOOL_KEY_MAP[id];
  if (!keys) return fallback ?? id;
  const translated = t(keys.label);
  return translated === keys.label ? (fallback ?? id) : translated;
}

export function getTranslatedContentToolDescription(t: TranslateFn, id: string, fallback?: string) {
  const keys = TOOL_KEY_MAP[id];
  if (!keys) return fallback ?? "";
  const translated = t(keys.description);
  return translated === keys.description ? (fallback ?? "") : translated;
}
