import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { validateKnowledgeBaseIntegrity } from "@/lib/ai-core/architecture-knowledge-base/integrity";
import {
  getLegacyBuilderTemplatePackageMap,
  PACKAGE_SUPERSESSION_ALIASES,
  resolveBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import {
  WEBSITE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
} from "@/lib/website/builder/template-package-index";
import { getWebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";
import {
  isKnownStructureTemplatePackage,
  STRUCTURE_TEMPLATE_INTELLIGENCE_MAP,
} from "@/lib/website/builder/template-package-ti-mapping";
import { isKnownStructureTemplateId } from "@/lib/website/contracts/structure-registry";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import {
  getWbTemplateRegistry,
  initializeWbTemplateEngine,
} from "@/lib/website/template-engine/index.server";
import { listRemoteMarketplaceListings } from "@/lib/website/template-marketplace/remote-catalog";

const FLAGSHIP_PACKAGE_IDS = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
] as const;

function discoverInstalledPackageIds(): string[] {
  const root = resolveWbTemplatesRoot();
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

describe("template registry validation", () => {
  it("registers all flagship packages in the structure index", () => {
    for (const id of FLAGSHIP_PACKAGE_IDS) {
      assert.ok(isKnownStructureTemplateId(id), `missing structure index entry for ${id}`);
      assert.ok(
        isKnownStructureTemplatePackage(id),
        `missing TI mapping for flagship ${id}`,
      );
      assert.ok(getWebsiteStructureTemplate(id), `getWebsiteStructureTemplate failed for ${id}`);
    }
  });

  it("keeps template-package-index aligned with installed filesystem packages", () => {
    const installed = new Set(discoverInstalledPackageIds());
    const indexed = new Set(WEBSITE_STRUCTURE_TEMPLATES.map((template) => template.id));

    for (const id of indexed) {
      assert.ok(installed.has(id), `index references missing on-disk package "${id}"`);
    }

    for (const id of FLAGSHIP_PACKAGE_IDS) {
      assert.ok(indexed.has(id), `flagship "${id}" missing from WEBSITE_STRUCTURE_TEMPLATES`);
    }

    assert.equal(
      WEBSITE_STRUCTURE_TEMPLATES.length,
      Object.keys(WEBSITE_STRUCTURE_TEMPLATE_INDEX).length,
    );
  });

  it("resolves legacy aliases and supersession targets to known installed packages", () => {
    const legacyMap = getLegacyBuilderTemplatePackageMap();

    for (const [legacyId, packageId] of Object.entries(legacyMap)) {
      assert.ok(
        isKnownStructureTemplateId(packageId),
        `legacy "${legacyId}" maps to unknown package "${packageId}"`,
      );
      assert.equal(
        resolveBuilderTemplatePackageId(legacyId),
        packageId,
        `resolver mismatch for legacy "${legacyId}"`,
      );
    }

    for (const [sourceId, targetId] of Object.entries(PACKAGE_SUPERSESSION_ALIASES)) {
      assert.ok(
        isKnownStructureTemplateId(targetId),
        `supersession "${sourceId}" -> unknown package "${targetId}"`,
      );
      assert.equal(resolveBuilderTemplatePackageId(sourceId), targetId);
    }
  });

  it("loads every indexed package into the template engine registry", async () => {
    await initializeWbTemplateEngine();
    const engineRegistry = getWbTemplateRegistry();

    for (const template of WEBSITE_STRUCTURE_TEMPLATES) {
      const pkg = engineRegistry.getPackage(template.id);
      assert.ok(pkg, `template engine missing package "${template.id}"`);
      assert.equal(pkg?.manifest.id, template.id);
    }

    for (const id of FLAGSHIP_PACKAGE_IDS) {
      assert.ok(engineRegistry.getPackage(id), `engine missing flagship "${id}"`);
    }

    assert.equal(resolveBuilderTemplatePackageId("modern-business"), "corporate-business");
    assert.equal(resolveBuilderTemplatePackageId("restaurant-signature"), "restaurant-premium");
    assert.ok(engineRegistry.getPackage("modern-business"));
    assert.ok(engineRegistry.getPackage("restaurant-signature"));
    assert.equal(engineRegistry.size(), WEBSITE_STRUCTURE_TEMPLATES.length);
  });

  it("aligns marketplace remote seeds with flagship package ids", () => {
    const remoteIds = new Set(listRemoteMarketplaceListings().map((listing) => listing.id));

    for (const id of FLAGSHIP_PACKAGE_IDS) {
      assert.ok(remoteIds.has(id), `marketplace remote catalog missing flagship "${id}"`);
    }

    for (const id of FLAGSHIP_PACKAGE_IDS) {
      const remote = listRemoteMarketplaceListings().find((listing) => listing.id === id);
      assert.equal(
        remote?.remote?.registryId,
        id,
        `marketplace registryId must match package id for "${id}"`,
      );
    }
  });

  it("maps every indexed package to a Template Intelligence profile", () => {
    for (const template of WEBSITE_STRUCTURE_TEMPLATES) {
      const tiId = STRUCTURE_TEMPLATE_INTELLIGENCE_MAP[template.id];
      assert.ok(tiId, `missing TI map for "${template.id}"`);
      assert.equal(template.templateIntelligenceId, tiId);
    }
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

  it("validates website-registry distributable packages for flagships", () => {
    const registryRoot = path.join(process.cwd(), "templates", "website-registry");

    for (const id of FLAGSHIP_PACKAGE_IDS) {
      const packageDir = path.join(registryRoot, id);
      assert.ok(
        readdirSync(packageDir, { withFileTypes: true }).some(
          (entry) => entry.name === "manifest.json",
        ),
        `website-registry missing manifest for "${id}"`,
      );
    }
  });
});
