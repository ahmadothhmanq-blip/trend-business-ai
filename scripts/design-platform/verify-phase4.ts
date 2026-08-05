/**
 * TBDP Phase 4 verification — sector DNA, experience profiles, AI selection, isolation.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  TBDP_SECTOR_DNA_PHASE,
  TBDP_SECTOR_DNA_VERSION,
  TBDP_SECTOR_DNA_COUNT,
  TBDP_EXPERIENCE_PROFILE_COUNT,
  TBDP_SECTOR_CATALOG_COUNT,
  assertSectorDnaCatalog,
  TBDP_SECTOR_DNA_CATALOG,
  selectSectorDesign,
  resolveSectorDna,
} from "@/lib/design-platform/sector-dna";

const root = join(import.meta.dirname, "../..");
const resultsDir = join(root, "scripts/benchmark-results/design-platform");

type Check = { id: string; ok: boolean; detail?: string };

function record(checks: Check[], id: string, ok: boolean, detail?: string) {
  checks.push({ id, ok, detail });
}

function main() {
  const checks: Check[] = [];

  record(checks, "dna.phase", TBDP_SECTOR_DNA_PHASE === "sector-dna-4");
  record(checks, "dna.version", TBDP_SECTOR_DNA_VERSION === "4.0.0");
  record(checks, "sector.count", TBDP_SECTOR_DNA_COUNT === 10);
  record(checks, "experience.count", TBDP_EXPERIENCE_PROFILE_COUNT === 10);
  record(checks, "catalog.count", TBDP_SECTOR_CATALOG_COUNT === 10);

  let catalogValid = true;
  try {
    assertSectorDnaCatalog(TBDP_SECTOR_DNA_CATALOG);
  } catch {
    catalogValid = false;
  }
  record(checks, "catalog.valid", catalogValid);

  const subdirs = [
    "core",
    "sectors",
    "experience-profiles",
    "schema",
    "validation",
    "ai",
    "docs",
  ];
  for (const dir of subdirs) {
    record(
      checks,
      `module.${dir}`,
      existsSync(join(root, "lib/design-platform/sector-dna", dir)),
    );
  }

  const sectors = [
    "saas",
    "restaurant",
    "real-estate",
    "medical",
    "creative-studio",
    "hotel-resort",
    "law-firm",
    "finance",
    "education",
    "logistics",
  ];
  for (const id of sectors) {
    record(
      checks,
      `sector.${id}`,
      existsSync(join(root, "lib/design-platform/sector-dna/sectors", `${id}.ts`)),
    );
  }

  const ai = selectSectorDesign({ sectorId: "saas", goal: "conversion" });
  record(checks, "ai.selection", ai.selections.layoutId.length > 0);
  record(checks, "ai.confidence", ai.metadata.confidence > 0);

  const resolved = resolveSectorDna("medical");
  record(checks, "resolve.foundations", resolved.foundations.color.primary !== undefined);
  record(checks, "resolve.experience", resolved.experience.motion !== undefined);

  const docs = [
    "ARCHITECTURE.md",
    "SECTOR-CATALOG.md",
    "EXPERIENCE-CATALOG.md",
    "BACKWARD-COMPATIBILITY.md",
  ];
  for (const doc of docs) {
    record(
      checks,
      `docs.${doc.replace(".md", "")}`,
      existsSync(join(root, "lib/design-platform/sector-dna/docs", doc)),
    );
  }

  const protectedPaths = [
    "lib/website/template-v2",
    "templates/website",
    "lib/website/builder",
  ];
  for (const rel of protectedPaths) {
    record(checks, `isolation.${rel.replace(/\//g, ".")}`, existsSync(join(root, rel)));
  }

  let tscOk = true;
  try {
    execSync("npx tsc --noEmit --pretty false", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    const output =
      (error as { stdout?: string; stderr?: string }).stdout ??
      (error as { stdout?: string; stderr?: string }).stderr ??
      "";
    tscOk = !output.includes("design-platform/sector-dna");
  }
  record(checks, "tsc.sector-dna", tscOk);

  let eslintOk = true;
  try {
    execSync(
      "npx eslint lib/design-platform/sector-dna --max-warnings 0",
      { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
  } catch {
    eslintOk = false;
  }
  record(checks, "eslint.sector-dna", eslintOk);

  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok);

  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(
    join(resultsDir, "phase4-qa-report.json"),
    JSON.stringify({ passed, total: checks.length, checks, failed }, null, 2),
  );

  console.log(`\nTBDP Phase 4 QA: ${passed}/${checks.length} checks passed\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "✓" : "✗"} ${c.id}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
}

main();
