import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveGenerationPrompt } from "@/lib/website/builder/resolve-generation-prompt";

describe("resolveGenerationPrompt", () => {
  it("requires projectBrief for new website generation", () => {
    assert.deepEqual(
      resolveGenerationPrompt({
        mode: "generate",
        projectBrief: "",
        activeProjectDescription: "Luxury real estate marketplace",
      }),
      { ok: false, reason: "empty_brief" },
    );

    assert.deepEqual(
      resolveGenerationPrompt({
        mode: "generate",
        projectBrief: "انشئ موقع لشركة ألعاب",
        activeProjectDescription: "Luxury real estate marketplace",
      }),
      { ok: true, prompt: "انشئ موقع لشركة ألعاب" },
    );
  });

  it("never substitutes template or fixture text in generate mode", () => {
    assert.deepEqual(
      resolveGenerationPrompt({
        mode: "generate",
        projectBrief: "Create a website for a gaming company",
        activeProjectDescription: "Luxury real estate marketplace",
      }),
      { ok: true, prompt: "Create a website for a gaming company" },
    );
  });

  it("allows stored description for continue/resume iteration", () => {
    assert.deepEqual(
      resolveGenerationPrompt({
        mode: "continue",
        projectBrief: "",
        activeProjectDescription: "Existing gaming company website",
        resume: true,
      }),
      { ok: true, prompt: "Existing gaming company website" },
    );

    assert.deepEqual(
      resolveGenerationPrompt({
        mode: "continue",
        projectBrief: "Add a careers page",
        activeProjectDescription: "Existing gaming company website",
        iterationOnActiveProject: true,
      }),
      { ok: true, prompt: "Existing gaming company website" },
    );
  });

  it("prefers user brief for regenerate when provided", () => {
    assert.deepEqual(
      resolveGenerationPrompt({
        mode: "regenerate",
        projectBrief: "Create a website for a gaming company",
        activeProjectDescription: "Luxury real estate marketplace",
      }),
      { ok: true, prompt: "Create a website for a gaming company" },
    );
  });
});
