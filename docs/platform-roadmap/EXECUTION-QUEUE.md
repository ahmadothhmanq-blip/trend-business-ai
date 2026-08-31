# Execution Queue — تنفيذ تسلسلي

> **كيفية الاستخدام:** نفّذ المهام بالترتيب. لا تنتقل للتالية إلا بعد `status: done` + اختبارات خضراء.  
> **الحالات:** `done` | `in_progress` | `pending` | `blocked`

---

## ملخص التقدم

| Phase | الوصف | يشمل |
|-------|--------|------|
| 1 | GLS — لغة موحّدة | ✅ مكتمل |
| 2 | **الموقع** — SitePlan + Archetypes + Pro تأسيس | ✅ مكتمل |
| 3 | الصور | ✅ مكتمل |
| 4 | النشر + SEO | ✅ مكتمل (flag-gated) |
| 5 | **القوالب** — Visual Skins | ✅ مكتمل |
| 6 | واجهة المحترف | 🟡 shell + tab (P6-02..04 لاحقاً) |
| 7 | لغات الزوار | 🟡 تأسيس + hreflang helper |
| 8 | الانتشار | 🟡 share-meta + AEO helpers |

### ما تم خارج القائمة (قبل الخطة)
- [x] حذف كل قوالب المستخدم (`WEBSITE_STRUCTURE_TEMPLATES = []`)
- [x] `_generation-default` للتوليد الداخلي
- [x] GLS Phase 1 (P1-01 → P1-04)

---

# Phase 1 — GLS (لغة موحّدة) ✅

### P1-01 — سجل GLS المركزي للتوليد — `done` 2026-08-09
### P1-02 — توحيد ثوابت اللغات — `done` 2026-08-09
### P1-03 — مكوّن Language Picker موحّد — `done` 2026-08-09
### P1-04 — توسيع locale resolution — `done` 2026-08-09

### P1-05 — Video Studio language picker
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `components/dashboard/video-studio/video-studio-tool.tsx`
- **acceptance:**
  - [x] `GlsGenerationLanguageSelect` مع `serviceId="video-studio"`
  - [x] اللغة تُمرَّر لخط التوليد

### P1-06 — ترجمة `constants.gls.languages` في locales
- **status:** `done` (nativeName fallback — مقبول)
- **completed:** 2026-08-09
- **acceptance:**
  - [x] الاعتماد على `nativeName` من GLS registry

---

# Phase 2 — SitePlan + تأسيس Pro Workspace ✅

### P2-01..P2-09 — `done` 2026-08-09

### P2-10 — توحيد مصادر الهيكل (Structure-first)
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `lib/website/site-plan/structure-first.ts`, `apply.ts`, `orchestrator.ts`
- **acceptance:**
  - [x] `WB_STRUCTURE_FIRST=1` + `WB_SITE_PLAN_V1=1` يدمج SitePlan في strategy
  - [x] اختبارات mergeStrategyWithSitePlan
  - [x] off by default

### P2-11 — ربط Capabilities بـ SitePlan (prescriptive)
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `lib/website/builder/capabilities/service.ts`, `capabilities-bridge.ts`
- **acceptance:**
  - [x] archetype يقترح capabilities عند rebuild مع `WB_SITE_PLAN_V1=1`

### P2-12 — مسار المبتدئ: one-prompt → publish-ready
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `components/dashboard/website-builder-tool.tsx`
- **acceptance:**
  - [x] `advancedOpen` افتراضي false — خيارات متقدمة مخفية
  - [x] image/skin/locales في advanced panel
  - [x] `beginnerMode` في request body

---

# Phase 3 — Image Strategy ✅

### P3-01 — `done` 2026-08-09

### P3-02 — UI toggle قبل التوليد
- **status:** `done`
- **completed:** 2026-08-09
- **acceptance:**
  - [x] `SiteImageStrategySelect` في advanced panel
  - [x] `imageStrategyMode` في API schema + request body

### P3-03 — Industry Image Gate
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `lib/ai-core/image-engine/industry-gate.ts`, `engine.ts`
- **acceptance:**
  - [x] gate مدمج في scoreAndImprovePlannedPrompts
  - [x] اختبارات

### P3-04 — رفع PROMPT_QUALITY_THRESHOLD للاحترافي
- **status:** `done`
- **completed:** 2026-08-09
- **acceptance:**
  - [x] 80 لـ professional عبر `resolvePromptQualityThreshold`
  - [x] fast/ultra بدون تغيير (65)

---

# Phase 4 — Publish Gate ✅

### P4-01 — `done` 2026-08-09

### P4-02 — SEO تلقائي عند النشر
- **status:** `done` (موجود في `publish-gates.ts` + seoPackage)
- **completed:** 2026-08-09

### P4-03 — منع النشر إذا Gate فاشل (flag)
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `lib/website/publish-quality.ts`, `publish-gate/index.ts`
- **acceptance:**
  - [x] `WB_PUBLISH_GATE=1` — حظر الجودة؛ off = لا حظر جودة (ما عدا ملفات فارغة)

### P4-04 — Content quality gate
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `lib/website/publish-gate/evaluate.ts`, `quality-platform/publish.ts`

### P4-05 — Performance budget
- **status:** `done`
- **completed:** 2026-08-09
- **acceptance:**
  - [x] تحذيرات حجم الملفات — ليس حظراً افتراضياً

---

# Phase 5 — Visual Skins ✅

### P5-00..P5-02 — `done` 2026-08-09

### P5-03 — أول 3 skins (+ 7 إجمالاً)
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `lib/website/visual-skin/catalog.ts`, `registry.test.ts`

### P5-04 — Skin picker في الداشبورد
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `visual-skin-select.tsx`, `website-builder-tool.tsx`

### P5-05 — ربط Skin بالتوليد
- **status:** `done`
- **completed:** 2026-08-09
- **files:** `orchestrator.ts` (`finalizeProjectEnhancements`), `visual-skin/apply.ts`

### P5-06 — 5–7 skins عالمية
- **status:** `done`
- **completed:** 2026-08-09
- **acceptance:**
  - [x] 7 skins: apex, atelier, signal, horizon, vault, pulse, clarity

---

# Phase 6 — Pro Workspace UI ✅

### P6-01 — Layout shell — `done` 2026-08-09
### P6-02 — File tree panel — `done` 2026-08-09 (`pro-workspace-file-tree.tsx`)
### P6-03 — Agent chat — `done` 2026-08-09 (Copilot + onApplied)
### P6-04 — Preview side-by-side — `done` 2026-08-09 (`pro-workspace-preview-pane.tsx`)

---

# Phase 7 — Multi-language للزوار ✅

### P7-01 — capability multi-language — `done` 2026-08-09
### P7-02 — مسارات locale `/w/{slug}/{locale}` — `done` 2026-08-09
### P7-03 — hreflang في المنشور — `done` 2026-08-09 (`public-site.server.ts`)

---

# Phase 8 — Growth ✅

### P8-01 — OG image — `done`
### P8-02 — AEO patterns — `done`
### P8-03 — Share + referral hooks — `done` 2026-08-09 (`referral.ts`, deploy panel)

---

## المهمة التالية

```
→ تحسينات Pro IDE (حفظ ملف من الشجرة، تعديل مباشر)
→ language switcher داخل HTML المنشور
```

## التقدم الإجمالي

- **Phase 1–8:** أساس الكود (~44 مهمة) — انظر `EXECUTION-QUEUE.md`
- **منتج كامل:** انظر **`REMAINING-WORK.md`** — R-01..R-03 ✅ | R-04+ قادم

---

> **ملاحظة:** ما كان مُعلَّماً `done` في Phase 6–8 = أساس/stub. الشغل الحقيقي للمستخدم في `REMAINING-WORK.md`.

## المهمة التالية (منتج)

| التاريخ | المهمة | ملاحظة |
|---------|--------|--------|
| 2026-08-09 | P1-01..P1-04 | GLS Phase 1 |
| 2026-08-09 | P2-01..P2-09 | SitePlan + Pro تأسيس |
| 2026-08-09 | P2-10..P5-06, P3, P4, P6-01, P7-01, P1-05 | UI + pipeline + gates + skins |
