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
    name: "Advisory",
    price: "From $18k",
    period: "/month",
    description: "Focused strategic counsel for leadership teams navigating priority initiatives.",
    features: [
      "Executive workshops",
      "Market & competitive analysis",
      "Quarterly board briefings",
      "Dedicated partner access",
    ],
    cta: "Request proposal",
  },
  {
    name: "Transformation",
    price: "From $45k",
    period: "/month",
    description: "Full-program leadership for enterprise change with measurable operational outcomes.",
    features: [
      "Everything in Advisory",
      "Program management office",
      "Change & communications",
      "KPI dashboards & reporting",
      "On-site leadership support",
    ],
    cta: "Schedule consultation",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Multi-region engagements with retained senior partners and bespoke governance models.",
    features: [
      "Everything in Transformation",
      "Global delivery teams",
      "Board & investor relations",
      "24/7 executive escalation",
      "Multi-year partnership terms",
    ],
    cta: "Contact partners",
  },
];

type CorporateBusinessPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function CorporateBusinessPricing({
  eyebrow = "Engagements",
  title = "Partnership models that scale with ambition",
  subtitle = "Transparent engagement structures. Retained partnerships receive preferred rates and dedicated partner coverage.",
  tiers = DEFAULT_TIERS,
}: CorporateBusinessPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="corporate-business-pricing"
      aria-labelledby="cb-pricing-title"
      className="cb-section cb-section-alt relative"
    >
      <div className="cb-container">
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <p className="cb-eyebrow mb-6">{eyebrow}</p>
          <h2 id="cb-pricing-title" className="cb-headline-sm">
            {title}
          </h2>
          <p className="cb-prose mx-auto mt-6">{subtitle}</p>
        </header>

        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={[
                "relative flex flex-col p-9 sm:p-10",
                tier.highlighted ? "cb-card-featured lg:-translate-y-2" : "cb-card",
              ].join(" ")}
            >
              {tier.highlighted ? (
                <span className="cb-font-mono absolute -top-3 start-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-[var(--color-ink)] px-4 py-1.5 text-[0.5625rem] uppercase tracking-[0.14em] text-[var(--color-signal)]">
                  Most popular
                </span>
              ) : null}
              <h3
                className={[
                  "cb-font-display text-xl font-medium",
                  tier.highlighted ? "text-white" : "text-[var(--color-foreground)]",
                ].join(" ")}
              >
                {tier.name}
              </h3>
              <p
                className={[
                  "cb-font-body mt-3 text-sm leading-relaxed",
                  tier.highlighted ? "text-white/60" : "text-[var(--color-muted)]",
                ].join(" ")}
              >
                {tier.description}
              </p>
              <p className="mt-10 border-b border-[var(--border-subtle)] pb-8">
                <span
                  className={[
                    "cb-metric text-4xl",
                    tier.highlighted ? "text-white" : "",
                  ].join(" ")}
                >
                  {tier.price}
                </span>
                {tier.period ? (
                  <span
                    className={[
                      "cb-font-body text-sm",
                      tier.highlighted ? "text-white/50" : "text-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    {tier.period}
                  </span>
                ) : null}
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className={[
                      "flex gap-3 cb-font-body text-sm",
                      tier.highlighted ? "text-white/85" : "text-[var(--color-foreground)]",
                    ].join(" ")}
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)] text-xs text-[var(--color-signal)]"
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
                className={`${tier.highlighted ? "cb-btn-primary" : "cb-btn-secondary"} cb-focus-ring mt-10 w-full`}
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
