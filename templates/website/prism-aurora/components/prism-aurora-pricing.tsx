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
    description: "For teams building their foundation.",
    features: ["Core platform", "Standard support", "Team dashboards"],
    cta: "Start trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$899",
    period: "/mo",
    description: "Full platform for scaling organizations.",
    features: ["Everything in Growth", "Advanced analytics", "Dedicated CSM", "SSO"],
    cta: "Book a demo",
    highlighted: true,
  },
  {
    name: "Global",
    price: "Custom",
    period: "",
    description: "Multi-region with enterprise SLAs.",
    features: ["Everything in Enterprise", "Custom integrations", "24/7 support"],
    cta: "Contact sales",
    highlighted: false,
  },
];

type PrismAuroraPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function PrismAuroraPricing({
  eyebrow = "Pricing",
  title = "Plans that scale with you",
  subtitle = "Transparent pricing. No surprises.",
  tiers = DEFAULT_TIERS,
}: PrismAuroraPricingProps) {
  return (
    <section id="pricing" data-v2-component="prism-aurora-pricing" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="mx-auto max-w-[88rem]">
        <div className="mb-6 max-w-xl">
          <p className="pr-eyebrow">{eyebrow}</p>
          <h2 className="pr-headline-sm mt-2">{title}</h2>
          <p className="pr-body mt-2">{subtitle}</p>
        </div>
        <div className="pr-mosaic pr-reveal-stagger">
          {tiers.map((tier, i) => (
            <article
              key={tier.name}
              className={`pr-tile flex flex-col ${
                tier.highlighted
                  ? "pr-tile-cta pr-span-6 pr-row-2"
                  : i === 0
                    ? "pr-span-6 pr-tile-field-a"
                    : "pr-span-12 pr-tile-field-b"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className={`pr-font-display text-xl font-bold ${tier.highlighted ? "text-white" : ""}`}>{tier.name}</h3>
                <p className={`pr-font-display text-3xl font-extrabold tracking-[-0.03em] ${tier.highlighted ? "text-white" : ""}`}>
                  {tier.price}
                  {tier.period ? <span className="text-sm font-medium opacity-70">{tier.period}</span> : null}
                </p>
              </div>
              <p className={`pr-body mt-3 ${tier.highlighted ? "!text-white/75" : ""}`}>{tier.description}</p>
              <ul className={`mt-6 space-y-2 text-sm ${tier.highlighted ? "text-white/85" : "text-[var(--color-muted)]"}`}>
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`pr-focus-ring mt-auto pt-8 inline-flex ${
                  tier.highlighted
                    ? "pr-btn-primary !bg-white !text-[var(--color-primary)] !shadow-none"
                    : "pr-btn-secondary"
                }`}
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
