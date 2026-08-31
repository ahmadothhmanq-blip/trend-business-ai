import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDeployment,
  evaluateDeploymentReadiness,
  isWebAppDeployEnabled,
  isWebAppPublicPublishEnabled,
} from "@/lib/ai-core/app-design-platform/deploy";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";

describe("app builder full trust deploy", () => {
  it("marks empty projects failed instead of fake-live", () => {
    const record = createDeployment({
      generationId: "11111111-1111-1111-1111-111111111111",
      environment: "preview",
      baseUrl: "https://example.com",
      files: [],
    });
    assert.equal(record.status, "failed");
    assert.match(record.url, /live-preview/);
  });

  it("preview points at live-preview after trust pass", () => {
    const files = hardenGeneratedWebApp(
      buildWebAppScaffold({
        requiresAuth: true,
        requiresDatabase: true,
        tables: ["Item"],
      }),
    );
    const issues = evaluateDeploymentReadiness(files);
    assert.deepEqual(issues, []);

    const record = createDeployment({
      generationId: "22222222-2222-2222-2222-222222222222",
      environment: "preview",
      baseUrl: "https://example.com",
      files,
      readinessIssues: issues,
    });
    assert.equal(record.status, "live");
    assert.equal(record.kind, "live-preview");
    assert.equal(
      record.url,
      "https://example.com/api/webapp-builder/22222222-2222-2222-2222-222222222222/live-preview",
    );
    assert.equal(record.url.includes("/apps/"), false);
  });

  it("production publishes /w/app slug when HTML present", () => {
    const files = hardenGeneratedWebApp(
      buildWebAppScaffold({
        projectName: "Inventory Ops",
        requiresAuth: true,
        requiresDatabase: true,
        tables: ["Item"],
      }),
    );
    const record = createDeployment({
      generationId: "33333333-3333-3333-3333-333333333333",
      environment: "production",
      baseUrl: "https://example.com",
      files,
      appName: "Inventory Ops",
      previewHtml: "<html><body>ok</body></html>",
      readinessIssues: [],
    });
    assert.equal(record.status, "live");
    assert.equal(record.kind, "public-host");
    assert.match(record.url, /\/w\/app\/inventory-ops-33333333/);
  });

  it("deploy flags default on", () => {
    assert.equal(isWebAppDeployEnabled(), true);
    assert.equal(isWebAppPublicPublishEnabled(), true);
  });
});
