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
    name: "Growth",
    price: "$499",
    period: "/mo",
    description: "Core control plane for single-site operations.",
    features: ["Core platform", "Standard support", "Team dashboards"],
    cta: "Request WP-01",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$899",
    period: "/mo",
    description: "Multi-site orchestration with dedicated engineering.",
    features: ["Everything in Growth", "Advanced analytics", "Dedicated CSM", "SSO"],
    cta: "Request WP-02",
    highlighted: true,
  },
  {
    name: "Global",
    price: "Custom",
    period: "",
    description: "Multi-region with enterprise SLAs and field kits.",
    features: ["Everything in Enterprise", "Custom integrations", "24/7 support"],
    cta: "Request WP-03",
    highlighted: false,
  },
];

type ForgeIndustrialPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
  figureLabel?: string;
};

export function ForgeIndustrialPricing({
  eyebrow = "Work packages",
  title = "Scoped engineering packages",
  subtitle = "Priced as work packages with deliverables — not soft SaaS cards.",
  tiers = DEFAULT_TIERS,
  figureLabel = "FIG. 10 — WORK PACKAGES",
}: ForgeIndustrialPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="forge-industrial-pricing"
      aria-labelledby="fg-pricing-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-pricing-title" className="fg-headline-sm mt-2">
            {title}
          </h2>
          <p className="fg-body mt-4 max-w-2xl">{subtitle}</p>

          <div className="fg-reveal-stagger mt-8" role="list">
            {tiers.map((tier, index) => (
              <article
                key={tier.name}
                className="fg-work-package"
                role="listitem"
                data-highlighted={tier.highlighted ? "true" : undefined}
              >
                <p className="fg-work-package-id">WP-{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3 className="fg-font-display text-xl font-semibold uppercase tracking-wide">{tier.name}</h3>
                  <p className="fg-body mt-2 text-sm">{tier.description}</p>
                  <ul className="mt-3 space-y-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="fg-font-mono text-[0.75rem] text-[var(--color-muted)]">
                        — {feature}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className="fg-btn-secondary fg-focus-ring mt-4 inline-flex">
                    {tier.cta}
                  </a>
                </div>
                <p className="fg-work-package-price">
                  {tier.price}
                  {tier.period ? <span className="text-sm font-normal text-[var(--color-muted)]">{tier.period}</span> : null}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
