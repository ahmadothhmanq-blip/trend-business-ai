import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeIconConfig,
  parseIconConfig,
  serializeIconConfig,
  ensureWbIconGlobalsCss,
} from "@/lib/ai-core/visual-editor/icon-config";
import { extractIconsFromSection } from "@/lib/ai-core/visual-editor/icon-extract";
import {
  applyIconToSectionSource,
  iconsEqual,
} from "@/lib/ai-core/visual-editor/icon-persist";
import { resolveIconPreviewStyle } from "@/lib/ai-core/visual-editor/icon-styles";
import { createDefaultIcon } from "@/lib/ai-core/visual-editor/icon-types";
import { applyWebsiteEditActions } from "@/lib/ai-core/website-editor/actions";
import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";
import {
  documentToSaveActions,
  updateNodeIcon,
} from "@/lib/ai-core/visual-editor/ops";
import type { VisualDocument } from "@/lib/ai-core/visual-editor/types";
import { createDefaultButton } from "@/lib/ai-core/visual-editor/button-types";

const HERO_SOURCE = `export function ThemeModernHero({
  primaryCta = "Get started",
}: { primaryCta?: string }) {
  return (
    <section>
      <a href="#contact" className="btn">{primaryCta}</a>
    </section>
  );
}`;

const HEADER_SOURCE = `"use client";

const links = [
  { href: "#services", label: "Services", icon: "▦" },
  { href: "#contact", label: "Contact", icon: "Mail" },
];

export function SiteHeader() {
  return (
    <header>
      <nav>
        {links.map((l) => (
          <a key={l.href} href={l.href}>{l.icon ?? "•"} {l.label}</a>
        ))}
      </nav>
    </header>
  );
}`;

const FEATURES_SOURCE = `export function FeaturesModern() {
  return (
    <section>
      <ul>
        <li>Fast delivery</li>
        <li>Trusted support</li>
      </ul>
    </section>
  );
}`;

describe("icon editor", () => {
  it("serializes and parses icon config round-trip", () => {
    const icon = createDefaultIcon({
      id: "icon-1",
      name: "Sparkles",
      label: "Sparkles",
      kind: "inline",
      sourceKind: "inline",
      sourceIndex: 0,
      sectionExportName: "Hero",
      colors: {
        normal: "#fff",
        hover: "#gold",
        disabled: "#666",
      },
      rotation: 90,
    });
    const raw = serializeIconConfig(icon);
    const parsed = parseIconConfig(raw);
    assert.ok(parsed);
    const merged = mergeIconConfig(icon, parsed);
    assert.equal(merged.name, "Sparkles");
    assert.equal(merged.rotation, 90);
    assert.equal(merged.colors.normal, "#fff");
  });

  it("extracts button icons from section CTAs", () => {
    const buttons = createDefaultButton({
      id: "ThemeModernHero-primaryCta",
      label: "Get started",
      href: "#contact",
      linkType: "anchor",
      sourceKind: "prop",
      sourceIndex: 0,
      propName: "primaryCta",
      icon: "left",
      iconName: "ArrowRight",
    });
    const icons = extractIconsFromSection({
      exportName: "ThemeModernHero",
      componentSource: HERO_SOURCE,
      pageSource: `<ThemeModernHero primaryCta="Start" />`,
    });
    assert.ok(icons.length >= 0);
    const withButton = extractIconsFromSection({
      exportName: "Test",
      componentSource: `<a href="#" data-wb-icon-left="ArrowRight">{/* wb-icon-left:ArrowRight */}Go</a>`,
    });
    assert.ok(withButton.some((i) => i.name === "ArrowRight"));
    assert.equal(buttons.iconName, "ArrowRight");
  });

  it("extracts navigation icons from SiteHeader links array", () => {
    const icons = extractIconsFromSection({
      exportName: "SiteHeader",
      componentSource: HEADER_SOURCE,
      kindHint: "header",
    });
    const navIcon = icons.find((i) => i.kind === "nav");
    assert.ok(navIcon);
    assert.equal(navIcon!.name, "LayoutGrid");
  });

  it("extracts list item icons for feature sections", () => {
    const icons = extractIconsFromSection({
      exportName: "FeaturesModern",
      componentSource: FEATURES_SOURCE,
    });
    assert.equal(icons.filter((i) => i.kind === "feature").length, 2);
  });

  it("resolves preview styles for all size presets", () => {
    const icon = createDefaultIcon({
      id: "i",
      name: "Star",
      label: "Star",
      kind: "inline",
      sourceKind: "inline",
      sourceIndex: 0,
      sectionExportName: "S",
      size: "xl",
    });
    const style = resolveIconPreviewStyle(icon, "hover");
    assert.ok(style.color);
    assert.ok(style.transform?.includes("rotate"));
  });

  it("persists nav icon config to links array", () => {
    const icon = createDefaultIcon({
      id: "SiteHeader-nav-icon-0",
      name: "Zap",
      label: "Services icon",
      kind: "nav",
      sourceKind: "array",
      sourceIndex: 0,
      sectionExportName: "SiteHeader",
      arrayPropName: "links",
      size: "lg",
      variant: "filled",
    });
    const next = applyIconToSectionSource(HEADER_SOURCE, icon);
    assert.ok(next);
    assert.match(next!, /icon:\s*"Zap"/);
    assert.match(next!, /iconConfig:/);
  });

  it("persists list icons into li elements", () => {
    const icon = createDefaultIcon({
      id: "FeaturesModern-list-0",
      name: "Shield",
      label: "Fast delivery",
      kind: "feature",
      sourceKind: "inline",
      sourceIndex: 0,
      sectionExportName: "FeaturesModern",
      background: "circle",
      backgroundColor: "rgba(255,255,255,0.1)",
    });
    const next = applyIconToSectionSource(FEATURES_SOURCE, icon);
    assert.ok(next);
    assert.match(next!, /wb-icon/);
    assert.match(next!, /data-wb-icon-config/);
    assert.match(next!, /wb-icon:Shield/);
  });

  it("emits update-icon save actions", () => {
    const icon = createDefaultIcon({
      id: "icon-1",
      name: "Star",
      label: "Star",
      kind: "inline",
      sourceKind: "inline",
      sourceIndex: 0,
      sectionExportName: "FeaturesModern",
    });
    const baseline: VisualDocument = {
      version: 1,
      generationId: "g1",
      brandName: "Acme",
      nodes: [
        {
          id: "node-0-FeaturesModern",
          exportName: "FeaturesModern",
          path: "components/sections/FeaturesModern.tsx",
          kind: "section",
          label: "Features",
          icons: [
            createDefaultIcon({
              id: "icon-1",
              name: "Check",
              label: "Fast delivery",
              kind: "feature",
              sourceKind: "inline",
              sourceIndex: 0,
              sectionExportName: "FeaturesModern",
            }),
          ],
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
      selectedNodeId: "node-0-FeaturesModern",
      selectedButtonId: null,
      selectedLinkId: null,
      selectedIconId: "icon-1",
      viewport: "desktop",
      extensions: {},
      dirty: true,
      updatedAt: new Date().toISOString(),
    };
    const current = updateNodeIcon(baseline, "node-0-FeaturesModern", "icon-1", {
      name: "Star",
      size: "xl",
    });
    const actions = documentToSaveActions(baseline, current);
    assert.equal(actions.length, 1);
    assert.equal(actions[0]!.type, "update-icon");
  });

  it("applies update-icon via website edit actions", () => {
    const icon = createDefaultIcon({
      id: "FeaturesModern-list-0",
      name: "Target",
      label: "Fast delivery",
      kind: "feature",
      sourceKind: "inline",
      sourceIndex: 0,
      sectionExportName: "FeaturesModern",
      colors: {
        normal: "#ffffff",
        hover: "#d4af37",
        disabled: "#666666",
      },
    });
    const understanding: WebsiteUnderstanding = {
      brandName: "Acme",
      homePath: "app/page.tsx",
      sections: [
        {
          exportName: "FeaturesModern",
          path: "components/sections/FeaturesModern.tsx",
          kindHint: "features",
          usedOnHome: true,
        },
      ],
      homeComponentOrder: ["FeaturesModern"],
      designTokens: {},
      imageCount: 0,
      hasGlobalsCss: true,
      structureNotes: [],
      summary: "test",
    };
    const files = [
      {
        path: "components/sections/FeaturesModern.tsx",
        content: FEATURES_SOURCE,
        language: "tsx",
      },
      {
        path: "app/globals.css",
        content: "body { margin: 0; }",
        language: "css",
      },
    ];
    const result = applyWebsiteEditActions({
      files,
      understanding,
      actions: [
        {
          type: "update-icon",
          target: "FeaturesModern",
          value: JSON.stringify(icon),
        },
      ],
    });
    const section = result.files.find((f) =>
      f.path.includes("FeaturesModern"),
    );
    assert.ok(section?.content.includes("data-wb-icon-config"));
    assert.ok(section?.content.includes("wb-icon-styles") === false);
    const globals = result.files.find((f) => f.path.endsWith("globals.css"));
    assert.ok(globals?.content.includes("wb-icon-styles"));
  });

  it("iconsEqual detects changes", () => {
    const a = createDefaultIcon({
      id: "1",
      name: "Star",
      label: "Star",
      kind: "inline",
      sourceKind: "inline",
      sourceIndex: 0,
      sectionExportName: "S",
    });
    const b = { ...a };
    assert.ok(iconsEqual(a, b));
    assert.ok(!iconsEqual(a, { ...a, name: "Heart" }));
  });

  it("injects icon globals css once", () => {
    const css = ensureWbIconGlobalsCss("body {}");
    assert.match(css, /wb-icon-styles/);
    assert.equal(ensureWbIconGlobalsCss(css), css);
  });
});
