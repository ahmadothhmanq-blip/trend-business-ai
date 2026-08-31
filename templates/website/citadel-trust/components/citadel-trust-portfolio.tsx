"use client";

const DEFAULT_ITEMS = [
  {
    company: "State v. Global Energy Consortium",
    industry: "Regulatory & litigation",
    outcome: "Favorable settlement",
    outcomeLabel: "Matter closed",
    detail: "Multi-jurisdiction defense of antitrust claims across EU and US regulators.",
  },
  {
    company: "Sovereign Infrastructure Fund",
    industry: "Corporate & M&A",
    outcome: "$24B acquisition",
    outcomeLabel: "Cleared",
    detail: "Advised on cross-border acquisition with regulatory clearance in 12 markets.",
  },
  {
    company: "Financial Services Reform",
    industry: "Public affairs",
    outcome: "Legislative counsel",
    outcomeLabel: "Adopted",
    detail: "Shaped regulatory framework adopted by three G7 nations.",
  },
  {
    company: "Healthcare Consortium",
    industry: "Investigations",
    outcome: "Matter closed",
    outcomeLabel: "No action",
    detail: "Internal investigation and regulatory response — no enforcement action.",
  },
];

type CitadelTrustPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function CitadelTrustPortfolio({
  eyebrow = "Matter docket",
  title = "Representative engagements",
  subtitle = "Selected matters presented as sealed records — many confidential engagements not listed.",
  items = DEFAULT_ITEMS,
}: CitadelTrustPortfolioProps) {
  return (
    <section
      id="portfolio"
      data-v2-component="citadel-trust-portfolio"
      aria-labelledby="ct-portfolio-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="mb-8">
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-portfolio-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
        </header>

        <div className="ct-reveal-stagger space-y-4">
          {items.map((item, index) => (
            <article key={item.company} className="ct-doc">
              <p className="ct-doc-ribbon">
                <span className="ct-doc-seal-mark" aria-hidden />
                Matter {String(index + 1).padStart(2, "0")} · {item.industry}
              </p>
              <h3 className="ct-article-title">{item.company}</h3>
              <p className="ct-body mt-3 text-base">{item.detail}</p>
              <p className="ct-font-mono mt-4 text-sm text-[var(--color-accent)]">
                {item.outcome}
                {item.outcomeLabel ? ` · ${item.outcomeLabel}` : ""}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
