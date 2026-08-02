import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { resolveTbgeFlags, shouldRunTbgeComposer, shouldRunTbgePlanning, shouldUseTbgeOrchestrator } from "@/lib/tbge/flags";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("TBGE flags", () => {
  afterEach(restoreEnv);

  it("defaults all flags to off except legacy fallbacks", () => {
    delete process.env.TBGE_ENABLED;
    delete process.env.TBGE_LEGACY_FILE_LLM;
    delete process.env.TBGE_SPEC_CHECKPOINT;
    const flags = resolveTbgeFlags();
    assert.equal(flags.enabled, false);
    assert.equal(flags.shadowMode, false);
    assert.equal(flags.assembly, false);
    assert.equal(flags.composer, false);
    assert.equal(flags.legacyFileLlm, true);
    assert.equal(flags.specCheckpoint, true);
    assert.equal(flags.legacyFull, false);
  });

  it("shouldUseTbgeOrchestrator requires enabled and not legacy full", () => {
    process.env.TBGE_ENABLED = "1";
    assert.equal(shouldUseTbgeOrchestrator(), true);
    process.env.TBGE_LEGACY_FULL = "1";
    assert.equal(shouldUseTbgeOrchestrator(), false);
  });

  it("shouldRunTbgePlanning requires orchestrator and planning flag", () => {
    delete process.env.TBGE_ENABLED;
    delete process.env.TBGE_PLANNING;
    assert.equal(shouldRunTbgePlanning(), false);
    process.env.TBGE_ENABLED = "1";
    assert.equal(shouldRunTbgePlanning(), false);
    process.env.TBGE_PLANNING = "1";
    assert.equal(shouldRunTbgePlanning(), true);
  });

  it("shouldRunTbgeComposer is always on when TBGE orchestrator is active", () => {
    delete process.env.TBGE_ENABLED;
    delete process.env.TBGE_COMPOSER;
    assert.equal(shouldRunTbgeComposer(), false);
    process.env.TBGE_ENABLED = "1";
    assert.equal(shouldRunTbgeComposer(), true);
    delete process.env.TBGE_COMPOSER;
    assert.equal(shouldRunTbgeComposer(), true);
    process.env.TBGE_COMPOSER = "1";
    assert.equal(shouldRunTbgeComposer(), true);
  });
});
