"use client";

const SPEC_ANNOTATIONS = [
  { ref: "A-01", label: "Supply chain module", note: "Primary ingress" },
  { ref: "B-02", label: "Asset telemetry", note: "Sensor bus" },
  { ref: "C-03", label: "Field dispatch", note: "Ops spine" },
  { ref: "D-04", label: "Compliance layer", note: "Audit envelope" },
];

type ForgeIndustrialHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  figureLabel?: string;
  scaleNote?: string;
};

export function ForgeIndustrialHero({
  title = "Engineering resilience into global operations",
  subtitle = "Supply chain orchestration, asset intelligence, and field service networks — built for manufacturers who cannot afford downtime.",
  eyebrow = "Industrial systems partner",
  primaryCta = "Request assessment",
  secondaryCta = "Open figure set",
  imageUrl = null,
  figureLabel = "FIG. 01 — HERO ASSEMBLY",
  scaleNote = "SCALE 1:1 · SHEET A",
}: ForgeIndustrialHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="forge-industrial-hero"
      aria-labelledby="fg-hero-title"
      className="fg-grid-paper fg-section"
    >
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="fg-frame">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[var(--color-accent)] pb-3">
            <p className="fg-fig-label">{figureLabel}</p>
            <p className="fg-font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {scaleNote}
            </p>
          </div>

          <p className="fg-eyebrow mt-6">{eyebrow}</p>
          <h1 id="fg-hero-title" className="fg-headline mt-3 max-w-[18ch]">
            {title}
          </h1>
          <p className="fg-body mt-5 max-w-2xl">{subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="fg-btn-primary fg-focus-ring">
              {primaryCta}
            </a>
            <a href="#features" className="fg-btn-secondary fg-focus-ring">
              {secondaryCta}
            </a>
          </div>

          {imageUrl ? (
            <figure className="mt-10 border border-[var(--border-default)] bg-[var(--color-surface)]">
              <img src={imageUrl} alt="" className="h-auto w-full object-cover" />
              <figcaption className="fg-font-mono border-t border-dashed border-[var(--border-default)] px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
                Ref plate · systems overview
              </figcaption>
            </figure>
          ) : null}

          <ul className="fg-reveal-stagger mt-10 grid gap-3 sm:grid-cols-2" aria-label="Assembly callouts">
            {SPEC_ANNOTATIONS.map((spec) => (
              <li key={spec.ref} className="fg-callout">
                <span className="fg-callout-ref">{spec.ref}</span>
                <div>
                  <p className="fg-font-body text-sm font-semibold text-[var(--color-foreground)]">{spec.label}</p>
                  <p className="fg-font-mono mt-1 text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
                    {spec.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
