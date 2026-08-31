import { DEFAULT_ABOUT_HIGHLIGHTS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const ABOUT_GENERATORS = {
  "split-image-right": splitImageRight,
  "full-width-statement": fullWidthStatement,
  "timeline-story": timelineStory,
  "values-grid": valuesGrid,
  "editorial-columns": editorialColumns,
  "mission-centered": missionCentered,
  "hospitality-story": hospitalityStory,
  "chef-narrative": chefNarrative,
  "academic-heritage": academicHeritage,
  "brand-manifesto": brandManifesto,
  "saas-origin": saasOrigin,
  "studio-manifesto": studioManifesto,
  "estate-legacy": estateLegacy,
  "organic-story": organicStory,
  "aurora-narrative": auroraNarrative,
  "noir-minimal-about": noirMinimalAbout,
  "fintech-origin": fintechOrigin,
  "blueprint-specs": blueprintSpecs,
  "firm-history": firmHistory,
  "wellness-philosophy": wellnessPhilosophy,
};

export function generateAbout(entry, layoutKey) {
  const fn = ABOUT_GENERATORS[layoutKey] ?? splitImageRight;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function aboutHeader({ p, pkg, Pascal }) {
  return `"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_HIGHLIGHTS = ${JSON.stringify(DEFAULT_ABOUT_HIGHLIGHTS, null, 2)};

type ${Pascal}AboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function ${Pascal}About({
  eyebrow = "Our story",
  title = "Built for teams that compete globally",
  subtitle,
  body = "We started with a simple belief: world-class organizations deserve tools and partners that match their ambition. Today we help teams across industries deliver measurable outcomes.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the team",
}: ${Pascal}AboutProps) {`;
}

function splitImageRight({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" aria-labelledby="${p}-about-title" className="${p}-section py-20 sm:py-28 lg:py-24">
      <div className="mx-auto grid max-w-[82rem] items-center gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <div>
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-about-title" className="${p}-headline-sm mt-3">{title}</h2>
          {subtitle ? <p className="${p}-body mt-4 text-[var(--color-muted)]">{subtitle}</p> : null}
          <p className="${p}-body mt-6">{body}</p>
          <ul className="mt-8 space-y-3">{highlights.map((h) => <li key={h} className="flex gap-3 text-sm"><span className="text-[var(--color-accent)]">✓</span>{h}</li>)}</ul>
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring mt-10 inline-flex">{primaryCta}</a>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--color-surface)]">
          <SlotImage src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
`;
}

function fullWidthStatement({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="bg-[var(--color-primary)] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h2 className="${p}-display mt-6 text-4xl sm:text-6xl">{title}</h2>
        <p className="${p}-body mt-8 max-w-2xl text-[var(--color-muted)]">{body}</p>
        <a href="#contact" className="${p}-btn-volt mt-12 inline-flex">{primaryCta}</a>
      </div>
    </section>
  );
}
`;
}

function timelineStory({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="${p}-section-alt py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <ol className="relative mt-12 border-s-2 border-[var(--color-accent)] ps-8">
          {highlights.map((h, i) => (
            <li key={h} className="relative pb-10 last:pb-0">
              <span className="absolute -start-[2.35rem] flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-[var(--color-background)]">{i + 1}</span>
              <p className="font-medium">{h}</p>
            </li>
          ))}
        </ol>
        <p className="${p}-body mt-8">{body}</p>
      </div>
    </section>
  );
}
`;
}

function valuesGrid({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mt-4">{body}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((h) => (
            <div key={h} className="${p}-card p-6">
              <h3 className="font-bold">{h}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function editorialColumns({ p, pkg, Pascal }) {
  return splitImageRight({ p, pkg, Pascal }).replace(`lg:grid-cols-2`, `lg:grid-cols-[1.2fr_0.8fr]`);
}

function missionCentered({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="py-20 text-center">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h2 className="${p}-headline-sm mt-4">{title}</h2>
        <p className="${p}-body mx-auto mt-6">{body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {highlights.map((h) => <span key={h} className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-sm">{h}</span>)}
        </div>
      </div>
    </section>
  );
}
`;
}

function hospitalityStory({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="${p}-section-glow py-20">
      <div className="mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <div className="aspect-[3/4] rounded-3xl bg-[var(--color-surface)]" aria-hidden />
        <div className="flex flex-col justify-center">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 className="${p}-headline-sm mt-4">{title}</h2>
          <p className="${p}-body mt-6">{body}</p>
          <a href="#contact" className="${p}-btn-primary mt-8 inline-flex w-fit">{primaryCta}</a>
        </div>
      </div>
    </section>
  );
}
`;
}

function chefNarrative({ p, pkg, Pascal }) {
  return hospitalityStory({ p, pkg, Pascal });
}

function academicHeritage({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="border-y-4 border-[var(--color-accent)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 text-center sm:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-accent)] font-bold">A</div>
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mx-auto mt-6 max-w-2xl">{body}</p>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">{highlights.map((h) => <li key={h} className="text-sm font-medium">{h}</li>)}</ul>
      </div>
    </section>
  );
}
`;
}

function brandManifesto({ p, pkg, Pascal }) {
  return fullWidthStatement({ p, pkg, Pascal }).replace(`bg-[var(--color-primary)]`, `bg-[var(--color-background)]`);
}

function saasOrigin({ p, pkg, Pascal }) {
  return valuesGrid({ p, pkg, Pascal });
}

function studioManifesto({ p, pkg, Pascal }) {
  return fullWidthStatement({ p, pkg, Pascal });
}

function estateLegacy({ p, pkg, Pascal }) {
  return timelineStory({ p, pkg, Pascal });
}

function organicStory({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="p-6 sm:p-10">
      <div className="mx-auto max-w-[82rem] rounded-[2.5rem] border-4 border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] p-10 lg:p-16">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mt-6 max-w-2xl">{body}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">{highlights.map((h) => <li key={h} className="text-sm">{h}</li>)}</ul>
      </div>
    </section>
  );
}
`;
}

function auroraNarrative({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--color-accent),transparent_50%)] opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <p className="${p}-body mt-6">{body}</p>
      </div>
    </section>
  );
}
`;
}

function noirMinimalAbout({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="py-16 font-mono">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <p className="text-[var(--color-accent)]">&gt; {eyebrow}</p>
        <h2 className="mt-4 text-2xl font-bold">{title}</h2>
        <p className="mt-6 text-sm text-[var(--color-muted)]">{body}</p>
      </div>
    </section>
  );
}
`;
}

function fintechOrigin({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="bg-[#0a0f0a] py-12 font-mono text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p className="text-[#00ff88]/50">$ cat origin.md</p>
        <h2 className="mt-4 text-xl font-bold text-white">{title}</h2>
        <p className="mt-4 text-sm text-[#00ff88]/80">{body}</p>
      </div>
    </section>
  );
}
`;
}

function blueprintSpecs({ p, pkg, Pascal }) {
  return `${aboutHeader({ p, pkg, Pascal })}
  return (
    <section id="about" data-v2-component="${pkg}-about" className="py-16" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto max-w-[82rem] border-2 border-dashed border-[var(--color-accent)] px-5 py-10 sm:px-8">
        <p className="${p}-font-mono text-xs text-[var(--color-accent)]">SPEC: ORGANIZATION</p>
        <h2 className="${p}-headline-sm mt-4">{title}</h2>
        <p className="${p}-body mt-4 max-w-2xl">{body}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">{highlights.map((h, i) => <div key={h}><dt className="text-xs uppercase text-[var(--color-muted)]">Point {i + 1}</dt><dd className="mt-1 font-medium">{h}</dd></div>)}</dl>
      </div>
    </section>
  );
}
`;
}

function firmHistory({ p, pkg, Pascal }) {
  return editorialColumns({ p, pkg, Pascal });
}

function wellnessPhilosophy({ p, pkg, Pascal }) {
  return missionCentered({ p, pkg, Pascal });
}
