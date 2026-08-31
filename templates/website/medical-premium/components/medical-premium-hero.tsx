"use client";

import { useEffect, useRef } from "react";

const DEFAULT_HERO = {
  eyebrow: "Welcome",
  title: "Build something remarkable",
  subtitle:
    "A clear story, strong offer, and thoughtful design — presented with craft and consistency for your audience.",
  primaryCta: "Get started",
  secondaryCta: "Learn more",
};

const DEFAULT_HIGHLIGHT = {
  highlightLabel: "At a glance",
  highlightTitle: "Engagement snapshot",
  highlightDetails: [
    { label: "Timeline", value: "4–8 weeks" },
    { label: "Team", value: "Dedicated lead" },
    { label: "Deliverables", value: "Scoped plan" },
    { label: "Support", value: "Included" },
  ],
};

const DEFAULT_BADGES = ["Strategy", "Design", "Delivery", "Support"];

type HeroHighlightDetail = { label: string; value: string };

type MedicalPremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  badges?: string[];
  highlightTitle?: string;
  highlightLabel?: string;
  highlightDetails?: HeroHighlightDetail[];
};

export function MedicalPremiumHero({
  title = DEFAULT_HERO.title,
  subtitle = DEFAULT_HERO.subtitle,
  eyebrow = DEFAULT_HERO.eyebrow,
  primaryCta = DEFAULT_HERO.primaryCta,
  secondaryCta = DEFAULT_HERO.secondaryCta,
  imageUrl = null,
  badges = DEFAULT_BADGES,
  highlightTitle = DEFAULT_HIGHLIGHT.highlightTitle,
  highlightLabel = DEFAULT_HIGHLIGHT.highlightLabel,
  highlightDetails = DEFAULT_HIGHLIGHT.highlightDetails,
}: MedicalPremiumHeroProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const strip = badges?.filter(Boolean) ?? [];
  const showHighlight = Boolean(highlightTitle || highlightDetails?.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(${x * 0.3}px, ${y * 0.2}px, 0)`;
      }
      if (panelRef.current) {
        panelRef.current.style.transform = `translate3d(${x * -0.4}px, ${y * -0.3}px, 0)`;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="top"
      data-v2-component="medical-premium-hero"
      aria-labelledby="mp-hero-title"
      className="mp-hero mp-grain relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--color-healing)_8%,transparent)] via-transparent to-[var(--color-background)]"
        aria-hidden
      />
      <div className="mp-container relative w-full pb-20 pt-28 sm:pb-28 sm:pt-32">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div ref={contentRef} className="mp-hero-parallax mp-fade-up min-w-0 text-center lg:text-start">
            <p className="mp-eyebrow">{eyebrow}</p>
            <span className="mp-sage-rule mx-auto mt-5 lg:mx-0" aria-hidden />
            <h1 id="mp-hero-title" className="mp-headline mt-8 max-w-[16ch] text-balance lg:max-w-[14ch]">
              {title}
            </h1>
            <p className="mp-lead mx-auto mt-8 max-w-xl lg:mx-0">{subtitle}</p>
            <div className="mt-12 flex flex-wrap justify-center gap-4 lg:justify-start">
              <a href="#contact" className="mp-btn-primary mp-focus-ring">
                {primaryCta}
              </a>
              <a href="#features" className="mp-btn-secondary mp-focus-ring">
                {secondaryCta}
              </a>
            </div>
            {strip.length ? (
              <div className="mt-10 flex flex-wrap justify-center gap-2 lg:justify-start">
                {strip.map((badge) => (
                  <span key={badge} className="mp-trust-badge">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {showHighlight ? (
            <aside ref={panelRef} className="mp-hero-parallax mp-fade-up-delay mp-panel p-6 sm:p-8">
              {highlightLabel ? <p className="mp-label">{highlightLabel}</p> : null}
              {highlightTitle ? <p className="mp-title-lg mt-3">{highlightTitle}</p> : null}
              {highlightDetails?.length ? (
                <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                  {highlightDetails.map((detail) => (
                    <div key={detail.label} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-background)] px-4 py-3">
                      <dt className="mp-caption">{detail.label}</dt>
                      <dd className="mp-metric mt-1 text-xl">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </aside>
          ) : imageUrl ? (
            <div className="mp-panel overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
