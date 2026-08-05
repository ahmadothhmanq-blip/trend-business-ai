import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBDP_WIRING_PHASE,
  TBDP_WIRING_VERSION,
  wireWebsiteGenerationStart,
  wireTemplateApply,
  wirePreviewContext,
  validateWebsiteAgainstTbdp,
  applyTbdpToDesignSystem,
  isTbdpVisualAuthority,
  mergeTbdpSettings,
  readStoredContextFromSettings,
} from "@/lib/website/tbdp-wiring";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { DesignSystem } from "@/lib/website/types";
import { resolveDesignContext } from "@/lib/design-platform/integration";

const baseDesign: DesignSystem = {
  style: "modern",
  stylePreset: "modern",
  industryPattern: "general",
  colors: {
    primary: "#000",
    secondary: "#111",
    accent: "#222",
    neutral: "#333",
    surface: "#fff",
    background: "#fafafa",
    foreground: "#000",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    scale: ["1rem"],
    notes: "",
  },
  layoutRules: [],
  layoutStyle: "standard",
  uiPatterns: [],
  componentPalette: ["hero"],
  spacingScale: ["8px"],
  borderRadius: "8px",
  shadowStyle: "soft",
};

describe("TBDP Phase 6 — Website Builder Wiring", () => {
  it("exports wiring constants", () => {
    assert.equal(TBDP_WIRING_PHASE, "wiring-6");
    assert.equal(TBDP_WIRING_VERSION, "6.0.0");
  });

  it("wires generation start when industry is present", () => {
    const result = wireWebsiteGenerationStart({ industryId: "medical" });
    assert.equal(result.enabled, true);
    assert.ok(result.settingsPatch.tbdpSectorDnaId);
    assert.ok(result.briefMetadataPatch.tbdpVisualAuthority);
  });

  it("skips wiring when no TBDP signals", () => {
    const result = wireWebsiteGenerationStart({ prompt: "hello world" });
    assert.equal(result.enabled, false);
  });

  it("wires template apply with settings patch", () => {
    const project = {
      title: "Test",
      settings: { industryId: "restaurant" },
    } as unknown as GeneratedWebsiteProject;
    const result = wireTemplateApply({
      project,
      templatePackageId: "restaurant-signature",
      language: "English",
    });
    assert.ok(result.settingsPatch.tbdpSectorDnaId);
  });

  it("resolves unified preview context", () => {
    const result = wirePreviewContext({
      templatePackageId: "saas-enterprise",
      language: "English",
      settings: { tbdpSectorDnaId: "saas", tbdpDesignContextHash: "abc" },
    });
    assert.ok(result.designContext || result.tbdpCssLayer);
  });

  it("applies TBDP to design system component palette", () => {
    const ctx = resolveDesignContext({ sectorId: "saas" });
    const updated = applyTbdpToDesignSystem(baseDesign, ctx);
    assert.ok(updated.componentPalette.length > 0);
    assert.notEqual(updated.componentPalette, baseDesign.componentPalette);
  });

  it("detects TBDP visual authority in brief metadata", () => {
    assert.equal(isTbdpVisualAuthority({ tbdpVisualAuthority: true }), true);
    assert.equal(isTbdpVisualAuthority({}), false);
  });

  it("validates website against TBDP registry", () => {
    const project = {
      title: "Test",
      components: ["navbar"],
      settings: {
        tbdpSectorDnaId: "saas",
        tbdpDesignContextHash: "test",
        tbdpComponentIds: ["navbar"],
      },
    } as unknown as GeneratedWebsiteProject;
    const result = validateWebsiteAgainstTbdp(project);
    assert.equal(result.valid, true);
  });

  it("merges TBDP settings without dropping prior keys", () => {
    const merged = mergeTbdpSettings({ framework: "Next.js" }, { tbdpSectorDnaId: "saas" });
    assert.equal(merged.framework, "Next.js");
    assert.equal(merged.tbdpSectorDnaId, "saas");
  });

  it("reads stored context from settings", () => {
    const stored = readStoredContextFromSettings({
      tbdpSectorDnaId: "medical",
      tbdpDesignContextHash: "hash123",
    });
    assert.equal(stored?.sectorDnaId, "medical");
  });
});
