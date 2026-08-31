import { DEFAULT_PRICING_TIERS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const PRICING_GENERATORS = {
  "three-column-cards": threeColumnCards,
  "two-tier-compare": twoTierCompare,
  "table-comparison": tableComparison,
  "horizontal-tiers": horizontalTiers,
  "single-enterprise-cta": singleEnterpriseCta,
  "clinical-packages": clinicalPackages,
  "resort-packages": resortPackages,
  "menu-pricing": menuPricing,
  "tuition-tiers": tuitionTiers,
  "product-tiers": productTiers,
  "saas-feature-matrix": saasFeatureMatrix,
  "project-based": projectBased,
  "property-fees": propertyFees,
  "organic-cards": organicCards,
  "gradient-tiers": gradientTiers,
  "minimal-list-pricing": minimalListPricing,
  "terminal-pricing": terminalPricing,
  "spec-packages": specPackages,
  "retainer-columns": retainerColumns,
  "ritual-packages": ritualPackages,
};

export function generatePricing(entry, layoutKey) {
  const fn = PRICING_GENERATORS[layoutKey] ?? threeColumnCards;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function pricingHeader({ p, pkg, Pascal }) {
  return `"use client";

type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const DEFAULT_TIERS: PricingTier[] = ${JSON.stringify(DEFAULT_PRICING_TIERS, null, 2)};

type ${Pascal}PricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export function ${Pascal}Pricing({
  eyebrow = "Pricing",
  title = "Plans that scale with you",
  subtitle = "Transparent pricing. No surprises.",
  tiers = DEFAULT_TIERS,
}: ${Pascal}PricingProps) {`;
}

function threeColumnCards({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" aria-labelledby="${p}-pricing-title" className="${p}-section ${p}-section-glow bg-[var(--color-background)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 text-center">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-pricing-title" className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mx-auto mt-4 max-w-lg text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article key={tier.name} className={\`${p}-card flex flex-col p-7 \${tier.highlighted ? "ring-2 ring-[var(--color-accent)] lg:-translate-y-2" : ""}\`}>
              <h3 className="text-lg font-bold">{tier.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              <p className="mt-6"><span className="${p}-metric">{tier.price}</span><span className="text-sm text-[var(--color-muted)]">{tier.period}</span></p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">{tier.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
              <a href="#contact" className={\`\${tier.highlighted ? "${p}-btn-primary" : "${p}-btn-secondary"} mt-8 w-full\`}>{tier.cta}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function twoTierCompare({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  const [a, b] = tiers;
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="py-16">
      <div className="mx-auto grid max-w-5xl gap-0 px-5 sm:grid-cols-2 sm:px-8">
        {[a, b].filter(Boolean).map((tier, i) => (
          <article key={tier!.name} className={\`flex flex-col p-10 \${i === 0 ? "bg-[var(--color-surface)]" : "bg-[var(--color-primary)] text-[var(--color-foreground)]"}\`}>
            <h3 className="${p}-display text-3xl">{tier!.name}</h3>
            <p className="mt-4 text-4xl font-bold">{tier!.price}<span className="text-base font-normal">{tier!.period}</span></p>
            <ul className="mt-8 flex-1 space-y-3 text-sm">{tier!.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <a href="#contact" className={\`\${i === 1 ? "${p}-btn-volt" : "${p}-btn-primary"} mt-10\`}>{tier!.cta}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function tableComparison({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  const allFeatures = [...new Set(tiers.flatMap((t) => t.features))];
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="${p}-section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] overflow-x-auto px-5 sm:px-8">
        <h2 className="${p}-headline-sm mb-10">{title}</h2>
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--color-accent)]">
              <th className="py-3 text-start">Feature</th>
              {tiers.map((t) => <th key={t.name} className="py-3 text-center">{t.name}<br /><span className="${p}-metric text-base">{t.price}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((f) => (
              <tr key={f} className="border-b border-[var(--border-subtle)]">
                <td className="py-3">{f}</td>
                {tiers.map((t) => <td key={t.name} className="py-3 text-center">{t.features.includes(f) ? "✓" : "—"}</td>)}
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

function horizontalTiers({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="py-16">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 flex flex-col gap-4 lg:flex-row">
          {tiers.map((tier) => (
            <article key={tier.name} className="${p}-card flex flex-1 items-center justify-between gap-6 p-6 lg:flex-col lg:items-stretch lg:p-8">
              <div>
                <h3 className="font-bold">{tier.name}</h3>
                <p className="${p}-metric mt-2">{tier.price}{tier.period}</p>
              </div>
              <a href="#contact" className="${p}-btn-primary">{tier.cta}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function singleEnterpriseCta({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  const tier = tiers.find((t) => t.price === "Custom") ?? tiers[tiers.length - 1];
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="relative bg-[var(--color-primary)] py-24 text-center">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h2 className="${p}-display mt-4 text-4xl">{title}</h2>
        <p className="mt-6 text-[var(--color-muted)]">{subtitle}</p>
        <p className="${p}-metric mt-10">{tier?.price ?? "By inquiry"}</p>
        <a href="#contact" className="${p}-btn-primary mt-10 inline-flex">{tier?.cta ?? "Request consultation"}</a>
      </div>
    </section>
  );
}
`;
}

function clinicalPackages({ p, pkg, Pascal }) {
  return threeColumnCards({ p, pkg, Pascal }).replace(
    `title = "Plans that scale with you"`,
    `title = "Care programs"`,
  );
}

function resortPackages({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="${p}-section-glow py-20 sm:py-28 text-center">
      <h2 className="${p}-headline-sm">{title}</h2>
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="rounded-2xl border border-[var(--border-accent)] bg-[var(--color-surface)]/80 p-8 backdrop-blur">
            <h3 className="font-semibold">{tier.name}</h3>
            <p className="${p}-metric mt-4">{tier.price}</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
            <a href="#contact" className="${p}-btn-primary mt-6 inline-flex">{tier.cta}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function menuPricing({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="py-16">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <ul className="mt-10 divide-y divide-[var(--border-default)]">
          {tiers.map((tier) => (
            <li key={tier.name} className="flex items-baseline justify-between gap-4 py-5">
              <div>
                <p className="font-semibold">{tier.name}</p>
                <p className="text-sm text-[var(--color-muted)]">{tier.description}</p>
              </div>
              <p className="${p}-font-display text-lg font-bold whitespace-nowrap">{tier.price}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function tuitionTiers({ p, pkg, Pascal }) {
  return horizontalTiers({ p, pkg, Pascal });
}

function productTiers({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="py-16">
      <div className="mx-auto grid max-w-[82rem] gap-8 px-5 sm:grid-cols-3 sm:px-8">
        {tiers.map((tier) => (
          <article key={tier.name}>
            <div className="aspect-square bg-[var(--color-surface)]" aria-hidden />
            <h3 className="mt-4 font-bold">{tier.name}</h3>
            <p className="${p}-metric">{tier.price}</p>
            <a href="#contact" className="mt-4 inline-block text-sm underline">{tier.cta}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function saasFeatureMatrix({ p, pkg, Pascal }) {
  return tableComparison({ p, pkg, Pascal });
}

function projectBased({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="border-y border-[var(--border-default)] py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="${p}-display text-5xl">{title}</h2>
        <p className="mt-6 text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-12 space-y-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-6">
              <div>
                <p className="text-sm uppercase tracking-widest">{tier.name}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{tier.description}</p>
              </div>
              <p className="${p}-font-display text-3xl font-bold">{tier.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function propertyFees({ p, pkg, Pascal }) {
  return menuPricing({ p, pkg, Pascal });
}

function organicCards({ p, pkg, Pascal }) {
  return resortPackages({ p, pkg, Pascal });
}

function gradientTiers({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="py-16">
      <div className="mx-auto grid max-w-[82rem] gap-6 px-5 sm:grid-cols-3 sm:px-8">
        {tiers.map((tier, i) => (
          <article key={tier.name} className="rounded-2xl p-8 text-white" style={{ background: \`linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-primary) \${70 + i * 10}%, transparent))\` }}>
            <h3 className="font-bold">{tier.name}</h3>
            <p className="mt-4 text-3xl font-bold">{tier.price}</p>
            <a href="#contact" className="mt-8 inline-block rounded-full bg-white/20 px-5 py-2 text-sm">{tier.cta}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
`;
}

function minimalListPricing({ p, pkg, Pascal }) {
  return menuPricing({ p, pkg, Pascal }).replace(
    `className="py-16"`,
    `className="py-16 font-mono"`,
  );
}

function terminalPricing({ p, pkg, Pascal }) {
  return `${pricingHeader({ p, pkg, Pascal })}
  return (
    <section id="pricing" data-v2-component="${pkg}-pricing" className="bg-[#0a0f0a] py-12 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p>$ pricing --list</p>
        <pre className="mt-4">
{tiers.map((t) => \`\${t.name.padEnd(16)} \${t.price.padStart(8)} \${t.period}\`).join("\\n")}
        </pre>
        <a href="#contact" className="mt-8 inline-block text-white underline">[ contact_sales ]</a>
      </div>
    </section>
  );
}
`;
}

function specPackages({ p, pkg, Pascal }) {
  return tableComparison({ p, pkg, Pascal });
}

function retainerColumns({ p, pkg, Pascal }) {
  return threeColumnCards({ p, pkg, Pascal }).replace(
    `title = "Plans that scale with you"`,
    `title = "Engagement models"`,
  );
}

function ritualPackages({ p, pkg, Pascal }) {
  return resortPackages({ p, pkg, Pascal });
}
