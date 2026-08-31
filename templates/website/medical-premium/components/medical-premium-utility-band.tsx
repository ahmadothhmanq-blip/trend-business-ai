"use client";

type MedicalPremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function MedicalPremiumUtilityBand({
  eyebrow = "Get started",
  title = "See it in action",
  subtitle = "Join organizations that chose excellence.",
  primaryCta = "Book a demo",
  secondaryCta = "Learn more",
}: MedicalPremiumUtilityBandProps) {
  return (
    <section id="cta-band" data-v2-component="medical-premium-utility-band" className="mp-reveal mp-section-band py-20 sm:py-28">
      <div className="mp-container">
        <div className="mp-panel mx-auto max-w-2xl p-10 text-center">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 className="mp-headline-sm mt-4">{title}</h2>
          {subtitle ? <p className="mp-body-sm mt-4">{subtitle}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#contact" className="mp-btn-primary mp-focus-ring">
              {primaryCta}
            </a>
            <a href="#features" className="mp-btn-secondary mp-focus-ring">
              {secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
