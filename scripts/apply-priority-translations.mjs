#!/usr/bin/env node
/**
 * Apply real translations for priority locales (ar, zh-CN, es, fr, de).
 * Run after `npm run sync:locales` when en.json keys change.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "locales");
const PRIORITY = ["ar", "zh-CN", "es", "fr", "de"];

const PATCHES = {
  ar: {
    common: {
      filter: "تصفية",
      copy: "نسخ",
      share: "مشاركة",
      close: "إغلاق",
    },
    auth: {
      backToHome: "← العودة للرئيسية",
    },
    errors: {
      api: {
        INVALID_INPUT: "إدخال غير صالح",
        NOT_FOUND: "غير موجود",
        UNAUTHORIZED: "غير مصرح",
        FORBIDDEN: "محظور",
        RATE_LIMITED: "طلبات كثيرة جداً",
        SERVER_ERROR: "حدث خطأ ما",
        MIGRATION_REQUIRED: "مطلوب ترحيل قاعدة البيانات",
        GENERATION_NOT_FOUND: "التوليد غير موجود",
        VIDEO_NOT_FOUND: "الفيديو غير موجود",
        TEMPLATE_NOT_FOUND: "القالب غير موجود",
        CHECKOUT_FAILED: "فشل الدفع",
        PAYMENT_INCOMPLETE: "تعذر إكمال الدفع",
      },
    },
    footer: {
      product: "المنتج",
      company: "الشركة",
      legal: "قانوني",
      privacy: "الخصوصية",
      terms: "الشروط",
      allRightsReserved: "جميع الحقوق محفوظة.",
    },
  },
  "zh-CN": {
    common: {
      appName: "Trend Business AI",
      save: "保存",
      cancel: "取消",
      loading: "加载中...",
      close: "关闭",
      search: "搜索",
      settings: "设置",
      getStarted: "立即开始",
      learnMore: "了解更多",
      back: "返回",
      submit: "提交",
      delete: "删除",
      edit: "编辑",
      export: "导出",
      filter: "筛选",
      copy: "复制",
    },
    nav: {
      dashboard: "仪表板",
      websiteBuilder: "网站构建器",
      webAppBuilder: "应用构建器",
      videoStudio: "视频工作室",
      contentStudio: "内容工作室",
      marketingStrategy: "营销策略",
      aiAgents: "AI 智能体",
      settings: "设置",
      signIn: "登录",
      about: "关于我们",
      contact: "联系我们",
    },
    auth: {
      welcomeBack: "欢迎回来",
      signInDescription: "登录您的 Trend Business AI 账户",
      email: "邮箱",
      password: "密码",
      signIn: "登录",
      signUp: "注册",
      backToHome: "← 返回首页",
      createAccount: "创建账户",
      forgotPassword: "忘记密码？",
    },
    errors: {
      generic: "出了点问题，请重试。",
      notFound: "页面未找到",
      unauthorized: "您需要登录才能访问此页面。",
      forbidden: "您没有权限访问此资源。",
      api: {
        INVALID_INPUT: "输入无效",
        NOT_FOUND: "未找到",
        UNAUTHORIZED: "未授权",
        FORBIDDEN: "禁止访问",
        RATE_LIMITED: "请求过于频繁",
        SERVER_ERROR: "出了点问题",
        MIGRATION_REQUIRED: "需要数据库迁移",
        GENERATION_NOT_FOUND: "未找到生成记录",
        VIDEO_NOT_FOUND: "未找到视频",
        TEMPLATE_NOT_FOUND: "未找到模板",
        CHECKOUT_FAILED: "结账失败",
        PAYMENT_INCOMPLETE: "无法完成付款",
      },
    },
    footer: {
      product: "产品",
      company: "公司",
      legal: "法律",
      privacy: "隐私政策",
      terms: "服务条款",
      allRightsReserved: "保留所有权利。",
    },
  },
  es: {
    common: {
      save: "Guardar",
      cancel: "Cancelar",
      loading: "Cargando...",
      close: "Cerrar",
      search: "Buscar",
      settings: "Configuración",
      getStarted: "Empezar",
      back: "Atrás",
      delete: "Eliminar",
      filter: "Filtrar",
      copy: "Copiar",
    },
    nav: {
      dashboard: "Panel",
      websiteBuilder: "Constructor web",
      webAppBuilder: "Constructor de apps",
      videoStudio: "Estudio de video",
      contentStudio: "Estudio de contenido",
      marketingStrategy: "Marketing",
      aiAgents: "Agentes IA",
      settings: "Configuración",
      signIn: "Iniciar sesión",
      about: "Acerca de",
      contact: "Contacto",
    },
    auth: {
      welcomeBack: "Bienvenido de nuevo",
      signInDescription: "Inicia sesión en tu cuenta de Trend Business AI",
      email: "Correo electrónico",
      password: "Contraseña",
      signIn: "Iniciar sesión",
      signUp: "Registrarse",
      backToHome: "← Volver al inicio",
    },
    errors: {
      generic: "Algo salió mal. Inténtalo de nuevo.",
      notFound: "Página no encontrada",
      unauthorized: "Debes iniciar sesión para acceder a esta página.",
      forbidden: "No tienes permiso para acceder a este recurso.",
      api: {
        INVALID_INPUT: "Entrada no válida",
        NOT_FOUND: "No encontrado",
        UNAUTHORIZED: "No autorizado",
        FORBIDDEN: "Prohibido",
        RATE_LIMITED: "Demasiadas solicitudes",
        SERVER_ERROR: "Algo salió mal",
        MIGRATION_REQUIRED: "Se requiere migración de base de datos",
        GENERATION_NOT_FOUND: "Generación no encontrada",
        VIDEO_NOT_FOUND: "Video no encontrado",
        TEMPLATE_NOT_FOUND: "Plantilla no encontrada",
        CHECKOUT_FAILED: "Error en el pago",
        PAYMENT_INCOMPLETE: "No se pudo completar el pago",
      },
    },
    footer: {
      product: "Producto",
      company: "Empresa",
      legal: "Legal",
      privacy: "Privacidad",
      terms: "Términos",
      allRightsReserved: "Todos los derechos reservados.",
    },
  },
  fr: {
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      loading: "Chargement...",
      close: "Fermer",
      search: "Rechercher",
      settings: "Paramètres",
      getStarted: "Commencer",
      back: "Retour",
      delete: "Supprimer",
      filter: "Filtrer",
      copy: "Copier",
    },
    nav: {
      dashboard: "Tableau de bord",
      websiteBuilder: "Créateur de sites",
      webAppBuilder: "Créateur d'apps",
      videoStudio: "Studio vidéo",
      contentStudio: "Studio de contenu",
      marketingStrategy: "Marketing",
      aiAgents: "Agents IA",
      settings: "Paramètres",
      signIn: "Connexion",
      about: "À propos",
      contact: "Contact",
    },
    auth: {
      welcomeBack: "Bon retour",
      signInDescription: "Connectez-vous à votre compte Trend Business AI",
      email: "E-mail",
      password: "Mot de passe",
      signIn: "Se connecter",
      signUp: "S'inscrire",
      backToHome: "← Retour à l'accueil",
    },
    errors: {
      generic: "Une erreur s'est produite. Veuillez réessayer.",
      notFound: "Page introuvable",
      unauthorized: "Vous devez être connecté pour accéder à cette page.",
      forbidden: "Vous n'avez pas la permission d'accéder à cette ressource.",
      api: {
        INVALID_INPUT: "Entrée invalide",
        NOT_FOUND: "Introuvable",
        UNAUTHORIZED: "Non autorisé",
        FORBIDDEN: "Interdit",
        RATE_LIMITED: "Trop de requêtes",
        SERVER_ERROR: "Une erreur s'est produite",
        MIGRATION_REQUIRED: "Migration de base de données requise",
        GENERATION_NOT_FOUND: "Génération introuvable",
        VIDEO_NOT_FOUND: "Vidéo introuvable",
        TEMPLATE_NOT_FOUND: "Modèle introuvable",
        CHECKOUT_FAILED: "Échec du paiement",
        PAYMENT_INCOMPLETE: "Paiement non complété",
      },
    },
    footer: {
      product: "Produit",
      company: "Entreprise",
      legal: "Mentions légales",
      privacy: "Confidentialité",
      terms: "Conditions",
      allRightsReserved: "Tous droits réservés.",
    },
  },
  de: {
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      loading: "Wird geladen...",
      close: "Schließen",
      search: "Suchen",
      settings: "Einstellungen",
      getStarted: "Loslegen",
      back: "Zurück",
      delete: "Löschen",
      filter: "Filtern",
      copy: "Kopieren",
    },
    nav: {
      dashboard: "Dashboard",
      websiteBuilder: "Website-Builder",
      webAppBuilder: "App-Builder",
      videoStudio: "Video-Studio",
      contentStudio: "Content-Studio",
      marketingStrategy: "Marketing",
      aiAgents: "KI-Agenten",
      settings: "Einstellungen",
      signIn: "Anmelden",
      about: "Über uns",
      contact: "Kontakt",
    },
    auth: {
      welcomeBack: "Willkommen zurück",
      signInDescription: "Melden Sie sich bei Ihrem Trend Business AI-Konto an",
      email: "E-Mail",
      password: "Passwort",
      signIn: "Anmelden",
      signUp: "Registrieren",
      backToHome: "← Zur Startseite",
    },
    errors: {
      generic: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      notFound: "Seite nicht gefunden",
      unauthorized: "Sie müssen angemeldet sein, um auf diese Seite zuzugreifen.",
      forbidden: "Sie haben keine Berechtigung für diese Ressource.",
      api: {
        INVALID_INPUT: "Ungültige Eingabe",
        NOT_FOUND: "Nicht gefunden",
        UNAUTHORIZED: "Nicht autorisiert",
        FORBIDDEN: "Verboten",
        RATE_LIMITED: "Zu viele Anfragen",
        SERVER_ERROR: "Etwas ist schiefgelaufen",
        MIGRATION_REQUIRED: "Datenbankmigration erforderlich",
        GENERATION_NOT_FOUND: "Generierung nicht gefunden",
        VIDEO_NOT_FOUND: "Video nicht gefunden",
        TEMPLATE_NOT_FOUND: "Vorlage nicht gefunden",
        CHECKOUT_FAILED: "Checkout fehlgeschlagen",
        PAYMENT_INCOMPLETE: "Zahlung konnte nicht abgeschlossen werden",
      },
    },
    footer: {
      product: "Produkt",
      company: "Unternehmen",
      legal: "Rechtliches",
      privacy: "Datenschutz",
      terms: "AGB",
      allRightsReserved: "Alle Rechte vorbehalten.",
    },
  },
};

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch ?? base;
  const out = { ...(base && typeof base === "object" ? base : {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

for (const code of PRIORITY) {
  const file = path.join(LOCALES_DIR, `${code}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`Skip missing locale: ${code}`);
    continue;
  }
  const current = JSON.parse(fs.readFileSync(file, "utf8"));
  const patch = PATCHES[code];
  const merged = deepMerge(current, patch);
  fs.writeFileSync(file, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Updated priority translations: ${code}`);
}

console.log("Priority locale patches applied.");
