import { DEFAULT_PORTFOLIO_ITEMS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const PORTFOLIO_GENERATORS = {
  "outcome-cards": outcomeCards,
  "case-study-rows": caseStudyRows,
  "logo-wall": logoWall,
  "masonry-portfolio": masonryPortfolio,
  "fullscreen-case": fullscreenCase,
  "clinical-outcomes": clinicalOutcomes,
  "gallery-grid": galleryGrid,
  "menu-showcase": menuShowcase,
  "alumni-success": alumniSuccess,
  "product-lookbook": productLookbook,
  "saas-customers": saasCustomers,
  "work-grid-large": workGridLarge,
  "property-showcase": propertyShowcase,
  "nature-gallery": natureGallery,
  "aurora-showcase": auroraShowcase,
  "minimal-list-portfolio": minimalListPortfolio,
  "terminal-cases": terminalCases,
  "blueprint-projects": blueprintProjects,
  "client-roster": clientRoster,
  "wellness-journey": wellnessJourney,
};

export function generatePortfolio(entry, layoutKey) {
  const fn = PORTFOLIO_GENERATORS[layoutKey] ?? outcomeCards;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function portfolioHeader({ p, pkg, Pascal }) {
  return `"use client";

const DEFAULT_ITEMS = ${JSON.stringify(DEFAULT_PORTFOLIO_ITEMS, null, 2)};

type ${Pascal}PortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ company: string; industry: string; outcome: string; outcomeLabel?: string; detail: string }>;
};

export function ${Pascal}Portfolio({
  eyebrow = "Selected work",
  title = "Outcomes that speak for themselves",
  subtitle = "Real results from organizations that chose to lead.",
  items = DEFAULT_ITEMS,
}: ${Pascal}PortfolioProps) {`;
}

function outcomeCards({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" aria-labelledby="${p}-portfolio-title" className="${p}-section bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-9 max-w-2xl">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-portfolio-title" className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mt-4 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <article key={item.company} className="${p}-card p-6">
              <p className="text-xs uppercase text-[var(--color-muted)]">{item.industry}</p>
              <h3 className="mt-2 text-lg font-bold">{item.company}</h3>
              <p className="${p}-metric mt-4">{item.outcome} <span className="text-sm font-normal text-[var(--color-muted)]">{item.outcomeLabel}</span></p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{item.detail}</p>
              <p className="mt-4 text-xs text-[var(--color-accent)]">Case 0{i + 1}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function caseStudyRows({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ul className="mt-10 divide-y divide-[var(--border-default)]">
          {items.map((item) => (
            <li key={item.company} className="grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs uppercase text-[var(--color-muted)]">{item.industry}</p>
                <h3 className="mt-1 text-xl font-bold">{item.company}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.detail}</p>
              </div>
              <p className="${p}-metric text-3xl">{item.outcome}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function logoWall({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-12">
      <div className="mx-auto max-w-[82rem] px-5 text-center sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-8 opacity-60">
          {items.map((item) => <span key={item.company} className="text-lg font-bold">{item.company}</span>)}
        </div>
      </div>
    </section>
  );
}
`;
}

function masonryPortfolio({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-16">
      <div className="mx-auto max-w-[88rem] columns-1 gap-4 px-5 sm:columns-2 sm:px-8 lg:columns-3">
        {items.map((item, i) => (
          <article key={item.company} className={\`${p}-card mb-4 break-inside-avoid p-6 \${i === 1 ? "min-h-[16rem]" : "min-h-[12rem]"}\`}>
            <h3 className="${p}-display text-2xl">{item.company}</h3>
            <p className="mt-4 text-sm">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function fullscreenCase({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  const featured = items[0];
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="flex min-h-[70vh] items-end bg-[var(--color-primary)] p-8 sm:p-12">
      {featured ? (
        <div>
          <p className="text-xs uppercase tracking-widest opacity-70">{featured.industry}</p>
          <h2 className="${p}-display mt-4 text-4xl">{featured.company}</h2>
          <p className="${p}-metric mt-6">{featured.outcome}</p>
          <p className="mt-4 max-w-xl opacity-80">{featured.detail}</p>
        </div>
      ) : null}
    </section>
  );
}
`;
}

function clinicalOutcomes({ p, pkg, Pascal }) {
  return outcomeCards({ p, pkg, Pascal });
}

function galleryGrid({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-16">
      <h2 className="${p}-headline-sm text-center">{title}</h2>
      <div className="mx-auto mt-10 grid max-w-[82rem] gap-3 px-5 sm:grid-cols-3 sm:px-8">
        {items.map((item) => (
          <article key={item.company} className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--color-surface)] p-6 flex flex-col justify-end">
            <h3 className="font-bold">{item.company}</h3>
            <p className="text-sm text-[var(--color-muted)]">{item.industry}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function menuShowcase({ p, pkg, Pascal }) {
  return galleryGrid({ p, pkg, Pascal });
}

function alumniSuccess({ p, pkg, Pascal }) {
  return caseStudyRows({ p, pkg, Pascal });
}

function productLookbook({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-16">
      <div className="mx-auto grid max-w-[88rem] grid-cols-2 gap-1 px-5 sm:grid-cols-3 sm:px-8">
        {items.map((item) => (
          <article key={item.company} className="group relative aspect-square bg-[var(--color-surface)]">
            <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition group-hover:opacity-100 bg-[var(--color-primary)]/80">
              <h3 className="font-bold">{item.company}</h3>
              <p className="text-sm">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function saasCustomers({ p, pkg, Pascal }) {
  return outcomeCards({ p, pkg, Pascal });
}

function workGridLarge({ p, pkg, Pascal }) {
  return masonryPortfolio({ p, pkg, Pascal });
}

function propertyShowcase({ p, pkg, Pascal }) {
  return galleryGrid({ p, pkg, Pascal });
}

function natureGallery({ p, pkg, Pascal }) {
  return galleryGrid({ p, pkg, Pascal });
}

function auroraShowcase({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent),transparent_60%)] opacity-20" aria-hidden />
      <div className="relative mx-auto grid max-w-[82rem] gap-6 px-5 sm:grid-cols-3 sm:px-8">
        {items.map((item) => (
          <article key={item.company} className="${p}-glass-card rounded-2xl border p-6 backdrop-blur">
            <h3 className="font-bold">{item.company}</h3>
            <p className="mt-2 text-sm">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function minimalListPortfolio({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-12 font-mono">
      <ul className="mx-auto max-w-xl space-y-4 px-5 sm:px-8">
        {items.map((item) => (
          <li key={item.company} className="border-b border-[var(--border-subtle)] pb-4">
            <span className="text-[var(--color-accent)]">→</span> {item.company} — {item.outcome}
          </li>
        ))}
      </ul>
    </section>
  );
}
`;
}

function terminalCases({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="bg-[#0a0f0a] py-12 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p>$ ls cases/</p>
        <pre className="mt-4">{items.map((item) => \`\${item.company.padEnd(20)} \${item.outcome}  \${item.industry}\`).join("\\n")}</pre>
      </div>
    </section>
  );
}
`;
}

function blueprintProjects({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-16" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto max-w-[82rem] border-2 border-dashed border-[var(--color-accent)] p-8">
        <p className="${p}-font-mono text-xs text-[var(--color-accent)]">PROJECT LOG</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={item.company} className="border border-[var(--border-default)] p-4">
              <span className="text-xs text-[var(--color-muted)]">PRJ-{String(i + 1).padStart(3, "0")}</span>
              <h3 className="mt-2 font-bold">{item.company}</h3>
              <p className="mt-2 text-sm">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function clientRoster({ p, pkg, Pascal }) {
  return caseStudyRows({ p, pkg, Pascal });
}

function wellnessJourney({ p, pkg, Pascal }) {
  return `${portfolioHeader({ p, pkg, Pascal })}
  return (
    <section id="portfolio" data-v2-component="${pkg}-portfolio" className="py-16 text-center">
      <h2 className="${p}-headline-sm">{title}</h2>
      <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-6">
        {items.map((item) => (
          <div key={item.company} className="rounded-full bg-[var(--color-surface)] px-6 py-4 shadow-sm">
            <p className="font-semibold">{item.company}</p>
            <p className="text-xs text-[var(--color-muted)]">{item.outcome} {item.outcomeLabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}
