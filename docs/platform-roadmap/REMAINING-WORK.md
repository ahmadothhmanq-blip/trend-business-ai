# Remaining Work — شغل حقيقي متبقي



> **مهم:** `EXECUTION-QUEUE.md` Phase 1–8 = **أساس الكود** (types, flags, stubs, wiring).  

> هذا الملف = **إكمال المنتج** حتى يستخدمه المستخدم النهائي بدون فجوات.



**القاعدة:** مهمة واحدة → `done` + اختبار → التالية. لا نعلّم `done` بدون سلوك فعلي.



---



## الحالة السريعة



| المحور | الأساس (كود) | منتج جاهز للمستخدم؟ |

|--------|--------------|---------------------|

| لغات التوليد GLS | ✅ | ✅ |

| لغات زوار الموقع المنشور | ✅ | ✅ — switcher + محتوى locale |

| تعديل الموقع (مبتدئ) | ✅ | ✅ Canvas + Copilot |

| Pro IDE | ✅ | ✅ — حفظ + تبديل ملفات |

| Visual Skins | ✅ | ✅ — معاينة + تطبيق بعد التوليد |

| Flags مفعّلة افتراضياً | ❌ | ❌ — اختبار داخلي فقط |



---



# Queue — تنفيذ تسلسلي



## R-01 — Language switcher على الموقع المنشور

- **status:** `done`

- **completed:** 2026-08-09



## R-02 — Pro IDE: حفظ ملف من محرر الكود

- **status:** `done`

- **completed:** 2026-08-09



## R-03 — معاينة Visual Skin قبل التوليد

- **status:** `done`

- **completed:** 2026-08-09



## R-04 — محتوى multi-language حقيقي (صفحات/نسخ)

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `lib/website/visitor-locale/locale-content.ts`, `published-seo.ts`, `public-site.server.ts`



## R-05 — تفعيل flags للاختبار الداخلي (env template)

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `.env.example`, `docs/platform-roadmap/FLAGS.md`



## R-06 — ترجمة أسماء اللغات في `locales/*.json`

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `locales/en.json`, `locales/ar.json`, `language-i18n-keys.test.ts`



## R-07 — Pro IDE: فتح ملف من الشجرة يحدّث المحرر

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `pro-workspace-shell.tsx`



## R-08 — Language switcher RTL + accessibility

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `language-switcher.ts`



## R-09 — Skin تطبيق بعد التوليد (بدون re-generate)

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `visual-skin/apply.ts`, `visual-skin/route.ts`, `visual-skin-editor.tsx`



## R-10 — E2E: مسار كامل مبتدئ → نشر → multi-lang

- **status:** `done`

- **completed:** 2026-08-09

- **files:** `lib/website/visitor-locale/locale-content.test.ts`



---



## المهمة الحالية



```

✅ R-01 … R-10 مكتملة

```



## متى "نبدأ" للمستخدم النهائي؟



| مرحلة | متى | ماذا يعمل |

|-------|-----|-----------|

| **الآن** | فوراً | توليد + Canvas + Copilot + نشر `/w/slug` |

| **مع flags internal-qa** | فوراً | skins + زوار multi-lang + Pro IDE |

| **لاحقاً** | مرحلة قادمة | تحسين جودة ترجمة LLM + مراقبة تكلفة API |



---



## سجل



| التاريخ | المهمة | ملاحظة |

|---------|--------|--------|

| 2026-08-09 | إنشاء الملف | فصل "أساس" عن "منتج" |

| 2026-08-09 | R-04 … R-10 | محتوى locale + flags + i18n + Pro + RTL + skin reapply + tests |

