/**
 * Deterministic App Studio Chat engine — clarify → plan → approve → build.
 * Keeps pre-build conversation cheap (no LLM required); Copilot handles post-build edits.
 */

import {
  getWebappTypeForTemplate,
  WEBAPP_TYPES,
} from "@/lib/constants/webapp-builder";

export type StudioChatRole = "user" | "assistant" | "system";

export type StudioChatTurn = {
  id: string;
  role: StudioChatRole;
  content: string;
  createdAt: string;
};

export type StudioChatVertical =
  | "crm"
  | "booking"
  | "ecommerce"
  | "healthcare"
  | "finance"
  | "custom";

export type StudioChatPlan = {
  title: string;
  vertical: StudioChatVertical;
  templateId: string;
  appType: string;
  language: string;
  summary: string;
  screens: string[];
  features: string[];
  readyToBuild: boolean;
};

export type StudioChatState = {
  turns: StudioChatTurn[];
  vertical: StudioChatVertical | null;
  language: string | null;
  users: string | null;
  mustHave: string | null;
  plan: StudioChatPlan | null;
  phase: "intro" | "clarify" | "plan" | "ready";
};

export type StudioChatReply = {
  state: StudioChatState;
  assistantMessage: string;
  plan: StudioChatPlan | null;
};

const VERTICAL_HINTS: Array<{
  id: StudioChatVertical;
  templateId: string;
  keys: string[];
  screens: string[];
  features: string[];
  titleEn: string;
  titleAr: string;
}> = [
  {
    id: "crm",
    templateId: "crm",
    keys: ["crm", "sales", "pipeline", "deal", "contact", "مبيعات", "عملاء", "صفقات", "علاقات"],
    screens: ["Dashboard", "Contacts", "Deals", "Companies", "Activities"],
    features: ["auth", "dashboard", "database", "roles"],
    titleEn: "Sales CRM",
    titleAr: "نظام مبيعات CRM",
  },
  {
    id: "booking",
    templateId: "booking",
    keys: ["booking", "appointment", "reservation", "calendar", "salon", "حجز", "مواعيد", "جدول"],
    screens: ["Dashboard", "Calendar", "Bookings", "Services", "Customers"],
    features: ["auth", "dashboard", "database", "calendar"],
    titleEn: "Bookings & Scheduling",
    titleAr: "نظام حجوزات ومواعيد",
  },
  {
    id: "ecommerce",
    templateId: "ecommerce",
    keys: ["store", "shop", "ecommerce", "cart", "checkout", "متجر", "سلة", "منتجات", "طلبات"],
    screens: ["Store", "Cart", "Products", "Orders", "Admin"],
    features: ["auth", "dashboard", "database", "catalog"],
    titleEn: "Online Store",
    titleAr: "متجر إلكتروني",
  },
  {
    id: "healthcare",
    templateId: "healthcare",
    keys: ["clinic", "health", "patient", "medical", "hospital", "عيادة", "مرضى", "طبي", "مستشفى"],
    screens: ["Dashboard", "Patients", "Appointments", "Records", "Staff"],
    features: ["auth", "dashboard", "database", "roles"],
    titleEn: "Clinic & Patients",
    titleAr: "عيادة ومرضى",
  },
  {
    id: "finance",
    templateId: "finance",
    keys: ["finance", "accounting", "ledger", "budget", "invoice", "محاسبة", "حسابات", "فواتير", "ميزانية"],
    screens: ["Dashboard", "Accounts", "Transactions", "Budgets", "Reports"],
    features: ["auth", "dashboard", "database", "reports"],
    titleEn: "Accounting & Finance",
    titleAr: "محاسبة ومالية",
  },
];

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function detectVertical(text: string): StudioChatVertical | null {
  const lower = text.toLowerCase();
  for (const entry of VERTICAL_HINTS) {
    if (entry.keys.some((k) => lower.includes(k.toLowerCase()))) return entry.id;
  }
  return null;
}

function verticalMeta(id: StudioChatVertical) {
  return VERTICAL_HINTS.find((v) => v.id === id) ?? null;
}

function appTypeForVertical(vertical: StudioChatVertical): string {
  const meta = verticalMeta(vertical);
  if (!meta) return WEBAPP_TYPES[0]?.id ?? "custom";
  return getWebappTypeForTemplate(meta.templateId);
}

function makeTurn(role: StudioChatRole, content: string): StudioChatTurn {
  return {
    id: `turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createStudioChatState(languageHint?: string | null): StudioChatState {
  return {
    turns: [],
    vertical: null,
    language: languageHint?.trim() || null,
    users: null,
    mustHave: null,
    plan: null,
    phase: "intro",
  };
}

export function studioChatIntroMessage(language?: string | null): string {
  const ar = language?.toLowerCase().includes("arab") || language === "ar";
  if (ar) {
    return "مرحبًا — صف لي التطبيق الذي تحتاجه كأنك تشرح لشريك عمل. مثال: نظام مبيعات للمتابعة مع العملاء والصفقات. سأطرح أسئلة قصيرة ثم أعرض خطة للموافقة قبل البناء.";
  }
  return "Hi — describe the business app you need like you would brief a partner. Example: a sales CRM to track contacts and deals. I will ask a few short questions, then show a plan for your approval before building.";
}

/** Prefill vertical from onboarding gallery (skip the “which vertical?” question). */
export function seedStudioChatVertical(
  state: StudioChatState,
  vertical: StudioChatVertical,
  language?: string | null,
): StudioChatReply {
  const meta = verticalMeta(vertical);
  if (!meta) {
    return {
      state,
      assistantMessage: studioChatIntroMessage(language ?? state.language),
      plan: null,
    };
  }
  const ar =
    language?.toLowerCase().includes("arab") ||
    language === "ar" ||
    state.language?.toLowerCase().includes("arab");
  const next: StudioChatState = {
    ...state,
    vertical,
    language: state.language || (ar ? "Arabic" : "English"),
    phase: "clarify",
  };
  const title = ar ? meta.titleAr : meta.titleEn;
  const assistantMessage = ar
    ? `ممتاز — اخترت «${title}». من سيستخدمه يوميًا؟`
    : `Great — you picked “${title}”. Who will use it daily?`;
  next.turns = [...next.turns, makeTurn("assistant", assistantMessage)];
  return { state: next, assistantMessage, plan: null };
}

function buildPlan(state: StudioChatState, latestUserText: string): StudioChatPlan {
  const ar = isArabic(latestUserText) || state.language?.toLowerCase().includes("arab");
  const vertical = state.vertical ?? "custom";
  const meta = verticalMeta(vertical);
  const title = meta
    ? ar
      ? meta.titleAr
      : meta.titleEn
    : ar
      ? "تطبيق أعمال مخصص"
      : "Custom business app";
  const templateId = meta?.templateId ?? "";
  const screens = meta?.screens ?? ["Dashboard", "Records", "Settings"];
  const features = meta?.features ?? ["auth", "dashboard", "database"];
  const lang = state.language || (ar ? "Arabic" : "English");
  const users = state.users || (ar ? "فريق العمل" : "business team");
  const must = state.mustHave || (ar ? "لوحة تحكم وسجلات أساسية" : "dashboard and core records");

  const summary = ar
    ? `نبني «${title}» لـ ${users}. يشمل: ${screens.join("، ")}. التركيز: ${must}. اللغة: ${lang}. بعد الموافقة نولّد التطبيق والمعاينة، ويمكنك التعديل من نفس الشات.`
    : `We will build “${title}” for ${users}. Includes: ${screens.join(", ")}. Focus: ${must}. Language: ${lang}. After you approve, we generate the app and preview — you can keep editing in this same chat.`;

  return {
    title,
    vertical,
    templateId,
    appType: appTypeForVertical(vertical),
    language: lang,
    summary,
    screens,
    features: [...features],
    readyToBuild: true,
  };
}

function missingSlotQuestion(state: StudioChatState, ar: boolean): string | null {
  if (!state.vertical) {
    return ar
      ? "ما نوع النشاط الأقرب؟ مبيعات، حجوزات، متجر، عيادة، أو محاسبة؟"
      : "Which fits best: sales CRM, bookings, store, clinic, or accounting?";
  }
  if (!state.users) {
    return ar
      ? "من سيستخدم التطبيق يوميًا؟ (مثال: فريق المبيعات، الاستقبال، المحاسب)"
      : "Who will use it daily? (e.g. sales team, front desk, accountant)";
  }
  if (!state.mustHave) {
    return ar
      ? "ما أهم شيء يجب أن يعمل من اليوم الأول؟"
      : "What must work on day one?";
  }
  return null;
}

function extractUsers(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < 2) return null;
  if (/^(مبيعات|حجوزات|متجر|عيادة|محاسبة|crm|booking|store|clinic|finance)$/i.test(trimmed)) {
    return null;
  }
  return trimmed.slice(0, 120);
}

function extractMustHave(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < 2) return null;
  return trimmed.slice(0, 160);
}

/** Process one user message and advance the studio chat state. */
export function advanceStudioChat(
  state: StudioChatState,
  userMessage: string,
): StudioChatReply {
  const text = userMessage.trim();
  const ar = isArabic(text) || state.language?.toLowerCase().includes("arab");
  const next: StudioChatState = {
    ...state,
    turns: [...state.turns, makeTurn("user", text)],
  };

  if (!next.language) {
    next.language = ar ? "Arabic" : "English";
  }

  const detected = detectVertical(text);
  if (detected && !next.vertical) next.vertical = detected;

  if (next.phase === "intro" || next.phase === "clarify") {
    next.phase = "clarify";

    // Slot filling from successive answers
    if (next.vertical && !next.users && state.vertical) {
      const users = extractUsers(text);
      if (users) next.users = users;
    } else if (next.vertical && next.users && !next.mustHave && state.users) {
      const must = extractMustHave(text);
      if (must) next.mustHave = must;
    } else if (next.vertical && !next.users) {
      // First message may already include users/must-have; keep clarifying
      const maybeUsers = extractUsers(text);
      if (maybeUsers && maybeUsers.length > 8 && !detectVertical(text)) {
        next.users = maybeUsers;
      }
    }

    const question = missingSlotQuestion(next, ar);
    if (question) {
      const assistantMessage = question;
      next.turns = [...next.turns, makeTurn("assistant", assistantMessage)];
      return { state: next, assistantMessage, plan: null };
    }

    const plan = buildPlan(next, text);
    next.plan = plan;
    next.phase = "plan";
    const assistantMessage = ar
      ? `هذه خطة البناء المقترحة:\n\n${plan.summary}\n\nاكتب «موافق» أو Approve للبدء، أو صف تعديلك على الخطة.`
      : `Here is the proposed build plan:\n\n${plan.summary}\n\nType “Approve” to build, or tell me what to change.`;
    next.turns = [...next.turns, makeTurn("assistant", assistantMessage)];
    return { state: next, assistantMessage, plan };
  }

  if (next.phase === "plan" || next.phase === "ready") {
    const normalized = text.trim().toLowerCase();
    const approve =
      /^(موافق|نعم|ابني|ابدأ)$/i.test(text.trim()) ||
      /^(approve|yes|build|go|ok|okay)\b/i.test(normalized) ||
      /\b(approve|build it)\b/i.test(normalized) ||
      /(موافق|ابدأ البناء)/.test(text);

    if (approve) {
      const plan = next.plan ?? buildPlan(next, text);
      next.plan = { ...plan, readyToBuild: true };
      next.phase = "ready";
      const assistantMessage = ar
        ? "تم — نبدأ بناء التطبيق الآن. بعد الانتهاء يمكنك طلب تعديلات من نفس الشات."
        : "Great — starting the build now. When it finishes, keep requesting edits in this same chat.";
      next.turns = [...next.turns, makeTurn("assistant", assistantMessage)];
      return { state: next, assistantMessage, plan: next.plan };
    }

    // Treat as plan refinement
    if (detected) next.vertical = detected;
    const must = extractMustHave(text);
    if (must) next.mustHave = must;
    const plan = buildPlan(next, text);
    next.plan = plan;
    next.phase = "plan";
    const assistantMessage = ar
      ? `حدّثت الخطة:\n\n${plan.summary}\n\nاكتب «موافق» للمتابعة.`
      : `Updated plan:\n\n${plan.summary}\n\nType “Approve” to continue.`;
    next.turns = [...next.turns, makeTurn("assistant", assistantMessage)];
    return { state: next, assistantMessage, plan };
  }

  const assistantMessage = ar
    ? "صف تطبيقك أو اختر القطاع: مبيعات، حجوزات، متجر، عيادة، محاسبة."
    : "Describe your app or pick a vertical: sales, bookings, store, clinic, accounting.";
  next.turns = [...next.turns, makeTurn("assistant", assistantMessage)];
  return { state: next, assistantMessage, plan: next.plan };
}

export function isStudioChatApproveReady(reply: StudioChatReply): boolean {
  return reply.state.phase === "ready" && Boolean(reply.plan?.readyToBuild);
}
