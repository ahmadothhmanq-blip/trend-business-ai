import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveDesignEngineAssetManifest,
  resolveDesignEngineStrategy,
} from "@/lib/website/builder/design-engine-view";
import type { GeneratedWebsiteProject } from "@/lib/website/types";

const SITE_IMAGES = `export const HERO_IMAGE = "https://cdn.example/hero.jpg";
export const GALLERY_IMAGES = ["https://cdn.example/g1.jpg"] as const;`;

function baseProject(
  overrides: Partial<GeneratedWebsiteProject> = {},
): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Test Co",
    description: "Tailored clothing and styling",
    pages: ["app/page.tsx", "app/about/page.tsx"],
    sections: ["Hero", "Services"],
    colorPalette: [],
    typography: [],
    components: [],
    content: [],
    seo: ["tailoring", "corporate apparel"],
    roadmap: [],
    files: [
      {
        path: "lib/site-images.ts",
        content: SITE_IMAGES,
        language: "typescript",
      },
    ],
    businessProfile: {
      projectName: "Test Co",
      industry: "business",
      targetAudience: "Executives",
      summary: "Premium corporate styling",
      tone: "Executive trust",
      businessGoals: ["Book fittings"],
      geography: "Global",
      offer: "Tailoring",
      competitors: [],
      requiredSections: [],
      kpis: [],
    },
    ...overrides,
  };
}

describe("design engine view resolution", () => {
  it("returns undefined when project is missing", () => {
    assert.equal(resolveDesignEngineStrategy(undefined), undefined);
    assert.equal(resolveDesignEngineAssetManifest(null), undefined);
  });

  it("derives strategy positioning from business profile when blueprint strategy is empty", () => {
    const strategy = resolveDesignEngineStrategy(baseProject({ strategy: undefined }));
    assert.equal(strategy?.positioning, "Premium corporate styling");
    assert.deepEqual(strategy?.sitemap, ["/", "/about"]);
    assert.equal(strategy?.contentStrategy.brandVoice, "Executive trust");
  });

  it("keeps persisted strategy when positioning exists", () => {
    const strategy = resolveDesignEngineStrategy(
      baseProject({
        strategy: {
          positioning: "Stored positioning",
          sitemap: ["/"],
          pages: [],
          sectionPlan: [],
          conversionFunnel: [],
          contentStructure: [],
          contentStrategy: {
            brandVoice: "Bold",
            messagingPillars: [],
            proofPoints: [],
            objectionHandlers: [],
            seoTopics: [],
          },
          ctas: ["Book now"],
          seoFocus: [],
        },
      }),
    );
    assert.equal(strategy?.positioning, "Stored positioning");
  });

  it("derives asset manifest items from lib/site-images.ts when manifest is missing", () => {
    const manifest = resolveDesignEngineAssetManifest(
      baseProject({ assetManifest: undefined }),
    );
    assert.ok(manifest?.items.length);
    assert.equal(manifest?.items[0]?.role, "hero");
    assert.equal(manifest?.items[0]?.url, "https://cdn.example/hero.jpg");
    assert.ok(manifest?.items.some((item) => item.role === "gallery"));
  });

  it("prefers persisted asset manifest over file derivation", () => {
    const manifest = resolveDesignEngineAssetManifest(
      baseProject({
        assetManifest: {
          items: [
            {
              id: "saved-hero",
              role: "hero",
              name: "Saved hero",
              prompt: "",
              alt: "Saved",
              url: "https://cdn.example/saved.jpg",
              storagePath: null,
              status: "generated",
            },
          ],
          provider: "ai",
        },
      }),
    );
    assert.equal(manifest?.items.length, 1);
    assert.equal(manifest?.items[0]?.id, "saved-hero");
  });

  it("parses typed V2 blank site-images exports with SITE_IMAGES metadata", () => {
    const manifest = resolveDesignEngineAssetManifest(
      baseProject({
        assetManifest: undefined,
        files: [
          {
            path: "lib/site-images.ts",
            content: `export const HERO_IMAGE: string = "https://cdn.example/hero.jpg";
export const GALLERY_IMAGES = ["https://cdn.example/gallery.jpg"] as const;
export const SITE_IMAGES: SiteImageMeta[] = [
  { "id": "meta-1", "role": "gallery", "name": "Lobby", "alt": "Lobby", "url": "https://cdn.example/lobby.jpg", "status": "generated" }
];`,
            language: "typescript",
          },
        ],
      }),
    );
    assert.ok((manifest?.items?.length ?? 0) >= 2);
    assert.ok(
      manifest?.items.some((item) => item.url === "https://cdn.example/hero.jpg"),
    );
    assert.ok(
      manifest?.items.some((item) => item.url === "https://cdn.example/lobby.jpg"),
    );
  });

  it("falls through empty persisted manifest items to site-images", () => {
    const manifest = resolveDesignEngineAssetManifest(
      baseProject({
        assetManifest: {
          items: [
            {
              id: "pending-hero",
              role: "hero",
              name: "Hero",
              prompt: "",
              alt: "Hero",
              url: null,
              storagePath: null,
              status: "pending",
            },
          ],
          provider: "ai",
        },
      }),
    );
    assert.equal(manifest?.items[0]?.url, "https://cdn.example/hero.jpg");
  });

  it("scrapes photographic URLs from generated component files", () => {
    const manifest = resolveDesignEngineAssetManifest(
      baseProject({
        assetManifest: undefined,
        files: [
          {
            path: "lib/site-images.ts",
            content: 'export const HERO_IMAGE: string = "";',
            language: "typescript",
          },
          {
            path: "components/hero.tsx",
            content:
              '<img src="https://cdn.example/component-hero.jpg" alt="Hero" />',
            language: "tsx",
          },
        ],
      }),
    );
    assert.equal(manifest?.items[0]?.url, "https://cdn.example/component-hero.jpg");
    assert.equal(manifest?.engine, "scraped-from-files");
  });
});
