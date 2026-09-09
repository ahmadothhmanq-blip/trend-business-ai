/**
 * Deterministic CRM vertical E2E (no live DeepSeek required):
 * design → specialized ZIP scaffold → harden → preview HTML contracts.
 *
 * Run: npm run e2e:app-builder:crm
 */

import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";

import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";
import { listAppTemplates } from "@/lib/ai-core/app-design-platform/templates";
import { auditAppTemplate } from "@/lib/ai-core/app-design-platform/template-quality";
import { createDeployment } from "@/lib/ai-core/app-design-platform/deploy";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { buildInteractiveAppPreviewHtml } from "@/lib/webapp/interactive-preview/build";
import { findInteractiveAppPreviewReadinessIssues } from "@/lib/webapp/interactive-preview/readiness";
import { APP_PREVIEW_RUNTIME_VERSION } from "@/lib/webapp/interactive-preview/manifest";
import {
  advanceStudioChat,
  createStudioChatState,
  isStudioChatApproveReady,
  seedStudioChatVertical,
} from "@/lib/webapp/studio-chat/engine";

loadEnvConfig(process.cwd());

async function main() {
  console.log("CRM vertical E2E (deterministic)…");

  const crmTemplate = listAppTemplates().find((t) => t.id === "crm");
  assert.ok(crmTemplate, "CRM template missing");
  assert.deepEqual(auditAppTemplate(crmTemplate!), [], "CRM template quality");

  // Studio chat: onboarding seed → clarify → approve
  let chat = createStudioChatState("English");
  chat = seedStudioChatVertical(chat, "crm", "English").state;
  assert.equal(chat.vertical, "crm");
  let reply = advanceStudioChat(chat, "Sales team of 6");
  chat = reply.state;
  reply = advanceStudioChat(chat, "Deals pipeline and follow-ups");
  assert.equal(reply.state.phase, "plan");
  reply = advanceStudioChat(reply.state, "Approve");
  assert.ok(isStudioChatApproveReady(reply), "studio chat should approve build");
  assert.equal(reply.plan?.templateId, "crm");
  console.log("✓ studio chat onboarding → approve");

  const designed = runAppDesignEngine({
    prompt: "CRM for sales team contacts and deals pipeline",
    appType: "crm",
    language: "English",
    templateId: "crm",
  });
  assert.equal(designed.model.templateId, "crm");

  const files = hardenGeneratedWebApp(
    buildWebAppScaffold({
      projectName: designed.model.settings.appName,
      language: "English",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: designed.model.dataModels.map((m) => m.name),
      dataModels: designed.model.dataModels,
      templateId: "crm",
    }),
  );

  assert.ok(files.some((f) => f.path === "prisma/seed.ts"), "CRM seed");
  const deals = files.find((f) => f.path === "app/dashboard/deals/page.tsx");
  assert.ok(deals, "deals page");
  assert.match(deals!.content, /pipeline|STAGES/i);
  console.log("✓ ZIP scaffold pipeline + seed");

  const readiness = findWebAppReadinessIssues(files, {
    requiresAuth: true,
    requiresDatabase: true,
  });
  assert.deepEqual(readiness, [], readiness.join("\n"));
  console.log("✓ ZIP readiness");

  const previewIssues = findInteractiveAppPreviewReadinessIssues(designed.model);
  assert.deepEqual(previewIssues, [], previewIssues.join("\n"));

  const html = buildInteractiveAppPreviewHtml({ model: designed.model });
  assert.match(html, new RegExp(APP_PREVIEW_RUNTIME_VERSION));
  assert.match(html, /zipHonesty|Reset demo|reset-demo|trust-banner/i);
  assert.match(html, /kanban|pipeline|Enterprise seats|Sara Alami/i);
  console.log("✓ interactive preview HTML (honesty + CRM seeds + board)");

  const deploy = createDeployment({
    generationId: "bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee",
    environment: "production",
    baseUrl: "https://example.com",
    files,
    appName: designed.model.settings.appName,
    previewHtml: html,
    readinessIssues: [],
  });
  assert.equal(deploy.kind, "public-host");
  assert.match(deploy.message, /not a full Next\.js/i);
  console.log("✓ honest deploy messaging");

  console.log(`CRM E2E PASS · ${files.length} files · preview ${APP_PREVIEW_RUNTIME_VERSION}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
