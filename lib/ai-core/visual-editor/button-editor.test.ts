import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buttonConfigPropName,
  parseButtonConfig,
  serializeButtonConfig,
} from "@/lib/ai-core/visual-editor/button-config";
import {
  extractButtonsFromSection,
  listInternalPageRoutes,
} from "@/lib/ai-core/visual-editor/button-extract";
import {
  applyButtonToPageSource,
  applyButtonToSectionSource,
  buttonsEqual,
} from "@/lib/ai-core/visual-editor/button-persist";
import {
  createDefaultButton,
  formatHref,
  inferLinkType,
} from "@/lib/ai-core/visual-editor/button-types";
import { resolveButtonPreviewStyle } from "@/lib/ai-core/visual-editor/button-styles";
import { applyWebsiteEditActions } from "@/lib/ai-core/website-editor/actions";
import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";
import {
  documentToSaveActions,
  updateNodeButton,
} from "@/lib/ai-core/visual-editor/ops";
import type { VisualDocument } from "@/lib/ai-core/visual-editor/types";

const HERO_SOURCE = `export function ThemeModernHero({
  title = "Welcome",
  primaryCta = "Get started",
  secondaryCta = "Learn more",
}: ThemeModernHeroProps) {
  return (
    <section>
      <h1>{title}</h1>
      <a href="#contact" className="btn">{primaryCta}</a>
      <a href="#features" className="btn-outline">{secondaryCta}</a>
    </section>
  );
}`;

const PAGE_SOURCE = `<ThemeModernHero title="Acme" primaryCta="Start now" secondaryCta="Docs" />`;

const GLOBALS_CSS = `@tailwind base;\nbody { margin: 0; }\n`;

function fullFeaturedButton(
  partial: Partial<ReturnType<typeof createDefaultButton>> &
    Pick<ReturnType<typeof createDefaultButton>, "id" | "label" | "sourceKind" | "sourceIndex">,
) {
  return createDefaultButton({
    href: "/contact",
    linkType: "internal",
    target: "new",
    style: "outline",
    size: "lg",
    width: "full",
    radius: "pill",
    customRadiusPx: 12,
    colors: {
      background: "#111111",
      text: "#ffffff",
      border: "#d4af37",
      hoverBackground: "#222222",
      hoverText: "#f5f5f5",
    },
    typography: {
      fontFamily: "Inter",
      fontWeight: "700",
      fontSize: "1rem",
      letterSpacing: "0.08em",
    },
    spacing: {
      padding: "1rem 2rem",
      margin: "0.5rem",
    },
    icon: "left",
    iconName: "ArrowRight",
    disabled: true,
    ariaLabel: "Contact sales",
    title: "Contact our team",
    ...partial,
  });
}

const understanding: WebsiteUnderstanding = {
  brandName: "Acme",
  homePath: "app/page.tsx",
  sections: [
    {
      exportName: "ThemeModernHero",
      path: "components/ThemeModernHero.tsx",
      kindHint: "hero",
      usedOnHome: true,
    },
  ],
  homeComponentOrder: ["ThemeModernHero"],
  designTokens: {},
  imageCount: 0,
  hasGlobalsCss: true,
  structureNotes: [],
  summary: "test",
};

describe("button editor", () => {
  it("extracts prop-based CTA buttons from page invocation", () => {
    const buttons = extractButtonsFromSection({
      exportName: "ThemeModernHero",
      componentSource: HERO_SOURCE,
      pageSource: PAGE_SOURCE,
    });
    assert.equal(buttons.length, 2);
    assert.equal(buttons[0]!.label, "Start now");
    assert.equal(buttons[0]!.propName, "primaryCta");
    assert.equal(buttons[1]!.label, "Docs");
  });

  it("extracts inline anchor buttons when no prop CTAs exist", () => {
    const buttons = extractButtonsFromSection({
      exportName: "CustomCta",
      componentSource: `
        export function CustomCta() {
          return (
            <div>
              <a href="https://example.com">Visit site</a>
            </div>
          );
        }
      `,
    });
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0]!.label, "Visit site");
    assert.equal(buttons[0]!.linkType, "external");
    assert.equal(buttons[0]!.sourceKind, "anchor");
  });

  it("formats href values by link type", () => {
    assert.equal(formatHref("email", "hello@acme.com"), "mailto:hello@acme.com");
    assert.equal(formatHref("phone", "5551234"), "tel:5551234");
    assert.equal(formatHref("anchor", "contact"), "#contact");
    assert.equal(inferLinkType("mailto:x@y.com"), "email");
  });

  it("serializes and parses full button config", () => {
    const button = fullFeaturedButton({
      id: "x",
      label: "Go",
      sourceKind: "anchor",
      sourceIndex: 0,
    });
    const raw = serializeButtonConfig(button);
    const parsed = parseButtonConfig(raw);
    assert.ok(parsed);
    assert.equal(parsed.style, "outline");
    assert.equal(parsed.icon, "left");
    assert.equal(parsed.iconName, "ArrowRight");
    assert.equal(parsed.colors?.background, "#111111");
    assert.equal(parsed.typography?.fontWeight, "700");
    assert.equal(parsed.spacing?.padding, "1rem 2rem");
    assert.equal(parsed.disabled, true);
    assert.equal(parsed.ariaLabel, "Contact sales");
  });

  it("updates prop buttons on the home page source with config prop", () => {
    const button = fullFeaturedButton({
      id: "ThemeModernHero-primaryCta",
      label: "Book demo",
      href: "/contact",
      linkType: "internal",
      sourceKind: "prop",
      sourceIndex: 0,
      propName: "primaryCta",
      hrefPropName: "primaryCtaHref",
    });
    const next = applyButtonToPageSource(PAGE_SOURCE, "ThemeModernHero", button);
    assert.ok(next);
    assert.match(next!, /primaryCta="Book demo"/);
    assert.match(next!, /primaryCtaHref="\/contact"/);
    assert.match(next!, new RegExp(`${buttonConfigPropName("primaryCta")}=`));
    assert.match(next!, /outline/);
  });

  it("patches inline anchor buttons in section source with full config", () => {
    const button = fullFeaturedButton({
      id: "CustomCta-anchor-0",
      label: "Buy now",
      href: "#pricing",
      linkType: "anchor",
      sourceKind: "anchor",
      sourceIndex: 0,
    });
    const source = `<a href="/old">Old label</a>`;
    const next = applyButtonToSectionSource(source, button);
    assert.ok(next);
    assert.match(next!, /Buy now/);
    assert.match(next!, /href="#pricing"/);
    assert.match(next!, /target="_blank"/);
    assert.match(next!, /aria-label="Contact sales"/);
    assert.match(next!, /data-wb-button-config="/);
    assert.match(next!, /wb-icon-left:ArrowRight/);
    assert.match(next!, /style=\{\{/);
  });

  it("patches prop CTA anchors in section source", () => {
    const button = fullFeaturedButton({
      id: "ThemeModernHero-primaryCta",
      label: "Launch",
      href: "/signup",
      linkType: "internal",
      sourceKind: "prop",
      sourceIndex: 0,
      propName: "primaryCta",
      hrefPropName: "primaryCtaHref",
    });
    const next = applyButtonToSectionSource(HERO_SOURCE, button);
    assert.ok(next);
    assert.match(next!, /href="\/signup"/);
    assert.match(next!, /\{primaryCta\}/);
    assert.match(next!, /data-wb-button-config="/);
    assert.match(next!, /wb-button/);
  });

  it("round-trips all properties for inline buttons after save", () => {
    const original = fullFeaturedButton({
      id: "CustomCta-anchor-0",
      label: "Buy now",
      href: "https://example.com/pricing",
      linkType: "external",
      sourceKind: "anchor",
      sourceIndex: 0,
    });
    const source = `<a href="/old">Old label</a>`;
    const saved = applyButtonToSectionSource(source, original);
    assert.ok(saved);
    const extracted = extractButtonsFromSection({
      exportName: "CustomCta",
      componentSource: saved!,
    });
    assert.equal(extracted.length, 1);
    const restored = extracted[0]!;
    assert.equal(restored.label, original.label);
    assert.equal(restored.linkType, original.linkType);
    assert.equal(restored.href, original.href);
    assert.equal(restored.target, original.target);
    assert.equal(restored.style, original.style);
    assert.equal(restored.size, original.size);
    assert.equal(restored.width, original.width);
    assert.equal(restored.radius, original.radius);
    assert.equal(restored.customRadiusPx, original.customRadiusPx);
    assert.equal(restored.icon, original.icon);
    assert.equal(restored.iconName, original.iconName);
    assert.equal(restored.disabled, original.disabled);
    assert.equal(restored.ariaLabel, original.ariaLabel);
    assert.equal(restored.title, original.title);
    assert.equal(restored.colors.background, original.colors.background);
    assert.equal(restored.typography.fontWeight, original.typography.fontWeight);
    assert.equal(restored.spacing.padding, original.spacing.padding);
  });

  it("round-trips all properties for prop buttons via page + section", () => {
    const original = fullFeaturedButton({
      id: "ThemeModernHero-primaryCta",
      label: "Launch now",
      href: "/signup",
      linkType: "internal",
      sourceKind: "prop",
      sourceIndex: 0,
      propName: "primaryCta",
      hrefPropName: "primaryCtaHref",
    });
    const page = applyButtonToPageSource(PAGE_SOURCE, "ThemeModernHero", original);
    const section = applyButtonToSectionSource(HERO_SOURCE, original);
    assert.ok(page);
    assert.ok(section);
    const extracted = extractButtonsFromSection({
      exportName: "ThemeModernHero",
      componentSource: section!,
      pageSource: page!,
    });
    const restored = extracted.find((b) => b.propName === "primaryCta");
    assert.ok(restored);
    assert.equal(restored.label, original.label);
    assert.equal(restored.href, original.href);
    assert.equal(restored.style, original.style);
    assert.equal(restored.size, original.size);
    assert.equal(restored.icon, original.icon);
    assert.equal(restored.disabled, original.disabled);
    assert.equal(restored.colors.border, original.colors.border);
    assert.equal(restored.typography.letterSpacing, original.typography.letterSpacing);
  });

  it("emits update-button save actions when button props change", () => {
    const baseDoc: VisualDocument = {
      version: 1,
      generationId: "g1",
      brandName: "Acme",
      nodes: [
        {
          id: "node-0-ThemeModernHero",
          exportName: "ThemeModernHero",
          path: "components/ThemeModernHero.tsx",
          kind: "hero",
          label: "Hero",
          buttons: [
            createDefaultButton({
              id: "btn-1",
              label: "Start",
              sourceKind: "prop",
              sourceIndex: 0,
              propName: "primaryCta",
            }),
          ],
        },
      ],
      tokens: {
        primary: "#000",
        secondary: "#111",
        accent: "#222",
        background: "#fff",
        foreground: "#000",
        headingFont: "Inter",
        bodyFont: "Inter",
        sectionY: "5rem",
      },
      selectedNodeId: "node-0-ThemeModernHero",
      selectedButtonId: "btn-1",
      selectedLinkId: null,
      selectedIconId: null,
      viewport: "desktop",
      extensions: {},
      dirty: false,
      updatedAt: new Date().toISOString(),
    };
    const current = updateNodeButton(baseDoc, baseDoc.nodes[0]!.id, "btn-1", {
      label: "Launch",
      style: "ghost",
    });
    const actions = documentToSaveActions(baseDoc, current);
    assert.equal(actions.length, 1);
    assert.equal(actions[0]!.type, "update-button");
    assert.match(actions[0]!.value || "", /Launch/);
    assert.match(actions[0]!.value || "", /"style":"ghost"/);
  });

  it("resolves preview styles for button variants", () => {
    const button = createDefaultButton({
      id: "x",
      label: "Go",
      sourceKind: "anchor",
      sourceIndex: 0,
      style: "outline",
      width: "full",
    });
    const style = resolveButtonPreviewStyle(button, "normal");
    assert.equal(style.width, "100%");
    assert.ok(style.border);
  });

  it("applies update-button actions to project files with globals css", () => {
    const button = fullFeaturedButton({
      id: "ThemeModernHero-primaryCta",
      label: "Contact us",
      href: "/contact",
      linkType: "internal",
      sourceKind: "prop",
      sourceIndex: 0,
      propName: "primaryCta",
      hrefPropName: "primaryCtaHref",
    });
    const result = applyWebsiteEditActions({
      files: [
        { path: "app/page.tsx", content: PAGE_SOURCE, language: "tsx" },
        { path: "components/ThemeModernHero.tsx", content: HERO_SOURCE, language: "tsx" },
        { path: "app/globals.css", content: GLOBALS_CSS, language: "css" },
      ],
      actions: [
        {
          type: "update-button",
          target: "ThemeModernHero",
          value: JSON.stringify(button),
        },
      ],
      understanding,
    });
    const page = result.files.find((f) => f.path === "app/page.tsx");
    const section = result.files.find((f) => f.path === "components/ThemeModernHero.tsx");
    const globals = result.files.find((f) => f.path === "app/globals.css");
    assert.ok(page?.content.includes('primaryCta="Contact us"'));
    assert.ok(page?.content.includes("primaryCtaConfig="));
    assert.ok(section?.content.includes("data-wb-button-config="));
    assert.ok(section?.content.includes('href="/contact"'));
    assert.ok(globals?.content.includes("wb-button-styles"));
    assert.equal(result.applied.length, 1);
  });

  it("simulates export/import zip by re-extracting saved project files", () => {
    const button = fullFeaturedButton({
      id: "ThemeModernHero-primaryCta",
      label: "Get started",
      href: "/start",
      linkType: "internal",
      sourceKind: "prop",
      sourceIndex: 0,
      propName: "primaryCta",
      hrefPropName: "primaryCtaHref",
    });
    const saved = applyWebsiteEditActions({
      files: [
        { path: "app/page.tsx", content: PAGE_SOURCE, language: "tsx" },
        { path: "components/ThemeModernHero.tsx", content: HERO_SOURCE, language: "tsx" },
        { path: "app/globals.css", content: GLOBALS_CSS, language: "css" },
      ],
      actions: [{ type: "update-button", target: "ThemeModernHero", value: JSON.stringify(button) }],
      understanding,
    });
    const zipFiles = saved.files;
    const imported = extractButtonsFromSection({
      exportName: "ThemeModernHero",
      componentSource: zipFiles.find((f) => f.path.includes("ThemeModernHero"))?.content,
      pageSource: zipFiles.find((f) => f.path === "app/page.tsx")?.content,
    });
    const restored = imported.find((b) => b.propName === "primaryCta");
    assert.ok(restored);
    assert.equal(restored.label, button.label);
    assert.equal(restored.href, button.href);
    assert.equal(restored.style, button.style);
    assert.equal(restored.width, button.width);
    assert.equal(restored.iconName, button.iconName);
    assert.equal(restored.disabled, button.disabled);
  });

  it("supports undo/redo diff via buttonsEqual", () => {
    const before = createDefaultButton({
      id: "b1",
      label: "A",
      sourceKind: "anchor",
      sourceIndex: 0,
    });
    const after = { ...before, label: "B", style: "ghost" as const };
    assert.equal(buttonsEqual(before, before), true);
    assert.equal(buttonsEqual(before, after), false);
  });

  it("lists internal routes from generated files", () => {
    const routes = listInternalPageRoutes([
      { path: "app/page.tsx" },
      { path: "app/about/page.tsx" },
      { path: "app/contact/page.tsx" },
    ]);
    assert.ok(routes.some((r) => r.path === "/"));
    assert.ok(routes.some((r) => r.path === "/about"));
  });
});
