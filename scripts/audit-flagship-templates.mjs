import path from "node:path";
import { existsSync } from "node:fs";
import { validateTemplateV2Package } from "../lib/website/template-v2/validation/validate-v2-package.ts";
import {
  loadTemplateV2Package,
  readTemplatePackageManifestRaw,
} from "../lib/website/template-v2/loader/load-v2-package.ts";
import { resolveWbTemplatesRoot } from "../lib/website/template-engine/constants.server.ts";
import { composeRegionGridPage } from "../lib/website/template-v2/composer/region-grid-composer.ts";
import { applyTemplateV2ToProject } from "../lib/website/template-v2/apply/apply-v2-template.ts";

const root = resolveWbTemplatesRoot();
const ids = ["saas-enterprise", "corporate-business"];

const stubProject = {
  title: "Audit",
  files: [
    {
      path: "app/page.tsx",
      content: "export default function Page() { return null; }",
      language: "tsx",
    },
    {
      path: "app/layout.tsx",
      content: "export default function L({ children }) { return children; }",
      language: "tsx",
    },
    { path: "app/globals.css", content: "@tailwind base;", language: "css" },
  ],
  settings: {},
};

async function comparePresentationToFlows(bundle) {
  const presMain = bundle.presentation.homeFlow?.regions?.main ?? [];
  const flowHome = bundle.flows.home?.regions?.main ?? [];
  const presSet = new Set(presMain);
  const flowSet = new Set(flowHome);
  const missingInFlow = presMain.filter((id) => !flowSet.has(id));
  const missingInPres = flowHome.filter((id) => !presSet.has(id));
  if (missingInFlow.length || missingInPres.length) {
    console.log("presentation vs flows/home mismatch:");
    if (missingInFlow.length) console.log("  in presentation only:", missingInFlow.join(", "));
    if (missingInPres.length) console.log("  in flows/home only:", missingInPres.join(", "));
  }
}

async function audit(id) {
  const dir = path.join(root, id);
  console.log(`\n=== ${id} ===`);
  const manifest = await readTemplatePackageManifestRaw(dir);
  const validation = await validateTemplateV2Package(dir, manifest);
  console.log("validate:", validation.valid ? "PASS" : "FAIL", `(${validation.issues.length} issues)`);
  for (const issue of validation.issues) {
    console.log(`  [${issue.code}] ${issue.message}`);
  }

  const loaded = await loadTemplateV2Package(dir);
  if (!loaded.ok) {
    console.log("load FAIL:", loaded.error);
    return;
  }
  const bundle = loaded.bundle;
  await comparePresentationToFlows(bundle);
  const regIds = new Set(bundle.componentRegistry.components.map((c) => c.id));

  for (const component of bundle.componentRegistry.components) {
    const scaffoldPath = path.join(dir, component.scaffold);
    if (!existsSync(scaffoldPath)) {
      console.log("MISSING scaffold:", component.scaffold);
    }
  }

  const pres = bundle.presentation;
  const home = pres.homeFlow?.regions;
  if (!home) {
    console.log("MISSING presentation.homeFlow.regions");
  } else {
    for (const [region, comps] of Object.entries(home)) {
      if (!Array.isArray(comps)) {
        console.log("BAD homeFlow region (not array):", region);
        continue;
      }
      for (const c of comps) {
        if (!regIds.has(c)) console.log("homeFlow unregistered:", c, "in", region);
      }
    }
  }

  for (const [flowKey, flow] of Object.entries(bundle.flows)) {
    if (!flow?.regions) {
      console.log("flow missing regions:", flowKey);
      continue;
    }
    for (const [region, comps] of Object.entries(flow.regions)) {
      if (!Array.isArray(comps)) {
        console.log("flow region not array:", flowKey, region);
        continue;
      }
      for (const c of comps) {
        if (!regIds.has(c)) console.log("flow unregistered:", flowKey, c);
      }
    }
    try {
      composeRegionGridPage({
        bundle,
        flowKey,
        brandName: "Audit",
        pageTitle: flow.pageId,
      });
    } catch (e) {
      console.log("COMPOSE FAIL", flowKey, e?.message || e);
    }
  }

  try {
    const applied = await applyTemplateV2ToProject({
      project: stubProject,
      templatePackageId: id,
      directPackageId: true,
      forceBlueprintFallback: true,
    });
    console.log(
      "apply fast OK:",
      applied.project.files?.length,
      "files, arch:",
      applied.project.settings?.templateArchitectureVersion,
    );
  } catch (e) {
    console.log("APPLY fast FAIL:", e?.stack || e);
  }

  const richProject = {
    ...stubProject,
    businessProfile: {
      projectName: "Audit Co",
      industry: id.includes("saas") ? "saas" : "corporate",
      targetAudience: "Enterprise",
      businessGoals: ["Grow revenue"],
      offer: "Platform",
      tone: "professional",
      geography: "Global",
      competitors: [],
      kpis: [],
      summary: "Audit",
      requiredSections: ["hero", "features", "pricing", "contact"],
    },
  };

  const prevBp = process.env.WB_PRODUCTION_BLUEPRINT;
  process.env.WB_PRODUCTION_BLUEPRINT = "1";
  try {
    const applied = await applyTemplateV2ToProject({
      project: richProject,
      templatePackageId: id,
      directPackageId: true,
      forceBlueprintFallback: false,
    });
    console.log(
      "apply blueprint OK:",
      applied.project.files?.length,
      "blueprint:",
      Boolean(applied.project.settings?.websiteBlueprint),
    );
  } catch (e) {
    console.log("APPLY blueprint FAIL:", e?.message || e);
    if (String(e?.message || "").includes("push")) {
      console.log(e?.stack);
    }
  } finally {
    if (prevBp === undefined) delete process.env.WB_PRODUCTION_BLUEPRINT;
    else process.env.WB_PRODUCTION_BLUEPRINT = prevBp;
  }
}

for (const id of ids) {
  await audit(id);
}
