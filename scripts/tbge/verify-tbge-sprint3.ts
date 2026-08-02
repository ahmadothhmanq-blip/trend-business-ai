/**
 * TBGE Sprint 3 verification — Assembly Engine.
 */
import { createAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { createGeneratorRegistry } from "@/lib/tbge/assembly/registry";
import { createFullAssemblyTestSpec } from "@/lib/tbge/spec/fixtures/assembly-spec";
import { createTestGenerationSpec } from "@/lib/tbge/spec/fixtures/test-spec";

async function main() {
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

  function record(name: string, ok: boolean, detail?: string) {
    checks.push({ name, ok, detail });
  }

  const registry = createGeneratorRegistry();
  record("built-in generators registered", registry.list().length >= 10);
  record("scaffold-static available", registry.has("scaffold-static"));

  const engine = createAssemblyEngine();
  const single = await engine.assemble(createTestGenerationSpec());
  record("single-node assembly produces file", single.files.length === 1);
  record("assembly is deterministic", single.stats.deterministicRatio === 1);

  const full = await engine.assemble(createFullAssemblyTestSpec());
  record("full graph assembly completes", full.files.length >= 9);
  record("parallel waves executed", full.stats.wavesCompleted >= 5);
  record("no LLM in assembly stats", full.stats.deterministicRatio === 1);

  const failed = checks.filter((c) => !c.ok);
  console.log("TBGE Sprint 3 Verification\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
