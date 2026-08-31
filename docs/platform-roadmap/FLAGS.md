# Website Builder Flags — تفعيل الميزات الجديدة

كل الـ flags **off افتراضياً** — لا تكسر السلوك الحالي.

## Server (` .env.local `)

| Flag | الوظيفة |
|------|---------|
| `WB_SITE_PLAN_V1=1` | يرفق SitePlan بالمشروع (industry, sections, capabilities) |
| `WB_STRUCTURE_FIRST=1` | SitePlan يحدد الأقسام — القالب لا يغيّر الهيكل |
| `WB_VISUAL_SKIN_V1=1` | يطبّق Visual Skin بعد التوليد |
| `WB_PUBLISH_GATE=1` | يحظر النشر إذا فشلت بوابة الجودة |
| `WB_PRO_WORKSPACE=1` | يفعّل Pro workspace على السيرفر |
| `WB_LOCALE_LLM=1` | ترجمة LLM لمحتوى زوار multi-lang عند النشر (افتراضي: on إذا في API key) |

## Client

| Flag | الوظيفة |
|------|---------|
| `NEXT_PUBLIC_WB_PRO_WORKSPACE=1` | يظهر تبويب **Pro IDE** |

## profile اختبار داخلي (`internal-qa`)

انسخ إلى `.env.local` للاختبار الداخلي الكامل:

```env
# internal-qa profile
WB_SITE_PLAN_V1=1
WB_STRUCTURE_FIRST=1
WB_VISUAL_SKIN_V1=1
WB_PUBLISH_GATE=1
WB_PRO_WORKSPACE=1
NEXT_PUBLIC_WB_PRO_WORKSPACE=1
WB_LOCALE_LLM=1
```

بعد التعديل: `npm run dev`

نفس القيم موجودة في `.env.example` (قسم Website Builder platform flags).

## ما يعمل بدون flags

- توليد موقع + Canvas + Copilot + نشر `/w/slug`
- لغة التوليد من GLS picker

## ما يحتاج flags + خيارات Advanced

- Visual Skin على المشروع
- Multi-language زوار (`visitorLocales` checkbox)
- Pro IDE + حفظ ملفات (`PATCH /api/website-builder/[id]/files`)

انظر أيضاً: [`REMAINING-WORK.md`](./REMAINING-WORK.md)
