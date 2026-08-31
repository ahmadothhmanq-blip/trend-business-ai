import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAppPlannerIntegration } from "@/lib/webapp/universal-planner-integration";
import type { WebAppPluginInput } from "@/plugins/webapp/types";

function buildInput(prompt: string): WebAppPluginInput {
  return {
    prompt,
    appType: "SaaS Dashboard",
    language: "English",
    designStyle: "professional",
    colorStyle: "modern",
    features: ["auth", "dashboard", "database"],
  };
}

describe("app universal planner integration", () => {
  it("stays disabled when feature flags are off", async () => {
    delete process.env.UNIVERSAL_PLANNER_ENABLED;
    delete process.env.UNIVERSAL_PLANNER_APP_ENABLED;

    const result = await resolveAppPlannerIntegration({
      input: buildInput("Build a CRUD web app with auth and dashboard."),
    });

    assert.equal(result.enabled, false);
    assert.equal(result.inputPatch, undefined);
  });

  it("runs planner and validates app adapter blueprint when flags are on", async () => {
    process.env.UNIVERSAL_PLANNER_ENABLED = "1";
    process.env.UNIVERSAL_PLANNER_APP_ENABLED = "1";

    const result = await resolveAppPlannerIntegration({
      input: buildInput(
        "Build a CRUD web app with auth, analytics dashboard, and inventory database.",
      ),
    });

    assert.equal(result.enabled, true);
    assert.ok(result.blueprint);
    assert.ok(result.appServicePlan);
    assert.equal(result.appServicePlan?.serviceId, "app-builder");
    assert.equal(result.appServicePlan?.supported, true);
    assert.equal(result.inputPatch?.universalPlannerEnabled, true);
    assert.equal(
      result.inputPatch?.universalPlannerAppPlan?.serviceId,
      "app-builder",
    );
  });
});

