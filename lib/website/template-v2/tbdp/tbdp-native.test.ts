import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import {
  NEXUS_COMMAND_MOTION,
  NEXUS_COMMAND_V2_TOKENS,
  SERENITY_CLINICAL_MOTION,
  SERENITY_CLINICAL_V2_TOKENS,
  EXECUTIVE_ATLAS_MOTION,
  EXECUTIVE_ATLAS_V2_TOKENS,
  EMBER_TABLE_MOTION,
  EMBER_TABLE_V2_TOKENS,
  PRESTIGE_ESTATES_MOTION,
  PRESTIGE_ESTATES_V2_TOKENS,
  STUDIO_VOLT_MOTION,
  STUDIO_VOLT_V2_TOKENS,
} from "@/lib/website/template-v2/tbdp";
import { buildV2DesignTokenCss } from "@/lib/website/template-v2/tokens/emit-design-tokens";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";

const RESTAURANT_PREMIUM_PACKAGE = path.join(resolveWbTemplatesRoot(), "restaurant-premium");
const SAAS_PACKAGE = path.join(resolveWbTemplatesRoot(), "saas-enterprise");
const CORPORATE_PACKAGE = path.join(resolveWbTemplatesRoot(), "corporate-business");
const REAL_ESTATE_PACKAGE = path.join(resolveWbTemplatesRoot(), "real-estate-premium");
const MEDICAL_PACKAGE = path.join(resolveWbTemplatesRoot(), "medical-premium");
const CREATIVE_PACKAGE = path.join(resolveWbTemplatesRoot(), "creative-agency-premium");

describe("TBDP native — saas-enterprise", () => {
  it("loads TBDP-native manifests and resolves Nexus Command tokens", async () => {
    const loaded = await loadTemplateV2Package(SAAS_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "saas");
    assert.equal(bundle.tbdpNative?.templateIdentity, "nexus-command");
    assert.deepEqual(bundle.tbdpNative?.experienceProfileIds, [
      "technical",
      "corporate",
      "executive",
    ]);
    assert.equal(bundle.tokens.colors.primary, NEXUS_COMMAND_V2_TOKENS.colors.primary);
    assert.equal(bundle.tokens.colors.accent, NEXUS_COMMAND_V2_TOKENS.colors.accent);
    assert.equal(bundle.motion.preset, NEXUS_COMMAND_MOTION.preset);
    assert.equal(bundle.responsive.containerMaxWidth, "82rem");
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits TBDP authority layer in globals CSS without changing V2 color vars", async () => {
    const loaded = await loadTemplateV2Package(SAAS_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes("TBDP Native Consumption"));
    assert.ok(css.includes("--tbdp-native: 1"));
    assert.ok(css.includes('--tbdp-sector-dna: "saas"'));
    assert.ok(css.includes(`--color-primary: ${NEXUS_COMMAND_V2_TOKENS.colors.primary}`));
    assert.ok(css.includes(".se-headline"));
    assert.ok(css.includes('[dir="rtl"]'));
  });

  it("resolves RTL language context for Arabic without visual token drift", async () => {
    const loaded = await loadTemplateV2Package(SAAS_PACKAGE, { language: "Arabic" });
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    assert.equal(loaded.bundle.tbdpDesignContext?.language.direction, "rtl");
    assert.equal(loaded.bundle.tokens.colors.primary, NEXUS_COMMAND_V2_TOKENS.colors.primary);
    assert.ok(loaded.bundle.tokens.languageProfile?.rtlTypography?.display);
  });
});

const AURA_PACKAGE = path.join(resolveWbTemplatesRoot(), "ai-startup-signal");

describe("TBDP native — ai-startup-signal", () => {
  it("loads TBDP-native manifests and resolves Aura Signal tokens", async () => {
    const loaded = await loadTemplateV2Package(AURA_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "saas");
    assert.equal(bundle.tbdpNative?.templateIdentity, "aura-signal");
    assert.equal(bundle.tokens.colors.accent, "#22D3EE");
    assert.equal(bundle.motion.preset, "signal-glow-reveal");
    assert.equal(bundle.responsive.containerMaxWidth, "88rem");
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits Aura Signal global CSS with cyan accent layer", async () => {
    const loaded = await loadTemplateV2Package(AURA_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes(".as-headline"));
    assert.ok(css.includes(".as-bento-grid"));
    assert.ok(css.includes(".as-nav-glass"));
    assert.ok(css.includes(".as-faq-item"));
    assert.ok(css.includes(`--color-accent: #22D3EE`));
  });

  it("resolves RTL language context for Arabic without visual token drift", async () => {
    const loaded = await loadTemplateV2Package(AURA_PACKAGE, { language: "Arabic" });
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    assert.equal(loaded.bundle.tbdpDesignContext?.language.direction, "rtl");
    assert.equal(loaded.bundle.tokens.colors.accent, "#22D3EE");
    assert.ok(loaded.bundle.tokens.languageProfile?.rtlTypography?.display);

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes('[dir="rtl"]'));
    assert.ok(css.includes(".as-hero-dashboard-bar"));
  });
});

describe("TBDP native — real-estate-premium", () => {
  it("loads TBDP-native manifests and resolves Prestige Estates tokens", async () => {
    const loaded = await loadTemplateV2Package(REAL_ESTATE_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "real-estate");
    assert.equal(bundle.tbdpNative?.templateIdentity, "prestige-estates");
    assert.equal(bundle.tokens.colors.primary, PRESTIGE_ESTATES_V2_TOKENS.colors.primary);
    assert.equal(bundle.tokens.colors.brass, PRESTIGE_ESTATES_V2_TOKENS.colors.brass);
    assert.equal(bundle.motion.preset, PRESTIGE_ESTATES_MOTION.preset);
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits TBDP authority layer in globals CSS without changing V2 color vars", async () => {
    const loaded = await loadTemplateV2Package(REAL_ESTATE_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes("TBDP Native Consumption"));
    assert.ok(css.includes("--tbdp-native: 1"));
    assert.ok(css.includes('--tbdp-sector-dna: "real-estate"'));
    assert.ok(css.includes(`--color-primary: ${PRESTIGE_ESTATES_V2_TOKENS.colors.primary}`));
    assert.ok(css.includes(".rep-headline") || css.includes("Cormorant"));
    assert.ok(css.includes('[dir="rtl"]'));
  });

  it("resolves RTL language context for Arabic without visual token drift", async () => {
    const loaded = await loadTemplateV2Package(REAL_ESTATE_PACKAGE, { language: "Arabic" });
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    assert.equal(loaded.bundle.tbdpDesignContext?.language.direction, "rtl");
    assert.equal(loaded.bundle.tokens.colors.primary, PRESTIGE_ESTATES_V2_TOKENS.colors.primary);
    assert.ok(loaded.bundle.tokens.languageProfile?.rtlTypography?.display);
  });
});

describe("TBDP native — medical-premium", () => {
  it("loads TBDP-native manifests and resolves Serenity Clinical tokens", async () => {
    const loaded = await loadTemplateV2Package(MEDICAL_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "medical");
    assert.equal(bundle.tbdpNative?.templateIdentity, "serenity-clinical");
    assert.deepEqual(bundle.tbdpNative?.experienceProfileIds, [
      "healthcare",
      "corporate",
      "minimal",
    ]);
    assert.equal(bundle.tokens.colors.primary, SERENITY_CLINICAL_V2_TOKENS.colors.primary);
    assert.equal(bundle.tokens.colors.healing, SERENITY_CLINICAL_V2_TOKENS.colors.healing);
    assert.equal(bundle.motion.preset, SERENITY_CLINICAL_MOTION.preset);
    assert.equal(bundle.responsive.containerMaxWidth, "76rem");
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits TBDP authority layer in globals CSS without changing V2 color vars", async () => {
    const loaded = await loadTemplateV2Package(MEDICAL_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes("TBDP Native Consumption"));
    assert.ok(css.includes("--tbdp-native: 1"));
    assert.ok(css.includes('--tbdp-sector-dna: "medical"'));
    assert.ok(css.includes(`--color-primary: ${SERENITY_CLINICAL_V2_TOKENS.colors.primary}`));
    assert.ok(css.includes(".mp-headline"));
    assert.ok(css.includes('[dir="rtl"]'));
  });

  it("resolves RTL language context for Arabic without visual token drift", async () => {
    const loaded = await loadTemplateV2Package(MEDICAL_PACKAGE, { language: "Arabic" });
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    assert.equal(loaded.bundle.tbdpDesignContext?.language.direction, "rtl");
    assert.equal(loaded.bundle.tokens.colors.primary, SERENITY_CLINICAL_V2_TOKENS.colors.primary);
    assert.ok(loaded.bundle.tokens.languageProfile?.rtlTypography?.display);
  });
});

describe("TBDP native — creative-agency-premium", () => {
  it("loads TBDP-native manifests and resolves Studio Volt tokens", async () => {
    const loaded = await loadTemplateV2Package(CREATIVE_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "creative-studio");
    assert.equal(bundle.tbdpNative?.templateIdentity, "studio-volt");
    assert.equal(bundle.tokens.colors.primary, STUDIO_VOLT_V2_TOKENS.colors.primary);
    assert.equal(bundle.tokens.colors.volt, STUDIO_VOLT_V2_TOKENS.colors.volt);
    assert.equal(bundle.motion.preset, STUDIO_VOLT_MOTION.preset);
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits TBDP authority layer in globals CSS without changing V2 color vars", async () => {
    const loaded = await loadTemplateV2Package(CREATIVE_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes("TBDP Native Consumption"));
    assert.ok(css.includes("--tbdp-native: 1"));
    assert.ok(css.includes('--tbdp-sector-dna: "creative-studio"'));
    assert.ok(css.includes(`--color-primary: ${STUDIO_VOLT_V2_TOKENS.colors.primary}`));
    assert.ok(css.includes(".cap-display") || css.includes("Space Grotesk"));
    assert.ok(css.includes('[dir="rtl"]'));
  });

  it("resolves RTL language context for Arabic without visual token drift", async () => {
    const loaded = await loadTemplateV2Package(CREATIVE_PACKAGE, { language: "Arabic" });
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    assert.equal(loaded.bundle.tbdpDesignContext?.language.direction, "rtl");
    assert.equal(loaded.bundle.tokens.colors.primary, STUDIO_VOLT_V2_TOKENS.colors.primary);
    assert.ok(loaded.bundle.tokens.languageProfile?.rtlTypography?.display);
  });
});

describe("TBDP native — corporate-business", () => {
  it("loads TBDP-native manifests and resolves Executive Atlas tokens", async () => {
    const loaded = await loadTemplateV2Package(CORPORATE_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "law-firm");
    assert.equal(bundle.tbdpNative?.templateIdentity, "executive-atlas");
    assert.equal(bundle.tokens.colors.primary, EXECUTIVE_ATLAS_V2_TOKENS.colors.primary);
    assert.equal(bundle.motion.preset, EXECUTIVE_ATLAS_MOTION.preset);
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits corporate-business global CSS with Executive Atlas layer", async () => {
    const loaded = await loadTemplateV2Package(CORPORATE_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes(".cb-headline") || css.includes("cb-slide-up"));
    assert.ok(css.includes(`--color-primary: ${EXECUTIVE_ATLAS_V2_TOKENS.colors.primary}`));
  });
});

describe("TBDP native — restaurant-premium", () => {
  it("loads TBDP-native manifests and resolves Ember Table tokens", async () => {
    const loaded = await loadTemplateV2Package(RESTAURANT_PREMIUM_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const { bundle } = loaded;
    assert.ok(bundle.tbdpNative?.enabled);
    assert.equal(bundle.tbdpNative?.sectorDnaId, "restaurant");
    assert.equal(bundle.tbdpNative?.templateIdentity, "ember-table");
    assert.equal(bundle.tokens.colors.primary, EMBER_TABLE_V2_TOKENS.colors.primary);
    assert.equal(bundle.motion.preset, EMBER_TABLE_MOTION.preset);
    assert.ok(bundle.tbdpDesignContext);
  });

  it("emits restaurant-premium global CSS with Ember Table layer", async () => {
    const loaded = await loadTemplateV2Package(RESTAURANT_PREMIUM_PACKAGE);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
    assert.ok(css.includes(".rp-card"));
    assert.ok(css.includes("rp-reveal-hero") || css.includes(".rp-headline"));
    assert.ok(css.includes(`--color-primary: ${EMBER_TABLE_V2_TOKENS.colors.primary}`));
  });
});
