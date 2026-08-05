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
    period: "/seat/mo",
    description: "For scaling GTM teams building their revenue foundation.",
    features: ["Pipeline intelligence", "CRM sync", "Standard dashboards", "Email support"],
    cta: "Start trial",
  },
  {
    name: "Enterprise",
    price: "$899",
    period: "/seat/mo",
    description: "Full platform for revenue leaders with advanced forecasting.",
    features: [
      "Everything in Growth",
      "AI forecast models",
      "Custom dashboards",
      "Dedicated CSM",
      "SSO & SCIM",
    ],
    cta: "Book a demo",
    highlighted: true,
  },
  {
    name: "Global",
    price: "Custom",
    period: "",
    description: "Multi-region deployments with enterprise security and SLAs.",
    features: [
      "Everything in Enterprise",
      "Multi-region hosting",
      "Custom integrations",
      "24/7 priority support",
      "Executive business reviews",
    ],
    cta: "Contact sales",
  },
];

type SaasEnterprisePricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function SaasEnterprisePricing({
  eyebrow = "Pricing",
  title = "Plans that scale with your GTM",
  subtitle = "Transparent per-seat pricing. Annual commitments receive up to 20% discount.",
  tiers = DEFAULT_TIERS,
}: SaasEnterprisePricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="saas-enterprise-pricing"
      aria-labelledby="se-pricing-title"
      className="se-section se-section-glow relative bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 text-center">
          <p className="se-eyebrow mb-3">{eyebrow}</p>
          <h2 id="se-pricing-title" className="se-headline-sm">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" aria-hidden />
          <p className="se-body text-muted-foreground mx-auto mt-5 max-w-lg">{subtitle}</p>
        </header>

        <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={[
                "se-card flex flex-col p-7 sm:p-8 transition-transform duration-500",
                tier.highlighted
                  ? "se-card-featured relative lg:-translate-y-2 lg:shadow-[var(--shadow-surface)] ring-1 ring-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_65%)]"
                  : "motion-safe:hover:-translate-y-1",
              ].join(" ")}
            >
              {tier.highlighted ? (
                <span className="se-eyebrow absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-4 py-1 text-[0.625rem] text-white shadow-[var(--shadow-card)]">
                  Most popular
                </span>
              ) : null}
              <h3 className="se-font-display text-lg font-bold text-[var(--color-foreground)]">{tier.name}</h3>
              <p className="se-font-body mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              <p className="mt-8 border-b border-[var(--border-subtle)] pb-6">
                <span className="se-metric text-4xl">{tier.price}</span>
                {tier.period ? (
                  <span className="se-font-body text-sm text-[var(--color-muted)]">{tier.period}</span>
                ) : null}
              </p>
              <ul className="mt-6 flex-1 space-y-3.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3 se-font-body text-sm text-[var(--color-foreground)]">
                    <span
                      className="se-signal mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_12%,transparent)] text-xs font-bold"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`${tier.highlighted ? "se-btn-primary" : "se-btn-secondary"} se-focus-ring mt-8 w-full`}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
