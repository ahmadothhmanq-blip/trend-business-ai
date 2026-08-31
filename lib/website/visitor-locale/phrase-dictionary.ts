/** Common website UI phrases — English source → localized label. */
export const SITE_PHRASE_DICTIONARY: Record<string, Record<string, string>> = {
  Home: {
    Arabic: "الرئيسية",
    French: "Accueil",
    Spanish: "Inicio",
    German: "Startseite",
    Italian: "Home",
    Portuguese: "Início",
    Dutch: "Home",
    Turkish: "Ana Sayfa",
    Japanese: "ホーム",
    Korean: "홈",
    Russian: "Главная",
    Hindi: "होम",
    "Simplified Chinese": "首页",
    "Traditional Chinese": "首頁",
  },
  About: {
    Arabic: "من نحن",
    French: "À propos",
    Spanish: "Acerca de",
    German: "Über uns",
    Italian: "Chi siamo",
    Portuguese: "Sobre",
    Dutch: "Over ons",
    Turkish: "Hakkımızda",
    Japanese: "会社概要",
    Korean: "소개",
    Russian: "О нас",
    Hindi: "हमारे बारे में",
    "Simplified Chinese": "关于我们",
    "Traditional Chinese": "關於我們",
  },
  Contact: {
    Arabic: "اتصل بنا",
    French: "Contact",
    Spanish: "Contacto",
    German: "Kontakt",
    Italian: "Contatti",
    Portuguese: "Contato",
    Dutch: "Contact",
    Turkish: "İletişim",
    Japanese: "お問い合わせ",
    Korean: "문의",
    Russian: "Контакты",
    Hindi: "संपर्क",
    "Simplified Chinese": "联系我们",
    "Traditional Chinese": "聯絡我們",
  },
  Services: {
    Arabic: "خدماتنا",
    French: "Services",
    Spanish: "Servicios",
    German: "Leistungen",
    Italian: "Servizi",
    Portuguese: "Serviços",
    Dutch: "Diensten",
    Turkish: "Hizmetler",
    Japanese: "サービス",
    Korean: "서비스",
    Russian: "Услуги",
    Hindi: "सेवाएं",
    "Simplified Chinese": "服务",
    "Traditional Chinese": "服務",
  },
  "Get Started": {
    Arabic: "ابدأ الآن",
    French: "Commencer",
    Spanish: "Empezar",
    German: "Loslegen",
    Italian: "Inizia",
    Portuguese: "Começar",
    Dutch: "Aan de slag",
    Turkish: "Başlayın",
    Japanese: "始める",
    Korean: "시작하기",
    Russian: "Начать",
    Hindi: "शुरू करें",
    "Simplified Chinese": "立即开始",
    "Traditional Chinese": "立即開始",
  },
  "Learn More": {
    Arabic: "اعرف المزيد",
    French: "En savoir plus",
    Spanish: "Saber más",
    German: "Mehr erfahren",
    Italian: "Scopri di più",
    Portuguese: "Saiba mais",
    Dutch: "Meer info",
    Turkish: "Daha fazla",
    Japanese: "詳しく見る",
    Korean: "자세히",
    Russian: "Подробнее",
    Hindi: "और जानें",
    "Simplified Chinese": "了解更多",
    "Traditional Chinese": "了解更多",
  },
  Products: {
    Arabic: "منتجاتنا",
    French: "Produits",
    Spanish: "Productos",
    German: "Produkte",
    Italian: "Prodotti",
    Portuguese: "Produtos",
    Dutch: "Producten",
    Turkish: "Ürünler",
    Japanese: "製品",
    Korean: "제품",
    Russian: "Продукты",
    Hindi: "उत्पाद",
    "Simplified Chinese": "产品",
    "Traditional Chinese": "產品",
  },
  Pricing: {
    Arabic: "الأسعار",
    French: "Tarifs",
    Spanish: "Precios",
    German: "Preise",
    Italian: "Prezzi",
    Portuguese: "Preços",
    Dutch: "Prijzen",
    Turkish: "Fiyatlandırma",
    Japanese: "料金",
    Korean: "가격",
    Russian: "Цены",
    Hindi: "मूल्य",
    "Simplified Chinese": "定价",
    "Traditional Chinese": "定價",
  },
};

export function translateSitePhrase(
  phrase: string,
  targetLanguage: string,
): string | null {
  const entry = SITE_PHRASE_DICTIONARY[phrase];
  if (!entry) return null;
  return entry[targetLanguage] ?? null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace known UI phrases in visible text (longest first to avoid partial matches). */
export function translateVisiblePhrases(
  html: string,
  targetLanguage: string,
): string {
  let result = html;
  const phrases = Object.keys(SITE_PHRASE_DICTIONARY).sort(
    (a, b) => b.length - a.length,
  );

  for (const phrase of phrases) {
    const translated = translateSitePhrase(phrase, targetLanguage);
    if (!translated || translated === phrase) continue;
    const pattern = new RegExp(
      `(>\\s*)${escapeRegex(phrase)}(\\s*<)`,
      "gi",
    );
    result = result.replace(pattern, `$1${translated}$2`);
  }
  return result;
}

/** Reverse map common Arabic UI labels back to English for primary `/w/slug`. */
export function translateArabicPhrasesToEnglish(html: string): string {
  let result = html;
  const pairs = Object.entries(SITE_PHRASE_DICTIONARY)
    .map(([english, locales]) => ({ english, arabic: locales.Arabic }))
    .filter((pair) => pair.arabic && pair.arabic !== pair.english)
    .sort((a, b) => b.arabic!.length - a.arabic!.length);

  for (const { english, arabic } of pairs) {
    const pattern = new RegExp(
      `(>\\s*)${escapeRegex(arabic!)}(\\s*<)`,
      "gi",
    );
    result = result.replace(pattern, `$1${english}$2`);
  }
  return result;
}
