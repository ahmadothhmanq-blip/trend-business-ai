import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateIndustryImageGate } from "@/lib/website/publish-gate/industry-images";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

function projectWithSiteImages(input: {
  hero: string;
  gallery?: string[];
  industry?: string;
}): GeneratedWebsiteProject {
  const gallery = input.gallery ?? [];
  return {
    title: "Test",
    files: [
      {
        path: "lib/site-images.ts",
        content: `export const HERO_IMAGE = ${JSON.stringify(input.hero)};
export const PRODUCT_IMAGE = "";
export const SERVICE_IMAGE = "";
export const BACKGROUND_IMAGE = "";
export const GALLERY_IMAGES = ${JSON.stringify(gallery)} as const;
export const SECTION_IMAGES = [] as const;
export const TEAM_IMAGES = [] as const;
export const TESTIMONIAL_IMAGES = [] as const;`,
        language: "ts",
      },
    ],
    settings: { businessIndustry: input.industry ?? "law" },
  } as GeneratedWebsiteProject;
}

describe("evaluateIndustryImageGate", () => {
  it("passes for law hero from law pack", () => {
    const checks = evaluateIndustryImageGate(
      projectWithSiteImages({
        hero:
          "https://images.unsplash.com/photo-1589829545856-d10d557cf57f?auto=format&fit=crop&w=2400&q=90",
        industry: "law",
      }),
    );
    assert.ok(checks.some((check) => check.passed && check.id === "industry-images"));
  });

  it("blocks cross-industry hero on law site", () => {
    const checks = evaluateIndustryImageGate(
      projectWithSiteImages({
        hero:
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=90",
        industry: "law",
      }),
    );
    assert.ok(
      checks.some(
        (check) =>
          !check.passed &&
          check.id === "industry-images" &&
          check.severity === "blocker",
      ),
    );
  });
});
