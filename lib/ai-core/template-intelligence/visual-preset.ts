import { getBrandPreset, normalizeBrandPresetId } from "@/lib/ai-core/brand-identity/presets";
import { buildSectionSpecsFromComponents } from "@/lib/ai-core/template-intelligence/section-specs";
import {
  applyTemplateDnaToVisualPreset,
  resolveTemplateDNA,
} from "@/lib/ai-core/template-intelligence/template-dna";
import type {
  TemplateCardVariant,
  TemplateFooterVariant,
  TemplateHeroVariant,
  TemplateIntelligenceDefinition,
  TemplateNavigationVariant,
  TemplateSectionSpec,
  TemplateVisualPreset,
} from "@/lib/ai-core/template-intelligence/types";

function headerComponent(template: TemplateIntelligenceDefinition): string {
  const header = template.components.find((c) => /Header|Nav/i.test(c));
  return header ? String(header) : "SiteHeader";
}

function footerComponent(template: TemplateIntelligenceDefinition): string {
  const footer = template.components.find((c) => /Footer/i.test(c));
  return footer ? String(footer) : "SiteFooter";
}

function heroComponent(template: TemplateIntelligenceDefinition): string {
  const hero = template.components.find((c) => /Hero/i.test(c));
  return hero ? String(hero) : "HeroSplit";
}

function heroVariantFor(template: TemplateIntelligenceDefinition): TemplateHeroVariant {
  if (template.id === "ti-red-premium") return "red-premium";
  if (template.id === "ti-luxury-noir") return "luxury-editorial";
  const hero = heroComponent(template);
  if (/HeroLuxury/i.test(hero) || template.layoutStructure === "editorial-hero") {
    return "luxury-editorial";
  }
  if (/HeroCinematic/i.test(hero) || template.layoutStructure === "studio-portfolio") {
    return "cinematic-full";
  }
  if (/HeroFullBleed/i.test(hero) || template.designPreset === "minimal") {
    return "minimal-bleed";
  }
  if (/HeroSplit|HeroProduct|HeroInteractive/i.test(hero)) return "saas-split";
  return "corporate-trust";
}

function navigationVariantFor(
  template: TemplateIntelligenceDefinition,
): TemplateNavigationVariant {
  if (template.id === "ti-red-premium") return "red-bold";
  if (template.category === "Luxury") return "transparent-underline";
  if (template.category === "Creative") return "plain-minimal";
  if (template.category === "Minimal") return "plain-minimal";
  if (template.category === "Corporate") return "solid-corporate";
  return "pill-modern";
}

function footerVariantFor(
  template: TemplateIntelligenceDefinition,
): TemplateFooterVariant {
  if (template.id === "ti-red-premium") return "premium-red";
  if (template.category === "Luxury") return "editorial";
  if (template.category === "Creative" || template.category === "Minimal") {
    return "minimal";
  }
  return "multi-column";
}

function categoryButtons(
  template: TemplateIntelligenceDefinition,
): TemplateVisualPreset["buttons"] {
  if (template.id === "ti-red-premium") {
    return {
      primary: "filled",
      secondary: "outline",
      radius: "0.5rem",
      uppercase: true,
      weight: 800,
    };
  }
  if (template.category === "Luxury") {
    return {
      primary: "ghost",
      secondary: "outline",
      radius: "999px",
      uppercase: true,
      weight: 700,
    };
  }
  if (template.category === "Creative") {
    return {
      primary: "filled",
      secondary: "ghost",
      radius: "0.5rem",
      uppercase: false,
      weight: 800,
    };
  }
  if (template.category === "Minimal") {
    return {
      primary: "outline",
      secondary: "ghost",
      radius: "0.25rem",
      uppercase: false,
      weight: 600,
    };
  }
  return {
    primary: "filled",
    secondary: "outline",
    radius: "999px",
    uppercase: false,
    weight: 700,
  };
}

function categoryChrome(
  template: TemplateIntelligenceDefinition,
): TemplateVisualPreset["chrome"] {
  const header = headerComponent(template);
  const footer = footerComponent(template);
  const navVariant = navigationVariantFor(template);
  const transparent = navVariant === "transparent-underline";

  const footerVar = footerVariantFor(template);
  return {
    headerVariant: transparent ? "transparent" : "solid",
    headerComponent: header,
    footerVariant:
      footerVar === "premium-red" ? "editorial" : footerVar,
    footerComponent: footer,
    navStyle:
      navVariant === "pill-modern"
        ? "pill"
        : navVariant === "transparent-underline"
          ? "underline"
          : "plain",
  };
}

function categoryLayout(
  template: TemplateIntelligenceDefinition,
): TemplateVisualPreset["layout"] {
  const hero = heroComponent(template);
  let sectionLayout: TemplateVisualPreset["layout"]["sectionLayout"] = "grid";
  let cardsStyle: TemplateVisualPreset["layout"]["cardsStyle"] = "structured";
  let cardVariant: TemplateCardVariant = "structured";

  if (template.layoutStructure === "editorial-hero") {
    sectionLayout = "editorial";
    cardsStyle = "soft-shadow";
    cardVariant = "soft-shadow";
  } else if (template.layoutStructure === "studio-portfolio") {
    sectionLayout = "asymmetric";
    cardsStyle = "glass";
    cardVariant = "glass";
  } else if (template.layoutStructure === "product-saas") {
    sectionLayout = "bento";
    cardsStyle = "structured";
    cardVariant = "structured";
  } else if (template.designPreset === "minimal") {
    sectionLayout = "editorial";
    cardsStyle = "borderless";
    cardVariant = "borderless";
  }

  if (template.category === "Luxury") {
    cardsStyle = "soft-shadow";
    cardVariant = "soft-shadow";
  }
  if (template.category === "Creative") {
    cardsStyle = "glass";
    cardVariant = "glass";
  }
  if (template.id === "ti-red-premium") {
    sectionLayout = "editorial";
    cardVariant = "premium-red";
  }

  return {
    heroLayout: `${hero} · ${template.layoutStructure}`,
    sectionLayout,
    cardsStyle,
    componentStyle: `${template.designStyle} · ${template.animations.label}`,
    layoutVariant: template.layoutStructure,
    heroVariant: heroVariantFor(template),
    cardVariant,
    navigationVariant: navigationVariantFor(template),
    footerVariant: footerVariantFor(template),
  };
}

function defaultSections(
  template: TemplateIntelligenceDefinition,
): TemplateSectionSpec[] {
  return buildSectionSpecsFromComponents(template.components.map(String), {
    industryId: template.industry,
  });
}

/** Resolve the full visual preset for a template (catalog override or derived). */
export function resolveTemplateVisualPreset(
  template: TemplateIntelligenceDefinition,
): TemplateVisualPreset {
  const derivedLayout = categoryLayout(template);
  const derivedSections = defaultSections(template);

  if (template.visualPreset) {
    const brand = getBrandPreset(
      normalizeBrandPresetId(template.brandPresetId) ?? "corporate-brand",
    );
    const merged: TemplateVisualPreset = {
      ...template.visualPreset,
      layout: {
        ...derivedLayout,
        ...template.visualPreset.layout,
      },
      sections:
        template.visualPreset.sections.length > 0
          ? template.visualPreset.sections
          : derivedSections,
      spacing: {
        ...brand.spacing,
        ...(template.visualPreset.spacing ?? {}),
      },
    };
    return applyTemplateDnaToVisualPreset(merged, resolveTemplateDNA(template));
  }

  const brand = getBrandPreset(
    normalizeBrandPresetId(template.brandPresetId) ?? "corporate-brand",
  );
  const base: TemplateVisualPreset = {
    spacing: {
      sectionY: brand.spacing.sectionY,
      sectionYMobile: brand.spacing.sectionYMobile,
      containerMax: brand.spacing.containerMax,
      stack: brand.spacing.stack,
      density: brand.spacing.density,
    },
    buttons: categoryButtons(template),
    chrome: categoryChrome(template),
    layout: derivedLayout,
    sections: derivedSections,
  };

  return applyTemplateDnaToVisualPreset(base, resolveTemplateDNA(template));
}

/** CSS custom properties + rules for template visual preset. */
export function buildTemplateVisualCss(
  template: TemplateIntelligenceDefinition,
): string {
  const preset = resolveTemplateVisualPreset(template);
  const c = template.colors;
  const btn = preset.buttons;
  const primaryBg =
    btn.primary === "ghost"
      ? "transparent"
      : btn.primary === "outline"
        ? "transparent"
        : c.accent;
  const primaryColor =
    btn.primary === "ghost" || btn.primary === "outline" ? c.accent : "#111111";
  const primaryBorder =
    btn.primary === "outline" || btn.primary === "ghost"
      ? `2px solid ${c.accent}`
      : "none";

  const headerBg =
    preset.chrome.headerVariant === "transparent"
      ? "transparent"
      : preset.chrome.headerVariant === "minimal"
        ? c.background
        : c.surface;
  const headerBorder =
    preset.chrome.headerVariant === "transparent"
      ? "none"
      : `1px solid color-mix(in srgb, ${c.foreground} 12%, transparent)`;

  const cardRadius =
    preset.layout.cardVariant === "borderless"
      ? "0"
      : preset.layout.cardVariant === "glass"
        ? "1rem"
        : "1.25rem";
  const cardShadow =
    preset.layout.cardVariant === "soft-shadow"
      ? "0 24px 48px color-mix(in srgb, var(--color-primary) 25%, transparent)"
      : preset.layout.cardVariant === "glass"
        ? "inset 0 1px 0 color-mix(in srgb, var(--color-foreground) 8%, transparent)"
        : preset.layout.cardVariant === "premium-red"
          ? "0 20px 40px color-mix(in srgb, var(--accent) 30%, transparent)"
          : "none";
  const cardBorder =
    preset.layout.cardVariant === "borderless"
      ? "none"
      : `1px solid color-mix(in srgb, ${c.foreground} 12%, transparent)`;

  return `
/* Template Visual Preset — ${template.id} · Phase 3 Premium */
:root {
  --ti-btn-radius: ${btn.radius};
  --ti-btn-weight: ${btn.weight};
  --ti-section-y: ${preset.spacing.sectionY};
  --ti-section-y-mobile: ${preset.spacing.sectionYMobile};
  --ti-container-max: ${preset.spacing.containerMax};
  --ti-stack: ${preset.spacing.stack};
  --ti-header-variant: ${preset.chrome.headerVariant};
  --ti-footer-variant: ${preset.layout.footerVariant};
  --ti-section-layout: ${preset.layout.sectionLayout};
  --ti-card-radius: ${cardRadius};
  --ti-hero-variant: ${preset.layout.heroVariant};
  --ti-ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
  --ti-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ti-glass-bg: color-mix(in srgb, ${c.surface} 72%, transparent);
  --ti-glass-border: color-mix(in srgb, ${c.foreground} 10%, transparent);
  --ti-gradient-hero: linear-gradient(135deg, color-mix(in srgb, ${c.primary} 88%, #000) 0%, color-mix(in srgb, ${c.accent} 42%, ${c.background}) 55%, ${c.background} 100%);
  --ti-gradient-accent: linear-gradient(90deg, ${c.accent}, color-mix(in srgb, ${c.secondary} 80%, ${c.accent}));
  --ti-shadow-premium: 0 24px 64px color-mix(in srgb, ${c.primary} 18%, transparent);
  --ti-shadow-lift: 0 12px 32px color-mix(in srgb, ${c.foreground} 12%, transparent);
}
.ti-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${primaryBg};
  color: ${primaryColor};
  border: ${primaryBorder};
  border-radius: var(--ti-btn-radius);
  font-weight: var(--ti-btn-weight);
  ${btn.uppercase ? "text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.75rem;" : ""}
  padding: 0.85rem 1.5rem;
  text-decoration: none;
  transition: transform 0.35s var(--ti-ease-premium), box-shadow 0.35s var(--ti-ease-premium), background 0.35s var(--ti-ease-premium);
  box-shadow: 0 1px 2px color-mix(in srgb, ${c.foreground} 8%, transparent);
}
.ti-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--ti-shadow-lift);
}
.ti-btn-primary:active {
  transform: translateY(0);
}
.ti-site-header {
  background: ${headerBg};
  border-bottom: ${headerBorder};
  backdrop-filter: ${preset.chrome.headerVariant === "transparent" ? "blur(12px)" : "blur(8px)"};
  -webkit-backdrop-filter: ${preset.chrome.headerVariant === "transparent" ? "blur(12px)" : "blur(8px)"};
}
.ti-card {
  border-radius: var(--ti-card-radius);
  border: ${cardBorder};
  box-shadow: ${cardShadow};
  background: ${
    preset.layout.cardVariant === "glass"
      ? "var(--ti-glass-bg)"
      : "var(--color-surface)"
  };
  backdrop-filter: ${preset.layout.cardVariant === "glass" ? "blur(16px)" : "none"};
  -webkit-backdrop-filter: ${preset.layout.cardVariant === "glass" ? "blur(16px)" : "none"};
  transition: transform 0.45s var(--ti-ease-premium), box-shadow 0.45s var(--ti-ease-premium);
}
.ti-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ti-shadow-premium);
}
.ti-section {
  padding-block: var(--ti-section-y-mobile);
  max-width: var(--ti-container-max);
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2rem);
}
@media (min-width: 768px) {
  .ti-section { padding-block: var(--ti-section-y); }
}
.ti-hero-premium {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.ti-hero-premium::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--ti-gradient-hero);
  opacity: 0.92;
  z-index: 0;
}
.ti-hero-premium > * {
  position: relative;
  z-index: 1;
}
.ti-glass-panel {
  background: var(--ti-glass-bg);
  border: 1px solid var(--ti-glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--ti-card-radius);
}
.ti-gradient-text {
  background: var(--ti-gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@keyframes ti-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ti-scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes ti-reveal {
  from { opacity: 0; transform: translateY(32px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.ti-animate-in {
  animation: ${template.animations.entrance};
  animation-fill-mode: both;
}
.ti-stagger > * {
  animation: ti-fade-up 0.75s var(--ti-ease-premium) both;
}
.ti-stagger > *:nth-child(2) { animation-delay: 0.08s; }
.ti-stagger > *:nth-child(3) { animation-delay: 0.16s; }
.ti-stagger > *:nth-child(4) { animation-delay: 0.24s; }
@media (prefers-reduced-motion: reduce) {
  .ti-animate-in, .ti-stagger > * { animation: none; }
  .ti-card:hover, .ti-btn-primary:hover { transform: none; }
}
@media (max-width: 767px) {
  .ti-btn-primary { min-height: 44px; padding-inline: 1.25rem; }
}
`;
}
