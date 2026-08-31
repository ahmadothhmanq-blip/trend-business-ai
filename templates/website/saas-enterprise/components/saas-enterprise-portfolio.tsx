"use client";

const DEFAULT_ITEMS = [
  {
    company: "Global retail roll-out",
    industry: "Implementation",
    outcome: "11 wks",
    outcomeLabel: "time-to-prod",
    detail: "Multi-region workspace with SCIM and custom forecast models.",
  },
  {
    company: "Fintech consolidation",
    industry: "Migration",
    outcome: "3 tools",
    outcomeLabel: "retired",
    detail: "Unified pipeline and board reporting onto a single shell.",
  },
  {
    company: "Manufacturing GTM",
    industry: "Expansion",
    outcome: "+22%",
    outcomeLabel: "net retention",
    detail: "Playbooks tied to account health signals across dealers.",
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
  eyebrow = "Case files",
  title = "Deployments",
  subtitle = "Compressed case notes — like tickets closed, not gallery cards.",
  items = DEFAULT_ITEMS,
}: SaasEnterprisePortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="saas-enterprise-portfolio"
      aria-labelledby="se-portfolio-title"
      className="se-cases se-reveal"
    >
      <div className="se-docs-inner">
        <header className="se-docs-head">
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-portfolio-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </header>
        <div className="se-cases-table-wrap">
          <table className="se-cases-table se-reveal-stagger">
            <thead>
              <tr>
                <th scope="col">Engagement</th>
                <th scope="col">Type</th>
                <th scope="col">Outcome</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.company}>
                  <td>{item.company}</td>
                  <td>{item.industry}</td>
                  <td>
                    <strong>{item.outcome}</strong>
                    {item.outcomeLabel ? <span> {item.outcomeLabel}</span> : null}
                  </td>
                  <td>{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
