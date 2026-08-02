/**
 * Verifies Website Builder client prompt resolution (no API / LLM calls).
 */
import { resolveGenerationPrompt } from "../lib/website/builder/resolve-generation-prompt";

const STALE_REAL_ESTATE = "Luxury real estate marketplace";

const cases = [
  {
    id: "arabic-gaming",
    projectBrief: "انشئ موقع لشركة ألعاب",
    language: "Arabic",
  },
  {
    id: "english-gaming",
    projectBrief: "Create a website for a gaming company",
    language: "English",
  },
];

let pass = 0;
let fail = 0;

console.log("Website Builder brief prompt verification\n");

for (const testCase of cases) {
  const emptyBlocked = resolveGenerationPrompt({
    mode: "generate",
    projectBrief: "",
    activeProjectDescription: STALE_REAL_ESTATE,
  });

  const resolved = resolveGenerationPrompt({
    mode: "generate",
    projectBrief: testCase.projectBrief,
    activeProjectDescription: STALE_REAL_ESTATE,
  });

  const checks = {
    emptyBriefBlocked: emptyBlocked.ok === false,
    promptMatchesBrief:
      resolved.ok === true && resolved.prompt === testCase.projectBrief,
    noRealEstateSubstitution:
      resolved.ok === true && !resolved.prompt.includes("Luxury real estate"),
  };

  const ok = Object.values(checks).every(Boolean);
  if (ok) pass += 1;
  else fail += 1;

  console.log(
    JSON.stringify(
      {
        case: testCase.id,
        language: testCase.language,
        projectBrief: testCase.projectBrief,
        requestBodyPrompt: resolved.ok ? resolved.prompt : null,
        activeProjectDescription: STALE_REAL_ESTATE,
        templateBrief: null,
        checks,
        status: ok ? "PASS" : "FAIL",
      },
      null,
      2,
    ),
  );
  console.log("");
}

console.log(`Summary: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
