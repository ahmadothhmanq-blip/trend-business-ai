import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "templates", "website");
const dirs = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let totalMissing = 0;
const errors = [];

for (const pkg of dirs.sort()) {
  const presPath = path.join(root, pkg, "presentation", "presentation.json");
  const regPath = path.join(root, pkg, "components", "registry.json");
  let pres;
  let reg;
  try {
    pres = JSON.parse(readFileSync(presPath, "utf8"));
    reg = JSON.parse(readFileSync(regPath, "utf8"));
  } catch {
    continue;
  }

  const componentIds = new Set((reg.components ?? []).map((c) => c.id));
  const inFlow = new Set();
  const regions = pres.homeFlow?.regions ?? {};
  for (const [region, ids] of Object.entries(regions)) {
    for (const id of ids) {
      inFlow.add(id);
      if (!componentIds.has(id)) {
        errors.push(`${pkg}: homeFlow.${region} references missing component ${id}`);
      }
    }
  }

  const skip = new Set(
    [pres.navigation?.componentId, pres.hero?.componentId, pres.footer?.componentId, pres.sectionShell?.componentId].filter(
      Boolean,
    ),
  );
  const missing = [];
  for (const c of reg.components ?? []) {
    if (skip.has(c.id)) continue;
    if (c.role === "section-shell") continue;
    if (!inFlow.has(c.id)) missing.push(c.id);
  }

  const mainN = regions.main?.length ?? 0;
  const status = missing.length ? `MISSING: ${missing.join(", ")}` : "OK";
  console.log(`${pkg}: registry=${componentIds.size} homeFlow=${inFlow.size} main=${mainN} — ${status}`);
  totalMissing += missing.length;
}

console.log(`\ntotal missing from homeFlow: ${totalMissing}`);
if (errors.length) {
  console.log("\nBROKEN REFERENCES:");
  for (const e of errors) console.log(e);
  process.exit(1);
}
process.exit(totalMissing > 0 ? 2 : 0);
