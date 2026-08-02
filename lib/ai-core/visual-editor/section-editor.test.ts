import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeSectionConfig,
  parseSectionConfig,
  serializeSectionConfig,
  ensureWbSectionGlobalsCss,
} from "@/lib/ai-core/visual-editor/section-config";
import { extractSectionConfig } from "@/lib/ai-core/visual-editor/section-extract";
import {
  applySectionConfigToSectionSource,
  sectionConfigsEqual,
} from "@/lib/ai-core/visual-editor/section-persist";
import {
  resolveSectionPreviewStyle,
  sectionIsVisible,
  sectionPreviewClassName,
} from "@/lib/ai-core/visual-editor/section-styles";
import { createDefaultSectionConfig } from "@/lib/ai-core/visual-editor/section-types";
import { applyWebsiteEditActions } from "@/lib/ai-core/website-editor/actions";
import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";
import {
  documentToSaveActions,
  moveNodeDown,
  moveNodeUp,
  updateNodeSectionConfig,
} from "@/lib/ai-core/visual-editor/ops";
import type { VisualDocument } from "@/lib/ai-core/visual-editor/types";

const SECTION_SOURCE = `"use client";

export function AboutSection() {
  return (
    <section className="py-20">
      <h2>About us</h2>
      <p>We build great products.</p>
    </section>
  );
}`;

const SECTION_WITH_CONFIG = `"use client";

export function AboutSection() {
  return (
    <section
      data-wb-section-id="AboutSection-section"
      data-wb-section-config="{&quot;v&quot;:1,&quot;sectionType&quot;:&quot;about&quot;,&quot;visibility&quot;:&quot;show&quot;,&quot;layout&quot;:{&quot;width&quot;:&quot;container&quot;,&quot;columns&quot;:2,&quot;gap&quot;:&quot;2rem&quot;,&quot;alignment&quot;:&quot;center&quot;},&quot;settings&quot;:{&quot;htmlId&quot;:&quot;about&quot;,&quot;anchor&quot;:&quot;about&quot;,&quot;cssClasses&quot;:&quot;my-about&quot;,&quot;customAttributes&quot;:&quot;&quot;},&quot;styling&quot;:{&quot;padding&quot;:&quot;2rem&quot;,&quot;margin&quot;:&quot;0&quot;,&quot;borderWidth&quot;:&quot;0&quot;,&quot;borderColor&quot;:&quot;transparent&quot;,&quot;borderStyle&quot;:&quot;solid&quot;,&quot;radius&quot;:&quot;0&quot;,&quot;shadow&quot;:&quot;none&quot;,&quot;opacity&quot;:100,&quot;zIndex&quot;:0,&quot;overflow&quot;:&quot;visible&quot;},&quot;animation&quot;:{&quot;type&quot;:&quot;fade&quot;,&quot;durationMs&quot;:800,&quot;delayMs&quot;:100},&quot;kind&quot;:&quot;section&quot;}"
      id="about"
      className="wb-section wb-animate-fade wb-section-container my-about"
      style={{ padding: "2rem" }}
    >
      <h2>About us</h2>
    </section>
  );
}`;

function baseDoc(overrides?: Partial<VisualDocument>): VisualDocument {
  const config = createDefaultSectionConfig({
    id: "AboutSection-section",
    sectionExportName: "AboutSection",
    sectionType: "about",
    kind: "section",
  });
  return {
    version: 1,
    generationId: "gen-1",
    brandName: "Acme",
    nodes: [
      {
        id: "node-0-AboutSection",
        exportName: "AboutSection",
        path: "components/sections/AboutSection.tsx",
        kind: "section",
        label: "About Section",
        text: "About us",
        sectionConfig: config,
      },
      {
        id: "node-1-CtaBand",
        exportName: "CtaBand",
        path: "components/sections/CtaBand.tsx",
        kind: "cta",
        label: "CTA",
        text: "Get started",
      },
    ],
    tokens: {
      primary: "#111",
      secondary: "#222",
      accent: "#333",
      background: "#fff",
      foreground: "#000",
      headingFont: "Inter",
      bodyFont: "Inter",
      sectionY: "5.75rem",
    },
    selectedNodeId: "node-0-AboutSection",
    selectedButtonId: null,
    selectedLinkId: null,
    selectedIconId: null,
    viewport: "desktop",
    extensions: {},
    dirty: false,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("section editor", () => {
  it("serializes and parses section config round-trip", () => {
    const config = createDefaultSectionConfig({
      id: "Hero-section",
      sectionExportName: "Hero",
      sectionType: "hero",
      kind: "hero",
      visibility: "desktop",
      layout: {
        width: "full",
        columns: 3,
        gap: "1rem",
        alignment: "center",
      },
      settings: {
        htmlId: "hero",
        anchor: "hero",
        cssClasses: "hero-block",
        customAttributes: "data-test=1",
      },
      styling: {
        padding: "3rem",
        margin: "1rem",
        borderWidth: "1px",
        borderColor: "#ccc",
        borderStyle: "solid",
        radius: "8px",
        shadow: "0 4px 12px rgba(0,0,0,0.1)",
        opacity: 90,
        zIndex: 2,
        overflow: "hidden",
      },
      animation: {
        type: "slide",
        durationMs: 500,
        delayMs: 200,
      },
    });
    const raw = serializeSectionConfig(config);
    const parsed = parseSectionConfig(raw);
    assert.ok(parsed);
    const merged = mergeSectionConfig(config, parsed);
    assert.equal(merged.sectionType, "hero");
    assert.equal(merged.layout.columns, 3);
    assert.equal(merged.settings.cssClasses, "hero-block");
    assert.equal(merged.styling.opacity, 90);
    assert.equal(merged.animation.type, "slide");
  });

  it("extracts defaults from plain section source", () => {
    const config = extractSectionConfig({
      exportName: "AboutSection",
      kind: "section",
      componentSource: SECTION_SOURCE,
    });
    assert.equal(config.sectionType, "about");
    assert.equal(config.sectionExportName, "AboutSection");
    assert.equal(config.visibility, "show");
  });

  it("extracts persisted config from section attributes", () => {
    const config = extractSectionConfig({
      exportName: "AboutSection",
      kind: "section",
      componentSource: SECTION_WITH_CONFIG,
    });
    assert.equal(config.layout.columns, 2);
    assert.equal(config.settings.anchor, "about");
    assert.equal(config.animation.type, "fade");
    assert.equal(config.settings.cssClasses, "my-about");
  });

  it("resolves preview style, class names, and viewport visibility", () => {
    const config = createDefaultSectionConfig({
      id: "x",
      sectionExportName: "X",
      sectionType: "custom",
      kind: "section",
      visibility: "mobile",
      layout: { width: "boxed", columns: 2, gap: "1rem", alignment: "left" },
      styling: {
        ...createDefaultSectionConfig({
          id: "x",
          sectionExportName: "X",
          sectionType: "custom",
          kind: "section",
        }).styling,
        padding: "1rem",
        opacity: 80,
      },
      animation: { type: "zoom", durationMs: 400, delayMs: 0 },
    });
    const style = resolveSectionPreviewStyle(config, "desktop");
    assert.equal(style.display, "none");
    assert.ok(sectionPreviewClassName(config).includes("wb-section-boxed"));
    assert.ok(sectionPreviewClassName(config).includes("wb-animate-zoom"));
    assert.equal(sectionIsVisible(config, "mobile"), true);
    assert.equal(sectionIsVisible(config, "desktop"), false);
    const mobileStyle = resolveSectionPreviewStyle(config, "mobile");
    assert.equal(mobileStyle.display, "grid");
    assert.equal(mobileStyle.padding, "1rem");
  });

  it("updates section config in visual document", () => {
    const doc = baseDoc();
    const next = updateNodeSectionConfig(doc, "node-0-AboutSection", {
      visibility: "hide",
      layout: { ...doc.nodes[0]!.sectionConfig!.layout, columns: 4 },
    });
    const node = next.nodes[0];
    assert.equal(node?.sectionConfig?.visibility, "hide");
    assert.equal(node?.sectionConfig?.layout.columns, 4);
    assert.equal(next.dirty, true);
  });

  it("emits update-section save actions when config changes", () => {
    const baseline = baseDoc();
    const updated = updateNodeSectionConfig(baseline, "node-0-AboutSection", {
      styling: {
        ...baseline.nodes[0]!.sectionConfig!.styling,
        padding: "4rem",
      },
    });
    const actions = documentToSaveActions(baseline, updated);
    const sectionAction = actions.find((a) => a.type === "update-section");
    assert.ok(sectionAction);
    assert.equal(sectionAction?.target, "AboutSection");
    const payload = JSON.parse(sectionAction?.value ?? "{}");
    assert.equal(payload.styling.padding, "4rem");
  });

  it("supports move up and move down operations", () => {
    const doc = baseDoc();
    const down = moveNodeDown(doc, "node-0-AboutSection");
    assert.equal(down.nodes[0]?.exportName, "CtaBand");
    const up = moveNodeUp(down, "node-1-AboutSection");
    assert.equal(up.nodes[0]?.exportName, "AboutSection");
  });

  it("persists section config to TSX source and globals.css", () => {
    const config = createDefaultSectionConfig({
      id: "AboutSection-section",
      sectionExportName: "AboutSection",
      sectionType: "about",
      kind: "section",
      visibility: "show",
      layout: { width: "container", columns: 1, gap: "1.5rem", alignment: "stretch" },
      settings: {
        htmlId: "about-us",
        anchor: "about-us",
        cssClasses: "about-custom",
        customAttributes: "",
      },
      styling: {
        padding: "3rem 0",
        margin: "0",
        borderWidth: "0",
        borderColor: "transparent",
        borderStyle: "solid",
        radius: "0",
        shadow: "none",
        opacity: 100,
        zIndex: 0,
        overflow: "visible",
      },
      animation: { type: "fade", durationMs: 600, delayMs: 0 },
    });

    const next = applySectionConfigToSectionSource(SECTION_SOURCE, config);
    assert.ok(next);
    assert.match(next!, /data-wb-section-config=/);
    assert.match(next!, /id="about-us"/);
    assert.match(next!, /about-custom/);

    const understanding: WebsiteUnderstanding = {
      brandName: "Acme",
      homePath: "app/page.tsx",
      sections: [
        {
          exportName: "AboutSection",
          path: "components/sections/AboutSection.tsx",
          kindHint: "about",
          usedOnHome: true,
        },
      ],
      homeComponentOrder: ["AboutSection"],
      designTokens: {},
      imageCount: 0,
      hasGlobalsCss: true,
      structureNotes: [],
      summary: "test",
    };

    const result = applyWebsiteEditActions({
      files: [
        {
          path: "components/sections/AboutSection.tsx",
          content: SECTION_SOURCE,
          language: "tsx",
        },
        { path: "app/globals.css", content: ":root {}", language: "css" },
      ],
      actions: [
        {
          type: "update-section",
          target: "AboutSection",
          value: JSON.stringify(config),
        },
      ],
      understanding,
    });

    const sectionFile = result.files.find((f) =>
      f.path.includes("AboutSection.tsx"),
    );
    assert.ok(sectionFile?.content.includes("data-wb-section-config"));
    assert.ok(sectionFile?.content.includes("about-custom"));
    const globals = result.files.find((f) => f.path.endsWith("globals.css"));
    assert.ok(globals?.content.includes("wb-section-styles"));
    assert.ok(result.applied.length > 0);
  });

  it("sectionConfigsEqual detects meaningful changes", () => {
    const a = createDefaultSectionConfig({
      id: "a",
      sectionExportName: "A",
      sectionType: "custom",
      kind: "section",
    });
    const b = { ...a, visibility: "hide" as const };
    assert.equal(sectionConfigsEqual(a, a), true);
    assert.equal(sectionConfigsEqual(a, b), false);
  });

  it("ensureWbSectionGlobalsCss is idempotent", () => {
    const once = ensureWbSectionGlobalsCss(":root {}");
    const twice = ensureWbSectionGlobalsCss(once);
    assert.equal(once, twice);
    assert.match(once, /wb-animate-fade/);
  });
});
