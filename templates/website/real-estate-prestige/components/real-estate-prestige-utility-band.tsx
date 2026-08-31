"use client";

type RealEstatePrestigeUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function RealEstatePrestigeUtilityBand({
  eyebrow = "Next step",
  title = "Ready to move forward?",
  subtitle = "Speak with our team to scope your project and timeline.",
  primaryCta = "Get started",
  secondaryCta = "Learn more",
}: RealEstatePrestigeUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="real-estate-prestige-utility-band"
      aria-labelledby="rep-cta-title"
      className="rep-reveal rep-cta-band border-y border-[var(--border-subtle)] py-20 sm:py-28"
    >
      <div className="rep-container text-center">
        <header className="rep-section-header mx-auto max-w-2xl text-center">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-cta-title" className="rep-headline-sm text-balance">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
        </header>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href="#contact" className="rep-btn-primary rep-focus-ring">
            {primaryCta}
          </a>
          <a href="#features" className="rep-btn-secondary rep-focus-ring">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
