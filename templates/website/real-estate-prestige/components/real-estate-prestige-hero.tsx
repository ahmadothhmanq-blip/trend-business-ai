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

type RealEstatePrestigeHeroProps = {
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

export function RealEstatePrestigeHero({
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
}: RealEstatePrestigeHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const strip = badges?.filter(Boolean) ?? [];
  const showHighlight = Boolean(highlightTitle || highlightDetails?.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 14;
      const y = (event.clientY / window.innerHeight - 0.5) * 10;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(${x * 0.35}px, ${y * 0.25}px, 0)`;
      }
      if (panelRef.current) {
        panelRef.current.style.transform = `translate3d(${x * -0.55}px, ${y * -0.4}px, 0)`;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      data-v2-component="real-estate-prestige-hero"
      aria-labelledby="rep-hero-title"
      className="rep-hero rep-grain relative min-h-[100svh] overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[color-mix(in_srgb,var(--color-background)_50%,transparent)] to-transparent"
        aria-hidden
      />
      <div className="rep-container relative w-full pb-20 pt-32 sm:pb-28">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div ref={contentRef} className="rep-hero-parallax rep-fade-up min-w-0">
            <p className="rep-eyebrow">{eyebrow}</p>
            <div className="rep-brass-rule mt-5" aria-hidden />
            <h1 id="rep-hero-title" className="rep-display mt-8 max-w-[18ch] text-balance">
              {title}
            </h1>
            <p className="rep-lead mt-8 max-w-xl">{subtitle}</p>
            <div className="mt-12 flex flex-wrap gap-4">
              <a href="#contact" className="rep-btn-primary rep-focus-ring">
                {primaryCta}
              </a>
              <a href="#features" className="rep-btn-secondary rep-focus-ring">
                {secondaryCta}
              </a>
            </div>
          </div>
          {showHighlight ? (
            <aside
              ref={panelRef}
              className="rep-panel rep-hero-parallax-panel rep-fade-up-delay rounded-[var(--radius-lg)] p-6 sm:p-8"
            >
              <p className="rep-label">{highlightLabel}</p>
              {highlightTitle ? <p className="rep-title-lg mt-4">{highlightTitle}</p> : null}
              {highlightDetails?.length ? (
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  {highlightDetails.map((row) => (
                    <div key={row.label}>
                      <dt className="rep-caption">{row.label}</dt>
                      <dd className="rep-body-sm mt-1 font-medium text-[var(--color-foreground)]">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </aside>
          ) : null}
        </div>
        {strip.length ? (
          <div className="mx-auto mt-16 flex max-w-[88rem] flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--border-subtle)] pt-10">
            <span className="rep-label me-2">Highlights</span>
            {strip.map((badge, index) => (
              <span key={badge} className="inline-flex items-center gap-6">
                {index > 0 ? <span className="text-[var(--color-brass)]/35" aria-hidden>·</span> : null}
                <span className="rep-body-sm text-[var(--color-foreground)]/80">{badge}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {imageUrl ? <img src={imageUrl} alt="" className="sr-only" aria-hidden /> : null}
    </section>
  );
}
