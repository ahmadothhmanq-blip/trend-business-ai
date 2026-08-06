"use client";

import type { CtaContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantCtaRow, VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { CtaVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

export const CTA_VARIANT_REGISTRY: VariantDefinition<"cta">[] = [
  { id: "centered-band", sectionKind: "cta", label: "Centered Band", description: "Centered headline with dual CTAs.", composition: "centered", hierarchy: "H2 + subtitle + CTAs", rhythm: "Symmetric band", visualIdentity: "Classic CTA band", imageSlots: [], responsiveStrategy: "Centered stack", isDefault: true },
  { id: "split-offer", sectionKind: "cta", label: "Split Offer", description: "Copy left, action panel right.", composition: "split", hierarchy: "50/50 split offer", rhythm: "Split conversion", visualIdentity: "Offer panel", imageSlots: [], responsiveStrategy: "Stack split" },
  { id: "gradient-banner", sectionKind: "cta", label: "Gradient Banner", description: "Full-width gradient banner CTA.", composition: "band", hierarchy: "Gradient band with CTAs", rhythm: "Bold color band", visualIdentity: "High-energy banner", imageSlots: [], responsiveStrategy: "Full-width band" },
  { id: "inline-newsletter", sectionKind: "cta", label: "Inline Newsletter", description: "Email capture inline with headline.", composition: "inline", hierarchy: "Headline + email form", rhythm: "Inline form row", visualIdentity: "Newsletter signup", imageSlots: [], responsiveStrategy: "Form stacks" },
  { id: "floating-card", sectionKind: "cta", label: "Floating Card", description: "Elevated card CTA on subtle background.", composition: "centered", hierarchy: "Card on surface", rhythm: "Floating elevation", visualIdentity: "Card CTA", imageSlots: [], responsiveStrategy: "Card full-width mobile" },
  { id: "minimal-line", sectionKind: "cta", label: "Minimal Line", description: "Single line with text link CTA.", composition: "minimal", hierarchy: "One line + link", rhythm: "Ultra minimal", visualIdentity: "Quiet CTA", imageSlots: [], responsiveStrategy: "Wrap line" },
];

export const CTA_DEFAULT_VARIANT: CtaVariantId = "centered-band";

function CtaCenteredBand(p: CtaContent) {
  const id = p.id ?? "cta";
  return (
    <SectionVariantShell sectionKind="cta" variantId="centered-band" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-background))]`}>
      <div className={`${p.ui.container} text-center`}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "Ready to move forward?"}</h2>
        <p className={`${p.ui.body} mx-auto mt-4 max-w-2xl`}>{p.subtitle}</p>
        <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} primaryHref={p.primaryHref} secondaryHref={p.secondaryHref} className="mt-8 justify-center" />
      </div>
    </SectionVariantShell>
  );
}

function CtaSplitOffer(p: CtaContent) {
  const id = p.id ?? "cta";
  return (
    <SectionVariantShell sectionKind="cta" variantId="split-offer" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} grid items-center gap-8 lg:grid-cols-2`}>
        <div>
          <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "Start your free trial"}</h2>
          <p className={`${p.ui.body} mt-4`}>{p.subtitle}</p>
        </div>
        <div className={`${p.ui.card} df-card-featured p-8 text-center`}>
          <p className={`${p.ui.eyebrow} text-white/80`}>Limited offer</p>
          <VariantCtaRow ui={p.ui} primary={p.primaryCta ?? "Claim offer"} secondary={p.secondaryCta} className="mt-6 justify-center" />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function CtaGradientBanner(p: CtaContent) {
  const id = p.id ?? "cta";
  return (
    <SectionVariantShell sectionKind="cta" variantId="gradient-banner" componentId={p.componentId} id={id} title={p.title} className="bg-gradient-to-r from-[var(--color-primary)] to-[color-mix(in_srgb,var(--color-accent)_60%,var(--color-primary))] py-16 text-white">
      <div className={`${p.ui.container} flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-start`}>
        <div>
          <h2 id={`${id}-title`} className={`${p.ui.headlineSm} text-white`}>{p.title ?? "Transform your business"}</h2>
          <p className="mt-2 text-white/85">{p.subtitle}</p>
        </div>
        <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} />
      </div>
    </SectionVariantShell>
  );
}

function CtaInlineNewsletter(p: CtaContent) {
  const id = p.id ?? "cta";
  return (
    <SectionVariantShell sectionKind="cta" variantId="inline-newsletter" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} max-w-3xl`}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "Stay in the loop"}</h2>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()} noValidate>
          <label htmlFor={`${id}-email`} className="sr-only">Email</label>
          <input id={`${id}-email`} type="email" placeholder={p.emailPlaceholder ?? "you@company.com"} className={`df-input flex-1 ${p.ui.focusRing}`} />
          <button type="submit" className={`${p.ui.btnPrimary} ${p.ui.focusRing} shrink-0`}>{p.primaryCta ?? "Subscribe"}</button>
        </form>
      </div>
    </SectionVariantShell>
  );
}

function CtaFloatingCard(p: CtaContent) {
  const id = p.id ?? "cta";
  return (
    <SectionVariantShell sectionKind="cta" variantId="floating-card" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-glow`}>
      <div className={p.ui.container}>
        <div className={`${p.ui.card} mx-auto max-w-2xl p-10 text-center shadow-[var(--shadow-surface)]`}>
          <VariantHeader ui={p.ui} id={id} title={p.title} subtitle={p.subtitle} align="center" className="mb-0" />
          <VariantCtaRow ui={p.ui} primary={p.primaryCta} secondary={p.secondaryCta} className="mt-8 justify-center" />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function CtaMinimalLine(p: CtaContent) {
  const id = p.id ?? "cta";
  return (
    <SectionVariantShell sectionKind="cta" variantId="minimal-line" componentId={p.componentId} id={id} title={p.title} className="border-y border-[var(--border-subtle)] py-8">
      <div className={`${p.ui.container} flex flex-col items-center justify-between gap-4 sm:flex-row`}>
        <p id={`${id}-title`} className={`${p.ui.fontBody} text-sm font-medium`}>{p.title ?? "Ready when you are."}</p>
        <a href={p.primaryHref ?? "#contact"} className={`df-btn-link ${p.ui.focusRing}`}>{p.primaryCta ?? "Get in touch →"}</a>
      </div>
    </SectionVariantShell>
  );
}

const CTA_RENDERERS: Record<CtaVariantId, (p: CtaContent) => React.JSX.Element> = {
  "centered-band": CtaCenteredBand,
  "split-offer": CtaSplitOffer,
  "gradient-banner": CtaGradientBanner,
  "inline-newsletter": CtaInlineNewsletter,
  "floating-card": CtaFloatingCard,
  "minimal-line": CtaMinimalLine,
};

export function renderCtaVariant(variantId: CtaVariantId, props: CtaContent) {
  return CTA_RENDERERS[variantId](props);
}
