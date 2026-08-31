# Skin vs SitePlan

## SitePlan (Phase 2) — **ماذا يُبنى**

- الصناعة / archetype (عقارات، SaaS، مطعم…)
- الصفحات والأقسام
- الأدوات (booking, blog, forms…)
- استراتيجية الصور
- لغة المحتوى

**الملفات:** `lib/website/site-plan/`

## VisualSkin (Phase 5) — **كيف يبدو**

- الألوان، الخطوط، الظلال، الحركة
- **معالجة الصور** (radius, frame, aspect) — متناسقة مع الـ skin
- **RTL** — خطوط عربية على كل اللغات
- يطبّق على `app/globals.css` — **شكل الموقع كامل** بدون تغيير المحتوى أو SitePlan

**الملفات:** `lib/website/visual-skin/` (`skin-css.ts`, `apply-project.ts`, `catalog.ts`)

## القواعد

1. Skin **لا يغيّر** `pages`, `sections`, أو `capabilities` في SitePlan
2. الترتيب: `SitePlan → توليد المحتوى → apply skin`
3. اختيار الـ skin في **الداشبورد فقط** — ليس للزائر
4. القوالب القديمة محذوفة؛ الـ skins الجديدة تُبنى من الصفر

## Flags

| Flag | الغرض |
|------|--------|
| `WB_SITE_PLAN_V1=1` | تفعيل SitePlan |
| `WB_VISUAL_SKIN_V1=1` | تطبيق skins بعد التوليد |
