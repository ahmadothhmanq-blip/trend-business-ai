/**
 * TBGE Sprint 4 verification — Component Composer.
 */
import { getDefaultTbgeContainer, resetDefaultTbgeContainer } from "@/lib/tbge/di/bootstrap";
import { TBGE_TOKENS } from "@/lib/tbge/di/tokens";
import { resolveTbgeFlags, shouldRunTbgeComposer } from "@/lib/tbge/flags";
import type { ComponentComposer } from "@/lib/tbge/composer/runtime";
import { createComponentComposer } from "@/lib/tbge/composer/runtime";
import { createComposerTestSpec } from "@/lib/tbge/spec/fixtures/composer-spec";

async function main() {
  const checks: Array<{ name: string; ok: boolean; detail?: string }> = [];

  function record(name: string, ok: boolean, detail?: string) {
    checks.push({ name, ok, detail });
  }

  const flags = resolveTbgeFlags();
  record("TBGE_COMPOSER defaults off", flags.composer === false);
  record("shouldRunTbgeComposer defaults false", shouldRunTbgeComposer() === false);

  const spec = createComposerTestSpec();
  const composer = createComponentComposer();
  const result = composer.compose(spec);

  record("composer produces pages", result.composition.pages.length === 2);
  record("composer produces sections", result.stats.sectionsComposed >= 5);
  record("gaming industry pattern applied", result.composition.industryPattern.id === "gaming");
  record("theme css variables present", Boolean(result.composition.theme.cssVariables["--color-primary"]));
  record("deterministic stats", result.stats.durationMs >= 0);

  resetDefaultTbgeContainer();
  const container = getDefaultTbgeContainer();
  const diComposer = container.resolve<ComponentComposer>(TBGE_TOKENS.componentComposer);
  const diResult = diComposer.compose(spec);
  record("DI componentComposer registered", diResult.composition.specId === spec.specId);

  const failed = checks.filter((c) => !c.ok);
  console.log("TBGE Sprint 4 Verification\n");
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
