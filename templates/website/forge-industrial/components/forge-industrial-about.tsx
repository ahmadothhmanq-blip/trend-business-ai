"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type ForgeIndustrialAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
  figureLabel?: string;
};

export function ForgeIndustrialAbout({
  eyebrow = "Organization spec",
  title = "Built for teams that compete globally",
  subtitle,
  body = "We started with a simple belief: world-class organizations deserve tools and partners that match their ambition. Today we help teams across industries deliver measurable outcomes.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Request org sheet",
  figureLabel = "FIG. 09 — ORGANIZATION",
}: ForgeIndustrialAboutProps) {
  return (
    <section
      id="about"
      data-v2-component="forge-industrial-about"
      aria-labelledby="fg-about-title"
      className="fg-grid-paper fg-section fg-reveal"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">{figureLabel}</p>
          <p className="fg-eyebrow mt-4">{eyebrow}</p>
          <h2 id="fg-about-title" className="fg-headline-sm mt-2 max-w-[20ch]">
            {title}
          </h2>
          {subtitle ? <p className="fg-body mt-3 max-w-2xl">{subtitle}</p> : null}
          <p className="fg-body mt-4 max-w-2xl">{body}</p>

          {imageUrl ? (
            <figure className="mt-8 border border-[var(--border-default)]">
              <img src={imageUrl} alt="" className="h-auto w-full object-cover" />
              <figcaption className="fg-font-mono border-t border-dashed border-[var(--border-default)] px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
                Org plate
              </figcaption>
            </figure>
          ) : null}

          <dl className="fg-reveal-stagger mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item, index) => (
              <div key={item} className="border border-dashed border-[var(--border-default)] p-4">
                <dt className="fg-font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                  Spec {String(index + 1).padStart(2, "0")}
                </dt>
                <dd className="fg-font-body mt-2 text-sm font-medium text-[var(--color-foreground)]">{item}</dd>
              </div>
            ))}
          </dl>

          <a href="#contact" className="fg-btn-secondary fg-focus-ring mt-8 inline-flex">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
