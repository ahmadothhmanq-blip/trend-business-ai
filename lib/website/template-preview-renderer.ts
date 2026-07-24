import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import { buildSectionSpecsFromComponents } from "@/lib/ai-core/template-intelligence/section-specs";
import type {
  TemplateHeroVariant,
  TemplateSectionSpec,
  TemplateVisualPreset,
} from "@/lib/ai-core/template-intelligence/types";
import { resolveTemplateVisualPreset } from "@/lib/ai-core/template-intelligence/visual-preset";

export type TemplatePreviewContent = {
  title: string;
  description: string;
  content: string[];
  primaryCta: string;
  secondaryCta?: string;
  heroImageUrl?: string | null;
  pages?: string[];
  defaultSlug: string;
};

export type TemplatePreviewTheme = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  displayFont: string;
  sectionY: string;
  sectionYMobile: string;
  containerMax: string;
  btnPrimary: "filled" | "ghost" | "outline";
  btnRadius: string;
  btnUppercase: boolean;
  btnWeight: number;
  preset: TemplateVisualPreset;
  templateId: string | null;
  templateName: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pickContent(
  content: string[],
  slot: number | undefined,
  fallback: string,
): string {
  if (slot !== undefined && content[slot]?.trim()) return content[slot]!.trim();
  if (content[slot ?? 0]?.trim()) return content[slot ?? 0]!.trim();
  return fallback;
}

function ctaHtml(
  label: string,
  href: string,
  theme: TemplatePreviewTheme,
  variant: "primary" | "secondary" = "primary",
): string {
  const cls =
    variant === "primary"
      ? "ti-btn ti-btn-primary"
      : "ti-btn ti-btn-secondary";
  return `<a class="${cls}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

function renderHeader(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  navHtml: string,
): string {
  const navVariant = theme.preset.layout.navigationVariant;
  const transparent = /transparent/i.test(navVariant);
  const headerCls = [
    "ti-site-header",
    `ti-nav-${navVariant}`,
    transparent ? "ti-header-transparent" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<header class="${headerCls}" data-component="${escapeHtml(spec.componentId)}">
  <a class="brand" href="#${escapeHtml(ctx.defaultSlug)}">${escapeHtml(ctx.title)}</a>
  <nav>${navHtml}</nav>
  ${ctaHtml(ctx.primaryCta, `#${escapeHtml(ctx.defaultSlug)}`, theme)}
</header>`;
}

function renderHero(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
): string {
  const variant = theme.preset.layout.heroVariant;
  const heroImage = ctx.heroImageUrl?.trim();
  const media = heroImage
    ? `<div class="ti-hero-media" style="background-image:url('${escapeHtml(heroImage)}')"></div>`
    : `<div class="ti-hero-media ti-hero-media--${escapeHtml(variant)}"></div>`;

  const secondary = ctx.secondaryCta
    ? ctaHtml(ctx.secondaryCta, `#contact`, theme, "secondary")
    : "";

  if (variant === "saas-split") {
    return `<section class="ti-hero ti-hero--saas-split" data-component="${escapeHtml(spec.componentId)}">
  <div class="ti-hero-inner">
    <div class="ti-hero-copy">
      <p class="eyebrow">${escapeHtml(spec.label)}</p>
      <h1>${escapeHtml(ctx.title)}</h1>
      <p class="lead">${escapeHtml(ctx.description)}</p>
      <div class="ti-hero-actions">${ctaHtml(ctx.primaryCta, "#services", theme)}${secondary}</div>
    </div>
    ${media}
  </div>
</section>`;
  }

  if (variant === "cinematic-full") {
    return `<section class="ti-hero ti-hero--cinematic" data-component="${escapeHtml(spec.componentId)}">
  ${media}
  <div class="ti-hero-overlay">
    <p class="eyebrow">${escapeHtml(spec.label)}</p>
    <h1>${escapeHtml(ctx.title)}</h1>
    <p class="lead">${escapeHtml(ctx.description)}</p>
    <div class="ti-hero-actions">${ctaHtml(ctx.primaryCta, "#gallery", theme)}${secondary}</div>
  </div>
</section>`;
  }

  if (variant === "red-premium") {
    return `<section class="ti-hero ti-hero--red-premium" data-component="${escapeHtml(spec.componentId)}">
  ${media}
  <div class="ti-hero-overlay">
    <p class="eyebrow">Premium</p>
    <h1>${escapeHtml(ctx.title)}</h1>
    <p class="lead">${escapeHtml(ctx.description)}</p>
    <div class="ti-hero-actions">${ctaHtml(ctx.primaryCta, "#cta", theme)}${secondary}</div>
  </div>
</section>`;
  }

  if (variant === "minimal-bleed") {
    return `<section class="ti-hero ti-hero--minimal" data-component="${escapeHtml(spec.componentId)}">
  <p class="eyebrow">${escapeHtml(spec.label)}</p>
  <h1>${escapeHtml(ctx.title)}</h1>
  <p class="lead">${escapeHtml(ctx.description)}</p>
  ${ctaHtml(ctx.primaryCta, "#services", theme)}
</section>`;
  }

  // luxury-editorial (default luxury)
  return `<section class="ti-hero ti-hero--luxury" data-component="${escapeHtml(spec.componentId)}">
  ${media}
  <div class="ti-hero-editorial">
    <p class="eyebrow">${escapeHtml(spec.label)}</p>
    <h1>${escapeHtml(ctx.title)}</h1>
    <p class="lead">${escapeHtml(ctx.description)}</p>
    <div class="ti-hero-actions">${ctaHtml(ctx.primaryCta, "#story", theme)}${secondary}</div>
  </div>
</section>`;
}

function renderFeaturesGrid(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  items: string[],
): string {
  const layout = theme.preset.layout.sectionLayout;
  const cards = items
    .map(
      (body, i) => `<article class="ti-card ti-card--${theme.preset.layout.cardVariant}">
  <p class="eyebrow">Feature ${i + 1}</p>
  <h3>${escapeHtml(spec.label)} ${i + 1}</h3>
  <p class="copy">${escapeHtml(body)}</p>
</article>`,
    )
    .join("\n");
  return `<section class="ti-block ti-block--features ti-layout-${layout}" id="features" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Features</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-features-grid">${cards}</div>
</section>`;
}

function renderServices(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  return `<section class="ti-block ti-block--services" id="services" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Services</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-services-row">
    <article class="ti-card ti-card--${theme.preset.layout.cardVariant}"><h3>Core offering</h3><p class="copy">${escapeHtml(body)}</p></article>
    <article class="ti-card ti-card--${theme.preset.layout.cardVariant}"><h3>Premium tier</h3><p class="copy">${escapeHtml(pickContent(ctx.content, (spec.contentSlot ?? 0) + 1, body))}</p></article>
    <article class="ti-card ti-card--${theme.preset.layout.cardVariant}"><h3>Consultation</h3><p class="copy">${escapeHtml(pickContent(ctx.content, (spec.contentSlot ?? 0) + 2, "Tailored support for your goals."))}</p></article>
  </div>
</section>`;
}

function renderGallery(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
): string {
  const asymmetric = theme.preset.layout.sectionLayout === "asymmetric";
  const cells = [0, 1, 2, 3].map(
    (i) =>
      `<figure class="ti-gallery-cell ${i === 0 && asymmetric ? "ti-gallery-cell--hero" : ""}"><span>${escapeHtml(pickContent(ctx.content, (spec.contentSlot ?? 0) + i, `Gallery item ${i + 1}`))}</span></figure>`,
  );
  return `<section class="ti-block ti-block--gallery ti-layout-${theme.preset.layout.sectionLayout}" id="gallery" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Gallery</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-gallery-grid">${cells.join("")}</div>
</section>`;
}

function renderTestimonials(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  const quotes = [
    body,
    pickContent(ctx.content, (spec.contentSlot ?? 0) + 1, "Outstanding quality and attention to detail."),
    pickContent(ctx.content, (spec.contentSlot ?? 0) + 2, "A seamless experience from start to finish."),
  ];
  return `<section class="ti-block ti-block--testimonials" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Proof</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-testimonial-track">${quotes
    .map(
      (q) =>
        `<blockquote class="ti-card ti-card--${theme.preset.layout.cardVariant}"><p>"${escapeHtml(q)}"</p><footer>Verified client</footer></blockquote>`,
    )
    .join("")}</div>
</section>`;
}

function renderPricing(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
): string {
  return `<section class="ti-block ti-block--pricing" id="pricing" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Pricing</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-pricing-grid">
    <article class="ti-card ti-card--${theme.preset.layout.cardVariant}"><h3>Starter</h3><p class="price">$29</p><p class="copy">Essentials to get started</p></article>
    <article class="ti-card ti-card--${theme.preset.layout.cardVariant} ti-card--featured"><h3>Pro</h3><p class="price">$79</p><p class="copy">${escapeHtml(pickContent(ctx.content, spec.contentSlot, "Most popular plan"))}</p></article>
    <article class="ti-card ti-card--${theme.preset.layout.cardVariant}"><h3>Enterprise</h3><p class="price">Custom</p><p class="copy">Dedicated support</p></article>
  </div>
</section>`;
}

function renderFaq(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  const items = [
    { q: "How do I get started?", a: body },
    { q: "What is included?", a: pickContent(ctx.content, (spec.contentSlot ?? 0) + 1, ctx.description) },
    { q: "Can I customize?", a: pickContent(ctx.content, (spec.contentSlot ?? 0) + 2, "Yes — structure and design adapt to your brand.") },
  ];
  return `<section class="ti-block ti-block--faq" id="faq" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">FAQ</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-faq-list">${items
    .map(
      (item) =>
        `<details class="ti-faq-item"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`,
    )
    .join("")}</div>
</section>`;
}

function renderCta(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  return `<section class="ti-block ti-block--cta ti-cta--${theme.preset.layout.heroVariant}" id="cta" data-component="${escapeHtml(spec.componentId)}">
  <div class="ti-cta-inner">
    <h2>${escapeHtml(pickContent(ctx.content, spec.contentSlot, ctx.title))}</h2>
    <p class="copy">${escapeHtml(body)}</p>
    ${ctaHtml(ctx.primaryCta, "#contact", theme)}
  </div>
</section>`;
}

function renderCaseStudies(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
): string {
  const cases = [0, 1].map((i) => {
    const body = pickContent(ctx.content, (spec.contentSlot ?? 0) + i, `Case study ${i + 1}`);
    return `<article class="ti-case ti-card ti-card--${theme.preset.layout.cardVariant}"><h3>Project ${i + 1}</h3><p class="copy">${escapeHtml(body)}</p></article>`;
  });
  return `<section class="ti-block ti-block--cases ti-layout-asymmetric" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Work</p><h2>${escapeHtml(spec.label)}</h2></header>
  <div class="ti-cases-grid">${cases.join("")}</div>
</section>`;
}

function renderStory(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  return `<section class="ti-block ti-block--editorial" id="story" data-component="${escapeHtml(spec.componentId)}">
  <div class="ti-editorial-split">
    <div><p class="eyebrow">Story</p><h2>${escapeHtml(spec.label)}</h2></div>
    <p class="copy ti-editorial-body">${escapeHtml(body)}</p>
  </div>
</section>`;
}

function renderContact(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  return `<section class="ti-block ti-block--contact" id="contact" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Contact</p><h2>${escapeHtml(spec.label)}</h2></header>
  <p class="copy">${escapeHtml(body)}</p>
  <div class="ti-contact-form">
    <div class="ti-field">Name</div><div class="ti-field">Email</div><div class="ti-field ti-field--wide">Message</div>
    ${ctaHtml(ctx.primaryCta, "#", theme)}
  </div>
</section>`;
}

function renderGenericSection(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
  body: string,
): string {
  return `<section class="ti-block" data-component="${escapeHtml(spec.componentId)}">
  <header class="ti-block-head"><p class="eyebrow">Section</p><h2>${escapeHtml(spec.label)}</h2></header>
  <p class="copy">${escapeHtml(body)}</p>
</section>`;
}

function renderSectionComponent(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
): string {
  const id = spec.componentId;
  const body = pickContent(
    ctx.content,
    spec.contentSlot,
    `${spec.label} — ${ctx.description}`,
  );
  const featureBodies = [
    body,
    pickContent(ctx.content, (spec.contentSlot ?? 0) + 1, body),
    pickContent(ctx.content, (spec.contentSlot ?? 0) + 2, body),
    pickContent(ctx.content, (spec.contentSlot ?? 0) + 3, body),
  ];

  if (/Feature/i.test(id)) return renderFeaturesGrid(spec, ctx, theme, featureBodies);
  if (/Services|Programs|Care/i.test(id)) return renderServices(spec, ctx, theme, body);
  if (/Gallery|Portfolio|Menu/i.test(id)) return renderGallery(spec, ctx, theme);
  if (/Testimonial|BrandTrust|SocialProof/i.test(id))
    return renderTestimonials(spec, ctx, theme, body);
  if (/Pricing|Finance/i.test(id)) return renderPricing(spec, ctx, theme);
  if (/Faq/i.test(id)) return renderFaq(spec, ctx, theme, body);
  if (/Cta|Booking/i.test(id)) return renderCta(spec, ctx, theme, body);
  if (/CaseStudies/i.test(id)) return renderCaseStudies(spec, ctx, theme);
  if (/FeatureStorytelling|Story/i.test(id)) return renderStory(spec, ctx, theme, body);
  if (/Contact/i.test(id)) return renderContact(spec, ctx, theme, body);
  if (/Process|Team|Trust/i.test(id)) return renderGenericSection(spec, ctx, theme, body);

  return renderGenericSection(spec, ctx, theme, body);
}

function renderFooter(
  spec: TemplateSectionSpec,
  ctx: TemplatePreviewContent,
  theme: TemplatePreviewTheme,
): string {
  const variant = theme.preset.layout.footerVariant;
  const note = theme.templateName
    ? `${theme.templateName} · ${escapeHtml(ctx.title)}`
    : escapeHtml(ctx.title);
  if (variant === "editorial") {
    return `<footer class="ti-site-footer ti-footer-editorial" data-component="${escapeHtml(spec.componentId)}">${note}</footer>`;
  }
  if (variant === "minimal") {
    return `<footer class="ti-site-footer ti-footer-minimal" data-component="${escapeHtml(spec.componentId)}"><span>${note}</span></footer>`;
  }
  if (variant === "premium-red") {
    return `<footer class="ti-site-footer ti-footer-red" data-component="${escapeHtml(spec.componentId)}">
  <div class="ti-footer-cols"><span>${note}</span><span>Privacy</span><span>Terms</span></div>
</footer>`;
  }
  return `<footer class="ti-site-footer ti-footer-multi" data-component="${escapeHtml(spec.componentId)}">
  <div class="ti-footer-cols"><div><strong>${escapeHtml(ctx.title)}</strong><p>${escapeHtml(ctx.description)}</p></div><div>Pages</div><div>Legal</div></div>
</footer>`;
}

/** Render full home page body from template section specs + preserved content. */
export function renderTemplateDrivenPageBody(params: {
  sections: TemplateSectionSpec[];
  ctx: TemplatePreviewContent;
  theme: TemplatePreviewTheme;
  navHtml: string;
}): string {
  const parts: string[] = [];
  for (const spec of params.sections) {
    if (spec.role === "header") {
      parts.push(renderHeader(spec, params.ctx, params.theme, params.navHtml));
      continue;
    }
    if (spec.role === "hero") {
      parts.push(renderHero(spec, params.ctx, params.theme));
      continue;
    }
    if (spec.role === "footer") {
      parts.push(renderFooter(spec, params.ctx, params.theme));
      continue;
    }
    parts.push(renderSectionComponent(spec, params.ctx, params.theme));
  }
  return parts.join("\n");
}

export function resolvePreviewSections(input: {
  templateIntelligenceId?: string | null;
  components?: string[];
}): TemplateSectionSpec[] {
  const template = input.templateIntelligenceId
    ? getTemplateIntelligence(input.templateIntelligenceId)
    : null;
  if (template) {
    const preset = resolveTemplateVisualPreset(template);
    if (preset.sections.length) return preset.sections;
    return buildSectionSpecsFromComponents(template.components.map(String));
  }
  const comps = (input.components ?? []).filter(Boolean);
  if (comps.length) return buildSectionSpecsFromComponents(comps);
  return buildSectionSpecsFromComponents([
    "SiteHeader",
    "HeroSplit",
    "FeaturesModern",
    "ServicesModern",
    "CtaSplit",
    "SiteFooter",
  ]);
}

export function heroVariantFromComponent(
  componentId: string,
  layoutStructure?: string,
): TemplateHeroVariant {
  if (/HeroLuxury/i.test(componentId) || layoutStructure === "editorial-hero") {
    return "luxury-editorial";
  }
  if (/HeroCinematic|HeroFullBleed/i.test(componentId)) return "cinematic-full";
  if (/HeroSplit|HeroProduct|HeroInteractive/i.test(componentId)) return "saas-split";
  if (/HeroFullBleed/i.test(componentId)) return "minimal-bleed";
  return "corporate-trust";
}
