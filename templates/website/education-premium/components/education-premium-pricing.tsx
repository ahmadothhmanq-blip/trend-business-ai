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
    name: "Foundation",
    price: "Undergraduate",
    period: "",
    description: "Liberal arts core with seminar depth and research apprenticeships.",
    features: ["Core curriculum", "Advising studio", "Campus residencies"],
    cta: "Request catalog",
    highlighted: false,
  },
  {
    name: "Advanced study",
    price: "Graduate",
    period: "",
    description: "Professional and research degrees with faculty mentorship.",
    features: ["Thesis pathway", "Lab access", "Teaching fellowships", "Career atelier"],
    cta: "Apply for term",
    highlighted: true,
  },
  {
    name: "Executive scholars",
    price: "Custom",
    period: "",
    description: "Cohort programs for leaders returning to campus mid-career.",
    features: ["Modular residencies", "Peer councils", "Dedicated faculty"],
    cta: "Speak with admissions",
    highlighted: false,
  },
];

type EducationPremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function EducationPremiumPricing({
  eyebrow = "Catalog",
  title = "Programs of study",
  subtitle = "Pathways listed as a prospectus — not a product grid.",
  tiers = DEFAULT_TIERS,
}: EducationPremiumPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="education-premium-pricing"
      aria-labelledby="ed-pricing-title"
      className="ed-programs ed-paper ed-reveal"
    >
      <div className="ed-programs-inner">
        <header className="ed-section-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-pricing-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </header>

        <ol className="ed-programs-list ed-reveal-stagger">
          {tiers.map((tier, i) => (
            <li key={tier.name} className={`ed-program-row${tier.highlighted ? " is-featured" : ""}`}>
              <span className="ed-program-index ed-font-mono">{String(i + 1).padStart(2, "0")}</span>
              <div className="ed-program-main">
                <div className="ed-program-head">
                  <h3 className="ed-program-name ed-font-display">{tier.name}</h3>
                  <p className="ed-program-price">
                    {tier.price}
                    {tier.period}
                  </p>
                </div>
                <p className="ed-program-desc">{tier.description}</p>
                <ul className="ed-program-features">
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <a href="#contact" className="ed-btn-secondary ed-focus-ring ed-program-cta">
                {tier.cta}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
