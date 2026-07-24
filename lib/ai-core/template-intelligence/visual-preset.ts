import { getBrandPreset } from "@/lib/ai-core/brand-identity/presets";
import { buildSectionSpecsFromComponents } from "@/lib/ai-core/template-intelligence/section-specs";
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
    return {
      ...template.visualPreset,
      layout: {
        ...derivedLayout,
        ...template.visualPreset.layout,
      },
      sections:
        template.visualPreset.sections.length > 0
          ? template.visualPreset.sections
          : derivedSections,
    };
  }

  const brand = getBrandPreset(template.brandPresetId);
  return {
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
/* Template Visual Preset — ${template.id} */
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
}
.ti-btn-primary {
  display: inline-block;
  background: ${primaryBg};
  color: ${primaryColor};
  border: ${primaryBorder};
  border-radius: var(--ti-btn-radius);
  font-weight: var(--ti-btn-weight);
  ${btn.uppercase ? "text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.75rem;" : ""}
  padding: 0.75rem 1.35rem;
  text-decoration: none;
}
.ti-site-header {
  background: ${headerBg};
  border-bottom: ${headerBorder};
}
.ti-card {
  border-radius: var(--ti-card-radius);
  border: ${cardBorder};
  box-shadow: ${cardShadow};
  background: var(--color-surface);
}
.ti-section {
  padding-block: var(--ti-section-y-mobile);
  max-width: var(--ti-container-max);
  margin-inline: auto;
}
@media (min-width: 768px) {
  .ti-section { padding-block: var(--ti-section-y); }
}
@keyframes ti-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.ti-animate-in { animation: ${template.animations.entrance}; }
@media (prefers-reduced-motion: reduce) {
  .ti-animate-in { animation: none; }
}
`;
}
