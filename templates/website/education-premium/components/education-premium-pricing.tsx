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
    name: "Undergraduate",
    price: "$58,400",
    period: "/year",
    description: "Full-time enrollment in bachelor's degree programs with comprehensive campus resources.",
    features: [
      "All core curriculum courses",
      "Campus housing options",
      "Research opportunities",
      "Career services access",
    ],
    cta: "Apply undergraduate",
  },
  {
    name: "Graduate",
    price: "$62,800",
    period: "/year",
    description: "Advanced study in master's and doctoral programs with faculty mentorship and research funding.",
    features: [
      "Graduate seminar access",
      "Research assistantships",
      "Dissertation support",
      "Professional development",
      "Conference travel grants",
    ],
    cta: "Apply graduate",
    highlighted: true,
  },
  {
    name: "Financial aid",
    price: "100%",
    period: " need met",
    description: "Need-blind admissions with generous financial aid packages for qualifying students.",
    features: [
      "Merit scholarships",
      "Need-based grants",
      "Work-study programs",
      "Loan-free packages",
      "International student aid",
    ],
    cta: "Calculate aid",
  },
];

type EducationPremiumPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function EducationPremiumPricing({
  eyebrow = "Tuition & aid",
  title = "Invest in a transformative education",
  subtitle = "Transparent tuition with one of the nation's most generous financial aid programs. 100% of demonstrated need is met for admitted students.",
  tiers = DEFAULT_TIERS,
}: EducationPremiumPricingProps) {
  return (
    <section
      id="pricing"
      data-v2-component="education-premium-pricing"
      aria-labelledby="ed-pricing-title"
      className="ed-section ed-section-glow relative bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 text-center">
          <p className="ed-eyebrow mb-3">{eyebrow}</p>
          <h2 id="ed-pricing-title" className="ed-headline-sm">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-[var(--color-signal)] to-transparent" aria-hidden />
          <p className="ed-body mx-auto mt-5 max-w-lg">{subtitle}</p>
        </header>

        <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={[
                "ed-card flex flex-col p-7 sm:p-8",
                tier.highlighted ? "ed-card-featured relative lg:-translate-y-2 lg:shadow-[var(--shadow-surface)]" : "",
              ].join(" ")}
            >
              {tier.highlighted ? (
                <span className="ed-eyebrow absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-4 py-1 text-[0.625rem] text-white shadow-[var(--shadow-card)]">
                  Most popular
                </span>
              ) : null}
              <h3 className="ed-font-display text-lg font-semibold text-[var(--color-foreground)]">{tier.name}</h3>
              <p className="ed-font-body mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              <p className="mt-8 border-b border-[var(--border-subtle)] pb-6">
                <span className="ed-metric text-4xl">{tier.price}</span>
                {tier.period ? (
                  <span className="ed-font-body text-sm text-[var(--color-muted)]">{tier.period}</span>
                ) : null}
              </p>
              <ul className="mt-6 flex-1 space-y-3.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3 ed-font-body text-sm text-[var(--color-foreground)]">
                    <span
                      className="ed-signal mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_12%,transparent)] text-xs font-bold"
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
                className={`${tier.highlighted ? "ed-btn-primary" : "ed-btn-secondary"} ed-focus-ring mt-8 w-full`}
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
