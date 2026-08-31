"use client";

type EcommercePremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function EcommercePremiumUtilityBand({
  eyebrow = "Next drop",
  title = "Join the runway list",
  subtitle = "Be first when archive editions open.",
  primaryCta = "Join list",
  secondaryCta = "Browse lookbook",
}: EcommercePremiumUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="ecommerce-premium-utility-band"
      aria-labelledby="ec-utility-title"
      className="ec-utility ec-reveal"
    >
      <div className="ec-utility-inner">
        <div>
          <p className="ec-eyebrow">{eyebrow}</p>
          <h2 id="ec-utility-title" className="ec-headline-sm ec-font-display">
            {title}
          </h2>
          <p className="ec-body">{subtitle}</p>
        </div>
        <div className="ec-utility-actions">
          <a href="#contact" className="ec-btn-primary ec-focus-ring">
            {primaryCta}
          </a>
          <a href="#features" className="ec-btn-secondary ec-focus-ring">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
