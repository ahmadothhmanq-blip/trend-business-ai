import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { runProductionDesignPipeline } from "@/lib/website/template-v2/integration/production-pipeline";
import {
  hasPresentationHomeFlow,
  resolveBlueprintRegionPlan,
} from "@/lib/website/template-v2/integration/section-component-map";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

const templatesRoot = path.join(resolveWbTemplatesRoot());

function baseProject(packageId: string): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Audit",
    description: "homeFlow audit",
    pages: ["home"],
    sections: [],
    colorPalette: [],
    typography: [],
    components: [],
    content: [],
    seo: [],
    roadmap: [],
    files: [
      {
        path: "app/page.tsx",
        content: "export default function Page(){return <main/>}",
        language: "tsx",
      },
    ],
    settings: { templatePackageId: packageId },
  };
}

function listV2Packages(): string[] {
  return readdirSync(templatesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      try {
        const manifest = JSON.parse(
          readFileSync(path.join(templatesRoot, name, "manifest.json"), "utf8"),
        );
        return manifest.architecture?.version === "v2";
      } catch {
        return false;
      }
    });
}

describe("presentation homeFlow audit", () => {
  for (const packageId of listV2Packages()) {
    it(`${packageId}: homeFlow references valid components and includes page sections`, async () => {
      const loaded = await loadTemplateV2Package(path.join(templatesRoot, packageId));
      assert.equal(loaded.ok, true);
      if (!loaded.ok) return;

      const { bundle } = loaded;
      const registryIds = new Set(bundle.componentRegistry.components.map((c) => c.id));
      const regions = bundle.presentation.homeFlow?.regions ?? {
        main: [],
        utility: [],
        overlay: [],
      };

      const inFlow = new Set<string>();
      for (const ids of Object.values(regions)) {
        for (const id of ids ?? []) {
          inFlow.add(id);
          assert.ok(registryIds.has(id), `${packageId}: homeFlow references unknown ${id}`);
        }
      }

      const skip = new Set(
        [
          bundle.presentation.navigation?.componentId,
          bundle.presentation.hero?.componentId,
          bundle.presentation.footer?.componentId,
          bundle.presentation.sectionShell?.componentId,
        ].filter(Boolean) as string[],
      );

      for (const component of bundle.componentRegistry.components) {
        if (skip.has(component.id)) continue;
        if (component.role === "section-shell") continue;
        assert.ok(
          inFlow.has(component.id),
          `${packageId}: registry component not in homeFlow: ${component.id}`,
        );
      }

      if (!hasPresentationHomeFlow(bundle.presentation)) return;

      const pipeline = runProductionDesignPipeline({
        project: baseProject(packageId),
        templatePackageId: packageId,
        seed: `audit-${packageId}`,
      });

      const plan = resolveBlueprintRegionPlan(pipeline.optimizedBlueprint, bundle, {
        structureFirst: true,
      });

      const expectedMain = regions.main ?? [];
      assert.equal(plan.main.length, expectedMain.length);
      for (const componentId of expectedMain) {
        assert.ok(plan.main.includes(componentId));
      }
      for (const componentId of regions.utility ?? []) {
        assert.ok(plan.utility.includes(componentId));
      }
      for (const componentId of regions.overlay ?? []) {
        assert.ok(plan.overlay.includes(componentId));
      }
    });
  }
});
