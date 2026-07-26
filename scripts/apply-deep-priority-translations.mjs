#!/usr/bin/env node
/**
 * Apply deep priority-locale translations for dashboard + AI products + business modules.
 * Run after `npm run sync:locales`.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "locales");
const EN = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en.json"), "utf8"));
const PRIORITY = ["ar", "zh-CN", "es", "fr", "de"];

const WORKSPACE_COMMON = {
  ar: {
    sections: { create: "إنشاء", editor: "المحرر", preview: "معاينة", history: "السجل", templates: "القوالب", settings: "الإعدادات", export: "تصدير", assets: "الأصول" },
    actions: { generate: "توليد", regenerate: "إعادة التوليد", save: "حفظ", export: "تصدير", download: "تحميل", preview: "معاينة", publish: "نشر", duplicate: "نسخ", delete: "حذف", favorite: "إضافة للمفضلة", unfavorite: "إزالة من المفضلة", improveWithAi: "تحسين بالذكاء الاصطناعي", applyTemplate: "تطبيق القالب", clearTemplate: "مسح القالب", browseTemplates: "تصفح القوالب", viewHistory: "عرض السجل", copyToClipboard: "نسخ" },
    status: { idle: "جاهز", generating: "جاري التوليد…", building: "جاري البناء…", success: "مكتمل", error: "فشل", saved: "محفوظ" },
  },
  "zh-CN": {
    sections: { create: "创建", editor: "编辑器", preview: "预览", history: "历史", templates: "模板", settings: "设置", export: "导出", assets: "资源" },
    actions: { generate: "生成", regenerate: "重新生成", save: "保存", export: "导出", download: "下载", preview: "预览", publish: "发布", duplicate: "复制", delete: "删除", favorite: "收藏", unfavorite: "取消收藏", improveWithAi: "AI 优化", applyTemplate: "应用模板", clearTemplate: "清除模板", browseTemplates: "浏览模板", viewHistory: "查看历史", copyToClipboard: "复制" },
    status: { idle: "就绪", generating: "生成中…", building: "构建中…", success: "完成", error: "失败", saved: "已保存" },
  },
  es: {
    sections: { create: "Crear", editor: "Editor", preview: "Vista previa", history: "Historial", templates: "Plantillas", settings: "Configuración", export: "Exportar", assets: "Recursos" },
    actions: { generate: "Generar", regenerate: "Regenerar", save: "Guardar", export: "Exportar", download: "Descargar", preview: "Vista previa", publish: "Publicar", duplicate: "Duplicar", delete: "Eliminar", favorite: "Añadir a favoritos", unfavorite: "Quitar de favoritos", improveWithAi: "Mejorar con IA", applyTemplate: "Aplicar plantilla", clearTemplate: "Borrar plantilla", browseTemplates: "Explorar plantillas", viewHistory: "Ver historial", copyToClipboard: "Copiar" },
    status: { idle: "Listo", generating: "Generando…", building: "Construyendo…", success: "Completado", error: "Error", saved: "Guardado" },
  },
  fr: {
    sections: { create: "Créer", editor: "Éditeur", preview: "Aperçu", history: "Historique", templates: "Modèles", settings: "Paramètres", export: "Exporter", assets: "Ressources" },
    actions: { generate: "Générer", regenerate: "Régénérer", save: "Enregistrer", export: "Exporter", download: "Télécharger", preview: "Aperçu", publish: "Publier", duplicate: "Dupliquer", delete: "Supprimer", favorite: "Ajouter aux favoris", unfavorite: "Retirer des favoris", improveWithAi: "Améliorer avec l'IA", applyTemplate: "Appliquer le modèle", clearTemplate: "Effacer le modèle", browseTemplates: "Parcourir les modèles", viewHistory: "Voir l'historique", copyToClipboard: "Copier" },
    status: { idle: "Prêt", generating: "Génération…", building: "Construction…", success: "Terminé", error: "Échec", saved: "Enregistré" },
  },
  de: {
    sections: { create: "Erstellen", editor: "Editor", preview: "Vorschau", history: "Verlauf", templates: "Vorlagen", settings: "Einstellungen", export: "Exportieren", assets: "Assets" },
    actions: { generate: "Generieren", regenerate: "Neu generieren", save: "Speichern", export: "Exportieren", download: "Herunterladen", preview: "Vorschau", publish: "Veröffentlichen", duplicate: "Duplizieren", delete: "Löschen", favorite: "Zu Favoriten", unfavorite: "Aus Favoriten entfernen", improveWithAi: "Mit KI verbessern", applyTemplate: "Vorlage anwenden", clearTemplate: "Vorlage löschen", browseTemplates: "Vorlagen durchsuchen", viewHistory: "Verlauf anzeigen", copyToClipboard: "Kopieren" },
    status: { idle: "Bereit", generating: "Wird generiert…", building: "Wird erstellt…", success: "Abgeschlossen", error: "Fehlgeschlagen", saved: "Gespeichert" },
  },
};

const PRODUCT_TITLES = {
  ar: {
    websiteBuilder: { title: "منشئ المواقع", subtitle: "أنشئ وطوّر مواقعك بالذكاء الاصطناعي" },
    webappBuilder: { title: "منشئ التطبيقات", subtitle: "أنشئ تطبيقات ويب بالذكاء الاصطناعي" },
    videoStudio: { title: "استوديو الفيديو", subtitle: "أنشئ وحرر مشاريع الفيديو بالذكاء الاصطناعي" },
    contentStudio: { title: "استوديو المحتوى", subtitle: "أنشئ محتوى احترافي بالذكاء الاصطناعي" },
    marketing: { dashboard: { totalCampaigns: "إجمالي الحملات", active: "نشطة", plannedDraft: "مخططة / مسودة", leads: "العملاء المحتملون" } },
    crm: { title: "إدارة علاقات العملاء" },
    erp: { title: "تخطيط موارد المؤسسة" },
    bi: { title: "ذكاء الأعمال" },
    cyber: { title: "الأمن السيبراني" },
    platform: { title: "المنصة", billing: { currentPlan: "الخطة الحالية:", billingHistory: "سجل الفوترة" }, settings: { language: { title: "اللغة والإعدادات المحلية" } } },
  },
  "zh-CN": {
    websiteBuilder: { title: "网站构建器", subtitle: "使用 AI 创建和优化网站" },
    webappBuilder: { title: "应用构建器", subtitle: "使用 AI 创建 Web 应用" },
    videoStudio: { title: "视频工作室", subtitle: "使用 AI 创建和编辑视频项目" },
    contentStudio: { title: "内容工作室", subtitle: "使用 AI 创建专业内容" },
    marketing: { dashboard: { totalCampaigns: "活动总数", active: "进行中", plannedDraft: "计划中 / 草稿", leads: "潜在客户" } },
    crm: { title: "客户关系管理" },
    erp: { title: "企业资源规划" },
    bi: { title: "商业智能" },
    cyber: { title: "网络安全" },
    platform: { title: "平台", billing: { currentPlan: "当前方案：", billingHistory: "账单历史" }, settings: { language: { title: "语言和区域设置" } } },
  },
  es: {
    websiteBuilder: { title: "Constructor web", subtitle: "Crea y perfecciona sitios web con IA" },
    webappBuilder: { title: "Constructor de apps", subtitle: "Crea aplicaciones web con IA" },
    videoStudio: { title: "Estudio de video", subtitle: "Crea y edita proyectos de video con IA" },
    contentStudio: { title: "Estudio de contenido", subtitle: "Crea contenido profesional con IA" },
    marketing: { dashboard: { totalCampaigns: "Campañas totales", active: "Activas", plannedDraft: "Planificadas / borrador", leads: "Leads" } },
    crm: { title: "CRM" },
    erp: { title: "ERP" },
    bi: { title: "Inteligencia de negocio" },
    cyber: { title: "Ciberseguridad" },
    platform: { title: "Plataforma", billing: { currentPlan: "Plan actual:", billingHistory: "Historial de facturación" }, settings: { language: { title: "Idioma y configuración regional" } } },
  },
  fr: {
    websiteBuilder: { title: "Créateur de sites", subtitle: "Créez et affinez des sites web avec l'IA" },
    webappBuilder: { title: "Créateur d'apps", subtitle: "Créez des applications web avec l'IA" },
    videoStudio: { title: "Studio vidéo", subtitle: "Créez et modifiez des vidéos avec l'IA" },
    contentStudio: { title: "Studio de contenu", subtitle: "Créez du contenu professionnel avec l'IA" },
    marketing: { dashboard: { totalCampaigns: "Campagnes totales", active: "Actives", plannedDraft: "Planifiées / brouillon", leads: "Prospects" } },
    crm: { title: "CRM" },
    erp: { title: "ERP" },
    bi: { title: "Intelligence d'affaires" },
    cyber: { title: "Cybersécurité" },
    platform: { title: "Plateforme", billing: { currentPlan: "Forfait actuel :", billingHistory: "Historique de facturation" }, settings: { language: { title: "Langue et paramètres régionaux" } } },
  },
  de: {
    websiteBuilder: { title: "Website-Builder", subtitle: "Websites mit KI erstellen und verfeinern" },
    webappBuilder: { title: "App-Builder", subtitle: "Web-Apps mit KI erstellen" },
    videoStudio: { title: "Video-Studio", subtitle: "Video-Projekte mit KI erstellen und bearbeiten" },
    contentStudio: { title: "Content-Studio", subtitle: "Professionelle Inhalte mit KI erstellen" },
    marketing: { dashboard: { totalCampaigns: "Kampagnen gesamt", active: "Aktiv", plannedDraft: "Geplant / Entwurf", leads: "Leads" } },
    crm: { title: "CRM" },
    erp: { title: "ERP" },
    bi: { title: "Business Intelligence" },
    cyber: { title: "Cybersicherheit" },
    platform: { title: "Plattform", billing: { currentPlan: "Aktueller Plan:", billingHistory: "Abrechnungsverlauf" }, settings: { language: { title: "Sprache und Region" } } },
  },
};

const PAGE_KEYS = ["dashboard", "websiteBuilder", "appBuilder", "videoStudio", "contentStudio", "marketing", "crm", "erp", "bi", "cybersecurity", "billing", "settings"];
const PAGE_TITLES = {
  ar: { dashboard: "لوحة التحكم", websiteBuilder: "منشئ المواقع", appBuilder: "منشئ التطبيقات", videoStudio: "استوديو الفيديو", contentStudio: "استوديو المحتوى", marketing: "التسويق", crm: "إدارة العملاء", erp: "تخطيط الموارد", bi: "ذكاء الأعمال", cybersecurity: "الأمن السيبراني", billing: "الفوترة", settings: "الإعدادات" },
  "zh-CN": { dashboard: "仪表板", websiteBuilder: "网站构建器", appBuilder: "应用构建器", videoStudio: "视频工作室", contentStudio: "内容工作室", marketing: "营销", crm: "客户关系管理", erp: "企业资源规划", bi: "商业智能", cybersecurity: "网络安全", billing: "账单", settings: "设置" },
  es: { dashboard: "Panel", websiteBuilder: "Constructor web", appBuilder: "Constructor de apps", videoStudio: "Estudio de video", contentStudio: "Estudio de contenido", marketing: "Marketing", crm: "CRM", erp: "ERP", bi: "Inteligencia de negocio", cybersecurity: "Ciberseguridad", billing: "Facturación", settings: "Configuración" },
  fr: { dashboard: "Tableau de bord", websiteBuilder: "Créateur de sites", appBuilder: "Créateur d'apps", videoStudio: "Studio vidéo", contentStudio: "Studio de contenu", marketing: "Marketing", crm: "CRM", erp: "ERP", bi: "Intelligence d'affaires", cybersecurity: "Cybersécurité", billing: "Facturation", settings: "Paramètres" },
  de: { dashboard: "Dashboard", websiteBuilder: "Website-Builder", appBuilder: "App-Builder", videoStudio: "Video-Studio", contentStudio: "Content-Studio", marketing: "Marketing", crm: "CRM", erp: "ERP", bi: "Business Intelligence", cybersecurity: "Cybersicherheit", billing: "Abrechnung", settings: "Einstellungen" },
};

const PRODUCT_WORKSPACES = [
  "websiteBuilder",
  "webappBuilder",
  "videoStudio",
  "contentStudio",
  "logoDesigner",
  "brandIdentity",
  "landingPageBuilder",
  "marketAnalysis",
  "aiAgents",
];

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch ?? base;
  const out = { ...(base && typeof base === "object" ? base : {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function setPath(obj, pathKeys, value) {
  let cur = obj;
  for (let i = 0; i < pathKeys.length - 1; i++) {
    const k = pathKeys[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[pathKeys[pathKeys.length - 1]] = deepMerge(cur[pathKeys[pathKeys.length - 1]], value);
}

for (const code of PRIORITY) {
  const file = path.join(LOCALES_DIR, `${code}.json`);
  const current = JSON.parse(fs.readFileSync(file, "utf8"));
  const patch = {};

  for (const key of PAGE_KEYS) {
    if (current.pages?.[key] && PAGE_TITLES[code]?.[key]) {
      setPath(patch, ["pages", key], { title: PAGE_TITLES[code][key] });
    }
  }

  for (const product of PRODUCT_WORKSPACES) {
    if (EN.workspaces?.[product]) {
      setPath(patch, ["workspaces", product], WORKSPACE_COMMON[code]);
      const titles = PRODUCT_TITLES[code]?.[product];
      if (titles) setPath(patch, ["workspaces", product], titles);
    }
  }

  for (const workspaceModule of ["crm", "erp", "bi", "cyber", "platform", "marketing"]) {
    const titles = PRODUCT_TITLES[code]?.[workspaceModule];
    if (titles && EN.workspaces?.[workspaceModule]) {
      setPath(patch, ["workspaces", workspaceModule], titles);
    }
  }

  if (PRODUCT_TITLES[code]?.marketing) {
    setPath(patch, ["workspaces", "marketing"], PRODUCT_TITLES[code].marketing);
  }

  setPath(patch, ["workspaces", "marketing", "adsPanel"], {
    description: {
      ar: "حملات Google Ads وMeta Ads — لا نشر مباشر بعد.",
      "zh-CN": "Google Ads 和 Meta Ads 草稿活动 — 暂不支持实时发布。",
      es: "Borradores de Google Ads y Meta Ads — sin publicación en vivo aún.",
      fr: "Campagnes brouillon Google Ads et Meta — pas de publication en direct pour l'instant.",
      de: "Google Ads- und Meta-Ads-Entwürfe — noch kein Live-Publishing.",
    }[code],
    empty: {
      ar: "لا توجد مسودات إعلانات بعد. أنشئ من حملة.",
      "zh-CN": "暂无广告草稿。从营销活动创建。",
      es: "Aún no hay borradores. Créelos desde una campaña.",
      fr: "Aucun brouillon publicitaire. Créez-en depuis une campagne.",
      de: "Noch keine Anzeigenentwürfe. Aus einer Kampagne erstellen.",
    }[code],
  });

  setPath(patch, ["workspaces", "marketing", "calendarPanel"], {
    description: {
      ar: "يشمل أحداث التسويق وجداول استوديو المحتوى ووسائل التواصل للقراءة فقط.",
      "zh-CN": "包含营销事件以及内容工作室和社交媒体的只读日程。",
      es: "Incluye eventos de marketing y calendarios de solo lectura de Content Studio y redes sociales.",
      fr: "Événements marketing et calendriers en lecture seule de Content Studio et réseaux sociaux.",
      de: "Marketing-Events plus schreibgeschützte Content-Studio- und Social-Media-Zeitpläne.",
    }[code],
    empty: {
      ar: "لا توجد أحداث في التقويم بعد.",
      "zh-CN": "暂无日历事件。",
      es: "Aún no hay eventos en el calendario.",
      fr: "Aucun événement au calendrier pour l'instant.",
      de: "Noch keine Kalenderereignisse.",
    }[code],
  });

  const merged = deepMerge(current, patch);
  fs.writeFileSync(file, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Deep translations applied: ${code}`);
}

console.log("Deep priority locale translations complete.");
