/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const UTILITY_BAND_GENERATORS = {
  "split-cta": splitCta,
  "full-bleed-bold": fullBleedBold,
  "trust-badges": trustBadges,
  "corporate-band": corporateBand,
  "luxury-minimal-band": luxuryMinimalBand,
  "clinical-band": clinicalBand,
  "resort-band": resortBand,
  "culinary-band": culinaryBand,
  "academic-band": academicBand,
  "shop-band": shopBand,
  "saas-pipeline-band": saasPipelineBand,
  "portfolio-band": portfolioBand,
  "estate-band": estateBand,
  "forest-band": forestBand,
  "prism-gradient": prismGradient,
  "noir-minimal": noirMinimal,
  "terminal-band": terminalBand,
  "blueprint-band": blueprintBand,
  "law-formal-band": lawFormalBand,
  "wellness-calm-band": wellnessCalmBand,
};

export function generateUtilityBand(entry, layoutKey) {
  const fn = UTILITY_BAND_GENERATORS[layoutKey] ?? splitCta;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function utilityHeader({ p, pkg, Pascal }) {
  return `"use client";

type ${Pascal}UtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function ${Pascal}UtilityBand({
  eyebrow = "Get started",
  title = "See it in action",
  subtitle = "Join organizations that chose excellence.",
  primaryCta = "Book a demo",
  secondaryCta = "Learn more",
}: ${Pascal}UtilityBandProps) {`;
}

function splitCta({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" aria-labelledby="${p}-utility-title" className="relative overflow-hidden bg-[var(--color-primary)] py-20 sm:py-28 sm:py-20">
      <div className="relative mx-auto flex max-w-[82rem] flex-col items-start justify-between gap-10 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="max-w-xl">
          <p className="${p}-eyebrow text-white/70">{eyebrow}</p>
          <h2 id="${p}-utility-title" className="${p}-headline-sm mt-3 text-white">{title}</h2>
          <p className="mt-4 text-sm text-white/78">{subtitle}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href="#contact" className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)]">{primaryCta}</a>
          <a href="#platform" className="inline-flex min-h-[3rem] items-center justify-center rounded-[var(--radius-md)] border border-white/35 px-6 py-3 text-sm font-semibold text-white">{secondaryCta}</a>
        </div>
      </div>
    </section>
  );
}
`;
}

function fullBleedBold({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="bg-[var(--color-accent)] py-24">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h2 className="${p}-display text-4xl sm:text-6xl text-[var(--color-background)]">{title}</h2>
        <a href="#contact" className="mt-10 inline-flex bg-[var(--color-background)] px-8 py-4 font-bold">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function trustBadges({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="relative overflow-hidden bg-[var(--color-primary)] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="${p}-headline-sm text-white">{title}</h2>
            <p className="mt-4 text-sm text-white/78">{subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["SOC 2", "99.9% uptime", "Global support"].map((b) => <span key={b} className="rounded border border-white/15 px-2 py-1 text-xs text-white/80">{b}</span>)}
            </div>
          </div>
          <a href="#contact" className="inline-flex bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)]">{primaryCta}</a>
        </div>
      </div>
    </section>
  );
}
`;
}

function corporateBand({ p, pkg, Pascal }) {
  return splitCta({ p, pkg, Pascal });
}

function luxuryMinimalBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="border-y border-[var(--border-subtle)] py-20 sm:py-28 text-center">
      <p className="text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
      <h2 className="${p}-headline-sm mt-4">{title}</h2>
      <a href="#contact" className="${p}-btn-secondary mt-8 inline-flex">{primaryCta}</a>
    </section>
  );
}
`;
}

function clinicalBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-xl rounded-3xl bg-[var(--color-background)] p-10 text-center shadow-sm">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="mt-4 text-sm text-[var(--color-muted)]">{subtitle}</p>
        <a href="#contact" className="${p}-btn-primary mt-8 inline-flex">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function resortBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] py-20 text-center text-white">
      <h2 className="${p}-headline-sm">{title}</h2>
      <p className="mx-auto mt-4 max-w-md opacity-90">{subtitle}</p>
      <a href="#contact" className="mt-8 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-[var(--color-primary)]">{primaryCta}</a>
    </section>
  );
}
`;
}

function culinaryBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="border-t-2 border-[var(--color-accent)]/30 bg-[var(--color-surface)] py-14">
      <div className="mx-auto flex max-w-[82rem] flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <a href="#contact" className="${p}-btn-primary">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function academicBand({ p, pkg, Pascal }) {
  return splitCta({ p, pkg, Pascal });
}

function shopBand({ p, pkg, Pascal }) {
  return luxuryMinimalBand({ p, pkg, Pascal });
}

function saasPipelineBand({ p, pkg, Pascal }) {
  return trustBadges({ p, pkg, Pascal });
}

function portfolioBand({ p, pkg, Pascal }) {
  return fullBleedBold({ p, pkg, Pascal });
}

function estateBand({ p, pkg, Pascal }) {
  return luxuryMinimalBand({ p, pkg, Pascal });
}

function forestBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="p-6 sm:p-10">
      <div className="mx-auto max-w-[82rem] rounded-[2.5rem] border-4 border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] bg-[var(--color-surface)] p-10 text-center lg:p-14">
        <h2 className="${p}-headline-sm">{title}</h2>
        <a href="#contact" className="${p}-btn-primary mt-8 inline-flex">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function prismGradient({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent),transparent_70%)] opacity-25" aria-hidden />
      <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <a href="#contact" className="${p}-btn-primary mt-8 inline-flex">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function noirMinimal({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="border-t border-[var(--border-default)] py-12 font-mono">
      <div className="mx-auto flex max-w-[82rem] items-center justify-between px-5 sm:px-8">
        <p>&gt; {title}</p>
        <a href="#contact" className="text-[var(--color-accent)]">{primaryCta} →</a>
      </div>
    </section>
  );
}
`;
}

function terminalBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="bg-[#0a0f0a] py-10 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto flex max-w-[82rem] items-center justify-between px-5 sm:px-8">
        <span>{title}</span>
        <a href="#contact" className="text-white">[{primaryCta}]</a>
      </div>
    </section>
  );
}
`;
}

function blueprintBand({ p, pkg, Pascal }) {
  return `${utilityHeader({ p, pkg, Pascal })}
  return (
    <section id="cta-band" data-v2-component="${pkg}-utility-band" className="border-t-4 border-[var(--color-accent)] py-12" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto flex max-w-[82rem] items-center justify-between border-2 border-dashed border-[var(--color-accent)] px-5 py-6 sm:px-8">
        <h2 className="${p}-font-mono text-sm font-bold uppercase">{title}</h2>
        <a href="#contact" className="${p}-btn-primary">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function lawFormalBand({ p, pkg, Pascal }) {
  return splitCta({ p, pkg, Pascal });
}

function wellnessCalmBand({ p, pkg, Pascal }) {
  return clinicalBand({ p, pkg, Pascal });
}
