import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeSectionBgConfig,
  parseSectionBgConfig,
  serializeSectionBgConfig,
  ensureWbSectionBgGlobalsCss,
} from "@/lib/ai-core/visual-editor/section-bg-config";
import { extractSectionBackground } from "@/lib/ai-core/visual-editor/section-bg-extract";
import {
  applySectionBackgroundToPageSource,
  applySectionBackgroundToSectionSource,
  sectionBackgroundsEqual,
} from "@/lib/ai-core/visual-editor/section-bg-persist";
import {
  resolveSectionBgImageStyle,
  resolveSectionBgOverlayStyle,
} from "@/lib/ai-core/visual-editor/section-bg-styles";
import { createDefaultSectionBackground } from "@/lib/ai-core/visual-editor/section-bg-types";
import { applyWebsiteEditActions } from "@/lib/ai-core/website-editor/actions";
import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";
import {
  documentToSaveActions,
  updateNodeSectionBackground,
} from "@/lib/ai-core/visual-editor/ops";
import type { VisualDocument } from "@/lib/ai-core/visual-editor/types";

const HERO_SOURCE = `"use client";

import { HERO_IMAGE } from "@/lib/site-images";

type HeroLuxuryProps = {
  title?: string;
  imageUrl?: string | null;
};

export function HeroLuxury({
  title = "Welcome",
  imageUrl,
}: HeroLuxuryProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE, 0);
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <div className="absolute inset-0">
        <img src={src} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
      </div>
      <h1>{title}</h1>
    </section>
  );
}`;

const PAGE_SOURCE = `<HeroLuxury title="Acme" imageUrl="https://cdn.example.com/hero.jpg" />`;

const CTA_SOURCE = `export function CtaBand() {
  return (
    <section className="relative py-20">
      <h2>Get started</h2>
    </section>
  );
}`;

describe("section background editor", () => {
  it("serializes and parses background config round-trip", () => {
    const bg = createDefaultSectionBackground({
      id: "HeroLuxury-bg",
      sectionExportName: "HeroLuxury",
      kind: "hero",
      url: "https://cdn.example.com/bg.jpg",
      source: "url",
      displayMode: "contain",
      position: "top",
      effects: {
        brightness: 90,
        contrast: 110,
        saturation: 80,
        grayscale: 10,
        blur: 2,
      },
      overlay: {
        enabled: true,
        color: "#000",
        opacity: 60,
        mode: "gradient",
        gradient: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent)",
        blur: 4,
      },
      parallax: true,
      borderRadius: "1rem",
      sectionHeight: "lg",
      mobile: {
        url: "https://cdn.example.com/mobile.jpg",
        displayMode: "cover",
        position: "center",
        positionX: "50%",
        positionY: "50%",
        hideOnMobile: false,
      },
      alt: "Hero background",
      decorative: false,
    });
    const raw = serializeSectionBgConfig(bg);
    const parsed = parseSectionBgConfig(raw);
    assert.ok(parsed);
    const merged = mergeSectionBgConfig(bg, parsed);
    assert.equal(merged.url, bg.url);
    assert.equal(merged.displayMode, "contain");
    assert.equal(merged.effects.blur, 2);
    assert.equal(merged.overlay.opacity, 60);
    assert.equal(merged.parallax, true);
    assert.equal(merged.mobile.url, "https://cdn.example.com/mobile.jpg");
  });

  it("extracts background from hero page props and persisted config", () => {
    const bg = extractSectionBackground({
      exportName: "HeroLuxury",
      kind: "hero",
      componentSource: HERO_SOURCE,
      pageSource: PAGE_SOURCE,
    });
    assert.equal(bg.url, "https://cdn.example.com/hero.jpg");
    assert.equal(bg.hasImageUrlProp, true);
    assert.equal(bg.kind, "hero");
  });

  it("resolves preview styles for display modes and effects", () => {
    const bg = createDefaultSectionBackground({
      id: "x",
      sectionExportName: "X",
      kind: "section",
      url: "https://cdn.example.com/a.jpg",
      displayMode: "cover",
      position: "custom",
      positionX: "25%",
      positionY: "75%",
      effects: {
        brightness: 80,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        blur: 3,
      },
    });
    const imgStyle = resolveSectionBgImageStyle(bg, "desktop");
    assert.equal(imgStyle.objectFit, "cover");
    assert.equal(imgStyle.objectPosition, "25% 75%");
    assert.match(String(imgStyle.filter), /blur\(3px\)/);

    const overlay = resolveSectionBgOverlayStyle({
      ...bg,
      overlay: { ...bg.overlay, enabled: true, mode: "solid", opacity: 50 },
    });
    assert.ok(overlay.background);
  });

  it("persists full background config to section source", () => {
    const bg = createDefaultSectionBackground({
      id: "CtaBand-bg",
      sectionExportName: "CtaBand",
      kind: "cta",
      url: "https://cdn.example.com/cta.jpg",
      source: "library",
      displayMode: "cover",
      sectionHeight: "md",
      alt: "CTA background",
    });
    const next = applySectionBackgroundToSectionSource(CTA_SOURCE, bg);
    assert.ok(next);
    assert.match(next!, /data-wb-section-bg-config/);
    assert.match(next!, /wb-section-bg-img/);
    assert.match(next!, /wb-section-bg-overlay/);
    assert.match(next!, /https:\/\/cdn\.example\.com\/cta\.jpg/);
  });

  it("persists imageUrl prop on home page for hero sections", () => {
    const bg = createDefaultSectionBackground({
      id: "HeroLuxury-bg",
      sectionExportName: "HeroLuxury",
      kind: "hero",
      url: "https://cdn.example.com/new-hero.jpg",
      hasImageUrlProp: true,
    });
    const next = applySectionBackgroundToPageSource(PAGE_SOURCE, "HeroLuxury", bg);
    assert.ok(next);
    assert.match(next!, /new-hero\.jpg/);
  });

  it("round-trips after save via re-extraction", () => {
    const original = createDefaultSectionBackground({
      id: "CtaBand-bg",
      sectionExportName: "CtaBand",
      kind: "cta",
      url: "https://cdn.example.com/roundtrip.jpg",
      displayMode: "contain",
      parallax: true,
      borderRadius: "0.5rem",
    });
    const saved = applySectionBackgroundToSectionSource(CTA_SOURCE, original);
    assert.ok(saved);
    const restored = extractSectionBackground({
      exportName: "CtaBand",
      kind: "cta",
      componentSource: saved!,
    });
    assert.equal(restored.url, original.url);
    assert.equal(restored.displayMode, original.displayMode);
    assert.equal(restored.parallax, original.parallax);
  });

  it("emits update-section-background save actions", () => {
    const bg = createDefaultSectionBackground({
      id: "CtaBand-bg",
      sectionExportName: "CtaBand",
      kind: "cta",
      url: "https://cdn.example.com/a.jpg",
    });
    const baseline: VisualDocument = {
      version: 1,
      generationId: "g1",
      brandName: "Acme",
      nodes: [
        {
          id: "node-0-CtaBand",
          exportName: "CtaBand",
          path: "components/sections/CtaBand.tsx",
          kind: "cta",
          label: "CTA",
          sectionBackground: createDefaultSectionBackground({
            id: "CtaBand-bg",
            sectionExportName: "CtaBand",
            kind: "cta",
            url: "",
            source: "none",
          }),
        },
      ],
      tokens: {
        primary: "#d4af37",
        secondary: "#1a1a1a",
        accent: "#c6a75e",
        background: "#0a0a0a",
        foreground: "#f5f5f5",
        headingFont: "Playfair Display",
        bodyFont: "Source Sans 3",
        sectionY: "6rem",
      },
      selectedNodeId: "node-0-CtaBand",
      selectedButtonId: null,
      selectedLinkId: null,
      selectedIconId: null,
      viewport: "desktop",
      extensions: {},
      dirty: true,
      updatedAt: new Date().toISOString(),
    };
    const current = updateNodeSectionBackground(baseline, "node-0-CtaBand", {
      url: bg.url,
      source: "url",
    });
    const actions = documentToSaveActions(baseline, current);
    assert.equal(actions.length, 1);
    assert.equal(actions[0]!.type, "update-section-background");
  });

  it("applies update-section-background via website edit actions", () => {
    const bg = createDefaultSectionBackground({
      id: "CtaBand-bg",
      sectionExportName: "CtaBand",
      kind: "cta",
      url: "https://cdn.example.com/persist.jpg",
      overlay: {
        enabled: true,
        color: "#111",
        opacity: 40,
        mode: "solid",
        gradient: "",
        blur: 0,
      },
    });
    const understanding: WebsiteUnderstanding = {
      brandName: "Acme",
      homePath: "app/page.tsx",
      sections: [
        {
          exportName: "CtaBand",
          path: "components/sections/CtaBand.tsx",
          kindHint: "cta",
          usedOnHome: true,
        },
      ],
      homeComponentOrder: ["CtaBand"],
      designTokens: {},
      imageCount: 0,
      hasGlobalsCss: true,
      structureNotes: [],
      summary: "test",
    };
    const result = applyWebsiteEditActions({
      files: [
        {
          path: "components/sections/CtaBand.tsx",
          content: CTA_SOURCE,
          language: "tsx",
        },
        { path: "app/globals.css", content: "body {}", language: "css" },
      ],
      understanding,
      actions: [
        {
          type: "update-section-background",
          target: "CtaBand",
          value: JSON.stringify(bg),
        },
      ],
    });
    const section = result.files.find((f) => f.path.includes("CtaBand"));
    assert.ok(section?.content.includes("data-wb-section-bg-config"));
    assert.ok(section?.content.includes("persist.jpg"));
    const globals = result.files.find((f) => f.path.endsWith("globals.css"));
    assert.ok(globals?.content.includes("wb-section-bg-styles"));
  });

  it("removes background and clears url on persist", () => {
    const withBg = createDefaultSectionBackground({
      id: "CtaBand-bg",
      sectionExportName: "CtaBand",
      kind: "cta",
      url: "https://cdn.example.com/remove.jpg",
    });
    const saved = applySectionBackgroundToSectionSource(CTA_SOURCE, withBg);
    assert.ok(saved);
    const cleared = createDefaultSectionBackground({
      id: "CtaBand-bg",
      sectionExportName: "CtaBand",
      kind: "cta",
      url: "",
      source: "none",
    });
    const next = applySectionBackgroundToSectionSource(saved!, cleared);
    assert.ok(next);
    const restored = extractSectionBackground({
      exportName: "CtaBand",
      kind: "cta",
      componentSource: next!,
    });
    assert.equal(restored.url, "");
    assert.equal(restored.source, "none");
  });

  it("sectionBackgroundsEqual detects changes", () => {
    const a = createDefaultSectionBackground({
      id: "1",
      sectionExportName: "S",
      kind: "section",
      url: "https://a.com/1.jpg",
    });
    const b = { ...a };
    assert.ok(sectionBackgroundsEqual(a, b));
    assert.ok(!sectionBackgroundsEqual(a, { ...a, parallax: true }));
  });

  it("injects section bg globals css once", () => {
    const css = ensureWbSectionBgGlobalsCss("body {}");
    assert.match(css, /wb-section-bg-styles/);
    assert.equal(ensureWbSectionBgGlobalsCss(css), css);
  });
});
