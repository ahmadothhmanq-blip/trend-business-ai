"use client";

const DEFAULT_OUTCOMES = [
  {
    company: "Vertex Systems",
    industry: "FinTech",
    outcome: "42%",
    outcomeLabel: "faster deal cycles",
    detail: "Unified pipeline data across 6 regions and reduced forecast variance by 28%.",
  },
  {
    company: "Helix Health",
    industry: "Healthcare SaaS",
    outcome: "$3.1M",
    outcomeLabel: "expansion ARR",
    detail: "Identified expansion signals 3 weeks earlier with account health scoring.",
  },
  {
    company: "Axiom Logistics",
    industry: "Supply Chain",
    outcome: "99.2%",
    outcomeLabel: "forecast accuracy",
    detail: "Replaced manual spreadsheets with live revenue intelligence dashboards.",
  },
];

type SaasEnterprisePortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{
    company: string;
    industry: string;
    outcome: string;
    outcomeLabel?: string;
    detail: string;
  }>;
};

export function SaasEnterprisePortfolio({
  eyebrow = "Customer outcomes",
  title = "Revenue leaders trust Northline",
  subtitle = "Enterprise GTM teams accelerate pipeline velocity and unlock expansion revenue with measurable ROI.",
  items = DEFAULT_OUTCOMES,
}: SaasEnterprisePortfolioProps) {
  return (
    <section
      id="customers"
      data-v2-component="saas-enterprise-portfolio"
      aria-labelledby="se-portfolio-title"
      className="se-section bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="se-eyebrow mb-3">{eyebrow}</p>
          <h2 id="se-portfolio-title" className="se-headline-sm">
            {title}
          </h2>
          <p className="se-body text-muted-foreground mt-4">{subtitle}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.company}
              className="se-card group relative overflow-hidden p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <p className="se-font-mono text-[0.625rem] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                {item.industry}
              </p>
              <h3 className="se-font-display mt-2 text-lg font-bold text-[var(--color-foreground)]">
                {item.company}
              </h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="se-metric text-3xl">{item.outcome}</span>
                {item.outcomeLabel ? (
                  <span className="se-font-body text-sm text-[var(--color-muted)]">
                    {item.outcomeLabel}
                  </span>
                ) : null}
              </div>
              <p className="se-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.detail}
              </p>
              <p className="se-font-mono mt-6 text-[0.625rem] text-[var(--color-accent)]">
                Case study 0{index + 1}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
