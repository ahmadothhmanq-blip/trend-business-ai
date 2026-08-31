import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFinalImageInjectionToProject } from "@/lib/ai-core/image-engine/inject";

describe("applyFinalImageInjectionToProject", () => {
  it("skips injection when image strategy is without-images", () => {
    const project = {
      files: [
        {
          path: "app/page.tsx",
          content: '<img src="" alt="hero" />',
          language: "tsx",
        },
      ],
      assetManifest: { items: [] },
    };

    const result = applyFinalImageInjectionToProject(project, {
      imageStrategy: { mode: "without-images", industryGate: true },
    });

    assert.equal(result.files[0]?.content, '<img src="" alt="hero" />');
  });

  it("fills premium stock images when with-images and manifest is empty", () => {
    const project = {
      prompt: "شركة موبايل لبيع الجوالات",
      files: [
        {
          path: "app/page.tsx",
          content: '<img src="" alt="hero" />',
          language: "tsx",
        },
      ],
    };

    const result = applyFinalImageInjectionToProject(project, {
      imageStrategy: { mode: "with-images", industryGate: true },
    }) as typeof project & {
      assetManifest?: { items: Array<{ url?: string | null }> };
    };

    assert.ok((result.assetManifest?.items?.length ?? 0) > 0);
    const siteImages = result.files.find((f) => f.path === "lib/site-images.ts");
    assert.ok(siteImages);
    assert.match(siteImages!.content, /w=2400|w=1920/);
  });
});
