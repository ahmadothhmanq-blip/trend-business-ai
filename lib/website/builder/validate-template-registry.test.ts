import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { validateKnowledgeBaseIntegrity } from "@/lib/ai-core/architecture-knowledge-base/integrity";
import {
  getLegacyBuilderTemplatePackageMap,
  resolveBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import {
  ACTIVE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
} from "@/lib/website/builder/template-package-index";
import { STRUCTURE_TEMPLATE_INTELLIGENCE_MAP } from "@/lib/website/builder/template-package-ti-mapping";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import {
  getWbTemplateRegistry,
  initializeWbTemplateEngine,
} from "@/lib/website/template-engine/index.server";
import { listRemoteMarketplaceListings } from "@/lib/website/template-marketplace/remote-catalog";

const INTERNAL_FALLBACK_ID = "_generation-default";

function discoverInstalledPackageIds(): string[] {
  const root = resolveWbTemplatesRoot();
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

describe("template registry validation", () => {
  it("keeps the user-facing structure catalog empty", () => {
    assert.equal(ACTIVE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(WEBSITE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(Object.keys(WEBSITE_STRUCTURE_TEMPLATE_INDEX).length, 0);
  });

  it("keeps the installed package library on disk", () => {
    assert.equal(discoverInstalledPackageIds().length, 20);
  });

  it("resolves legacy aliases to the internal generation fallback", () => {
    const legacyMap = getLegacyBuilderTemplatePackageMap();

    for (const [legacyId, packageId] of Object.entries(legacyMap)) {
      assert.equal(packageId, INTERNAL_FALLBACK_ID);
      assert.equal(resolveBuilderTemplatePackageId(legacyId), INTERNAL_FALLBACK_ID);
    }
  });

  it("registers every on-disk package in the template engine", async () => {
    await initializeWbTemplateEngine();
    const engineRegistry = getWbTemplateRegistry();

    // Industry aliases stay on internal generation routing; flagship V2 package
    // ids resolve to themselves so marketplace selection and apply keep working.
    assert.equal(resolveBuilderTemplatePackageId("restaurant"), INTERNAL_FALLBACK_ID);
    assert.equal(
      resolveBuilderTemplatePackageId("ai-startup-signal"),
      "ai-startup-signal",
    );
    assert.deepEqual(
      engineRegistry.list().map((item) => item.id).sort(),
      discoverInstalledPackageIds(),
    );
  });

  it("keeps marketplace remote seeds empty", () => {
    assert.deepEqual(listRemoteMarketplaceListings(), []);
  });

  it("keeps structure package TI map empty", () => {
    assert.deepEqual(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP, {});
  });

  it("passes Architecture Knowledge Base integrity without unknown structure references", () => {
    const report = validateKnowledgeBaseIntegrity();
    const structureErrors = report.issues.filter(
      (issue) => issue.code === "ORPHANED_STRUCTURE_TEMPLATE",
    );
    assert.equal(
      structureErrors.length,
      0,
      structureErrors.map((issue) => issue.message).join("; "),
    );
    assert.equal(report.valid, true, report.issues.map((issue) => issue.message).join("; "));
  });

  it("validates website-registry has no distributable packages", () => {
    const registryRoot = path.join(process.cwd(), "templates", "website-registry");
    const onDisk = readdirSync(registryRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();

    assert.deepEqual(onDisk, []);
  });
});
