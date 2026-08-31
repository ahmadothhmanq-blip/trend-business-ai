import { heroDefaults, METRICS } from "./shared.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string; h: object; metricsKey?: string }) => string>} */
export const HERO_GENERATORS = {
  "glass-dashboard": glassDashboard,
  "kinetic-split": kineticSplit,
  "split-trust": splitTrust,
  "corporate-image": corporateImage,
  "fullbleed-overlay": fullbleedOverlay,
  "centered-clinical": centeredClinical,
  "ocean-immersive": oceanImmersive,
  "culinary-asymmetric": culinaryAsymmetric,
  "academy-crest": academyCrest,
  "commerce-editorial": commerceEditorial,
  "pipeline-flow": pipelineFlow,
  "portfolio-mega": portfolioMega,
  "estate-search": estateSearch,
  "forest-frame": forestFrame,
  "aurora-orbit": auroraOrbit,
  "noir-terminal": noirTerminal,
  "fintech-terminal": fintechTerminal,
  "blueprint-grid": blueprintGrid,
  "authority-triple": authorityTriple,
  "wellness-wave": wellnessWave,
};

export function generateHero(entry, layoutKey) {
  const fn = HERO_GENERATORS[layoutKey] ?? splitTrust;
  return fn({
    p: entry.cssPrefix,
    pkg: entry.packageId,
    Pascal: entry.pascal,
    h: entry.hero,
    metricsKey: layoutKey === "glass-dashboard" || layoutKey === "kinetic-split" ? layoutKey : "default",
  });
}

function glassDashboard({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "glass-dashboard")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section relative min-h-[min(88vh,52rem)] overflow-hidden bg-[var(--color-background)] pb-12 pt-14">
      <div className="${p}-grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
              <span className="${p}-eyebrow">{eyebrow}</span>
            </div>
            <h1 id="${p}-hero-title" className="${p}-headline mt-6 max-w-[13ch]">{title}</h1>
            <p className="${p}-body mt-6 max-w-lg">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#platform" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="${p}-glass-card rounded-[var(--radius-xl,32px)] border border-[var(--border-accent)] p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((m) => (
                  <div key={m.label} className="${p}-glass-card p-4">
                    <p className="${p}-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">{m.label}</p>
                    <p className="${p}-metric mt-2 text-[var(--color-accent)]">{m.value}</p>
                    {m.trend ? <p className="mt-1 text-xs text-[var(--color-muted)]">{m.trend}</p> : null}
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

function kineticSplit({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "kinetic-split")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section relative overflow-hidden bg-[var(--color-background)] pb-14 pt-16">
      <div className="${p}-section-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="${p}-eyebrow ${p}-animate-slam">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-display mt-6 max-w-[12ch] ${p}-animate-slam">{title}</h1>
            <p className="${p}-body mt-8 max-w-2xl text-[var(--color-muted)]">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="${p}-btn-volt ${p}-focus-ring">{primaryCta}</a>
              <a href="#portfolio" className="${p}-btn-ghost ${p}-focus-ring">{secondaryCta}</a>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="${p}-card-lift border border-[var(--border-default)] bg-[var(--color-surface)] p-6">
              <dl className="space-y-5">
                {metrics.map((m) => (
                  <div key={m.label} className="flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] pb-4 last:border-0">
                    <dt className="text-sm text-[var(--color-muted)]">{m.label}</dt>
                    <dd className="${p}-font-display text-2xl font-bold">{m.value}</dd>
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

function splitTrust({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section-glow relative min-h-[min(88vh,52rem)] overflow-hidden bg-[var(--color-background)]">
      <div className="relative mx-auto flex min-h-[min(88vh,52rem)] max-w-[88rem] flex-col justify-center px-5 py-20 sm:py-28 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="${p}-eyebrow mb-5">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-headline max-w-[12ch]">{title}</h1>
            <p className="${p}-body mt-7 max-w-xl">{subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((m) => (
              <div key={m.label} className="${p}-card p-5">
                <p className="${p}-font-mono text-[0.6875rem] uppercase text-[var(--color-muted)]">{m.label}</p>
                <p className="${p}-metric mt-2">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function corporateImage({ p, pkg, Pascal, h }) {
  return `"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]">
      <div className="${p}-hero-atmosphere" aria-hidden />
      <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-[88rem] items-center gap-16 px-5 py-20 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <p className="${p}-eyebrow mb-7">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline max-w-[11ch]">{title}</h1>
          <p className="${p}-body mt-10">{subtitle}</p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="${p}-hero-image-frame relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)]">
            <SlotImage src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function fullbleedOverlay({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative flex min-h-[100svh] items-end overflow-hidden bg-[var(--color-primary)]">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[color-mix(in_srgb,var(--color-background)_40%,transparent)] to-transparent" aria-hidden />
      <div className="relative w-full px-5 pb-16 pt-32 sm:px-8 lg:pb-24">
        <div className="mx-auto max-w-[88rem]">
          <p className="${p}-eyebrow mb-4 text-[var(--color-accent)]">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-display max-w-[14ch] text-[var(--color-foreground)]">{title}</h1>
          <p className="${p}-body mt-6 max-w-2xl text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#portfolio" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <dl className="mt-16 grid gap-6 border-t border-[var(--border-subtle)] pt-10 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{m.label}</dt>
                <dd className="${p}-metric mt-2">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
`;
}

function centeredClinical({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="${p}-eyebrow mb-4">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-xl text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
      </div>
      <div className="mx-auto mt-16 grid max-w-4xl gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="${p}-card rounded-2xl p-5 text-center">
            <p className="${p}-metric">{m.value}</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function oceanImmersive({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-background)] text-center">
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, var(--color-accent), transparent)" }} aria-hidden />
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <p className="${p}-eyebrow mb-6">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-display">{title}</h1>
        <p className="${p}-body mx-auto mt-8 max-w-2xl">{subtitle}</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {metrics.map((m) => (
            <span key={m.label} className="rounded-full border border-[var(--border-accent)] bg-[var(--color-surface)]/60 px-4 py-2 text-sm backdrop-blur">
              <strong className="text-[var(--color-accent)]">{m.value}</strong> {m.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function culinaryAsymmetric({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section-glow overflow-hidden bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-[88rem] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-5 py-20 sm:py-28 sm:px-8 lg:col-span-5 lg:py-24">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-6">{title}</h1>
          <p className="${p}-body mt-6">{subtitle}</p>
          <div className="mt-10 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <div className="relative lg:col-span-7">
          <div className="absolute inset-4 rounded-[2rem] border-2 border-[var(--color-accent)]/30 lg:inset-8" aria-hidden />
          <div className="relative m-8 min-h-[24rem] rounded-[1.5rem] bg-[var(--color-surface)] p-8 lg:m-12 lg:min-h-[32rem]">
            <div className="grid h-full grid-cols-2 gap-4">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col justify-end border-t border-[var(--border-subtle)] pt-4">
                  <span className="${p}-metric">{m.value}</span>
                  <span className="text-sm text-[var(--color-muted)]">{m.label}</span>
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

function academyCrest({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28 lg:py-24">
      <div className="mx-auto max-w-[88rem] px-5 text-center sm:px-8">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-accent)] ${p}-font-display text-xl font-bold">A</div>
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mx-auto mt-4 max-w-[16ch]">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-2xl">{subtitle}</p>
        <div className="mt-10 flex justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-2">
          {metrics.map((m, i) => (
            <div key={m.label} className={\`text-\${i % 2 === 0 ? "end" : "start"}\`}>
              <p className="${p}-metric">{m.value}</p>
              <p className="text-sm text-[var(--color-muted)]">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function commerceEditorial({ p, pkg, Pascal, h }) {
  return `"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-[88rem] lg:grid-cols-2">
        <div className="relative min-h-[50vh] lg:min-h-[85vh]">
          <SlotImage src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center px-5 py-20 sm:py-28 sm:px-12 lg:py-24">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
          <p className="${p}-body mt-6">{subtitle}</p>
          <div className="mt-10 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <ul className="mt-12 space-y-3 border-t border-[var(--border-subtle)] pt-8">
            {metrics.map((m) => (
              <li key={m.label} className="flex justify-between text-sm">
                <span className="text-[var(--color-muted)]">{m.label}</span>
                <span className="font-semibold">{m.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
`;
}

function pipelineFlow({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  const steps = metrics.map((m, i) => ({ ...m, step: String(i + 1).padStart(2, "0") }));
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section relative overflow-hidden bg-[var(--color-background)] py-20 sm:py-28 lg:py-24">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
          <p className="${p}-body mt-6">{subtitle}</p>
          <div className="mt-8 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#platform" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <ol className="mt-16 flex flex-col gap-0 lg:flex-row lg:items-stretch">
          {steps.map((s, i) => (
            <li key={s.label} className="relative flex flex-1 flex-col border border-[var(--border-default)] bg-[var(--color-surface)] p-6 lg:border-s-0 lg:first:rounded-s-xl lg:last:rounded-e-xl lg:[&:not(:last-child)]:border-e-0">
              <span className="${p}-font-mono text-xs text-[var(--color-accent)]">{s.step}</span>
              <span className="${p}-metric mt-3">{s.value}</span>
              <span className="mt-2 text-sm font-medium">{s.label}</span>
              {i < steps.length - 1 ? <span className="absolute -end-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-accent)] lg:block" aria-hidden /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
`;
}

function portfolioMega({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="flex min-h-[100svh] flex-col justify-between bg-[var(--color-background)] px-5 py-12 sm:px-8">
      <p className="${p}-eyebrow">{eyebrow}</p>
      <div>
        <h1 id="${p}-hero-title" className="${p}-display text-[clamp(2.5rem,12vw,8rem)] leading-[0.9]">{title}</h1>
        <p className="${p}-body mt-8 max-w-xl text-[var(--color-muted)]">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-[var(--border-subtle)] pt-8">
        <div className="flex gap-3">
          <a href="#contact" className="${p}-btn-volt ${p}-focus-ring">{primaryCta}</a>
          <a href="#portfolio" className="${p}-btn-ghost ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <dl className="flex flex-wrap gap-8">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-xs uppercase text-[var(--color-muted)]">{m.label}</dt>
              <dd className="${p}-font-display text-2xl font-bold">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
`;
}

function estateSearch({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28 lg:py-24">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mt-4 max-w-[14ch]">{title}</h1>
        <p className="${p}-body mt-6 max-w-2xl">{subtitle}</p>
        <form className="mt-10 flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center" onSubmit={(e) => e.preventDefault()}>
          <input type="search" placeholder="Location, neighborhood, or ZIP" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" aria-label="Search properties" />
          <button type="submit" className="${p}-btn-primary ${p}-focus-ring shrink-0">{primaryCta}</button>
        </form>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <article key={m.label} className="${p}-card overflow-hidden">
              <div className="aspect-[4/3] bg-[var(--color-primary)]/20" aria-hidden />
              <div className="p-4">
                <p className="font-semibold">{m.value}</p>
                <p className="text-sm text-[var(--color-muted)]">{m.label}</p>
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

function forestFrame({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section-glow bg-[var(--color-background)] p-6 sm:p-10">
      <div className="mx-auto max-w-[88rem] rounded-[2.5rem] border-4 border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[var(--color-surface)] p-8 sm:p-12 lg:p-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="${p}-eyebrow">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
            <p className="${p}-body mt-6">{subtitle}</p>
            <div className="mt-8 flex gap-3">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl bg-[var(--color-background)] p-5 text-center">
                <p className="${p}-metric">{m.value}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function auroraOrbit({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative flex min-h-[90svh] items-center overflow-hidden bg-[var(--color-background)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-accent),transparent_50%),radial-gradient(circle_at_70%_80%,var(--color-primary),transparent_50%)] opacity-40" aria-hidden />
      <div className="relative mx-auto grid max-w-[88rem] place-items-center px-5 py-20 text-center sm:px-8">
        <div className="relative z-10 max-w-2xl">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
          <p className="${p}-body mt-6">{subtitle}</p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {metrics.map((m, i) => (
            <div key={m.label} className="${p}-glass-card absolute rounded-xl border border-[var(--border-accent)] p-4 text-start text-sm" style={{ transform: \`rotate(\${i * 90}deg) translateY(-9rem) rotate(-\${i * 90}deg)\` }}>
              <p className="font-bold text-[var(--color-accent)]">{m.value}</p>
              <p className="text-[var(--color-muted)]">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function noirTerminal({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="min-h-[88svh] bg-[var(--color-background)] px-5 py-20 sm:py-28 font-mono sm:px-8">
      <div className="mx-auto max-w-3xl border border-[var(--border-default)]">
        <div className="border-b border-[var(--border-default)] px-4 py-2 text-xs text-[var(--color-muted)]">~/studio — zsh</div>
        <div className="space-y-4 p-6 sm:p-10">
          <p className="text-[var(--color-accent)]">&gt; {eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline !font-mono text-3xl sm:text-4xl">{title}</h1>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <pre className="mt-8 overflow-x-auto rounded border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4 text-xs">
            {metrics.map((m) => \`\${m.label.padEnd(24)} \${m.value}\`).join("\\n")}
          </pre>
        </div>
      </div>
    </section>
  );
}
`;
}

function fintechTerminal({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="bg-[#0a0f0a] py-12 text-[#00ff88]">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="rounded-lg border border-[#00ff88]/30 bg-[#0d140d] p-1">
          <div className="flex gap-1.5 border-b border-[#00ff88]/20 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" /><span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="p-6 font-mono text-sm sm:p-10">
            <p className="text-[#00ff88]/70">$ init --platform fintech</p>
            <h1 id="${p}-hero-title" className="mt-4 text-2xl font-bold text-white sm:text-4xl">{title}</h1>
            <p className="mt-4 max-w-xl text-[#00ff88]/80">{subtitle}</p>
            <div className="mt-8 flex gap-3">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
            <div className="mt-10 grid gap-2 sm:grid-cols-2">
              {metrics.map((m) => (
                <div key={m.label} className="flex justify-between border border-[#00ff88]/15 px-3 py-2">
                  <span className="text-[#00ff88]/60">{m.label}</span>
                  <span className="font-bold text-white">{m.value}</span>
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

function blueprintGrid({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative bg-[var(--color-background)]" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:py-28 sm:px-8 lg:py-24">
        <div className="border-2 border-dashed border-[var(--color-accent)] p-8 lg:p-12">
          <span className="${p}-font-mono text-xs text-[var(--color-accent)]">FIG. 01 — HERO ASSEMBLY</span>
          <p className="${p}-eyebrow mt-4">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-2 max-w-[14ch]">{title}</h1>
          <p className="${p}-body mt-6 max-w-xl">{subtitle}</p>
          <div className="mt-8 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <dl className="mt-12 grid gap-4 border-t border-dashed border-[var(--border-default)] pt-8 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="border border-[var(--border-default)] p-3">
                <dt className="text-[0.65rem] uppercase tracking-widest text-[var(--color-muted)]">{m.label}</dt>
                <dd className="${p}-metric mt-1">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
`;
}

function authorityTriple({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28 lg:py-24">
      <div className="mx-auto max-w-[88rem] px-5 text-center sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mx-auto mt-4 max-w-[16ch]">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-2xl">{subtitle}</p>
        <div className="mt-10 flex justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {metrics.slice(0, 3).map((m) => (
            <div key={m.label} className="border-t-4 border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-10">
              <p className="${p}-metric">{m.value}</p>
              <p className="mt-3 font-semibold">{m.label}</p>
              {m.trend ? <p className="mt-2 text-sm text-[var(--color-muted)]">{m.trend}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function wellnessWave({ p, pkg, Pascal, h }) {
  return `"use client";

${heroDefaults(Pascal, h, "default")} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative overflow-hidden bg-[var(--color-background)] py-20 lg:py-28">
      <div className="absolute -top-24 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-xl">{subtitle}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mx-auto mt-16 flex flex-wrap justify-center gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-full bg-[var(--color-surface)] px-6 py-4 shadow-sm">
              <p className="${p}-metric text-lg">{m.value}</p>
              <p className="text-xs text-[var(--color-muted)]">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}
