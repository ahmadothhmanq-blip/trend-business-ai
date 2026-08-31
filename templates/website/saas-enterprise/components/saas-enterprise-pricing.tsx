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
    name: "Team",
    price: "$499",
    period: "/mo",
    description: "Core workspace for growing GTM orgs.",
    features: ["Pipeline + forecast", "Standard SSO", "Email support"],
    cta: "Start Team",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$1,200",
    period: "/mo",
    description: "Full shell with governance and playbooks.",
    features: ["Everything in Team", "SCIM", "Playbook runner", "CSM"],
    cta: "Start Enterprise",
    highlighted: true,
  },
  {
    name: "Global",
    price: "Custom",
    period: "",
    description: "Multi-region tenancy and dedicated controls.",
    features: ["Everything in Enterprise", "Custom SLAs", "Private network"],
    cta: "Talk to sales",
    highlighted: false,
  },
];

type SaasEnterprisePricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function SaasEnterprisePricing({
  eyebrow = "Plans",
  title = "Workspace plans",
  subtitle = "Licensed like product seats — compared as a matrix.",
  tiers = DEFAULT_TIERS,
}: SaasEnterprisePricingProps) {
  const allFeatures = [...new Set(tiers.flatMap((t) => t.features))];
  return (
    <section
      id="pricing"
      data-v2-component="saas-enterprise-pricing"
      aria-labelledby="se-pricing-title"
      className="se-plans se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-pricing-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>

        <div className="se-plans-matrix-wrap">
          <table className="se-plans-matrix">
            <thead>
              <tr>
                <th scope="col">Capability</th>
                {tiers.map((t) => (
                  <th key={t.name} scope="col" className={t.highlighted ? "is-featured" : undefined}>
                    <span className="se-plan-name">{t.name}</span>
                    <span className="se-plan-price">
                      {t.price}
                      {t.period}
                    </span>
                    <a href="#contact" className="se-btn-primary se-focus-ring">
                      {t.cta}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Summary</th>
                {tiers.map((t) => (
                  <td key={t.name}>{t.description}</td>
                ))}
              </tr>
              {allFeatures.map((f) => (
                <tr key={f}>
                  <th scope="row">{f}</th>
                  {tiers.map((t) => (
                    <td key={t.name}>{t.features.includes(f) ? "Included" : "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
