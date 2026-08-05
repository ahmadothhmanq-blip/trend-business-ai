"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_OUTCOMES = [
  {
    company: "Rhodes Scholarship",
    industry: "Graduate Fellowships",
    outcome: "12",
    outcomeLabel: "Rhodes Scholars since 2010",
    detail: "Our graduates consistently earn the world's most prestigious academic fellowships and research grants.",
  },
  {
    company: "Fortune 500",
    industry: "Career Placement",
    outcome: "94%",
    outcomeLabel: "employed within 6 months",
    detail: "Graduates join leading firms in consulting, finance, technology, and public service across the globe.",
  },
  {
    company: "Research Impact",
    industry: "Publications",
    outcome: "2,400+",
    outcomeLabel: "faculty publications annually",
    detail: "Undergraduate researchers co-author peer-reviewed papers in journals spanning every academic discipline.",
  },
];

type EducationPremiumPortfolioProps = {
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

export function EducationPremiumPortfolio({
  eyebrow = "Student outcomes",
  title = "Where our graduates lead",
  subtitle = "From Rhodes Scholars to industry innovators, Scholar's Hall alumni shape the world through scholarship, leadership, and service.",
  items = DEFAULT_OUTCOMES,
}: EducationPremiumPortfolioProps) {
  return (
    <section
      id="customers"
      data-v2-component="education-premium-portfolio"
      aria-labelledby="ed-portfolio-title"
      className="ed-section bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="ed-eyebrow mb-3">{eyebrow}</p>
          <h2 id="ed-portfolio-title" className="ed-headline-sm">
            {title}
          </h2>
          <div className="ed-accent-line mt-4" aria-hidden />
          <p className="ed-body mt-4">{subtitle}</p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.company}
              className="ed-card group relative overflow-hidden"
            >
              <div
                className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-signal)] opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative aspect-[16/10] overflow-hidden">
                <SlotImage
                  slot="features"
                  index={index}
                  alt={`${item.company} student success`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />
              </div>
              <div className="p-6 sm:p-7">
                <p className="ed-font-mono text-[0.625rem] font-medium uppercase tracking-wider text-[var(--color-muted)]">
                  {item.industry}
                </p>
                <h3 className="ed-font-display mt-2 text-lg font-semibold text-[var(--color-foreground)]">
                  {item.company}
                </h3>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="ed-metric text-3xl">{item.outcome}</span>
                  {item.outcomeLabel ? (
                    <span className="ed-font-body text-sm text-[var(--color-muted)]">
                      {item.outcomeLabel}
                    </span>
                  ) : null}
                </div>
                <p className="ed-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.detail}
                </p>
                <p className="ed-font-mono mt-6 text-[0.625rem] text-[var(--color-signal)]">
                  Outcome 0{index + 1}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
