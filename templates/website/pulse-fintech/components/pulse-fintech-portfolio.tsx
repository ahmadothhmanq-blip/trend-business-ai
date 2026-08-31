"use client";

const DEFAULT_ITEMS = [
  {
    company: "Vertex Systems",
    industry: "Technology",
    outcome: "42%",
    outcomeLabel: "faster cycles",
    detail: "Unified operations across six regions with measurable ROI in quarter one.",
  },
  {
    company: "Helix Group",
    industry: "Healthcare",
    outcome: "$3.1M",
    outcomeLabel: "value unlocked",
    detail: "Identified expansion opportunities weeks earlier with proactive insights.",
  },
  {
    company: "Axiom Logistics",
    industry: "Supply Chain",
    outcome: "99%",
    outcomeLabel: "accuracy",
    detail: "Replaced manual workflows with live intelligence dashboards.",
  },
];

type PulseFintechPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function PulseFintechPortfolio({
  eyebrow = "Case tape",
  title = "Production outcomes",
  subtitle = "Desk-readable results from live deployments.",
  items = DEFAULT_ITEMS,
}: PulseFintechPortfolioProps) {
  return (
    <section id="portfolio" data-v2-component="pulse-fintech-portfolio" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <p className="pu-eyebrow">{eyebrow}</p>
        <h2 className="pu-headline-sm mt-1">{title}</h2>
        <p className="pu-body mt-2 max-w-xl">{subtitle}</p>
        <div className="pu-panel mt-6 overflow-x-auto">
          <div className="pu-panel-head">
            <span>LEDGER · SELECTED</span>
            <span>{items.length} ROWS</span>
          </div>
          <table className="pu-table">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">Sector</th>
                <th scope="col">Delta</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.company}>
                  <td className="font-semibold text-[var(--color-foreground)]">{item.company}</td>
                  <td>{item.industry}</td>
                  <td className="pu-ticker-up">
                    {item.outcome}
                    {item.outcomeLabel ? ` ${item.outcomeLabel}` : ""}
                  </td>
                  <td className="max-w-md text-[var(--color-muted)]">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
