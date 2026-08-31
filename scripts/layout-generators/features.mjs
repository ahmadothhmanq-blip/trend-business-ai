import { DEFAULT_FEATURES } from "../layout-dna.mjs";
import { featuresPropsType as featuresType } from "./shared.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const FEATURES_GENERATORS = {
  "bento-asymmetric": bentoAsymmetric,
  "horizontal-scroll": horizontalScroll,
  "numbered-list": numberedList,
  "icon-rows": iconRows,
  "masonry-cards": masonryCards,
  "soft-grid": softGrid,
  "amenity-pills": amenityPills,
  "menu-cards": menuCards,
  timeline: timeline,
  "editorial-split": editorialSplit,
  "saas-columns": saasColumns,
  "showcase-strip": showcaseStrip,
  "property-list": propertyList,
  "organic-bento": organicBento,
  "gradient-orbs": gradientOrbs,
  "minimal-list": minimalList,
  "terminal-metrics": terminalMetrics,
  "spec-table": specTable,
  "practice-grid": practiceGrid,
  "ritual-cards": ritualCards,
};

export function generateFeatures(entry, layoutKey) {
  const fn = FEATURES_GENERATORS[layoutKey] ?? bentoAsymmetric;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function featuresHeader({ p, Pascal, pkg, title = "Built for modern teams", subtitle = "Capabilities designed for clarity, scale, and measurable impact." }) {
  return `
const DEFAULT_FEATURES = ${JSON.stringify(DEFAULT_FEATURES, null, 2)};

${featuresType(Pascal)}

export function ${Pascal}Features({
  eyebrow = "Platform capabilities",
  title = ${JSON.stringify(title)},
  subtitle = ${JSON.stringify(subtitle)},
  items = DEFAULT_FEATURES,
}: ${Pascal}FeaturesProps) {`;
}

function bentoAsymmetric({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" aria-labelledby="${p}-features-title" className="${p}-section ${p}-section-alt bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="${p}-eyebrow mb-3">{eyebrow}</p>
          <h2 id="${p}-features-title" className="${p}-headline-sm">{title}</h2>
          <p className="${p}-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <article key={item.title} className={\`${p}-card p-7 \${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}\`}>
              <span className="${p}-font-mono text-xs text-[var(--color-accent)]">{item.icon ?? String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function horizontalScroll({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "What we deliver", subtitle: "Scroll through our core capabilities." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section overflow-hidden bg-[var(--color-background)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mt-4 max-w-xl text-[var(--color-muted)]">{subtitle}</p>
      </div>
      <div className="mt-10 flex gap-4 overflow-x-auto px-5 pb-4 sm:px-8 snap-x snap-mandatory">
        {items.map((item) => (
          <article key={item.title} className="${p}-card min-w-[18rem] flex-shrink-0 snap-start p-6 sm:min-w-[22rem]">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function numberedList({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28 lg:py-24">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 border-b border-[var(--border-default)] pb-8">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 className="${p}-headline-sm mt-2">{title}</h2>
        </header>
        <ol className="space-y-0">
          {items.map((item, i) => (
            <li key={item.title} className="grid gap-6 border-b border-[var(--border-subtle)] py-10 lg:grid-cols-12 lg:items-start">
              <span className="${p}-font-mono text-4xl font-light text-[var(--color-accent)] lg:col-span-2">{String(i + 1).padStart(2, "0")}</span>
              <div className="lg:col-span-10">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-[var(--color-muted)]">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
`;
}

function iconRows({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mt-4 max-w-xl">{subtitle}</p>
        <ul className="mt-12 divide-y divide-[var(--border-default)]">
          {items.map((item) => (
            <li key={item.title} className="flex gap-6 py-8 first:pt-0">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-accent)]">{item.icon}</span>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function masonryCards({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] columns-1 gap-4 px-5 sm:columns-2 sm:px-8 lg:columns-3">
        <h2 className="${p}-headline-sm mb-8 break-inside-avoid">{title}</h2>
        {items.map((item, i) => (
          <article key={item.title} className={\`${p}-card mb-4 break-inside-avoid p-6 \${i % 2 === 0 ? "min-h-[12rem]" : "min-h-[16rem]"}\`}>
            <h3 className="font-bold">{item.title}</h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function softGrid({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section bg-[var(--color-background)] py-20">
      <div className="mx-auto max-w-[82rem] px-5 text-center sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mx-auto mt-4 max-w-xl">{subtitle}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.title} className="${p}-card rounded-3xl p-8 text-center">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function amenityPills({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Amenities & services", subtitle: "Everything curated for your stay." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section-glow py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-full border border-[var(--border-accent)] bg-[var(--color-surface)]/80 px-5 py-3 backdrop-blur">
              <span className="font-medium">{item.title}</span>
              <span className="mx-2 text-[var(--color-muted)]">·</span>
              <span className="text-sm text-[var(--color-muted)]">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function menuCards({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Signature offerings", subtitle: "Seasonal selections crafted with care." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-[var(--border-default)]">
              <div className="aspect-[16/9] bg-[var(--color-primary)]/15" aria-hidden />
              <div className="p-6">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function timeline({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Our approach", subtitle: "A proven path from discovery to outcomes." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ol className="relative mt-12 border-s-2 border-[var(--color-accent)] ps-8">
          {items.map((item, i) => (
            <li key={item.title} className="relative pb-10 last:pb-0">
              <span className="absolute -start-[2.35rem] flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-[var(--color-background)]">{i + 1}</span>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
`;
}

function editorialSplit({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm mb-12">{title}</h2>
        {items.map((item, i) => (
          <article key={item.title} className={\`grid items-center gap-8 py-12 lg:grid-cols-2 \${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}\`}>
            <div className="aspect-[4/3] rounded-2xl bg-[var(--color-surface)]" aria-hidden />
            <div>
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="mt-4 text-[var(--color-muted)]">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function saasColumns({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 text-center sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mx-auto mt-4 max-w-2xl">{subtitle}</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="text-start">
              <div className="mb-4 h-1 w-12 bg-[var(--color-accent)]" />
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function showcaseStrip({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Selected capabilities" })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="bg-[var(--color-primary)] py-1">
      {items.map((item) => (
        <article key={item.title} className="border-b border-[var(--border-subtle)] py-12 last:border-0">
          <div className="mx-auto flex max-w-[82rem] flex-col justify-between gap-4 px-5 sm:flex-row sm:items-center sm:px-8">
            <h3 className="${p}-font-display text-2xl font-bold text-[var(--color-foreground)]">{item.title}</h3>
            <p className="max-w-md text-sm text-[var(--color-muted)]">{item.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
`;
}

function propertyList({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Featured properties", subtitle: "Curated listings with full specifications." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ul className="mt-10 divide-y divide-[var(--border-default)]">
          {items.map((item) => (
            <li key={item.title} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
              </div>
              <span className="${p}-font-mono text-sm text-[var(--color-accent)]">{item.icon}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function organicBento({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section-glow py-20 sm:py-28">
      <div className="mx-auto grid max-w-[82rem] grid-cols-6 gap-3 px-5 sm:px-8">
        {items.map((item, i) => (
          <article key={item.title} className={\`${p}-card rounded-[2rem] p-5 \${["col-span-6 sm:col-span-4","col-span-6 sm:col-span-2","col-span-6 sm:col-span-3","col-span-6 sm:col-span-3"][i % 4]}\`}>
            <h3 className="font-bold">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function gradientOrbs({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <article key={item.title} className="relative overflow-hidden rounded-2xl p-8" style={{ background: \`radial-gradient(circle at \${i % 2 === 0 ? "20%" : "80%"} 30%, var(--color-accent), transparent 60%), var(--color-surface)\` }}>
              <h3 className="relative font-bold">{item.title}</h3>
              <p className="relative mt-3 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function minimalList({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="bg-[var(--color-background)] py-20 sm:py-28 font-mono">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <h2 className="text-sm uppercase tracking-widest text-[var(--color-muted)]">{title}</h2>
        <ul className="mt-8 space-y-6">
          {items.map((item) => (
            <li key={item.title} className="border-b border-[var(--border-subtle)] pb-6">
              <span className="text-[var(--color-accent)]">—</span> <strong>{item.title}</strong>
              <p className="mt-2 ps-4 text-sm text-[var(--color-muted)]">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function terminalMetrics({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="bg-[#0a0f0a] py-20 sm:py-28 text-[#00ff88]">
      <div className="mx-auto max-w-[82rem] px-5 font-mono sm:px-8">
        <p className="text-xs text-[#00ff88]/60">$ cat features.json</p>
        <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
        <pre className="mt-8 overflow-x-auto rounded border border-[#00ff88]/20 p-6 text-sm">
{JSON.stringify(items, null, 2)}
        </pre>
      </div>
    </section>
  );
}
`;
}

function specTable({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Technical specifications" })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section py-20 sm:py-28" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <table className="mt-10 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--color-accent)]">
              <th className="py-3 text-start font-mono text-xs uppercase">Module</th>
              <th className="py-3 text-start font-mono text-xs uppercase">Description</th>
              <th className="py-3 text-end font-mono text-xs uppercase">Ref</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.title} className="border-b border-[var(--border-default)]">
                <td className="py-4 font-semibold">{item.title}</td>
                <td className="py-4 text-[var(--color-muted)]">{item.description}</td>
                <td className="py-4 text-end font-mono text-[var(--color-accent)]">{item.icon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
`;
}

function practiceGrid({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Practice areas", subtitle: "Depth across disciplines that matter to your organization." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="mt-12 grid gap-px bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="bg-[var(--color-background)] p-8">
              <span className="text-2xl text-[var(--color-accent)]" aria-hidden>§</span>
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function ritualCards({ p, pkg, Pascal }) {
  return `"use client";
${featuresHeader({ p, Pascal, pkg, title: "Your wellness journey", subtitle: "Gentle rituals designed for balance and renewal." })}
  return (
    <section id="features" data-v2-component="${pkg}-features" className="${p}-section bg-[var(--color-background)] py-20">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="relative mt-16 flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
          {items.map((item, i) => (
            <article key={item.title} className="${p}-card w-full max-w-xs rounded-3xl p-8 shadow-lg lg:-mt-4" style={{ transform: \`rotate(\${(i - 1.5) * 3}deg)\` }}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}
