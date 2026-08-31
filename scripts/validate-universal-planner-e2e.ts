import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import type { WebsiteGenerationInput } from "@/lib/website/types";
import type { WebAppPluginInput } from "@/plugins/webapp/types";

// Match Next.js runtime env loading for standalone scripts (.env.local, etc).
loadEnvConfig(process.cwd());

function envOn(name: string) {
  process.env[name] = "1";
}

async function validateWebsiteOnce() {
  const { resolveWebsitePlannerIntegration } = await import(
    "@/lib/website/universal-planner-integration"
  );
  const { generateWebsite } = await import("@/lib/website-generator");
  const { websiteInputToBrief } = await import(
    "@/lib/ai-core/adapters/website-builder"
  );

  const input: WebsiteGenerationInput = {
    prompt:
      "Create a professional restaurant website with menu and a booking dashboard.",
    projectType: "Business Website",
    projectKind: "website",
    language: "English",
    theme: "professional",
    features: ["seo", "booking", "contact-form"],
  };

  const planner = await resolveWebsitePlannerIntegration({
    input,
    onProgress: (m) => console.log(m),
  });

  assert.equal(planner.enabled, true);
  assert.ok(planner.blueprint);
  assert.ok(planner.websiteServicePlan);
  assert.equal(planner.websiteServicePlan.serviceId, "website-builder");
  assert.equal(planner.websiteServicePlan.supported, true);

  // Evidence: adapter conversion sees planner metadata.
  const brief = websiteInputToBrief({
    ...input,
    ...(planner.inputPatch ?? {}),
  });
  const meta = brief.metadata as Record<string, unknown> | undefined;
  const wbInput = meta?.websiteGenerationInput as Record<string, unknown> | undefined;
  assert.ok(wbInput?.universalPlannerBlueprint);
  assert.ok(wbInput?.universalPlannerWebsitePlan);

  let builder: {
    executed: boolean;
    fileCount?: number;
    title?: string;
    error?: string;
  } = { executed: false };

  try {
    // Evidence: builder runs normally (no persistence, no userId).
    const result = await generateWebsite({
      ...input,
      ...(planner.inputPatch ?? {}),
      language: input.language,
      locale: input.language,
      projectKind: input.projectKind,
    });

    assert.ok(result.files?.length, "Website Builder produced files");
    builder = {
      executed: true,
      fileCount: result.files.length,
      title: result.title,
    };
  } catch (e) {
    builder = {
      executed: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return {
    pass: builder.executed,
    request: input.prompt,
    planner: {
      executed: true,
      blueprintValidated: true,
      selectedServiceId: planner.blueprint.selectedServiceId,
      traceRef: planner.blueprint.trace.planningTraceRef,
    },
    adapter: {
      executed: true,
      receivedBlueprint: true,
    },
    builder,
  };
}

async function validateAppOnce() {
  const { resolveAppPlannerIntegration } = await import(
    "@/lib/webapp/universal-planner-integration"
  );
  const { generateWebApp } = await import("@/lib/webapp-generator");
  const { webappInputToBrief } = await import(
    "@/lib/ai-core/adapters/webapp-builder"
  );

  const input: WebAppPluginInput = {
    prompt:
      "Build a CRUD SaaS dashboard app with auth and an inventory database.",
    appType: "SaaS Dashboard",
    language: "English",
    designStyle: "professional",
    colorStyle: "modern",
    features: ["auth", "dashboard", "database"],
  };

  const planner = await resolveAppPlannerIntegration({
    input,
    onProgress: (m) => console.log(m),
  });

  assert.equal(planner.enabled, true);
  assert.ok(planner.blueprint);
  assert.ok(planner.appServicePlan);
  assert.equal(planner.appServicePlan.serviceId, "app-builder");
  assert.equal(planner.appServicePlan.supported, true);

  // Evidence: adapter conversion sees planner metadata.
  const brief = webappInputToBrief({
    ...input,
    ...(planner.inputPatch ?? {}),
  });
  const meta = brief.metadata as Record<string, unknown> | undefined;
  const waInput = meta?.webappPluginInput;
  assert.ok(waInput?.universalPlannerBlueprint);
  assert.ok(waInput?.universalPlannerAppPlan);

  let builder: {
    executed: boolean;
    fileCount?: number;
    title?: string;
    error?: string;
  } = { executed: false };

  try {
    // Evidence: builder runs normally (no persistence).
    const result = await generateWebApp({
      ...input,
      ...(planner.inputPatch ?? {}),
    });

    assert.ok(result.files?.length, "App Builder produced files");
    builder = {
      executed: true,
      fileCount: result.files.length,
      title: result.title,
    };
  } catch (e) {
    builder = {
      executed: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return {
    pass: builder.executed,
    request: input.prompt,
    planner: {
      executed: true,
      blueprintValidated: true,
      selectedServiceId: planner.blueprint.selectedServiceId,
      traceRef: planner.blueprint.trace.planningTraceRef,
    },
    adapter: {
      executed: true,
      receivedBlueprint: true,
    },
    builder,
  };
}

async function main() {
  // E2E must be explicitly gated.
  envOn("UNIVERSAL_PLANNER_ENABLED");
  envOn("UNIVERSAL_PLANNER_WEBSITE_ENABLED");
  envOn("UNIVERSAL_PLANNER_APP_ENABLED");

  const websiteResult = await validateWebsiteOnce().catch((e) => ({
    pass: false,
    error: e instanceof Error ? e.stack ?? e.message : String(e),
  }));
  const appResult = await validateAppOnce().catch((e) => ({
    pass: false,
    error: e instanceof Error ? e.stack ?? e.message : String(e),
  }));

  console.log("\n=== Universal Planner E2E Evidence ===");
  console.log(JSON.stringify({ website: websiteResult, app: appResult }, null, 2));

  if (!websiteResult.pass || !appResult.pass) {
    process.exitCode = 1;
  }
}

void main();

