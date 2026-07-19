import {
  WEBSITE_INDUSTRY_INTELLIGENCE,
  PRIMARY_WEBSITE_INDUSTRIES,
  getWebsiteIndustryIntelligence,
} from "../lib/ai-core/industry-intelligence/profiles.ts";

const requiredFields = [
  "recommendedPages",
  "requiredSections",
  "ctaTypes",
  "contentStyle",
  "designStyle",
  "imageRequirements",
];

let ok = true;

for (const id of PRIMARY_WEBSITE_INDUSTRIES) {
  const profile = getWebsiteIndustryIntelligence(id);
  for (const field of requiredFields) {
    const value = profile[field];
    if (Array.isArray(value) ? value.length === 0 : !String(value || "").trim()) {
      console.error(`FAIL ${id}.${field} empty`);
      ok = false;
    }
  }
  if (profile.recommendedPages.length < 5) {
    console.error(`FAIL ${id} recommendedPages too short`);
    ok = false;
  }
}

const tourism = WEBSITE_INDUSTRY_INTELLIGENCE.tourism;
if (
  !tourism.recommendedPages.includes("Destinations") ||
  !tourism.recommendedPages.includes("Booking") ||
  tourism.designStyle !== "Travel premium"
) {
  console.error("FAIL tourism blueprint mismatch");
  ok = false;
}

const healthcare = WEBSITE_INDUSTRY_INTELLIGENCE.clinic;
if (healthcare.label !== "Healthcare") {
  console.error("FAIL clinic label should be Healthcare");
  ok = false;
}

if (!ok) process.exit(1);
console.log(
  `PASS industry intelligence (${PRIMARY_WEBSITE_INDUSTRIES.length} primary verticals)`,
);
