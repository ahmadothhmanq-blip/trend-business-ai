"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { hasSlotImage } from "@/lib/website/template-v2/slots/slot-layout";

const DEFAULT_HIGHLIGHTS = [
  "Senior practitioners with global delivery experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type RestaurantPremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function RestaurantPremiumAbout({
  eyebrow = "About",
  title = "A partner built for global ambition",
  body = "We work with leadership teams that expect clarity, discretion, and results. From strategy through delivery, every engagement is designed to stand up to international standards.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the firm",
}: RestaurantPremiumAboutProps) {
  const hasAboutVisual = hasSlotImage("about", 0, imageUrl);

  return (
    <section id="about" data-v2-component="restaurant-premium-about" className="rp-reveal rp-section">
      <div className={`rp-shell rp-about-grid ${hasAboutVisual ? "has-media" : ""}`}>
        {hasAboutVisual ? (
          <figure className="rp-about-media rp-split-left">
            <SlotImage slot="about" index={0} preferred={imageUrl} alt="" className="rp-about-img" />
          </figure>
        ) : null}
        <div className="rp-split-right">
          {eyebrow ? <p className="rp-kicker">{eyebrow}</p> : null}
          <h2 className="rp-h2">{title}</h2>
          <div className="rp-accent-rule" aria-hidden />
          <p className="rp-body rp-about-body">{body}</p>
          {highlights.length ? (
            <ul className="rp-checklist">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : null}
          <a href="#contact" className="rp-btn-ghost rp-focus-ring rp-about-cta">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
