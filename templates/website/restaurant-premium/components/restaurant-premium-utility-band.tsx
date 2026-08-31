"use client";

type RestaurantPremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function RestaurantPremiumUtilityBand({
  eyebrow = "Next step",
  title = "Ready to move forward?",
  subtitle = "Schedule a conversation with our team.",
  primaryCta = "Speak with us",
  secondaryCta = "View capabilities",
}: RestaurantPremiumUtilityBandProps) {
  return (
    <section id="cta-band" data-v2-component="restaurant-premium-utility-band" className="rp-reveal rp-cta-band">
      <div className="rp-shell rp-cta-band-inner">
        <div>
          {eyebrow ? <p className="rp-kicker rp-kicker--on-dark">{eyebrow}</p> : null}
          <h2 className="rp-h2 rp-h2--on-dark">{title}</h2>
          {subtitle ? <p className="rp-cta-sub">{subtitle}</p> : null}
        </div>
        <div className="rp-cta-band-actions">
          <a href="#contact" className="rp-btn-light rp-focus-ring">
            {primaryCta}
          </a>
          <a href="#features" className="rp-btn-ghost-light rp-focus-ring">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
