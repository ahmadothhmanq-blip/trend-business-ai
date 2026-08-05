"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const TRUST_BADGES = ["JCI Accredited", "Board Certified", "24/7 Care Line"];
const HERO_STATS = [
  { value: "40+", label: "Specialists" },
  { value: "98%", label: "Patient satisfaction" },
  { value: "48h", label: "Avg. appointment" },
];

type MedicalPremiumTrustHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function MedicalPremiumTrustHero({
  eyebrow = "Private healthcare network",
  title = "Exceptional care, delivered with calm precision",
  subtitle = "A world-class network of physicians, specialists, and care coordinators — united by a commitment to your wellbeing at every stage of life.",
  primaryCta = "Schedule a consultation",
  secondaryCta = "Find a physician",
  imageUrl,
}: MedicalPremiumTrustHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="medical-premium-trust-hero"
      aria-labelledby="mp-hero-title"
      className="relative overflow-hidden bg-[var(--color-background)]"
    >
      <div className="mp-grain absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background)] via-[var(--color-surface)]/60 to-[var(--color-sage)]/30" />
      </div>

      <div className="relative mx-auto grid max-w-[76rem] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
        <div>
          <div className="flex flex-wrap gap-2 motion-safe:animate-[mp-clinical-fade_0.85s_ease_both]">
            {TRUST_BADGES.map((badge) => (
              <span key={badge} className="mp-trust-badge">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-healing)]" aria-hidden />
                {badge}
              </span>
            ))}
          </div>

          <p className="mp-eyebrow mt-8 mb-4 motion-safe:animate-[mp-gentle-rise_0.75s_ease_0.08s_both]">
            {eyebrow}
          </p>
          <div
            className="mp-sage-rule mb-6 motion-safe:animate-[mp-draw-sage_0.7s_ease_0.12s_both]"
            aria-hidden
          />
          <h1
            id="mp-hero-title"
            className="mp-headline max-w-xl motion-safe:animate-[mp-clinical-fade_0.9s_ease_0.15s_both]"
          >
            {title}
          </h1>
          <p className="mp-body text-muted-foreground mt-6 max-w-lg text-base leading-relaxed motion-safe:animate-[mp-gentle-rise_0.85s_ease_0.25s_both]">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 motion-safe:animate-[mp-gentle-rise_0.85s_ease_0.35s_both]">
            <a href="#appointments" className="mp-btn-primary mp-focus-ring">
              {primaryCta}
            </a>
            <a href="#physicians" className="mp-btn-secondary mp-focus-ring">
              {secondaryCta}
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-[var(--border-subtle)] pt-8 motion-safe:animate-[mp-gentle-rise_0.9s_ease_0.45s_both]">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="mp-stat-value">{stat.value}</dt>
                <dd className="mp-font-body mt-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="relative motion-safe:animate-[mp-scale-in_0.95s_ease_0.2s_both]">
          <div className="absolute -inset-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)]" aria-hidden />
          <div className="mp-card relative overflow-hidden p-2">
            <SlotImage
              slot="hero"
              index={0}
              preferred={imageUrl}
              alt="Serene clinical care environment — modern healthcare facility"
              className="aspect-[4/5] w-full rounded-[calc(var(--radius-lg)-4px)] object-cover motion-safe:animate-[mp-ken-burns_12s_ease-out_both]"
              priority
            />
          </div>
          <figcaption className="mp-font-body mt-4 text-center text-xs tracking-wide text-muted-foreground">
            Serenity Clinical · Private suites &amp; on-site diagnostics
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
