"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import type { HeroContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantCtaRow, VariantHeader, VariantMetricStrip } from "@/lib/website/template-v2/variants/sections/_shared";
import type { HeroVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_METRICS = [
  { value: "98%", label: "Client retention" },
  { value: "40+", label: "Markets served" },
  { value: "15yr", label: "Industry tenure" },
  { value: "2.4×", label: "Avg. ROI" },
];

export const HERO_VARIANT_REGISTRY: VariantDefinition<"hero">[] = [
  { id: "split-trust", sectionKind: "hero", label: "Split Trust", description: "Classic split layout — narrative left, visual right with elevated frame.", composition: "split", hierarchy: "H1 dominant, eyebrow → headline → body → CTAs", rhythm: "Generous vertical section padding, 12/20 column split", visualIdentity: "Trust-forward editorial split", imageSlots: ["hero"], responsiveStrategy: "Stack on mobile, image below copy", isDefault: true },
  { id: "centered-statement", sectionKind: "hero", label: "Centered Statement", description: "Centered typographic hero with supporting image band below.", composition: "centered", hierarchy: "Centered H1, subtitle, dual CTAs, wide image", rhythm: "Tight headline cluster, wide image gap", visualIdentity: "Confident manifesto", imageSlots: ["hero"], responsiveStrategy: "Full-width image scales down" },
  { id: "editorial-stack", sectionKind: "hero", label: "Editorial Stack", description: "Oversized stacked headline with offset corner image.", composition: "stacked", hierarchy: "Display type stack, corner accent image", rhythm: "Large top margin, asymmetric offset", visualIdentity: "Magazine editorial", imageSlots: ["hero"], responsiveStrategy: "Image drops below headline block" },
  { id: "product-spotlight", sectionKind: "hero", label: "Product Spotlight", description: "Compact copy header with dominant centered product visual.", composition: "centered", hierarchy: "Compact header, hero visual dominates 70%", rhythm: "Compressed intro, expansive visual", visualIdentity: "Product-first SaaS", imageSlots: ["hero", "products"], responsiveStrategy: "Visual maintains aspect ratio" },
  { id: "metrics-rail", sectionKind: "hero", label: "Metrics Rail", description: "Split hero with horizontal metrics rail anchoring the base.", composition: "rail", hierarchy: "Split copy/visual, metrics band below", rhythm: "Two-tier vertical rhythm", visualIdentity: "Data-backed credibility", imageSlots: ["hero"], responsiveStrategy: "Metrics grid 2×2 on mobile" },
  { id: "immersive-visual", sectionKind: "hero", label: "Immersive Visual", description: "Full-bleed background image with gradient overlay and inset copy.", composition: "immersive", hierarchy: "Overlay copy on cinematic visual", rhythm: "Edge-to-edge visual, inset text block", visualIdentity: "Cinematic immersion", imageSlots: ["hero", "backgrounds"], responsiveStrategy: "Min-height scales, text padding increases" },
  { id: "minimal-type", sectionKind: "hero", label: "Minimal Type", description: "Typography-only hero — no image, maximum whitespace.", composition: "minimal", hierarchy: "Display headline, single CTA", rhythm: "Extreme vertical breathing room", visualIdentity: "Refined minimalism", imageSlots: [], responsiveStrategy: "Type scales with clamp" },
  { id: "dual-cta-band", sectionKind: "hero", label: "Dual CTA Band", description: "Bold headline with full-width dual-action band.", composition: "band", hierarchy: "Headline block + contrasting CTA band", rhythm: "Sharp section break at CTA band", visualIdentity: "Conversion-focused", imageSlots: ["hero"], responsiveStrategy: "CTA band stacks buttons" },
  { id: "video-frame", sectionKind: "hero", label: "Video Frame", description: "Split copy with faux video frame using hero slot poster.", composition: "split", hierarchy: "Copy left, framed media right", rhythm: "Media frame with play affordance", visualIdentity: "Demo-driven", imageSlots: ["hero"], responsiveStrategy: "Frame full-width on mobile" },
  { id: "asymmetric-grid", sectionKind: "hero", label: "Asymmetric Grid", description: "12-column asymmetric grid with overlapping visual cell.", composition: "asymmetric", hierarchy: "Grid-positioned copy and visual", rhythm: "Broken grid, intentional overlap", visualIdentity: "Architectural tension", imageSlots: ["hero"], responsiveStrategy: "Grid collapses to single column" },
];

export const HERO_DEFAULT_VARIANT: HeroVariantId = "split-trust";

function HeroSplitTrust(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="split-trust" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-background)]`}>
      <div className={`${p.ui.container} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
        <div>
          {p.eyebrow ? <p className={`${p.ui.eyebrow} mb-4`}>{p.eyebrow}</p> : null}
          <h1 id={`${id}-title`} className={p.ui.headline}>{p.title ?? "Build with confidence"}</h1>
          {p.subtitle ? <p className={`${p.ui.body} mt-6`}>{p.subtitle}</p> : null}
          <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} primaryHref={p.primaryHref} secondaryHref={p.secondaryHref} className="mt-8" />
        </div>
        <div className={`${p.ui.card} overflow-hidden p-1`}>
          <SlotImage slot="hero" preferred={p.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" priority />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroCenteredStatement(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="centered-statement" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-glow bg-[var(--color-background)]`}>
      <div className={`${p.ui.container} text-center`}>
        {p.eyebrow ? <p className={`${p.ui.eyebrow} mb-4`}>{p.eyebrow}</p> : null}
        <h1 id={`${id}-title`} className={`${p.ui.headline} mx-auto max-w-4xl`}>{p.title ?? "Lead with clarity"}</h1>
        {p.subtitle ? <p className={`${p.ui.body} mx-auto mt-6`}>{p.subtitle}</p> : null}
        <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-8 justify-center" />
        <div className={`${p.ui.card} mx-auto mt-14 max-w-5xl overflow-hidden`}>
          <SlotImage slot="hero" preferred={p.imageUrl} alt="" className="aspect-[21/9] w-full object-cover" priority />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroEditorialStack(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="editorial-stack" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} relative overflow-hidden bg-[var(--color-background)]`}>
      <div className={p.ui.container}>
        <div className="relative grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {p.eyebrow ? <p className={`${p.ui.eyebrow} mb-6`}>{p.eyebrow}</p> : null}
            <h1 id={`${id}-title`} className={`${p.ui.headline} text-[clamp(2.75rem,8vw,6rem)]`}>{p.title ?? "Stories that move markets"}</h1>
            {p.subtitle ? <p className={`${p.ui.body} mt-8 max-w-xl`}>{p.subtitle}</p> : null}
            <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-10" />
          </div>
          <div className="relative lg:col-span-5 lg:-me-8 lg:mt-16">
            <div className={`${p.ui.card} rotate-1 overflow-hidden shadow-[var(--shadow-surface)]`}>
              <SlotImage slot="hero" preferred={p.imageUrl} alt="" className="aspect-[3/4] w-full object-cover" priority />
            </div>
          </div>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroProductSpotlight(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="product-spotlight" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-surface)]`}>
      <div className={p.ui.container}>
        <div className="mx-auto max-w-2xl text-center">
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "See it in action"} subtitle={p.subtitle} align="center" className="mb-0" />
          <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-6 justify-center" />
        </div>
        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="df-grid-bg absolute inset-0 opacity-40" aria-hidden />
          <div className={`${p.ui.card} relative overflow-hidden border-2`}>
            <SlotImage slot="products" index={0} preferred={p.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" priority />
          </div>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroMetricsRail(p: HeroContent) {
  const id = p.id ?? "hero";
  const metrics = p.metrics ?? DEFAULT_METRICS;
  return (
    <SectionVariantShell sectionKind="hero" variantId="metrics-rail" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-background)]`}>
      <div className={p.ui.container}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h1 id={`${id}-title`} className={p.ui.headline}>{p.title ?? "Proven at scale"}</h1>
            {p.subtitle ? <p className={`${p.ui.body} mt-5`}>{p.subtitle}</p> : null}
            <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-8" />
          </div>
          <SlotImage slot="hero" preferred={p.imageUrl} alt="" className={`${p.ui.card} aspect-square w-full object-cover`} priority />
        </div>
        <VariantMetricStrip ui={p.ui} metrics={metrics} className="mt-12 border-t border-[var(--border-subtle)] pt-10" />
      </div>
    </SectionVariantShell>
  );
}

function HeroImmersiveVisual(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="immersive-visual" componentId={p.componentId} id={id} title={p.title} className="relative min-h-[85vh] overflow-hidden">
      <SlotImage slot="backgrounds" index={0} preferred={p.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" priority containerClassName="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 via-[var(--color-primary)]/70 to-transparent" aria-hidden />
      <div className={`${p.ui.container} relative flex min-h-[85vh] max-w-2xl items-center py-20`}>
        <div className="text-white">
          {p.eyebrow ? <p className={`${p.ui.eyebrow} mb-4 text-white/80`}>{p.eyebrow}</p> : null}
          <h1 id={`${id}-title`} className={`${p.ui.headline} text-white`}>{p.title ?? "Experience excellence"}</h1>
          {p.subtitle ? <p className={`${p.ui.body} mt-6 text-white/85`}>{p.subtitle}</p> : null}
          <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-8" />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroMinimalType(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="minimal-type" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-tight bg-[var(--color-background)]`}>
      <div className={`${p.ui.container} max-w-3xl`}>
        {p.eyebrow ? <p className={`${p.ui.eyebrow} mb-6`}>{p.eyebrow}</p> : null}
        <h1 id={`${id}-title`} className={`${p.ui.headline} text-[clamp(3rem,9vw,6.5rem)]`}>{p.title ?? "Less noise. More impact."}</h1>
        {p.subtitle ? <p className={`${p.ui.body} mt-8 text-lg`}>{p.subtitle}</p> : null}
        <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-12" />
      </div>
    </SectionVariantShell>
  );
}

function HeroDualCtaBand(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="dual-cta-band" componentId={p.componentId} id={id} title={p.title} className="bg-[var(--color-background)]">
      <div className={`${p.ui.section} ${p.ui.container}`}>
        <h1 id={`${id}-title`} className={`${p.ui.headline} max-w-4xl`}>{p.title ?? "Start building today"}</h1>
        {p.subtitle ? <p className={`${p.ui.body} mt-5 max-w-2xl`}>{p.subtitle}</p> : null}
      </div>
      <div className="border-y border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-background))]">
        <div className={`${p.ui.container} flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center`}>
          <p className={`${p.ui.fontBody} text-sm font-medium text-[var(--color-muted)]`}>Choose your path</p>
          <VariantCtaRow ui={p.ui} primary={p.primaryCta ?? "Get started"} secondary={p.secondaryCta ?? "Book a demo"} />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroVideoFrame(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="video-frame" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-background)]`}>
      <div className={`${p.ui.container} grid items-center gap-12 lg:grid-cols-2`}>
        <div>
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Watch how it works"} subtitle={p.subtitle} />
          <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} />
        </div>
        <div className={`${p.ui.card} relative overflow-hidden p-2`}>
          <SlotImage slot="hero" preferred={p.imageUrl} alt="" className="aspect-video w-full rounded-[var(--radius-md)] object-cover" priority />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-lg">▶</span>
          </div>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function HeroAsymmetricGrid(p: HeroContent) {
  const id = p.id ?? "hero";
  return (
    <SectionVariantShell sectionKind="hero" variantId="asymmetric-grid" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-surface)]`}>
      <div className={`${p.ui.container} df-grid-12 items-end`}>
        <div className="col-span-12 lg:col-span-5">
          <h1 id={`${id}-title`} className={p.ui.headline}>{p.title ?? "Designed to stand apart"}</h1>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:col-start-7">
          {p.subtitle ? <p className={`${p.ui.body} mb-6`}>{p.subtitle}</p> : null}
          <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} />
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:-mt-8">
          <div className={`${p.ui.card} overflow-hidden lg:translate-y-8`}>
            <SlotImage slot="hero" preferred={p.imageUrl} alt="" className="aspect-[5/4] w-full object-cover" priority />
          </div>
        </div>
      </div>
    </SectionVariantShell>
  );
}

const HERO_RENDERERS: Record<HeroVariantId, (p: HeroContent) => React.JSX.Element> = {
  "split-trust": HeroSplitTrust,
  "centered-statement": HeroCenteredStatement,
  "editorial-stack": HeroEditorialStack,
  "product-spotlight": HeroProductSpotlight,
  "metrics-rail": HeroMetricsRail,
  "immersive-visual": HeroImmersiveVisual,
  "minimal-type": HeroMinimalType,
  "dual-cta-band": HeroDualCtaBand,
  "video-frame": HeroVideoFrame,
  "asymmetric-grid": HeroAsymmetricGrid,
};

export function renderHeroVariant(variantId: HeroVariantId, props: HeroContent) {
  return HERO_RENDERERS[variantId](props);
}
