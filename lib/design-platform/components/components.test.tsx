import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBDP_COMPONENT_CATALOG,
  TBDP_COMPONENT_COUNT,
  getTbdpComponentsByCategory,
} from "@/lib/design-platform/components/catalog";
import { emitTbdpComponentStyles } from "@/lib/design-platform/components/core";
import { PrimaryButton } from "@/lib/design-platform/components/buttons/primary";
import { Container } from "@/lib/design-platform/components/layout/container";
import { Modal } from "@/lib/design-platform/components/dialogs/modal";
import { renderToStaticMarkup } from "react-dom/server";

describe("TBDP Phase 2 component catalog", () => {
  it("registers 75 enterprise components", () => {
    assert.equal(TBDP_COMPONENT_COUNT, 75);
    assert.equal(TBDP_COMPONENT_CATALOG.length, 75);
  });

  it("covers all 11 categories", () => {
    const categories = new Set(TBDP_COMPONENT_CATALOG.map((c) => c.category));
    assert.equal(categories.size, 11);
    assert.equal(getTbdpComponentsByCategory("buttons").length, 7);
    assert.equal(getTbdpComponentsByCategory("forms").length, 12);
  });

  it("emits component styles using TBDP CSS variables only", () => {
    const css = emitTbdpComponentStyles();
    assert.ok(css.includes("--tbdp-color-primary"));
    assert.ok(css.includes(".tbdp-btn"));
    assert.ok(!css.includes("#1A5CFF"));
  });
});

describe("TBDP Phase 2 component rendering", () => {
  it("renders PrimaryButton with token classes", () => {
    const html = renderToStaticMarkup(<PrimaryButton label="Save" />);
    assert.ok(html.includes('data-tbdp-component="primary"'));
    assert.ok(html.includes("tbdp-btn"));
    assert.ok(html.includes("tbdp-btn--primary"));
  });

  it("renders Container with layout class", () => {
    const html = renderToStaticMarkup(<Container>Content</Container>);
    assert.ok(html.includes('data-tbdp-component="container"'));
    assert.ok(html.includes("tbdp-container"));
  });

  it("Modal returns null when closed", () => {
    const html = renderToStaticMarkup(<Modal open={false}>Hidden</Modal>);
    assert.equal(html, "");
  });
});

describe("TBDP Phase 2 isolation", () => {
  it("does not export website builder symbols from components", async () => {
    const mod = await import("@/lib/design-platform/components/catalog");
    const keys = Object.keys(mod);
    assert.ok(!keys.some((k) => k.includes("Theme")));
    assert.ok(!keys.some((k) => k.includes("WebsiteBuilder")));
  });
});
