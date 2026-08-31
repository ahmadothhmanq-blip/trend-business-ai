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
    name: "Build",
    price: "$299",
    period: "/mo",
    description: "For teams routing their first production models.",
    features: ["5M inference calls", "Core routing policies", "7-day log retention", "Email support"],
    cta: "Start trial",
    highlighted: false,
  },
  {
    name: "Scale",
    price: "$899",
    period: "/mo",
    description: "Full control plane for growing AI products.",
    features: ["50M inference calls", "Observability mesh", "Multi-region failover", "SSO + RBAC", "Dedicated CSM"],
    cta: "Book a demo",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Global fleets with custom SLAs and compliance.",
    features: ["Unlimited regions", "VPC / private link", "HIPAA BAA", "24/7 support", "Custom integrations"],
    cta: "Contact sales",
    highlighted: false,
  },
];

type AiStartupSignalPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function AiStartupSignalPricing({
  eyebrow = "Pricing",
  title = "Plans that scale with your models",
  subtitle = "Transparent usage-based pricing. No hidden inference fees.",
  tiers = DEFAULT_TIERS,
}: AiStartupSignalPricingProps) {
  return (
    <section id="pricing" data-v2-component="ai-startup-signal-pricing" aria-labelledby="as-pricing-title" className="df-reveal as-section as-section-glow bg-[var(--color-background)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="as-eyebrow mb-3">{eyebrow}</p>
          <h2 id="as-pricing-title" className="as-headline-sm">{title}</h2>
          <p className="as-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="df-reveal-stagger grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`as-glass-card flex flex-col rounded-xl border p-7 transition-all ${
                tier.highlighted
                  ? "as-accent-selected border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] lg:-translate-y-1"
                  : "border-[var(--border-default)] hover:border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
              }`}
            >
              <h3 className="text-lg font-bold">{tier.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              <p className="mt-6">
                <span className="as-metric">{tier.price}</span>
                <span className="text-sm text-[var(--color-muted)]">{tier.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--color-muted)]">
                {tier.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <a href="#contact" className={`${tier.highlighted ? "as-btn-primary" : "as-btn-secondary"} as-focus-ring mt-8 w-full text-center`}>
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
