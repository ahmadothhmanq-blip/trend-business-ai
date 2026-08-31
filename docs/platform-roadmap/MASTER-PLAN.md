# Master Plan — Trend Business AI Platform

> **الغرض:** وثيقة واحدة تجمع **كل شيء**: الموقع، القوالب، اللغات، المحترفين، الصور، SEO، الانتشار، وكل الخدمات.  
> **التنفيذ:** خطوة بخطوة عبر [`EXECUTION-QUEUE.md`](./EXECUTION-QUEUE.md) — مهمة واحدة 100% ثم التالية.

---

## فهرس شامل — كل موضوع حكينا عنه

| الموضوع | أين في الخطة | Phase |
|---------|--------------|-------|
| **لغة التوليد (30+ لغة)** | GLS موحّد لكل الخدمات | 1 ✅ |
| **لغة واجهة المنصة** | `locales/*.json` (موجود) | — |
| **Bilingual (عربي+إنجليزي)** | Website + Landing | 1 ✅ |
| **لغة زوار الموقع (multi-lang)** | مبدّل لغات / `/[locale]` | 7 |
| **الموقع = SitePlan** | industry, sections, tools, pages | 2 |
| **Site Archetypes** | عقارات، SaaS، مطعم، متجر… | 2 |
| **مسار المبتدئ** | prompt → جاهز للنشر | 2 + موجود |
| **مسار المحترف** | IDE + Agent (تأسيس ثم UI) | 2 تأسيس → 6 UI |
| **حذف القوالب القديمة** | صفر templates للمستخدم | ✅ تم |
| **التوليد بدون قالب** | `_generation-default` | ✅ تم |
| **Visual Skins (قوالب شكل فقط)** | 5–7 skins عالمية | 5 |
| **القالب لا يتحكم بالموقع المنشور** | skin في الداشبورد فقط | 5 |
| **Structure-first** | `WB_STRUCTURE_FIRST` | 2 |
| **استراتيجية الصور** | with / without / لاحقاً | 3 |
| **Industry Image Gate** | لا صور خاطئة للصناعة | 3 |
| **جودة الصور الاحترافية** | threshold 80 | 3 |
| **Publish Gate** | SEO + جودة + a11y قبل النشر | 4 |
| **SEO تلقائي** | meta, schema, sitemap | 4 |
| **الظهور بمحركات البحث** | Publish Gate + SitePlan | 4 |
| **AI Search (AEO/GEO)** | structured data + محتوى | 4 + 8 |
| **الانتشار الفيروسي** | OG, مشاركة, referral | 8 |
| **Capabilities (24 أداة)** | booking, blog, CRM… | 2 (ضمن SitePlan) |
| **Copilot / Agent** | موجود — يتوسع في Pro | 6 |
| **Video / Content / App** | نفس GLS للغة | 1 ✅ |
| **Content quality gate** | لا نصوص AI عامة | 4 |
| **RTL عربي ممتاز** | GLS + typography | 1 ✅ + 7 |
| **أداء (Core Web Vitals)** | performance budget | 4 |

---

## الرؤية

منصة عالمية حيث:

1. **أي شخص** يولّد موقعاً/محتوى/فيديو **بلغته** (30+ لغة)
2. **المبتدئ:** يكتب "اعملي موقع لشركة عقارات" → جاهز للنشر
3. **المحترف:** واجهة IDE + Agent (مستوحاة من Cursor — ليس نسخاً)
4. **الموقع المنشور** يظهر في محركات البحث وAI Search
5. **كل الخدمات** (Website, Video, Content, App…) تستخدم نفس نظام اللغة

---

## المبادئ المعمارية

| المبدأ | المعنى |
|--------|--------|
| **Site owns structure** | SitePlan يحدد الصناعة، الأقسام، الأدوات، الصور — ليس القالب |
| **Templates = skins only** | القوالب شكل فقط (ألوان، خطوط، shells) — تُختار في الداشبورد فقط |
| **Engine ≠ UI** | المحرك واحد؛ واجهة المبتدئ وواجهة المحترف طبقتان فوقه |
| **GLS مركزي** | لغة واحدة لكل الخدمات — `lib/language-platform` |
| **No latency regression** | ميزات جديدة خلف flags (`WB_*`) حتى تثبت الاستقرار |
| **Sequential execution** | لا نبدأ مهمة قبل إكمال سابقتها 100% |

---

## الطبقات

```text
┌─────────────────────────────────────────────────────────┐
│  Platform UI (locales/*.json) — واجهة الداشبورد        │
├─────────────────────────────────────────────────────────┤
│  GLS — لغة التوليد لكل الخدمات                          │
├─────────────────────────────────────────────────────────┤
│  SitePlan — هيكل الموقع (archetype, sections, tools)   │
├─────────────────────────────────────────────────────────┤
│  VisualSkin — مظهر فقط (لاحقاً: 5–7 skins عالمية)      │
├─────────────────────────────────────────────────────────┤
│  Generation Engine — orchestrator, copilot, files        │
├─────────────────────────────────────────────────────────┤
│  Publish Gate — SEO + أداء + جودة قبل النشر              │
├─────────────────────────────────────────────────────────┤
│  Growth — OG tags, مشاركة، AEO/GEO, referral             │
└─────────────────────────────────────────────────────────┘
```

---

## مساران للمستخدم (Website Builder)

| | مبتدئ | محترف |
|---|--------|--------|
| **الحالة** | موجود (`website-builder-tool`) | تأسيس فقط — UI لاحقاً |
| **التجربة** | prompt → موقع كامل | IDE + ملفات + Agent |
| **المحرك** | مشترك | مشترك |
| **التأسيس** | `WorkspaceMode: beginner` (default) | `WorkspaceMode: pro` + SitePlan + file contracts |

---

## القوالب (Templates) — بالتفصيل

### ما تم ✅
| البند | الحالة |
|-------|--------|
| حذف كل القوالب القديمة (بما فيها Bold) | ✅ |
| `WEBSITE_STRUCTURE_TEMPLATES = []` | ✅ (structure catalog stays empty; SitePlan owns structure) |
| التوليد عبر `_generation-default` داخلياً | ✅ |
| Marketplace يعرض الحزم المثبّتة من `templates/website` | ✅ (20 V2 packages) |
| القالب البصري = VisualSkin (فلسفة `WB_STRUCTURE_FIRST`) | موثّق |

### ما سيُنفَّذ (Phase 5)
| البند | الوصف |
|-------|--------|
| **VisualSkin type** | tokens + typography + section shells فقط |
| **5–7 skins عالمية** | Apex, Atelier, Signal… (أسماء مؤقتة) |
| **Skin picker** | في الداشبورد فقط — لا يظهر للزائر كـ "template" |
| **فصل تام عن SitePlan** | Skin يغيّر الشكل؛ SitePlan يغيّر المحتوى والهيكل |

```text
SitePlan (ماذا يُبنى)  +  VisualSkin (كيف يبدو)  =  موقع نهائي
     ↑                          ↑
  Phase 2                   Phase 5
```

---

## الموقع (Site) — بالتفصيل

### طبقة SitePlan (Phase 2)
| يملكها SitePlan | لا يملكها القالب |
|-----------------|------------------|
| الصناعة / archetype | الألوان والخطوط |
| ترتيب الأقسام | شكل الـ shell فقط |
| الصفحات (Home, Pricing…) | |
| الأدوات (booking, blog, CRM…) | |
| استراتيجية الصور | |
| لغة المحتوى (عبر GLS) | |

### مسار المبتدئ
```text
"اعملي موقع لشركة عقارات"
        ↓
كشف archetype = real-estate
        ↓
SitePlan (أقسام + أدوات + صور)
        ↓
توليد كامل → معاينة → نشر
```

### مسار المحترف (لاحقاً — Phase 6)
```text
نفس SitePlan + نفس المحرك
        ↓
واجهة IDE (ملفات + محرر + Agent)
        ↓
تعديلات دقيقة + iterations
```

---

## اللغات

| الطبقة | الحالة |
|--------|--------|
| **واجهة المنصة** | 30+ locale في `locales/*.json` |
| **لغة التوليد (GLS)** | ✅ Phase 1 — `lib/language-platform/generation/options.ts` |
| **Bilingual** | Website + Landing فقط |
| **زوار الموقع (multi-lang)** | لاحقاً — ميزة `multi-language` منفصلة |

---

## SEO والانتشار

| عنصر | الوصف |
|------|--------|
| **تقني** | meta, schema.org, sitemap, hreflang — تلقائي عند النشر |
| **جودة** | SitePlan يمنع المحتوى العام (أساس الانتشار) |
| **أداء** | Core Web Vitals budget |
| **AI Search** | AEO/GEO عبر structured data |
| **فيروسي** | مشاركة سهلة + OG image + جودة المخرجات |

---

## Flags البيئة (تدريجي)

| Flag | الغرض |
|------|--------|
| `WB_SITE_PLAN_V1=1` | تفعيل SitePlan في التوليد |
| `WB_STRUCTURE_FIRST=1` | الهيكل من الاستراتيجية — القالب skin فقط |
| `WB_PRO_WORKSPACE=1` | تفعيل وضع المحترف (لاحقاً) |
| `WB_CAPABILITY_TOOLBAR=1` | شريط أدوات حسب capabilities |

---

## ترتيب المراحل (ملخص)

```text
Phase 1  GLS ───────────────────────────── ✅ مكتمل
Phase 2  SitePlan + تأسيس Pro Workspace
Phase 3  Image strategy toggle + Industry Image Gate
Phase 4  Publish Gate (SEO + quality + a11y)
Phase 5  Visual Skins (5–7 عالمية)
Phase 6  Pro Workspace UI (IDE + Agent)
Phase 7  Multi-language للزوار
Phase 8  Growth layer (مشاركة، referral، AEO)
```

---

## قواعد التنفيذ للوكيل / المطور

1. افتح `EXECUTION-QUEUE.md` وابحث عن أول مهمة `status: pending`
2. نفّذ المهمة كاملة حتى تحقق **Acceptance Criteria**
3. شغّل الاختبارات المذكورة في المهمة
4. حدّث `status: done` + تاريخ الإكمال
5. انتقل للمهمة التالية فقط — لا تتخطى
6. لا تكسر المسار الافتراضي بدون flag

---

## مراجع الكود

| الموضوع | المسار |
|---------|--------|
| GLS | `lib/language-platform/` |
| Language picker UI | `components/dashboard/language/gls-generation-language-select.tsx` |
| Website generation | `lib/website/orchestrator.ts`, `plugins/website/generate.ts` |
| Builder workspace | `components/dashboard/website-builder/builder-workspace.tsx` |
| Capabilities | `lib/website/builder/capabilities/` |
| SEO | `lib/ai-core/seo/`, `lib/website/seo/` |
| Flags | `lib/website/generation-flags.ts` |
| Empty templates | `lib/website/builder/unified-template-registry.ts` |

---

*آخر تحديث: أغسطس 2026*
