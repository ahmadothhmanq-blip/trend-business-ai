import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapTbgeSpecToWebsiteProject } from "@/lib/tbge/integration/result-mapper";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

function minimalSpec(overrides: Partial<GenerationSpec["business"]> = {}): GenerationSpec {
  return {
    productId: "website-builder",
    business: {
      name: "Apex Motors",
      industry: "Automotive",
      industryId: "automotive",
      audience: "car buyers",
      offer: "Premium vehicles",
      goals: ["sell cars"],
      ...overrides,
    },
    structure: {
      pages: [{ name: "Home", path: "/", sections: ["Hero"] }],
    },
    design: {
      tokens: {
        primary: "#000",
        secondary: "#111",
        accent: "#f00",
        background: "#fff",
        foreground: "#000",
      },
      componentPalette: [],
    },
    capabilities: {
      auth: false,
      dashboard: false,
      ecommerce: false,
      saas: false,
      database: { provider: "none" },
    },
    provenance: { lockedAt: new Date().toISOString(), plannerModel: "test" },
  } as unknown as GenerationSpec;
}

describe("mapTbgeSpecToWebsiteProject industry propagation", () => {
  it("stores canonical businessIndustry for image routing", () => {
    const project = mapTbgeSpecToWebsiteProject({
      spec: minimalSpec(),
      files: [{ path: "app/page.tsx", content: "export default function Page(){return null}" }],
    });
    assert.equal(project.settings?.businessIndustry, "automotive");
  });
});
