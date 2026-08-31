"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { hasSlotImage } from "@/lib/website/template-v2/slots/slot-layout";

type RestaurantPremiumHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  badge?: string;
};

export function RestaurantPremiumHero({
  eyebrow = "Global advisory",
  title = "Clarity and craft for organizations that lead",
  subtitle = "We partner with ambitious teams worldwide to design presence, deliver outcomes, and build lasting trust.",
  primaryCta = "Speak with us",
  secondaryCta = "Explore capabilities",
  imageUrl,
  badge = "Trusted across 40+ markets",
}: RestaurantPremiumHeroProps) {
  const hasHeroVisual = hasSlotImage("hero", 0, imageUrl);

  return (
    <section id="top" data-v2-component="restaurant-premium-hero" aria-labelledby="rp-hero-title" className="rp-hero">
      <div className="rp-hero-glow" aria-hidden />
      <div className={`rp-shell rp-hero-grid ${hasHeroVisual ? "" : "rp-hero-grid--solo"}`}>
        <div className="rp-hero-stagger">
          {eyebrow ? <p className="rp-kicker rp-hero-item">{eyebrow}</p> : null}
          <h1 id="rp-hero-title" className="rp-display rp-hero-item">
            {title}
          </h1>
          <div className="rp-accent-rule rp-hero-item" aria-hidden />
          <p className="rp-lead rp-hero-item">{subtitle}</p>
          <div className="rp-hero-cta rp-hero-item">
            <a href="#contact" className="rp-btn-primary rp-focus-ring">
              {primaryCta}
            </a>
            <a href="#features" className="rp-btn-ghost rp-focus-ring">
              {secondaryCta}
            </a>
          </div>
          {badge ? <p className="rp-trust-line rp-hero-item">{badge}</p> : null}
        </div>
        {hasHeroVisual ? (
          <figure className="rp-hero-media rp-hero-media-enter">
            <SlotImage slot="hero" index={0} preferred={imageUrl} alt="" className="rp-hero-img" priority />
            <span className="rp-hero-frame" aria-hidden />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
