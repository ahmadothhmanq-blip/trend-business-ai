/**
 * Resolve website content language for static copy packs (industry + production extras).
 */

import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";

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

/** True only for explicit English — all other languages use LLM-native copy. */
export function isEnglishWebsiteLanguage(language?: string | null): boolean {
  const key = (language || "english").toLowerCase().trim();
  if (!key || key === "en" || key === "english" || key.startsWith("en-")) {
    return true;
  }
  return false;
}

/**
 * When true, skip English scaffolds / production packs / composed pages.
 * The LLM must author all visible UI copy in the selected language.
 */
export function usesLlmLocalizedWebsiteCopy(language?: string | null): boolean {
  return !isEnglishWebsiteLanguage(language);
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

export type StrategyFallbackLabels = {
  pages: string[];
  sections: string[];
  ctas: string[];
  conversionFunnel: string[];
  proofPoints: string[];
  objectionHandlers: string[];
  pagePurposeSuffix: string;
};

const COMPOSE_UI_BY_LOCALE: Record<string, ComposeUiFallbacks> = {
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
  es: {
    primaryCta: "Comenzar",
    secondaryCta: "Saber más",
    heroEyebrow: "Experiencia premium",
    pageTitleSuffix: "Sitio web profesional",
    pageDescriptionSuffix:
      "sitio web creado con la biblioteca de componentes profesionales de Trend Business AI.",
    learnMore: "Saber más",
    navServices: "Servicios",
    navFeatures: "Características",
    navPricing: "Precios",
    navContact: "Contacto",
  },
  fr: {
    primaryCta: "Commencer",
    secondaryCta: "En savoir plus",
    heroEyebrow: "Expérience premium",
    pageTitleSuffix: "Site web professionnel",
    pageDescriptionSuffix:
      "site web créé avec la bibliothèque de composants professionnels Trend Business AI.",
    learnMore: "En savoir plus",
    navServices: "Services",
    navFeatures: "Fonctionnalités",
    navPricing: "Tarifs",
    navContact: "Contact",
  },
  de: {
    primaryCta: "Jetzt starten",
    secondaryCta: "Mehr erfahren",
    heroEyebrow: "Premium-Erlebnis",
    pageTitleSuffix: "Professionelle Website",
    pageDescriptionSuffix:
      "Website erstellt mit der Trend Business AI Professional Components Library.",
    learnMore: "Mehr erfahren",
    navServices: "Leistungen",
    navFeatures: "Funktionen",
    navPricing: "Preise",
    navContact: "Kontakt",
  },
  pt: {
    primaryCta: "Começar",
    secondaryCta: "Saiba mais",
    heroEyebrow: "Experiência premium",
    pageTitleSuffix: "Site profissional",
    pageDescriptionSuffix:
      "site criado com a biblioteca de componentes profissionais Trend Business AI.",
    learnMore: "Saiba mais",
    navServices: "Serviços",
    navFeatures: "Recursos",
    navPricing: "Preços",
    navContact: "Contato",
  },
  it: {
    primaryCta: "Inizia",
    secondaryCta: "Scopri di più",
    heroEyebrow: "Esperienza premium",
    pageTitleSuffix: "Sito web professionale",
    pageDescriptionSuffix:
      "sito web creato con la libreria di componenti professionali Trend Business AI.",
    learnMore: "Scopri di più",
    navServices: "Servizi",
    navFeatures: "Funzionalità",
    navPricing: "Prezzi",
    navContact: "Contatti",
  },
};

const EMPTY_COMPOSE_UI: ComposeUiFallbacks = {
  primaryCta: "",
  secondaryCta: "",
  heroEyebrow: "",
  pageTitleSuffix: "",
  pageDescriptionSuffix: "",
  learnMore: "",
  navServices: "",
  navFeatures: "",
  navPricing: "",
  navContact: "",
};

const EMPTY_STRATEGY_LABELS: StrategyFallbackLabels = {
  pages: [],
  sections: [],
  ctas: [],
  conversionFunnel: [],
  proofPoints: [],
  objectionHandlers: [],
  pagePurposeSuffix: "",
};

const STRATEGY_LABELS: Record<string, StrategyFallbackLabels> = {
  en: {
    pages: ["Home", "About", "Contact"],
    sections: ["Hero", "Benefits", "Social proof", "CTA"],
    ctas: ["Get started", "Contact us"],
    conversionFunnel: ["Awareness", "Interest", "Conversion"],
    proofPoints: ["Customer outcomes", "Trusted expertise"],
    objectionHandlers: ["Clear pricing path", "Fast contact"],
    pagePurposeSuffix: "page",
  },
  ar: {
    pages: ["الرئيسية", "من نحن", "تواصل"],
    sections: ["البطل", "المزايا", "آراء العملاء", "دعوة لاتخاذ إجراء"],
    ctas: ["ابدأ الآن", "تواصل معنا"],
    conversionFunnel: ["الوعي", "الاهتمام", "التحويل"],
    proofPoints: ["نتائج العملاء", "خبرة موثوقة"],
    objectionHandlers: ["مسار تسعير واضح", "تواصل سريع"],
    pagePurposeSuffix: "صفحة",
  },
  es: {
    pages: ["Inicio", "Acerca de", "Contacto"],
    sections: ["Hero", "Beneficios", "Prueba social", "CTA"],
    ctas: ["Comenzar", "Contáctanos"],
    conversionFunnel: ["Conciencia", "Interés", "Conversión"],
    proofPoints: ["Resultados para clientes", "Experiencia confiable"],
    objectionHandlers: ["Precios claros", "Contacto rápido"],
    pagePurposeSuffix: "página",
  },
  fr: {
    pages: ["Accueil", "À propos", "Contact"],
    sections: ["Héros", "Avantages", "Preuve sociale", "CTA"],
    ctas: ["Commencer", "Nous contacter"],
    conversionFunnel: ["Notoriété", "Intérêt", "Conversion"],
    proofPoints: ["Résultats clients", "Expertise fiable"],
    objectionHandlers: ["Tarification claire", "Contact rapide"],
    pagePurposeSuffix: "page",
  },
  de: {
    pages: ["Startseite", "Über uns", "Kontakt"],
    sections: ["Hero", "Vorteile", "Social Proof", "CTA"],
    ctas: ["Jetzt starten", "Kontakt aufnehmen"],
    conversionFunnel: ["Bekanntheit", "Interesse", "Conversion"],
    proofPoints: ["Kundenergebnisse", "Vertrauenswürdige Expertise"],
    objectionHandlers: ["Klare Preise", "Schneller Kontakt"],
    pagePurposeSuffix: "Seite",
  },
  pt: {
    pages: ["Início", "Sobre", "Contato"],
    sections: ["Hero", "Benefícios", "Prova social", "CTA"],
    ctas: ["Começar", "Fale conosco"],
    conversionFunnel: ["Consciência", "Interesse", "Conversão"],
    proofPoints: ["Resultados para clientes", "Experiência confiável"],
    objectionHandlers: ["Preços claros", "Contato rápido"],
    pagePurposeSuffix: "página",
  },
  it: {
    pages: ["Home", "Chi siamo", "Contatti"],
    sections: ["Hero", "Vantaggi", "Prova sociale", "CTA"],
    ctas: ["Inizia", "Contattaci"],
    conversionFunnel: ["Consapevolezza", "Interesse", "Conversione"],
    proofPoints: ["Risultati per i clienti", "Esperienza affidabile"],
    objectionHandlers: ["Prezzi chiari", "Contatto rapido"],
    pagePurposeSuffix: "pagina",
  },
};

export function getComposeUiFallbacks(
  language?: string | null,
): ComposeUiFallbacks {
  const localeCode = resolveLocaleFromLanguage(language).localeCode;
  if (usesLlmLocalizedWebsiteCopy(language)) {
    return COMPOSE_UI_BY_LOCALE[localeCode] ?? EMPTY_COMPOSE_UI;
  }
  return COMPOSE_UI_BY_LOCALE.en!;
}

export function getStrategyFallbackLabels(
  language?: string | null,
): StrategyFallbackLabels {
  const localeCode = resolveLocaleFromLanguage(language).localeCode;
  if (usesLlmLocalizedWebsiteCopy(language)) {
    return STRATEGY_LABELS[localeCode] ?? EMPTY_STRATEGY_LABELS;
  }
  return STRATEGY_LABELS.en!;
}

/** Default nav page names for static preview when blueprint pages are missing. */
export function getDefaultPreviewPageNames(language?: string | null): string[] {
  const labels = getStrategyFallbackLabels(language);
  const services = getComposeUiFallbacks(language).navServices;
  return [labels.pages[0]!, labels.pages[1]!, services, labels.pages[2]!];
}

const GENERATING_LABELS: Record<string, string> = {
  en: "Generating website…",
  ar: "جاري إنشاء الموقع…",
  es: "Generando sitio web…",
  fr: "Génération du site…",
  de: "Website wird erstellt…",
  pt: "Gerando site…",
  it: "Generazione sito web…",
};

/** Session / blueprint placeholder while generation is in progress. */
export function getGeneratingWebsiteLabel(language?: string | null): string {
  const code = resolveLocaleFromLanguage(language).localeCode;
  if (usesLlmLocalizedWebsiteCopy(language)) {
    return GENERATING_LABELS[code] ?? "";
  }
  return GENERATING_LABELS.en!;
}

/** True when title is the in-progress session placeholder (not a real brand name). */
export function isGeneratingWebsitePlaceholderTitle(
  title?: string | null,
): boolean {
  const normalized = title?.trim();
  if (!normalized) return false;
  const lower = normalized.toLowerCase().replace(/…/g, "...");
  if (lower === "generating website..." || lower.includes("generating website")) {
    return true;
  }
  if (lower.includes("جاري إنشاء")) return true;
  return Object.values(GENERATING_LABELS).some((label) => {
    if (!label?.trim()) return false;
    const candidate = label.trim().toLowerCase().replace(/…/g, "...");
    return candidate === lower;
  });
}

export type PreviewBlockLabels = {
  features: string;
  services: string;
  gallery: string;
  testimonials: string;
  pricing: string;
  faq: string;
  contact: string;
  story: string;
  work: string;
  proof: string;
  premium: string;
  section: string;
  coreOffering: string;
  premiumTier: string;
  consultation: string;
  verifiedClient: string;
  starter: string;
  pro: string;
  enterprise: string;
  custom: string;
  privacy: string;
  terms: string;
  pages: string;
  legal: string;
  name: string;
  email: string;
  message: string;
};

const PREVIEW_BLOCK_LABELS: Record<string, PreviewBlockLabels> = {
  en: {
    features: "Features",
    services: "Services",
    gallery: "Gallery",
    testimonials: "Testimonials",
    pricing: "Pricing",
    faq: "FAQ",
    contact: "Contact",
    story: "Story",
    work: "Work",
    proof: "Proof",
    premium: "Premium",
    section: "Section",
    coreOffering: "Core offering",
    premiumTier: "Premium tier",
    consultation: "Consultation",
    verifiedClient: "Verified client",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    custom: "Custom",
    privacy: "Privacy",
    terms: "Terms",
    pages: "Pages",
    legal: "Legal",
    name: "Name",
    email: "Email",
    message: "Message",
  },
  ar: {
    features: "المميزات",
    services: "الخدمات",
    gallery: "المعرض",
    testimonials: "آراء العملاء",
    pricing: "الأسعار",
    faq: "الأسئلة الشائعة",
    contact: "تواصل",
    story: "قصتنا",
    work: "أعمالنا",
    proof: "شهادات",
    premium: "متميز",
    section: "قسم",
    coreOffering: "الخدمة الأساسية",
    premiumTier: "الباقة المميزة",
    consultation: "استشارة",
    verifiedClient: "عميل موثّق",
    starter: "أساسي",
    pro: "احترافي",
    enterprise: "مؤسسات",
    custom: "مخصص",
    privacy: "الخصوصية",
    terms: "الشروط",
    pages: "الصفحات",
    legal: "قانوني",
    name: "الاسم",
    email: "البريد",
    message: "الرسالة",
  },
  es: {
    features: "Características",
    services: "Servicios",
    gallery: "Galería",
    testimonials: "Testimonios",
    pricing: "Precios",
    faq: "Preguntas frecuentes",
    contact: "Contacto",
    story: "Historia",
    work: "Trabajos",
    proof: "Prueba social",
    premium: "Premium",
    section: "Sección",
    coreOffering: "Servicio principal",
    premiumTier: "Plan premium",
    consultation: "Consulta",
    verifiedClient: "Cliente verificado",
    starter: "Inicial",
    pro: "Pro",
    enterprise: "Empresa",
    custom: "Personalizado",
    privacy: "Privacidad",
    terms: "Términos",
    pages: "Páginas",
    legal: "Legal",
    name: "Nombre",
    email: "Correo",
    message: "Mensaje",
  },
  fr: {
    features: "Fonctionnalités",
    services: "Services",
    gallery: "Galerie",
    testimonials: "Témoignages",
    pricing: "Tarifs",
    faq: "FAQ",
    contact: "Contact",
    story: "Histoire",
    work: "Réalisations",
    proof: "Preuve sociale",
    premium: "Premium",
    section: "Section",
    coreOffering: "Offre principale",
    premiumTier: "Offre premium",
    consultation: "Consultation",
    verifiedClient: "Client vérifié",
    starter: "Débutant",
    pro: "Pro",
    enterprise: "Entreprise",
    custom: "Sur mesure",
    privacy: "Confidentialité",
    terms: "Conditions",
    pages: "Pages",
    legal: "Mentions légales",
    name: "Nom",
    email: "E-mail",
    message: "Message",
  },
  de: {
    features: "Funktionen",
    services: "Leistungen",
    gallery: "Galerie",
    testimonials: "Referenzen",
    pricing: "Preise",
    faq: "FAQ",
    contact: "Kontakt",
    story: "Geschichte",
    work: "Arbeiten",
    proof: "Social Proof",
    premium: "Premium",
    section: "Abschnitt",
    coreOffering: "Kernangebot",
    premiumTier: "Premium-Paket",
    consultation: "Beratung",
    verifiedClient: "Verifizierter Kunde",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    custom: "Individuell",
    privacy: "Datenschutz",
    terms: "AGB",
    pages: "Seiten",
    legal: "Rechtliches",
    name: "Name",
    email: "E-Mail",
    message: "Nachricht",
  },
  pt: {
    features: "Recursos",
    services: "Serviços",
    gallery: "Galeria",
    testimonials: "Depoimentos",
    pricing: "Preços",
    faq: "Perguntas frequentes",
    contact: "Contato",
    story: "História",
    work: "Trabalhos",
    proof: "Prova social",
    premium: "Premium",
    section: "Seção",
    coreOffering: "Oferta principal",
    premiumTier: "Plano premium",
    consultation: "Consulta",
    verifiedClient: "Cliente verificado",
    starter: "Inicial",
    pro: "Pro",
    enterprise: "Empresa",
    custom: "Personalizado",
    privacy: "Privacidade",
    terms: "Termos",
    pages: "Páginas",
    legal: "Legal",
    name: "Nome",
    email: "E-mail",
    message: "Mensagem",
  },
  it: {
    features: "Funzionalità",
    services: "Servizi",
    gallery: "Galleria",
    testimonials: "Testimonianze",
    pricing: "Prezzi",
    faq: "Domande frequenti",
    contact: "Contatti",
    story: "Storia",
    work: "Lavori",
    proof: "Prova sociale",
    premium: "Premium",
    section: "Sezione",
    coreOffering: "Offerta principale",
    premiumTier: "Piano premium",
    consultation: "Consulenza",
    verifiedClient: "Cliente verificato",
    starter: "Base",
    pro: "Pro",
    enterprise: "Enterprise",
    custom: "Personalizzato",
    privacy: "Privacy",
    terms: "Termini",
    pages: "Pagine",
    legal: "Legale",
    name: "Nome",
    email: "Email",
    message: "Messaggio",
  },
};

const EMPTY_PREVIEW_BLOCK_LABELS: PreviewBlockLabels = {
  features: "",
  services: "",
  gallery: "",
  testimonials: "",
  pricing: "",
  faq: "",
  contact: "",
  story: "",
  work: "",
  proof: "",
  premium: "",
  section: "",
  coreOffering: "",
  premiumTier: "",
  consultation: "",
  verifiedClient: "",
  starter: "",
  pro: "",
  enterprise: "",
  custom: "",
  privacy: "",
  terms: "",
  pages: "",
  legal: "",
  name: "",
  email: "",
  message: "",
};

/** Static preview block eyebrows / form labels — English only when language is English. */
export function getPreviewBlockLabels(
  language?: string | null,
): PreviewBlockLabels {
  const code = resolveLocaleFromLanguage(language).localeCode;
  if (usesLlmLocalizedWebsiteCopy(language)) {
    return PREVIEW_BLOCK_LABELS[code] ?? EMPTY_PREVIEW_BLOCK_LABELS;
  }
  return PREVIEW_BLOCK_LABELS.en!;
}

/** Localized section name for component selection (non-English never uses English titles). */
export function getSectionKindLabel(
  kind: string,
  language?: string | null,
): string {
  if (!usesLlmLocalizedWebsiteCopy(language)) {
    return "";
  }
  const ui = getComposeUiFallbacks(language);
  const labels = getStrategyFallbackLabels(language);
  switch (kind) {
    case "hero":
      return labels.sections[0] ?? "";
    case "services":
      return ui.navServices;
    case "features":
      return ui.navFeatures;
    case "pricing":
      return ui.navPricing;
    case "contact":
      return ui.navContact;
    case "testimonials":
      return labels.sections[2] ?? "";
    case "cta":
      return labels.ctas[0] ?? "";
    case "faq":
      return getPreviewBlockLabels(language).faq;
    case "gallery":
    case "gallery-experience":
      return getPreviewBlockLabels(language).gallery;
    case "booking":
      return labels.ctas[0] ?? "";
    case "maps":
      return ui.navContact;
    case "team":
      return labels.pages[1] ?? "";
    case "blog":
      return labels.pages[1] ?? "";
    default:
      return "";
  }
}

/**
 * Section label for previews / specs.
 * Non-English: never derive from component export names (e.g. "FeaturesModern" → "Features Modern").
 */
export function resolveSectionDisplayLabel(params: {
  componentId: string;
  language?: string | null;
  industryLabel?: string | null;
  contentLabel?: string | null;
}): string {
  if (params.contentLabel?.trim()) return params.contentLabel.trim();
  if (usesLlmLocalizedWebsiteCopy(params.language)) {
    return params.industryLabel?.trim() || "";
  }
  if (params.industryLabel?.trim()) return params.industryLabel.trim();
  return params.componentId
    .replace(/([A-Z])/g, " $1")
    .replace(/^ /, "")
    .trim();
}
