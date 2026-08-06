"use client";

import { useState } from "react";
import type { PricingContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantCtaRow, VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { PricingVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_TIERS = [
  { name: "Starter", price: "$49", period: "/mo", description: "For small teams getting started.", features: ["5 users", "Core features", "Email support"], cta: "Start free" },
  { name: "Professional", price: "$149", period: "/mo", description: "For growing organizations.", features: ["25 users", "Advanced analytics", "Priority support", "API access"], featured: true, cta: "Get started" },
  { name: "Enterprise", price: "Custom", period: "", description: "For large-scale deployments.", features: ["Unlimited users", "SSO & SAML", "Dedicated CSM", "SLA"], cta: "Contact sales" },
];

export const PRICING_VARIANT_REGISTRY: VariantDefinition<"pricing">[] = [
  { id: "tier-cards", sectionKind: "pricing", label: "Tier Cards", description: "Three-tier pricing card layout.", composition: "grid", hierarchy: "Equal cards, center featured", rhythm: "3-up card grid", visualIdentity: "SaaS pricing", imageSlots: [], responsiveStrategy: "Stack tiers", isDefault: true },
  { id: "comparison-table", sectionKind: "pricing", label: "Comparison Table", description: "Feature comparison table across tiers.", composition: "table", hierarchy: "Table rows × columns", rhythm: "Tabular scan", visualIdentity: "Analytical comparison", imageSlots: [], responsiveStrategy: "Horizontal scroll table" },
  { id: "toggle-annual", sectionKind: "pricing", label: "Toggle Annual", description: "Monthly/annual toggle above tier cards.", composition: "grid", hierarchy: "Toggle + cards", rhythm: "Toggle then grid", visualIdentity: "Flexible billing", imageSlots: [], responsiveStrategy: "Toggle centers, cards stack" },
  { id: "feature-matrix", sectionKind: "pricing", label: "Feature Matrix", description: "Dense feature matrix with checkmarks.", composition: "table", hierarchy: "Features × tiers matrix", rhythm: "Dense grid", visualIdentity: "Enterprise matrix", imageSlots: [], responsiveStrategy: "Scrollable matrix" },
  { id: "minimal-single", sectionKind: "pricing", label: "Minimal Single", description: "Single plan with feature list.", composition: "centered", hierarchy: "One plan centered", rhythm: "Focused single offer", visualIdentity: "Simple pricing", imageSlots: [], responsiveStrategy: "Narrow centered" },
  { id: "enterprise-callout", sectionKind: "pricing", label: "Enterprise Callout", description: "Two tiers + enterprise callout band.", composition: "band", hierarchy: "Cards + full-width CTA band", rhythm: "Cards then band", visualIdentity: "Enterprise upsell", imageSlots: [], responsiveStrategy: "Band full-width" },
  { id: "slider-tiers", sectionKind: "pricing", label: "Slider Tiers", description: "Highlighted tier with side previews.", composition: "carousel", hierarchy: "Center featured tier", rhythm: "Carousel focus", visualIdentity: "Interactive tiers", imageSlots: [], responsiveStrategy: "Single tier visible mobile" },
  { id: "horizontal-scroll", sectionKind: "pricing", label: "Horizontal Scroll", description: "Scrollable pricing cards rail.", composition: "carousel", hierarchy: "Horizontal card rail", rhythm: "Snap scroll cards", visualIdentity: "App-store pricing", imageSlots: [], responsiveStrategy: "Horizontal scroll" },
];

export const PRICING_DEFAULT_VARIANT: PricingVariantId = "tier-cards";

function PricingTierCards(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tiers = p.tiers ?? DEFAULT_TIERS;
  return (
    <SectionVariantShell sectionKind="pricing" variantId="tier-cards" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Pricing"} subtitle={p.subtitle} align="center" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className={`${p.ui.card} flex flex-col p-8 ${tier.featured ? "df-card-featured md:-translate-y-2" : ""}`}>
              <h3 className={`${p.ui.fontBody} font-semibold ${tier.featured ? "text-white" : ""}`}>{tier.name}</h3>
              <p className={`${p.ui.metric} mt-4`}>{tier.price}<span className="text-base font-normal">{tier.period}</span></p>
              <p className={`${p.ui.body} mt-3 text-sm ${tier.featured ? "text-white/80" : ""}`}>{tier.description}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" role="list">
                {tier.features?.map((f) => <li key={f}>✓ {f}</li>)}
              </ul>
              <a href="#contact" className={`${tier.featured ? p.ui.btnPrimary : p.ui.btnSecondary} mt-8 text-center ${p.ui.focusRing}`}>{tier.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PricingComparisonTable(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tiers = p.tiers ?? DEFAULT_TIERS;
  const features = tiers[0]?.features ?? [];
  return (
    <SectionVariantShell sectionKind="pricing" variantId="comparison-table" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="py-4 text-start">Feature</th>
                {tiers.map((t) => <th key={t.name} className="py-4 text-center font-semibold">{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {features.map((f, fi) => (
                <tr key={f} className="border-b border-[var(--border-subtle)]">
                  <td className="py-3">{f}</td>
                  {tiers.map((t) => <td key={t.name} className="py-3 text-center">{t.features?.[fi] ? "✓" : "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PricingToggleAnnual(p: PricingContent) {
  const id = p.id ?? "pricing";
  const [annual, setAnnual] = useState(false);
  const tiers = p.tiers ?? DEFAULT_TIERS;
  return (
    <SectionVariantShell sectionKind="pricing" variantId="toggle-annual" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => setAnnual(false)} className={`${p.ui.btnSecondary} ${!annual ? "ring-2 ring-[var(--color-accent)]" : ""}`}>Monthly</button>
          <button type="button" onClick={() => setAnnual(true)} className={`${p.ui.btnSecondary} ${annual ? "ring-2 ring-[var(--color-accent)]" : ""}`}>Annual</button>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className={`${p.ui.card} p-8 text-center`}>
              <h3 className="font-semibold">{tier.name}</h3>
              <p className={`${p.ui.metric} mt-4`}>{annual ? tier.price.replace("$", "$").replace("/mo", "/yr") : tier.price}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PricingFeatureMatrix(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tiers = p.tiers ?? DEFAULT_TIERS;
  const allFeatures = [...new Set(tiers.flatMap((t) => t.features ?? []))];
  return (
    <SectionVariantShell sectionKind="pricing" variantId="feature-matrix" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-xs">
            <thead><tr><th className="p-3 text-start">Capability</th>{tiers.map((t) => <th key={t.name} className="p-3">{t.name}</th>)}</tr></thead>
            <tbody>
              {allFeatures.map((f) => (
                <tr key={f} className="border-t border-[var(--border-subtle)]">
                  <td className="p-3">{f}</td>
                  {tiers.map((t) => <td key={t.name} className="p-3 text-center">{t.features?.includes(f) ? "✓" : ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PricingMinimalSingle(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tier = (p.tiers ?? DEFAULT_TIERS)[1] ?? DEFAULT_TIERS[0]!;
  return (
    <SectionVariantShell sectionKind="pricing" variantId="minimal-single" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} mx-auto max-w-lg text-center`}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{tier.name}</h2>
        <p className={`${p.ui.metric} mt-6`}>{tier.price}<span className="text-lg">{tier.period}</span></p>
        <p className={`${p.ui.body} mx-auto mt-4`}>{tier.description}</p>
        <ul className="mt-8 space-y-2 text-sm" role="list">{tier.features?.map((f) => <li key={f}>{f}</li>)}</ul>
        <VariantCtaRow ui={p.ui} primary={tier.cta} className="mt-8 justify-center" />
      </div>
    </SectionVariantShell>
  );
}

function PricingEnterpriseCallout(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tiers = (p.tiers ?? DEFAULT_TIERS).slice(0, 2);
  const enterprise = (p.tiers ?? DEFAULT_TIERS)[2];
  return (
    <SectionVariantShell sectionKind="pricing" variantId="enterprise-callout" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <div key={tier.name} className={`${p.ui.card} p-8`}>
              <h3 className="font-semibold">{tier.name}</h3>
              <p className={`${p.ui.metric} mt-3`}>{tier.price}</p>
            </div>
          ))}
        </div>
        {enterprise ? (
          <div className={`${p.ui.card} df-card-featured mt-6 flex flex-col items-center justify-between gap-6 p-10 text-center md:flex-row md:text-start`}>
            <div>
              <h3 className={p.ui.headlineSm}>{enterprise.name}</h3>
              <p className={`${p.ui.body} mt-2 text-white/85`}>{enterprise.description}</p>
            </div>
            <a href="#contact" className={`${p.ui.btnPrimary} ${p.ui.focusRing}`}>{enterprise.cta}</a>
          </div>
        ) : null}
      </div>
    </SectionVariantShell>
  );
}

function PricingSliderTiers(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tiers = p.tiers ?? DEFAULT_TIERS;
  const featured = tiers.find((t) => t.featured) ?? tiers[1] ?? tiers[0]!;
  return (
    <SectionVariantShell sectionKind="pricing" variantId="slider-tiers" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-glow`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className={`${p.ui.card} df-card-featured mx-auto mt-10 max-w-md p-10 text-center`}>
          <p className={p.ui.eyebrow}>Most popular</p>
          <h3 className={`${p.ui.headlineSm} mt-2 text-white`}>{featured.name}</h3>
          <p className={`${p.ui.metric} mt-4 text-white`}>{featured.price}</p>
          <VariantCtaRow ui={p.ui} primary={featured.cta} className="mt-8 justify-center" />
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PricingHorizontalScroll(p: PricingContent) {
  const id = p.id ?? "pricing";
  const tiers = p.tiers ?? DEFAULT_TIERS;
  return (
    <SectionVariantShell sectionKind="pricing" variantId="horizontal-scroll" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="-mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-4 snap-x">
          {tiers.map((tier) => (
            <div key={tier.name} className={`${p.ui.card} min-w-[16rem] flex-shrink-0 snap-center p-6 sm:min-w-[18rem]`}>
              <h3 className="font-semibold">{tier.name}</h3>
              <p className={`${p.ui.metric} mt-3`}>{tier.price}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

const PRICING_RENDERERS: Record<PricingVariantId, (p: PricingContent) => React.JSX.Element> = {
  "tier-cards": PricingTierCards,
  "comparison-table": PricingComparisonTable,
  "toggle-annual": PricingToggleAnnual,
  "feature-matrix": PricingFeatureMatrix,
  "minimal-single": PricingMinimalSingle,
  "enterprise-callout": PricingEnterpriseCallout,
  "slider-tiers": PricingSliderTiers,
  "horizontal-scroll": PricingHorizontalScroll,
};

export function renderPricingVariant(variantId: PricingVariantId, props: PricingContent) {
  return PRICING_RENDERERS[variantId](props);
}
