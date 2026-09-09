import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAppTemplate } from "@/lib/ai-core/app-design-platform/templates";
import { buildStructuredAppModel } from "@/lib/ai-core/app-design-platform/model-builder";
import { syncAppModelToFiles } from "@/lib/ai-core/app-design-platform/sync";
import {
  buildAppPreviewHtml,
  finalizeLivePreviewHtml,
} from "@/lib/webapp/build-app-preview";
import {
  localizeAppTemplateLabel,
  resolveLocaleForAppModel,
} from "@/lib/ai/webapp-i18n/localize-template";
import { AR_WEBAPP_MESSAGES } from "@/lib/ai/webapp-i18n/dictionaries/ar";

describe("app builder template labels stay language-agnostic", () => {
  it("localizes CRM template labels for Arabic", () => {
    const locale = resolveLocaleForAppModel("Arabic");
    assert.equal(localizeAppTemplateLabel(locale, "Contacts"), AR_WEBAPP_MESSAGES["entity.Contact"]);
    assert.equal(localizeAppTemplateLabel(locale, "Deal"), AR_WEBAPP_MESSAGES["entity.Deal"]);
    assert.equal(localizeAppTemplateLabel(locale, "Dashboard"), AR_WEBAPP_MESSAGES["nav.dashboard"]);
    assert.equal(localizeAppTemplateLabel(locale, "Login"), AR_WEBAPP_MESSAGES["auth.signIn"]);
  });

  it("builds Arabic interactive preview without English template chrome", () => {
    const model = buildStructuredAppModel({
      templateId: "crm",
      appName: "نظام المبيعات",
      prompt: "تطبيق إدارة علاقات العملاء",
      language: "Arabic",
      designStyle: "Modern",
      colorStyle: "Dark Minimal",
      features: [],
    });
    const html = finalizeLivePreviewHtml(buildAppPreviewHtml({ model }));
    assert.match(html, /lang="ar"/);
    assert.match(html, /dir="rtl"/);
    assert.match(html, /data-preview-runtime="interactive"/);
    assert.match(html, /__PREVIEW_RUNTIME__/);
    assert.match(html, /تسجيل الدخول/);
    assert.match(html, /جهة اتصال|صفقة|شركة/);
    assert.match(html, /نظام المبيعات/);
    assert.doesNotMatch(html, /lang="en"/);
    assert.doesNotMatch(html, /Contact directory/);
    assert.doesNotMatch(html, /Pipeline overview/);
    assert.doesNotMatch(html, /Arabic\s*·/);
    assert.doesNotMatch(html, /·\s*\/login/);
  });

  it("sync emits t()/te() instead of English screen titles", () => {
    const tpl = getAppTemplate("crm")!;
    assert.ok(tpl);
    const model = buildStructuredAppModel({
      templateId: "crm",
      appName: "نظام المبيعات",
      prompt: "CRM",
      language: "Arabic",
      features: [],
    });
    const synced = syncAppModelToFiles(model, []);
    const contacts = synced.files.find((f) => f.path === "app/contacts/page.tsx");
    assert.ok(contacts, "contacts page missing");
    assert.match(contacts!.content, /from "@\/lib\/i18n"/);
    assert.match(contacts!.content, /te\("Contact"\)|t\("nav\./);
    assert.doesNotMatch(contacts!.content, />Contacts</);
    assert.doesNotMatch(contacts!.content, /Contact directory/);
  });
});
