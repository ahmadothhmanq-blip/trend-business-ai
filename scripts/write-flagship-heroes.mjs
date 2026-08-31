/**
 * Write custom flagship hero components for catalog skins.
 * Usage: node scripts/write-flagship-heroes.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(__dirname, "..", "templates", "website");

const METRICS = {
  "glass-dashboard": [
    { value: "12ms", label: "Inference latency", trend: "p99 edge" },
    { value: "99.99%", label: "Platform uptime", trend: "global SLA" },
    { value: "140+", label: "Model endpoints", trend: "production" },
    { value: "48", label: "Regions live", trend: "multi-cloud" },
  ],
  "kinetic-split": [
    { value: "240+", label: "Global launches", trend: "2020–2026" },
    { value: "38", label: "Markets served", trend: "6 continents" },
    { value: "92%", label: "Repeat clients", trend: "studio avg." },
    { value: "18", label: "Design awards", trend: "last 3 years" },
  ],
  "editorial-trust": [
    { value: "500+", label: "Enterprise clients", trend: "Global footprint" },
    { value: "28", label: "Countries served", trend: "Active markets" },
    { value: "97%", label: "Client retention", trend: "3-year average" },
    { value: "$48B", label: "Assets advised", trend: "AUM" },
  ],
  "estate-monolith": [
    { value: "$2.4B", label: "Portfolio value", trend: "Active listings" },
    { value: "18", label: "Global markets", trend: "Prime corridors" },
    { value: "42", label: "Landmark estates", trend: "Curated" },
    { value: "96%", label: "Private sales", trend: "Off-market" },
  ],
  "clinical-calm": [
    { value: "40+", label: "Specialties", trend: "Integrated care" },
    { value: "98%", label: "Patient satisfaction", trend: "Annual survey" },
    { value: "24/7", label: "Care coordination", trend: "Concierge" },
    { value: "15", label: "Clinical partners", trend: "Global network" },
  ],
  "ocean-resort": [
    { value: "142", label: "Suites & villas", trend: "Oceanfront" },
    { value: "3", label: "Michelin experiences", trend: "On property" },
    { value: "12", label: "Wellness rituals", trend: "Signature" },
    { value: "5★", label: "Guest rating", trend: "Global travelers" },
  ],
  "culinary-warm": [
    { value: "18", label: "Course tasting", trend: "Seasonal menu" },
    { value: "2", label: "Michelin stars", trend: "2026 guide" },
    { value: "48", label: "Local farms", trend: "Sourced weekly" },
    { value: "6", label: "Chef's tables", trend: "Nightly" },
  ],
  "academy-classic": [
    { value: "12K+", label: "Students", trend: "Global campus" },
    { value: "94%", label: "Graduate placement", trend: "Within 6 months" },
    { value: "60+", label: "Degree programs", trend: "Undergrad & grad" },
    { value: "140", label: "Partner universities", trend: "Exchange" },
  ],
  "commerce-editorial": [
    { value: "180+", label: "Designers", trend: "Curated roster" },
    { value: "42", label: "Countries shipped", trend: "White-glove" },
    { value: "72h", label: "Atelier delivery", trend: "Priority" },
    { value: "100%", label: "Authenticity verified", trend: "Every piece" },
  ],
};

const TRUST = {
  "glass-dashboard": ["AI platforms", "Fintech", "Healthcare AI", "Cybersecurity", "Developer tools", "Enterprise data"],
  "editorial-trust": ["Global industrials", "Financial institutions", "Healthcare systems", "Energy & utilities", "Public sector", "Private equity"],
  "estate-monolith": ["Waterfront", "Urban penthouses", "Heritage estates", "Golf communities", "Alpine retreats", "Private islands"],
  "clinical-calm": ["Primary care", "Cardiology", "Women's health", "Diagnostics", "Preventive medicine", "Telehealth"],
  "ocean-resort": ["Ocean suites", "Spa sanctuary", "Coastal dining", "Private beach", "Yacht club", "Wellness"],
  "culinary-warm": ["Tasting menu", "Wine program", "Chef's table", "Private dining", "Seasonal produce", "Fire kitchen"],
  "academy-classic": ["Undergraduate", "Graduate", "Research", "Executive education", "Global exchange", "Scholarships"],
  "commerce-editorial": ["Ready-to-wear", "Accessories", "Home atelier", "Limited editions", "Bespoke", "Archive"],
};

function heroBody(entry) {
  const p = entry.cssPrefix;
  const pkg = entry.packageId;
  const Pascal = entry.pascal;
  const h = entry.hero;
  const metrics = METRICS[h.variant] ?? METRICS["editorial-trust"];
  const trust = TRUST[h.variant] ?? TRUST["editorial-trust"];
  const anim = `${p}-slide-up`;

  if (h.variant === "glass-dashboard") {
    return glassDashboardHero({ p, pkg, Pascal, h, metrics, trust, anim });
  }
  if (h.variant === "kinetic-split") {
    return kineticSplitHero({ p, pkg, Pascal, h, metrics, anim });
  }
  if (h.variant === "ocean-resort") {
    return oceanResortHero({ p, pkg, Pascal, h, metrics, anim });
  }
  if (h.variant === "clinical-calm") {
    return clinicalHero({ p, pkg, Pascal, h, metrics, anim });
  }
  if (h.variant === "culinary-warm") {
    return culinaryHero({ p, pkg, Pascal, h, metrics, anim });
  }
  if (h.variant === "estate-monolith") {
    return estateHero({ p, pkg, Pascal, h, metrics, anim });
  }
  if (h.variant === "commerce-editorial") {
    return commerceHero({ p, pkg, Pascal, h, metrics, anim });
  }
  return editorialTrustHero({ p, pkg, Pascal, h, metrics, trust, anim });
}

function glassDashboardHero({ p, pkg, Pascal, h, metrics, trust, anim }) {
  return `"use client";

const DEFAULT_METRICS = ${JSON.stringify(metrics, null, 2)};

type ${Pascal}HeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function ${Pascal}Hero({
  title = ${JSON.stringify(h.title)},
  subtitle = ${JSON.stringify(h.subtitle)},
  eyebrow = ${JSON.stringify(h.eyebrow)},
  primaryCta = ${JSON.stringify(h.primaryCta)},
  secondaryCta = ${JSON.stringify(h.secondaryCta)},
  metrics = DEFAULT_METRICS,
}: ${Pascal}HeroProps) {
  return (
    <section
      id="top"
      data-v2-component="${pkg}-hero"
      aria-labelledby="${p}-hero-title"
      className="${p}-section relative min-h-[min(88vh,52rem)] overflow-hidden bg-[var(--color-background)] pb-12 pt-14 sm:pt-16"
    >
      <div className="${p}-grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-1.5 backdrop-blur-md motion-safe:animate-[${anim}_0.6s_ease_both]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
              <span className="${p}-eyebrow !text-[0.6875rem]">{eyebrow}</span>
            </div>
            <h1 id="${p}-hero-title" className="${p}-headline mt-6 max-w-[13ch] motion-safe:animate-[${anim}_0.65s_ease_0.08s_both]">{title}</h1>
            <p className="${p}-body mt-6 max-w-lg motion-safe:animate-[${anim}_0.65s_ease_0.16s_both]">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3 motion-safe:animate-[${anim}_0.65s_ease_0.24s_both]">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#platform" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {${JSON.stringify(trust)}.map((sector) => (
                <span key={sector} className="${p}-trust-badge">{sector}</span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="${p}-glass-card overflow-hidden rounded-[var(--radius-xl,32px)] border border-[var(--border-accent)] p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="${p}-hero-dashboard-panel ${p}-glass-card p-4">
                    <p className="${p}-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">{metric.label}</p>
                    <p className="${p}-metric mt-2 text-[var(--color-accent)]">{metric.value}</p>
                    {metric.trend ? <p className="${p}-font-body mt-1 text-xs text-[var(--color-muted)]">{metric.trend}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function kineticSplitHero({ p, pkg, Pascal, h, metrics, anim }) {
  return `"use client";

const DEFAULT_METRICS = ${JSON.stringify(metrics, null, 2)};

type ${Pascal}HeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function ${Pascal}Hero({
  title = ${JSON.stringify(h.title)},
  subtitle = ${JSON.stringify(h.subtitle)},
  eyebrow = ${JSON.stringify(h.eyebrow)},
  primaryCta = ${JSON.stringify(h.primaryCta)},
  secondaryCta = ${JSON.stringify(h.secondaryCta)},
  metrics = DEFAULT_METRICS,
}: ${Pascal}HeroProps) {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section relative overflow-hidden bg-[var(--color-background)] pb-14 pt-16 sm:pt-20">
      <div className="${p}-section-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="${p}-eyebrow ${p}-animate-slam">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-display mt-6 max-w-[12ch] ${p}-animate-slam">{title}</h1>
            <p className="${p}-body mt-8 max-w-2xl text-[var(--color-muted)] ${p}-animate-rise">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4 ${p}-animate-rise">
              <a href="#contact" className="${p}-btn-volt ${p}-focus-ring">{primaryCta}</a>
              <a href="#portfolio" className="${p}-btn-ghost ${p}-focus-ring">{secondaryCta}</a>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="${p}-card-lift border border-[var(--border-default)] bg-[var(--color-surface)] p-6 sm:p-8">
              <dl className="space-y-5">
                {metrics.map((metric) => (
                  <div key={metric.label} className="flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 last:border-0 last:pb-0">
                    <dt className="${p}-font-body text-sm text-[var(--color-muted)]">{metric.label}</dt>
                    <dd className="${p}-font-display text-2xl font-bold">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function editorialTrustHero({ p, pkg, Pascal, h, metrics, trust, anim }) {
  return `"use client";

const DEFAULT_METRICS = ${JSON.stringify(metrics, null, 2)};

type ${Pascal}HeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function ${Pascal}Hero({
  title = ${JSON.stringify(h.title)},
  subtitle = ${JSON.stringify(h.subtitle)},
  eyebrow = ${JSON.stringify(h.eyebrow)},
  primaryCta = ${JSON.stringify(h.primaryCta)},
  secondaryCta = ${JSON.stringify(h.secondaryCta)},
  metrics = DEFAULT_METRICS,
}: ${Pascal}HeroProps) {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section-glow relative min-h-[min(88vh,52rem)] overflow-hidden bg-[var(--color-background)]">
      <div className="relative mx-auto flex min-h-[min(88vh,52rem)] max-w-[88rem] flex-col justify-center px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <p className="${p}-eyebrow mb-5 motion-safe:animate-[${anim}_0.6s_ease_both]">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-headline max-w-[12ch] motion-safe:animate-[${anim}_0.65s_ease_0.08s_both]">{title}</h1>
            <p className="${p}-body mt-7 max-w-xl motion-safe:animate-[${anim}_0.65s_ease_0.16s_both]">{subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3 motion-safe:animate-[${anim}_0.65s_ease_0.24s_both]">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#platform" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {${JSON.stringify(trust)}.map((sector) => (
                <span key={sector} className="${p}-trust-badge">{sector}</span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="${p}-card p-5 motion-safe:animate-[${anim}_0.65s_ease_both]">
                  <p className="${p}-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">{metric.label}</p>
                  <p className="${p}-metric mt-2">{metric.value}</p>
                  {metric.trend ? <p className="${p}-font-body mt-1 text-xs text-[var(--color-muted)]">{metric.trend}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function oceanResortHero({ p, pkg, Pascal, h, metrics, anim }) {
  return editorialTrustHero({ p, pkg, Pascal, h, metrics, trust: TRUST["ocean-resort"], anim }).replace(
    `className="relative min-h-[min(88vh,52rem)]`,
    `className="${p}-section-glow relative min-h-[min(92vh,56rem)]`,
  );
}

function clinicalHero({ p, pkg, Pascal, h, metrics, anim }) {
  return editorialTrustHero({ p, pkg, Pascal, h, metrics, trust: TRUST["clinical-calm"], anim });
}

function culinaryHero({ p, pkg, Pascal, h, metrics, anim }) {
  return editorialTrustHero({ p, pkg, Pascal, h, metrics, trust: TRUST["culinary-warm"], anim }).replace(
    `bg-[var(--color-background)]`,
    `bg-[var(--color-background)] ${p}-section-glow`,
  );
}

function estateHero({ p, pkg, Pascal, h, metrics, anim }) {
  return editorialTrustHero({ p, pkg, Pascal, h, metrics, trust: TRUST["estate-monolith"], anim });
}

function commerceHero({ p, pkg, Pascal, h, metrics, anim }) {
  return editorialTrustHero({ p, pkg, Pascal, h, metrics, trust: TRUST["commerce-editorial"], anim });
}

async function main() {
  for (const entry of FLAGSHIP_SKIN_MANIFEST) {
    const dir = path.join(websiteRoot, entry.packageId, "components");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${entry.packageId}-hero.tsx`);
    const skip = entry.skinId === "atlas";
    if (skip) {
      console.log(`skip atlas (existing hero): ${file}`);
      continue;
    }
    await writeFile(file, heroBody(entry), "utf8");
    console.log(`wrote ${entry.packageId}-hero.tsx`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
