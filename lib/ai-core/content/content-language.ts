/**
 * Resolve website content language for static copy packs (industry + production extras).
 */

export type ContentLanguage = "en" | "ar";

export function resolveContentLanguage(
  language?: string | null,
): ContentLanguage {
  const key = (language || "english").toLowerCase().trim();
  if (key === "ar" || key.startsWith("ar-")) return "ar";
  if (key.includes("arab")) return "ar";
  if (key.includes("عرب")) return "ar";
  return "en";
}

export function isArabicContentLanguage(language?: string | null): boolean {
  return resolveContentLanguage(language) === "ar";
}

export type ComposeUiFallbacks = {
  primaryCta: string;
  secondaryCta: string;
  heroEyebrow: string;
  pageTitleSuffix: string;
  pageDescriptionSuffix: string;
  learnMore: string;
  navServices: string;
  navFeatures: string;
  navPricing: string;
  navContact: string;
};

const COMPOSE_UI: Record<ContentLanguage, ComposeUiFallbacks> = {
  en: {
    primaryCta: "Get started",
    secondaryCta: "Learn more",
    heroEyebrow: "Premium experience",
    pageTitleSuffix: "Professional website",
    pageDescriptionSuffix:
      "website built with Trend Business AI Professional Components Library.",
    learnMore: "Learn more",
    navServices: "Services",
    navFeatures: "Features",
    navPricing: "Pricing",
    navContact: "Contact",
  },
  ar: {
    primaryCta: "ابدأ الآن",
    secondaryCta: "اعرف المزيد",
    heroEyebrow: "تجربة متميزة",
    pageTitleSuffix: "موقع احترافي",
    pageDescriptionSuffix:
      "موقع إلكتروني مبني بمكتبة المكونات الاحترافية من Trend Business AI.",
    learnMore: "اعرف المزيد",
    navServices: "الخدمات",
    navFeatures: "المميزات",
    navPricing: "الأسعار",
    navContact: "تواصل معنا",
  },
};

export function getComposeUiFallbacks(
  language?: string | null,
): ComposeUiFallbacks {
  return COMPOSE_UI[resolveContentLanguage(language)];
}
