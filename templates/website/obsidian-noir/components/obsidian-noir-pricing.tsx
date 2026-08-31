"use client";

type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const DEFAULT_TIERS: PricingTier[] = [
  {
    name: "Private",
    price: "On request",
    period: "",
    description: "Commissioned access for collectors and houses.",
    features: ["Private viewing", "Atelier finishing", "Concierge service"],
    cta: "Inquire",
    highlighted: true,
  },
  {
    name: "Archive",
    price: "Seasonal",
    period: "",
    description: "Limited releases with documented provenance.",
    features: ["Edition ledger", "Care guidance", "Priority notice"],
    cta: "Join list",
    highlighted: false,
  },
];

type ObsidianNoirPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function ObsidianNoirPricing({
  eyebrow = "Access",
  title = "No catalogue of tiers. Only pathways.",
  subtitle = "Pricing is conversational — never theatrical.",
  tiers = DEFAULT_TIERS,
}: ObsidianNoirPricingProps) {
  return (
    <section id="pricing" data-v2-component="obsidian-noir-pricing" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-4 max-w-[16ch]">{title}</h2>
        <p className="ob-body mt-4 max-w-xl">{subtitle}</p>
        <hr className="ob-rule mt-12" />
        <div className="ob-reveal-stagger">
          {tiers.map((tier) => (
            <article key={tier.name} className="grid gap-6 border-b border-[var(--border-default)] py-12 md:grid-cols-[1fr_12rem]">
              <div>
                <h3 className="ob-thesis-title">{tier.name}</h3>
                <p className="ob-body mt-3 max-w-xl">{tier.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-[var(--color-muted)]">
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="md:text-end">
                <p className="ob-metric text-2xl sm:text-3xl">{tier.price}</p>
                <a href="#contact" className="ob-btn-secondary ob-focus-ring mt-6 inline-flex">
                  {tier.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
