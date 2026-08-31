"use client";

type EducationPremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function EducationPremiumUtilityBand({
  eyebrow = "Next issue",
  title = "Reserve a seat at the seminar table",
  subtitle = "Request the prospectus or schedule a quiet campus walk with admissions.",
  primaryCta = "Write admissions",
  secondaryCta = "View programs",
}: EducationPremiumUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="education-premium-utility-band"
      aria-labelledby="ed-utility-title"
      className="ed-utility ed-paper ed-reveal"
    >
      <div className="ed-utility-inner">
        <div>
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-utility-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          <p className="ed-body">{subtitle}</p>
        </div>
        <div className="ed-utility-actions">
          <a href="#contact" className="ed-btn-primary ed-focus-ring">
            {primaryCta}
          </a>
          <a href="#pricing" className="ed-btn-secondary ed-focus-ring">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
