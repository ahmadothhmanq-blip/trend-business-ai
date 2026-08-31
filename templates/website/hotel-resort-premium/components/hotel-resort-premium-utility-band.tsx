"use client";

type HotelResortPremiumUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function HotelResortPremiumUtilityBand({
  eyebrow = "Next step",
  title = "Ready when you are",
  subtitle = "Tell us about your goals — we respond within one business day.",
  primaryCta = "Start a conversation",
  secondaryCta = "Explore capabilities",
}: HotelResortPremiumUtilityBandProps) {
  return (
    <section id="cta-band" data-v2-component="hotel-resort-premium-utility-band" className="hr-reveal hr-section !py-12 sm:!py-16">
      <div className="hr-container">
        <div className="hr-cta-strip">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 className="hr-headline-sm mt-3">{title}</h2>
          {subtitle ? <p className="hr-body-sm mx-auto mt-3 max-w-md">{subtitle}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#contact" className="hr-btn-primary hr-focus-ring">
              {primaryCta}
            </a>
            <a href="#capabilities" className="hr-btn-secondary hr-focus-ring">
              {secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
