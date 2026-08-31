"use client";

const DEFAULT_MILESTONES = [
  { year: "1892", event: "Founded in London as a chambers for commercial litigation" },
  { year: "1968", event: "Expanded to Washington and New York — transatlantic practice" },
  { year: "2001", event: "Merged with leading regulatory boutique — full-service institutional model" },
  { year: "Today", event: "1,200+ lawyers across 42 jurisdictions" },
];

type CitadelTrustAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
  milestones?: Array<{ year: string; event: string }>;
};

export function CitadelTrustAbout({
  eyebrow = "Firm record",
  title = "A legacy of institutional counsel",
  subtitle,
  body = "For over a century, Citadel has advised governments, Fortune 100 boards, and sovereign institutions on matters that shape markets and public policy.",
  imageUrl,
  highlights,
  primaryCta = "Request consultation",
  milestones = DEFAULT_MILESTONES,
}: CitadelTrustAboutProps) {
  const timeline = highlights?.length
    ? highlights.map((event, i) => ({ year: `0${i + 1}`, event }))
    : milestones;

  return (
    <section
      id="about"
      data-v2-component="citadel-trust-about"
      aria-labelledby="ct-about-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="ct-doc">
          <p className="ct-doc-ribbon">
            <span className="ct-doc-seal-mark" aria-hidden />
            Historical record
          </p>
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-about-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          {subtitle ? <p className="ct-body mt-4">{subtitle}</p> : null}
          <p className="ct-body mt-4">{body}</p>

          {imageUrl ? (
            <figure className="mt-8 border border-[var(--border-default)]">
              <img src={imageUrl} alt="" className="h-auto w-full object-cover" />
            </figure>
          ) : null}

          <ol className="ct-reveal-stagger mt-8 space-y-5 border-s border-[var(--border-subtle)] ps-6">
            {timeline.map((item) => (
              <li key={`${item.year}-${item.event}`} className="relative">
                <span className="absolute -start-[1.625rem] top-1.5 h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden />
                <p className="ct-font-mono text-sm text-[var(--color-accent)]">{item.year}</p>
                <p className="ct-body mt-1 text-sm">{item.event}</p>
              </li>
            ))}
          </ol>

          <a href="#contact" className="ct-btn-primary ct-focus-ring mt-8 inline-flex">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
