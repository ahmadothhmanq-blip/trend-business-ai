/**
 * Arabic production section extras — nav, CTAs, section titles, testimonials, FAQs.
 */

import type { IndustryExtras } from "@/lib/ai-core/content/production-content";

const AR_BUSINESS: IndustryExtras = {
  heroEyebrow: "حضور احترافي",
  brandTagline: "رسائل واضحة وصفحات موجهة للتحويل تكسب الثقة بسرعة.",
  serviceTitles: ["الخدمات الأساسية", "الإثبات والعملية", "متابعة سريعة"],
  featureTitles: [
    "عرض واضح",
    "تقديم راقٍ",
    "مسارات تحويل",
    "تواصل موثوق",
  ],
  featureBodies: [
    "اشرح ما تقدمه ولمن تخدم دون مصطلحات معقدة.",
    "خطوط ومسافات وصور تعكس مؤسسة راسخة.",
    "دعوات للإجراء توجه الزائر للخطوة التالية.",
    "نماذج ومسارات تواصل تُجاب بسرعة.",
  ],
  testimonials: [
    {
      quote: "أخيراً نبدو بمستوى الاحتراف الذي نقدمه فعلاً.",
      name: "أندريا ويلز",
      role: "مالكة، ويلز للاستشارات",
    },
    {
      quote: "زادت الاستفسارات بعد إعادة التصميم — الرسالة أوضح.",
      name: "كيفن تشاو",
      role: "شريك إداري",
    },
    {
      quote: "العملاء يعلقون على الموقع قبل الاجتماعات الآن.",
      name: "روث أوكونكو",
      role: "مستشارة",
    },
  ],
  faqs: [
    {
      q: "متى يمكننا الإطلاق؟",
      a: "تُطلق معظم النسخ الأولى بسرعة بمجرد توافق الرسالة والأصول.",
    },
    {
      q: "هل يمكننا تحديث المحتوى بأنفسنا؟",
      a: "نعم — أقسام منظمة تجعل التعديل المستمر سهلاً.",
    },
    {
      q: "هل تدعمون المواقع ثنائية اللغة؟",
      a: "يمكن ضبط خيارات اللغة أثناء التوليد والتحسين.",
    },
  ],
  galleryItems: [
    { title: "لحظة العلامة", tag: "هوية" },
    { title: "قصة الخدمة", tag: "عرض" },
    { title: "الفريق", tag: "أشخاص" },
    { title: "العملية", tag: "تسليم" },
    { title: "النتائج", tag: "إثبات" },
    { title: "التواصل", tag: "الخطوة التالية" },
  ],
  pricing: [
    {
      name: "أساسي",
      price: "١٬٢٠٠ ر.س",
      blurb: "جاهز للإطلاق",
      features: ["صفحات أساسية", "مسار تواصل", "تجربة جوال"],
      featured: false,
    },
    {
      name: "نمو",
      price: "٢٬٨٠٠ ر.س",
      blurb: "موصى به",
      features: ["أقسام موسعة", "كتل إثبات", "نظام دعوات للإجراء"],
      featured: true,
    },
    {
      name: "مخصص",
      price: "عرض سعر",
      blurb: "احتياجات معقدة",
      features: ["مكونات مخصصة", "تكاملات", "دعم مستمر"],
      featured: false,
    },
  ],
  servicesEyebrow: "الخدمات",
  servicesTitle: "ما نقدمه لعملائنا",
  servicesSubtitle: "عروض بلغة بسيطة ونتائج واضحة — لموقع أعمال راقٍ.",
  featuresEyebrow: "لماذا نحن",
  featuresTitle: "حضور يكسب الثقة",
  featuresSubtitle: "مسافات وخطوط وتسلسل بصري بمستوى احترافي للعلامات الجادة.",
  testimonialsEyebrow: "العملاء",
  testimonialsTitle: "أعمال رفعت معيارها",
  testimonialsSubtitle: "نتائج محددة من فرق الخدمات المهنية.",
  faqEyebrow: "الأسئلة الشائعة",
  faqTitle: "أسئلة شائعة",
  faqSubtitle: "التوقيت والتعديلات واللغات.",
  pricingEyebrow: "الباقات",
  pricingTitle: "خيارات تعاون بسيطة",
  pricingSubtitle: "ابدأ بخفة أو تعمق — كلاهما يبدو راقياً.",
  galleryEyebrow: "الاستوديو",
  galleryTitle: "لحظات من العمل",
  gallerySubtitle: "إثبات بصري يبدو تحريرياً ومدروساً.",
  ctaEyebrow: "الخطوة التالية",
  ctaTitle: "مستعد لتبدو راسخاً أونلاين؟",
  ctaBody: "شاركنا أهدافك — نقدم مساراً واضحاً وجدولاً زمنياً.",
  contactTitle: "اطلب عرض سعر",
  contactSubtitle: "أخبرنا عن عملك وسنرد بسرعة.",
  navLinks: [
    { href: "#services", label: "الخدمات" },
    { href: "#features", label: "لماذا نحن" },
    { href: "#pricing", label: "الباقات" },
    { href: "#testimonials", label: "العملاء" },
    { href: "#contact", label: "تواصل" },
  ],
  showcaseBullets: [
    "خدمات موضحة بالنتائج لا بالمصطلحات",
    "نقاط إثبات تقلل تردد العملاء الجدد",
    "مسارات تواصل مصممة للمتابعة السريعة",
  ],
};

/** Per-industry overrides layered on AR_BUSINESS for nav and section chrome. */
const AR_INDUSTRY_OVERRIDES: Record<string, Partial<IndustryExtras>> = {
  saas: {
    heroEyebrow: "منصة SaaS حديثة",
    brandTagline: "برمجيات للوضوح والسرعة والنمو القابل للقياس.",
    serviceTitles: ["سير العمل", "الأتمتة", "التقارير والرؤى"],
    servicesEyebrow: "المنصة",
    servicesTitle: "كل ما يحتاجه فريقك للتحرك أسرع",
    featuresEyebrow: "القدرات",
    featuresTitle: "مصمم كمنتج SaaS راقٍ",
    navLinks: [
      { href: "#features", label: "المنتج" },
      { href: "#services", label: "الحلول" },
      { href: "#pricing", label: "الأسعار" },
      { href: "#testimonials", label: "العملاء" },
      { href: "#contact", label: "تواصل" },
    ],
    ctaTitle: "مستعد لرؤيته ببياناتك؟",
    contactTitle: "تحدث مع مختصي المنتج",
  },
  tourism: {
    heroEyebrow: "تجارب سفر منتقاة",
    brandTagline: "رحلات مخططة بخبرة محلية وحجز سهل.",
    serviceTitles: ["جولات مرشدة", "برامج مخصصة", "كونسيرج سفر"],
    servicesTitle: "رحلات مصممة بعناية",
    featuresTitle: "لماذا تسافر معنا",
    navLinks: [
      { href: "#services", label: "الجولات" },
      { href: "#features", label: "الوجهات" },
      { href: "#gallery", label: "المعرض" },
      { href: "#testimonials", label: "آراء المسافرين" },
      { href: "#contact", label: "احجز" },
    ],
    ctaTitle: "مستعد لخطط رحلتك؟",
    contactTitle: "تحدث مع مستشار سفر",
  },
  restaurant: {
    heroEyebrow: "تجربة طعام راقية",
    brandTagline: "مطبخ موسمي وضيافة دافئة ومائدة تستحق الحجز.",
    serviceTitles: ["قائمة الطهاة", "قاعات خاصة", "تيك أواي وتموين"],
    servicesTitle: "تجربة طعام متكاملة",
    navLinks: [
      { href: "#services", label: "القائمة" },
      { href: "#gallery", label: "المعرض" },
      { href: "#testimonials", label: "آراء الضيوف" },
      { href: "#contact", label: "احجز" },
    ],
    ctaTitle: "احجز مائدتك الليلة",
    contactTitle: "احجز طاولة",
  },
  "real-estate": {
    heroEyebrow: "عقارات موثقة",
    brandTagline: "عروض واضحة وإرشاد محلي حتى تسليم المفاتيح.",
    serviceTitles: ["شراء وبيع", "معاينات", "إيجار واستثمار"],
    servicesTitle: "خدمات عقارية شاملة",
    navLinks: [
      { href: "#services", label: "العروض" },
      { href: "#features", label: "لماذا نحن" },
      { href: "#gallery", label: "المعرض" },
      { href: "#contact", label: "استفسار" },
    ],
    ctaTitle: "ابحث عن منزلك القادم",
    contactTitle: "تحدث مع وكيل عقاري",
  },
  ecommerce: {
    heroEyebrow: "تسوق منتقى",
    brandTagline: "مجموعات وعروض ودفع سلس من أول نقرة.",
    serviceTitles: ["مجموعات مميزة", "دفع آمن", "دعم الطلبات"],
    servicesTitle: "تسوق بثقة",
    navLinks: [
      { href: "#services", label: "المتجر" },
      { href: "#features", label: "لماذا نحن" },
      { href: "#pricing", label: "العروض" },
      { href: "#contact", label: "تواصل" },
    ],
    ctaTitle: "اكتشف المجموعة الجديدة",
    contactTitle: "مساعدة في الطلبات",
  },
  automotive: {
    heroEyebrow: "معرض مركبات",
    brandTagline: "مخزون شفاف وتجربة قيادة وتمويل واضح.",
    serviceTitles: ["مخزون جديد", "تجربة قيادة", "صيانة وتمويل"],
    servicesTitle: "تجربة شراء سلسة",
    navLinks: [
      { href: "#services", label: "المخزون" },
      { href: "#features", label: "لماذا نحن" },
      { href: "#gallery", label: "المعرض" },
      { href: "#contact", label: "استفسار" },
    ],
    ctaTitle: "اعثر على مركبتك",
    contactTitle: "احجز تجربة قيادة",
  },
  clinic: {
    heroEyebrow: "رعاية صحية",
    brandTagline: "أطباء خبراء وخطط علاج واضحة وحجز يحترم وقتك.",
    serviceTitles: ["استشارات", "رعاية وقائية", "متابعة مستمرة"],
    servicesTitle: "خدماتنا الطبية",
    navLinks: [
      { href: "#services", label: "الخدمات" },
      { href: "#features", label: "لماذا نحن" },
      { href: "#testimonials", label: "آراء المرضى" },
      { href: "#contact", label: "احجز" },
    ],
    ctaTitle: "احجز موعدك",
    contactTitle: "حجز موعد",
  },
  education: {
    heroEyebrow: "تعليم عملي",
    brandTagline: "برامج مبنية على النتائج مع مدربين خبراء.",
    serviceTitles: ["دورات مهنية", "تعلم مرن", "دعم القبول"],
    servicesTitle: "برامجنا التعليمية",
    navLinks: [
      { href: "#services", label: "البرامج" },
      { href: "#features", label: "لماذا نحن" },
      { href: "#testimonials", label: "قصص النجاح" },
      { href: "#contact", label: "قدّم" },
    ],
    ctaTitle: "ابدأ رحلة التعلم",
    contactTitle: "استفسار عن القبول",
  },
  agency: {
    heroEyebrow: "وكالة إبداعية",
    brandTagline: "استراتيجية وتصميم وحملات بمظهر راقٍ وأداء.",
    serviceTitles: ["هوية العلامة", "حملات رقمية", "تسليم تعاوني"],
    servicesTitle: "ما نقدمه للعلامات",
    navLinks: [
      { href: "#services", label: "الخدمات" },
      { href: "#features", label: "الأعمال" },
      { href: "#testimonials", label: "العملاء" },
      { href: "#contact", label: "ابدأ مشروعاً" },
    ],
    ctaTitle: "لننمّي علامتك",
    contactTitle: "ابدأ مشروعاً",
  },
};

function mergeExtras(
  base: IndustryExtras,
  override?: Partial<IndustryExtras>,
): IndustryExtras {
  if (!override) return base;
  return {
    ...base,
    ...override,
    navLinks: override.navLinks ?? base.navLinks,
    testimonials: override.testimonials ?? base.testimonials,
    faqs: override.faqs ?? base.faqs,
    galleryItems: override.galleryItems ?? base.galleryItems,
    pricing: override.pricing ?? base.pricing,
    showcaseBullets: override.showcaseBullets ?? base.showcaseBullets,
    serviceTitles: override.serviceTitles ?? base.serviceTitles,
    featureTitles: override.featureTitles ?? base.featureTitles,
    featureBodies: override.featureBodies ?? base.featureBodies,
  };
}

export function getArabicExtras(industryId: string): IndustryExtras {
  return mergeExtras(AR_BUSINESS, AR_INDUSTRY_OVERRIDES[industryId]);
}
