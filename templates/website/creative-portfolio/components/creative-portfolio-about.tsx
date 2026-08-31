"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type CreativePortfolioAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function CreativePortfolioAbout({
  eyebrow = "Colophon",
  title = "A studio for teams that compete on craft",
  subtitle,
  body = "We started with a simple belief: world-class organizations deserve partners who treat design as infrastructure. Today we ship brand systems, products, and campaigns that hold up under global scrutiny.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Start a project",
}: CreativePortfolioAboutProps) {
  return (
    <section id="about" data-v2-component="creative-portfolio-about" className="cp-colophon cp-reveal">
      <div className="cp-colophon-inner">
        <p className="cp-colophon-eyebrow">{eyebrow}</p>
        <h2 className="cp-colophon-title">{title}</h2>
        {subtitle ? <p className="cp-colophon-body">{subtitle}</p> : null}
        <p className="cp-colophon-body">{body}</p>
        <ul className="mt-8 space-y-3 border-t border-[var(--border-subtle)] pt-6">
          {highlights.map((h) => (
            <li key={h} className="cp-font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
              — {h}
            </li>
          ))}
        </ul>
        <a href="#contact" className="cp-btn-volt mt-10 inline-flex">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}
