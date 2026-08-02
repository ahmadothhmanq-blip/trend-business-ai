import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractLinksFromSection,
  listAnchorSections,
} from "@/lib/ai-core/visual-editor/link-extract";
import {
  formatHref,
  inferLinkType,
  isValidExternalUrl,
} from "@/lib/ai-core/visual-editor/link-format";
import {
  applyLinkToPageSource,
  applyLinkToSectionSource,
} from "@/lib/ai-core/visual-editor/link-persist";
import { createDefaultLink } from "@/lib/ai-core/visual-editor/link-types";
import { validateLink, hasBlockingLinkSaveErrors } from "@/lib/ai-core/visual-editor/link-validate";
import { applyWebsiteEditActions } from "@/lib/ai-core/website-editor/actions";
import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";
import { documentToSaveActions, updateNodeLink } from "@/lib/ai-core/visual-editor/ops";
import type { VisualDocument } from "@/lib/ai-core/visual-editor/types";

const HEADER_SOURCE = `"use client";

const links = [
  { href: "#services", label: "Services" },
  { href: "#features", label: "Features" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header>
      <a href="/" className="logo">Brand</a>
      <nav>
        {links.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>
    </header>
  );
}`;

const FOOTER_SOURCE = `export function SiteFooter({
  links = [
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ],
}: { links?: Array<{ href: string; label: string }> }) {
  return (
    <footer>
      <ul>
        {links.map((l) => (
          <li key={l.href}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </footer>
  );
}`;

const PAGE_SOURCE = `<SiteHeader /><SiteFooter links={[{href:"#services",label:"Services"},{href:"#contact",label:"Contact"}]} />`;

describe("link editor", () => {
  it("infers and formats all link types", () => {
    assert.equal(inferLinkType("mailto:a@b.com"), "email");
    assert.equal(inferLinkType("tel:+15551234"), "phone");
    assert.equal(inferLinkType("https://wa.me/15551234"), "whatsapp");
    assert.equal(inferLinkType("https://t.me/mybot"), "telegram");
    assert.equal(inferLinkType("#contact"), "anchor");
    assert.equal(inferLinkType("/files/brochure.pdf"), "download");
    assert.equal(formatHref("whatsapp", "15551234567"), "https://wa.me/15551234567");
    assert.equal(formatHref("telegram", "mybot"), "https://t.me/mybot");
    assert.equal(formatHref("external", "example.com"), "https://example.com");
    assert.ok(isValidExternalUrl("https://example.com"));
  });

  it("extracts navigation links from SiteHeader", () => {
    const links = extractLinksFromSection({
      exportName: "SiteHeader",
      componentSource: HEADER_SOURCE,
      kindHint: "header",
    });
    assert.ok(links.some((l) => l.kind === "nav" && l.label === "Services"));
    assert.ok(links.some((l) => l.kind === "logo"));
  });

  it("extracts footer links from page props", () => {
    const links = extractLinksFromSection({
      exportName: "SiteFooter",
      componentSource: FOOTER_SOURCE,
      pageSource: PAGE_SOURCE,
      kindHint: "footer",
    });
    const footer = links.find((l) => l.kind === "footer");
    assert.ok(footer);
    assert.equal(footer!.label, "Services");
  });

  it("validates internal and external links", () => {
    const ctx = { internalRoutes: ["/", "/about"], anchorIds: ["contact"] };
    assert.equal(
      validateLink({ linkType: "internal", href: "/missing", label: "X" }, ctx).status,
      "error",
    );
    assert.equal(
      validateLink({ linkType: "external", href: "not-a-url", label: "X" }, ctx).status,
      "error",
    );
    assert.equal(
      validateLink({ linkType: "anchor", href: "#contact", label: "X" }, ctx).status,
      "valid",
    );
  });

  it("persists nav link edits in section source", () => {
    const link = createDefaultLink({
      id: "SiteHeader-nav-0",
      kind: "nav",
      label: "About us",
      href: "/about",
      linkType: "internal",
      sourceKind: "array-const",
      sourceIndex: 0,
      sectionExportName: "SiteHeader",
      arrayPropName: "links",
      rel: ["noopener"],
      target: "new",
    });
    const next = applyLinkToSectionSource(HEADER_SOURCE, link);
    assert.ok(next);
    assert.match(next!, /About us/);
    assert.match(next!, /\/about/);
    assert.match(next!, /linkConfig/);
  });

  it("persists footer link edits on page source", () => {
    const link = createDefaultLink({
      id: "SiteFooter-footer-0",
      kind: "footer",
      label: "Pricing",
      href: "/pricing",
      linkType: "internal",
      sourceKind: "array-prop",
      sourceIndex: 0,
      sectionExportName: "SiteFooter",
      arrayPropName: "links",
    });
    const next = applyLinkToPageSource(PAGE_SOURCE, "SiteFooter", link);
    assert.ok(next);
    assert.match(next!, /Pricing/);
    assert.match(next!, /\/pricing/);
  });

  it("round-trips nav link after save", () => {
    const original = createDefaultLink({
      id: "SiteHeader-nav-1",
      kind: "nav",
      label: "Features",
      href: "/features",
      linkType: "internal",
      sourceKind: "array-const",
      sourceIndex: 1,
      sectionExportName: "SiteHeader",
      target: "new",
      rel: ["noopener", "noreferrer"],
    });
    const saved = applyLinkToSectionSource(HEADER_SOURCE, original);
    const restored = extractLinksFromSection({
      exportName: "SiteHeader",
      componentSource: saved!,
      kindHint: "header",
    }).find((l) => l.kind === "nav" && l.sourceIndex === 1);
    assert.ok(restored);
    assert.equal(restored.href, "/features");
    assert.equal(restored.target, "new");
    assert.ok(restored.rel.includes("noopener"));
  });

  it("emits update-link save actions", () => {
    const baseDoc: VisualDocument = {
      version: 1,
      generationId: "g1",
      brandName: "Acme",
      nodes: [
        {
          id: "node-0-SiteHeader",
          exportName: "SiteHeader",
          path: "components/SiteHeader.tsx",
          kind: "header",
          label: "Header",
          links: [
            createDefaultLink({
              id: "nav-0",
              kind: "nav",
              label: "Services",
              sourceKind: "array-const",
              sourceIndex: 0,
              sectionExportName: "SiteHeader",
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
      selectedNodeId: "node-0-SiteHeader",
      selectedButtonId: null,
      selectedLinkId: "nav-0",
      selectedIconId: null,
      viewport: "desktop",
      extensions: {},
      dirty: false,
      updatedAt: new Date().toISOString(),
    };
    const current = updateNodeLink(baseDoc, baseDoc.nodes[0]!.id, "nav-0", {
      href: "/services",
      linkType: "internal",
    });
    const actions = documentToSaveActions(baseDoc, current);
    assert.equal(actions[0]!.type, "update-link");
    assert.match(actions[0]!.value || "", /\/services/);
  });

  it("applies update-link via website edit actions", () => {
    const link = createDefaultLink({
      id: "SiteHeader-nav-0",
      kind: "nav",
      label: "Contact",
      href: "/contact",
      linkType: "internal",
      sourceKind: "array-const",
      sourceIndex: 2,
      sectionExportName: "SiteHeader",
    });
    const understanding: WebsiteUnderstanding = {
      brandName: "Acme",
      homePath: "app/page.tsx",
      sections: [
        {
          exportName: "SiteHeader",
          path: "components/SiteHeader.tsx",
          kindHint: "header",
          usedOnHome: true,
        },
      ],
      homeComponentOrder: ["SiteHeader"],
      designTokens: {},
      imageCount: 0,
      hasGlobalsCss: true,
      structureNotes: [],
      summary: "test",
    };
    const result = applyWebsiteEditActions({
      files: [
        { path: "components/SiteHeader.tsx", content: HEADER_SOURCE, language: "tsx" },
        { path: "app/globals.css", content: "body{}", language: "css" },
      ],
      actions: [{ type: "update-link", target: "SiteHeader", value: JSON.stringify(link) }],
      understanding,
    });
    assert.equal(result.applied.length, 1);
    const section = result.files.find((f) => f.path.includes("SiteHeader"));
    assert.ok(section?.content.includes("/contact"));
  });

  it("lists anchor sections from project files", () => {
    const anchors = listAnchorSections([
      { path: "components/Hero.tsx", content: '<section id="pricing">x</section>' },
    ]);
    assert.ok(anchors.some((a) => a.id === "pricing"));
  });

  it("does not block save for pre-existing broken internal links", () => {
    const ctx = { internalRoutes: ["/", "/about"], anchorIds: [] };
    const baseline = [
      createDefaultLink({
        id: "SiteShell-anchor-2",
        kind: "nav",
        label: "Services",
        href: "/services",
        linkType: "internal",
        sourceKind: "anchor",
        sourceIndex: 2,
        sectionExportName: "SiteShell",
      }),
    ];
    assert.equal(hasBlockingLinkSaveErrors(baseline, baseline, ctx), false);
  });

  it("blocks save when user introduces a broken internal link", () => {
    const ctx = { internalRoutes: ["/", "/about"], anchorIds: [] };
    const baseline = [
      createDefaultLink({
        id: "SiteShell-anchor-2",
        kind: "nav",
        label: "Services",
        href: "/about",
        linkType: "internal",
        sourceKind: "anchor",
        sourceIndex: 2,
        sectionExportName: "SiteShell",
      }),
    ];
    const current = [
      {
        ...baseline[0]!,
        href: "/missing-page",
      },
    ];
    assert.equal(hasBlockingLinkSaveErrors(baseline, current, ctx), true);
  });
});
