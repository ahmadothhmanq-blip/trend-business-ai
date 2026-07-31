import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { loadValidatedWbTemplatePackage } from "@/lib/website/template-engine/spec/validate-package";
import { WB_TEMPLATE_RENDERER_CONTRACT_VERSION } from "@/lib/website/template-renderer-contract/constants";
import {
  isWbTemplateRuntimeModel,
  validateRuntimeModel,
} from "@/lib/website/template-renderer-contract/validation";
import { adaptResolvedTemplatePackage } from "@/lib/website/template-renderer/adapt";
import {
  createPackageWithBrokenConstraint,
  createPackageWithBrokenLayoutReference,
  createPackageWithBrokenPageLayout,
  createPackageWithBrokenPageRegion,
  createPackageWithBrokenPlacementOverride,
  createPackageWithUnsupportedSpec,
  createValidPackageFixture,
  FIXTURE_LOADED_AT,
} from "@/lib/website/template-renderer/fixtures";
import {
  renderWbTemplateFromResolvedPackage,
  renderWbTemplateRuntimeModel,
} from "@/lib/website/template-renderer/render";
import type { WbTemplateRendererResult } from "@/lib/website/template-renderer-contract/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function resolveRendererResult(
  result: WbTemplateRendererResult | Promise<WbTemplateRendererResult>,
): WbTemplateRendererResult {
  assert.ok(!(result instanceof Promise), "expected synchronous renderer result");
  return result;
}

function assertSuccess(
  result: WbTemplateRendererResult | Promise<WbTemplateRendererResult>,
): Extract<WbTemplateRendererResult, { ok: true }> {
  const resolved = resolveRendererResult(result);
  assert.equal(resolved.ok, true, JSON.stringify(resolved, null, 2));
  return resolved;
}

function assertFailure(
  result: WbTemplateRendererResult | Promise<WbTemplateRendererResult>,
): Extract<WbTemplateRendererResult, { ok: false }> {
  const resolved = resolveRendererResult(result);
  assert.equal(resolved.ok, false, JSON.stringify(resolved, null, 2));
  return resolved;
}

describe("renderWbTemplateRuntimeModel", () => {
  it("normalizes a valid package into a contract runtime model", () => {
    const pkg = createValidPackageFixture();
    const result = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.equal(result.value.model.contractVersion, WB_TEMPLATE_RENDERER_CONTRACT_VERSION);
    assert.equal(result.value.model.template.id, "fixture-template");
    assert.equal(result.value.meta.normalizedAt, FIXTURE_LOADED_AT);
    assert.equal(isWbTemplateRuntimeModel(result.value.model), true);
  });

  it("preserves metadata, canvas, responsive configuration, and media references", () => {
    const pkg = createValidPackageFixture();
    const result = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.deepEqual(result.value.model.metadata, pkg.manifest.metadata);
    assert.deepEqual(result.value.model.canvas, pkg.canvas);
    assert.deepEqual(result.value.model.responsive, pkg.manifest.responsive);
    assert.equal(result.value.model.media.thumbnail, pkg.mediaPaths.thumbnail);
    assert.equal(result.value.model.media.preview, pkg.mediaPaths.preview);
    assert.deepEqual(result.value.model.media.gallery, pkg.mediaPaths.gallery);
  });

  it("merges placement overrides into region placement rules", () => {
    const pkg = createValidPackageFixture();
    const result = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.equal(result.value.model.regions.header.placement.ordering, "horizontal");
    assert.equal(result.value.model.regions.header.placement.maxComponents, 2);
    assert.deepEqual(result.value.model.regions.main.placement, pkg.regions.main.placement);
    assert.deepEqual(
      result.value.model.placementRules.constraints,
      pkg.placementRules.constraints,
    );
  });

  it("orders page region ids according to layout region order", () => {
    const pkg = createValidPackageFixture();
    pkg.pages.home.regionIds = ["main", "header"];

    const result = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.deepEqual(result.value.model.pages.home.regionIds, ["header", "main"]);
  });

  it("produces deterministic output for identical input", () => {
    const pkg = createValidPackageFixture();
    const first = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));
    const second = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.deepEqual(first.value.model, second.value.model);
    assert.deepEqual(first.value.meta, second.value.meta);
  });

  it("sorts record keys and nested lists for canonical output", () => {
    const pkg = createValidPackageFixture();
    const result = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.deepEqual(Object.keys(result.value.model.layouts), ["default"]);
    assert.deepEqual(Object.keys(result.value.model.regions), ["header", "main"]);
    assert.deepEqual(Object.keys(result.value.model.pages), ["home"]);
    assert.deepEqual(result.value.model.componentTypes?.types.map((item) => item.id), [
      "custom",
      "hero",
    ]);
    assert.deepEqual(result.value.model.placementRules.constraints?.map((item) => item.id), [
      "no-hero-header",
    ]);
  });

  it("records optional scope in metadata without mutating the model", () => {
    const pkg = createValidPackageFixture();
    const scoped = assertSuccess(
      renderWbTemplateRuntimeModel({
        package: pkg,
        scope: { pageId: "home" },
      }),
    );
    const full = assertSuccess(renderWbTemplateRuntimeModel({ package: pkg }));

    assert.deepEqual(scoped.value.model, full.value.model);
    assert.deepEqual(scoped.value.meta.scope, { pageId: "home" });
  });

  it("rejects unsupported contract versions", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createValidPackageFixture(),
        contractVersion: "9.9.9",
      }),
    );

    assert.equal(result.error.code, "contract.unsupported_version");
  });

  it("rejects packages below the minimum supported spec version", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createPackageWithUnsupportedSpec(),
      }),
    );

    assert.equal(result.error.code, "input.unsupported_spec_version");
  });

  it("rejects missing package input", () => {
    const result = assertFailure(renderWbTemplateRuntimeModel({} as never));

    assert.equal(result.error.code, "input.missing_package");
  });

  it("rejects invalid layout region references", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createPackageWithBrokenLayoutReference(),
      }),
    );

    assert.match(result.error.message, /invalid internal references/);
    assert.ok(
      result.error.issues.some((item) => item.code === "validation.layout_region_mismatch"),
    );
  });

  it("rejects pages that reference unknown layouts", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createPackageWithBrokenPageLayout(),
      }),
    );

    assert.ok(
      result.error.issues.some((item) => item.code === "validation.page_layout_mismatch"),
    );
  });

  it("rejects pages that reference unknown regions", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createPackageWithBrokenPageRegion(),
      }),
    );

    assert.ok(
      result.error.issues.some((item) => item.code === "validation.page_region_mismatch"),
    );
  });

  it("rejects placement overrides that target unknown regions", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createPackageWithBrokenPlacementOverride(),
      }),
    );

    assert.ok(
      result.error.issues.some(
        (item) => item.code === "validation.placement_override_unknown_region",
      ),
    );
  });

  it("rejects placement constraints that target unknown pages", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createPackageWithBrokenConstraint(),
      }),
    );

    assert.ok(
      result.error.issues.some((item) => item.code === "validation.constraint_unknown_page"),
    );
  });

  it("rejects scope references to missing pages", () => {
    const result = assertFailure(
      renderWbTemplateRuntimeModel({
        package: createValidPackageFixture(),
        scope: { pageId: "missing" },
      }),
    );

    assert.equal(result.error.code, "input.missing_page");
  });
});

describe("renderWbTemplateFromResolvedPackage", () => {
  it("renders the modern-business template package from disk", async () => {
    const pkg = await loadValidatedWbTemplatePackage(
      join(root, "templates/website/modern-business"),
    );
    const result = assertSuccess(renderWbTemplateFromResolvedPackage(pkg));

    assert.equal(result.value.model.template.id, "modern-business");
    assert.equal(result.value.model.template.version, "2.0.0");
    assert.deepEqual(result.value.model.pages.home.regionIds, ["header", "main", "footer"]);
    assert.equal(validateRuntimeModel(result.value.model).valid, true);
  });

  it("adapts engine page blueprints with regions[] into runtime regionIds[]", async () => {
    const pkg = await loadValidatedWbTemplatePackage(
      join(root, "templates/website/modern-business"),
    );
    const adapted = adaptResolvedTemplatePackage(pkg);

    assert.deepEqual(adapted.pages.home.regionIds, ["header", "main", "footer"]);
    assert.equal("regions" in (pkg.pages.home as object), true);
    assert.equal("regionIds" in adapted.pages.home, true);
  });
});
