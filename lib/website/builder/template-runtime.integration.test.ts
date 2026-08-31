import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  listInstalledBuilderTemplatePackageIds,
  resolveBuilderTemplateRuntimeModel,
} from "@/lib/website/builder/template-runtime.server";
import { formatBuilderTemplateRuntimeError } from "@/lib/website/builder/template-runtime.types";
import {
  getActiveBuilderTemplateRuntimeModel,
  setActiveBuilderTemplateRuntime,
  clearActiveBuilderTemplateRuntime,
  runBuilderTemplateRuntimeSessionSync,
} from "@/lib/website/builder/builder-template-runtime-session.server";
import { isWbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/validation";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const FLAGSHIP_PACKAGE_ID = "corporate-business";

describe("builder template runtime integration", () => {
  it("lists installed template package ids from the Template Engine", async () => {
    const ids = await listInstalledBuilderTemplatePackageIds();
    assert.ok(ids.includes(FLAGSHIP_PACKAGE_ID));
    assert.ok(!ids.includes("modern-business"));
  });

  it("loads and renders corporate-business into a runtime model", async () => {
    const result = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.templateId, FLAGSHIP_PACKAGE_ID);
    assert.equal(result.model.template.id, FLAGSHIP_PACKAGE_ID);
    assert.equal(result.model.template.specVersion, "2.0.0");
    assert.deepEqual(result.model.pages.home.regionIds, [
      "header",
      "main",
      "utility",
      "footer",
    ]);
    assert.equal(result.model.regions.header.placement.ordering, "horizontal");
    assert.equal(isWbTemplateRuntimeModel(result.model), true);
    assert.equal(result.meta.templateId, FLAGSHIP_PACKAGE_ID);
  });

  it("resolves modern-business legacy alias to corporate-business runtime", async () => {
    const result = await resolveBuilderTemplateRuntimeModel("modern-business");

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.templateId, FLAGSHIP_PACKAGE_ID);
    assert.equal(result.model.template.id, FLAGSHIP_PACKAGE_ID);
  });

  it("preserves metadata, canvas, responsive config, and media references", async () => {
    const result = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID);
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.model.metadata.category, "corporate");
    assert.equal(result.model.canvas.id, "canvas");
    assert.equal(result.model.responsive.containerMaxWidth, "82rem");
    assert.ok(result.model.media.thumbnail.length > 0);
    assert.ok(result.model.media.preview.length > 0);
  });

  it("returns structured renderer errors for unknown template packages", async () => {
    const result = await resolveBuilderTemplateRuntimeModel("missing-template-package");

    assert.equal(result.ok, false);
    if (result.ok) return;

    assert.equal(result.code, "input.missing_package");
    assert.ok(result.issues.length > 0);
    assert.match(formatBuilderTemplateRuntimeError(result), /not installed/);
  });

  it("returns structured renderer errors for blank template ids", async () => {
    const result = await resolveBuilderTemplateRuntimeModel("   ");

    assert.equal(result.ok, false);
    if (result.ok) return;

    assert.equal(result.code, "input.invalid_package");
  });

  it("supports optional page scope without changing the runtime model shape", async () => {
    const full = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID);
    const scoped = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID, {
      pageId: "home",
    });

    assert.equal(full.ok, true);
    assert.equal(scoped.ok, true);
    if (!full.ok || !scoped.ok) return;

    assert.deepEqual(scoped.model, full.model);
    assert.deepEqual(scoped.meta.scope, { pageId: "home" });
  });

  it("stores the latest resolved runtime model in an isolated session", async () => {
    const result = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID);
    assert.equal(result.ok, true);
    if (!result.ok) return;

    runBuilderTemplateRuntimeSessionSync(() => {
      clearActiveBuilderTemplateRuntime();
      assert.equal(getActiveBuilderTemplateRuntimeModel(), null);

      setActiveBuilderTemplateRuntime(result);
      assert.equal(
        getActiveBuilderTemplateRuntimeModel()?.template.id,
        FLAGSHIP_PACKAGE_ID,
      );

      clearActiveBuilderTemplateRuntime();
      assert.equal(getActiveBuilderTemplateRuntimeModel(), null);
    });

    assert.equal(getActiveBuilderTemplateRuntimeModel(), null);
  });

  it("does not leak runtime models between isolated server sessions", async () => {
    const result = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID);
    assert.equal(result.ok, true);
    if (!result.ok) return;

    runBuilderTemplateRuntimeSessionSync(() => {
      setActiveBuilderTemplateRuntime(result);
      assert.equal(
        getActiveBuilderTemplateRuntimeModel()?.template.id,
        FLAGSHIP_PACKAGE_ID,
      );
    });

    runBuilderTemplateRuntimeSessionSync(() => {
      assert.equal(getActiveBuilderTemplateRuntimeModel(), null);
    });
  });

  it("loads the on-disk corporate-business package from templates/website", async () => {
    const packageDir = join(root, "templates/website/corporate-business");
    const result = await resolveBuilderTemplateRuntimeModel(FLAGSHIP_PACKAGE_ID);

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.ok(packageDir.includes("corporate-business"));
    assert.equal(result.model.entry.defaultPageId, "home");
    assert.equal(result.model.entry.defaultLayoutId, "default");
  });
});
