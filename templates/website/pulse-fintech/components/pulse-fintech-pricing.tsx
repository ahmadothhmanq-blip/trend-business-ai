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

type PulseFintechPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function PulseFintechPricing({
  eyebrow = "Plans",
  title = "Contract matrix",
  subtitle = "Transparent rates. Desk SLAs attached.",
  tiers = DEFAULT_TIERS,
}: PulseFintechPricingProps) {
  return (
    <section id="pricing" data-v2-component="pulse-fintech-pricing" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <p className="pu-eyebrow">{eyebrow}</p>
        <h2 className="pu-headline-sm mt-1">{title}</h2>
        <p className="pu-body mt-2 max-w-xl">{subtitle}</p>
        <div className="pu-panel mt-6 overflow-x-auto">
          <div className="pu-panel-head">
            <span>PRICING // MATRIX</span>
            <span>{tiers.length} TIERS</span>
          </div>
          <table className="pu-table">
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Rate</th>
                <th scope="col">Includes</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.name} className={tier.highlighted ? "bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]" : undefined}>
                  <td>
                    <p className="font-semibold text-[var(--color-foreground)]">{tier.name}</p>
                    <p className="mt-1 text-[var(--color-muted)]">{tier.description}</p>
                  </td>
                  <td className="pu-metric whitespace-nowrap">
                    {tier.price}
                    {tier.period}
                  </td>
                  <td>
                    <ul className="space-y-1 text-[var(--color-muted)]">
                      {tier.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <a href="#contact" className={tier.highlighted ? "pu-btn-primary pu-focus-ring" : "pu-btn-secondary pu-focus-ring"}>
                      {tier.cta}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
