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
    "name": "Growth",
    "price": "$499",
    "period": "/mo",
    "description": "For teams building their foundation.",
    "features": [
      "Core platform",
      "Standard support",
      "Team dashboards"
    ],
    "cta": "Start trial",
    "highlighted": false
  },
  {
    "name": "Enterprise",
    "price": "$899",
    "period": "/mo",
    "description": "Full platform for scaling organizations.",
    "features": [
      "Everything in Growth",
      "Advanced analytics",
      "Dedicated CSM",
      "SSO"
    ],
    "cta": "Book a demo",
    "highlighted": true
  },
  {
    "name": "Global",
    "price": "Custom",
    "period": "",
    "description": "Multi-region with enterprise SLAs.",
    "features": [
      "Everything in Enterprise",
      "Custom integrations",
      "24/7 support"
    ],
    "cta": "Contact sales",
    "highlighted": false
  }
];

type CreativePortfolioPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function CreativePortfolioPricing({
  eyebrow = "Pricing",
  title = "Plans that scale with you",
  subtitle = "Transparent pricing. No surprises.",
  tiers = DEFAULT_TIERS,
}: CreativePortfolioPricingProps) {
  return (
    <section id="pricing" data-v2-component="creative-portfolio-pricing" className="df-reveal border-y border-[var(--border-default)] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="cp-display text-5xl">{title}</h2>
        <p className="mt-6 text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-12 space-y-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-6">
              <div>
                <p className="text-sm uppercase tracking-widest">{tier.name}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              </div>
              <p className="cp-font-display text-3xl font-bold">{tier.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
