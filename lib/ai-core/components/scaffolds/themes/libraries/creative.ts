/**
 * Creative theme component scaffolds — agency portfolio identity.
 * Expressive asymmetry, mix-blend overlay nav, fullscreen cinematic hero,
 * horizontal filmstrip gallery, case study rows, dark footer.
 */

export const CREATIVE_SCAFFOLDS: Record<string, string> = {
  ThemeCreativeNav: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#gallery", label: "Work" },
  { href: "#cases", label: "Cases" },
  { href: "#story", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

type ThemeCreativeNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeCreativeNav({
  brandName = "Atelier",
  ctaLabel = "Start a project",
  links = DEFAULT_LINKS,
}: ThemeCreativeNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header data-theme-scaffold="nav" className="pointer-events-none fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="mx-auto flex max-w-[88rem] items-start justify-between px-6 py-7 sm:px-10 lg:px-14">
          <a
            href="/"
            className="pointer-events-auto text-[11px] font-semibold uppercase tracking-[0.38em] text-white"
          >
            {brandName}
          </a>
          <nav className="pointer-events-auto hidden items-center gap-10 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[10px] uppercase tracking-[0.26em] text-white/90 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="pointer-events-auto flex items-center gap-6">
            <a
              href="#contact"
              className="hidden text-[10px] uppercase tracking-[0.24em] text-white/80 transition hover:text-white sm:inline-flex"
            >
              {ctaLabel}
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex flex-col gap-1.5 text-white md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <span className={["block h-px w-7 bg-white transition", open ? "translate-y-[7px] rotate-45" : ""].join(" ")} />
              <span className={["block h-px w-5 bg-white transition", open ? "opacity-0" : ""].join(" ")} />
              <span className={["block h-px w-7 bg-white transition", open ? "-translate-y-[7px] -rotate-45" : ""].join(" ")} />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-black px-6 py-10 text-white sm:px-10">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.38em]">{brandName}</p>
            <button
              type="button"
              aria-label="Close menu"
              className="text-xs uppercase tracking-[0.24em]"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]"
                onClick={() => setOpen(false)}
              >
                <span className="mr-4 text-[10px] font-normal uppercase tracking-[0.32em] text-white/35">
                  0{i + 1}
                </span>
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="inline-flex w-fit border border-white/30 px-6 py-3 text-[10px] uppercase tracking-[0.28em]"
            onClick={() => setOpen(false)}
          >
            {ctaLabel}
          </a>
        </div>
      ) : null}
    </>
  );
}
`,

  ThemeCreativeHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

type ThemeCreativeHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
};

export function ThemeCreativeHero({
  title = "We craft brands that refuse to blend in",
  subtitle = "A creative agency for founders who want cinematic presence — strategy, identity, and launch campaigns built for attention.",
  eyebrow = "Creative agency · Portfolio",
  primaryCta = "View selected work",
  secondaryCta = "Watch reel",
  imageUrl,
  layoutMode = "cinematic",
}: ThemeCreativeHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const cinematic = layoutMode === "cinematic" || layoutMode === "fullscreen";

  if (cinematic) {
    return (
      <section data-theme-scaffold="hero" className="relative min-h-[100svh] overflow-hidden bg-black text-white">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover object-[center_35%] opacity-60"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,color-mix(in_srgb,var(--color-primary)_22%,transparent),transparent),linear-gradient(to_top,black,transparent_55%)]"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 top-1/4 w-[42%] bg-gradient-to-r from-[var(--color-primary)]/18 to-transparent blur-3xl"
        />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-20 pt-40 sm:px-10 sm:pb-28 lg:px-14">
          <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.42fr)] lg:items-end lg:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-white/55">{eyebrow}</p>
              <h1 className="mt-8 max-w-[12ch] font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(3.25rem,10vw,7.25rem)] font-semibold leading-[0.86] tracking-[-0.05em]">
                {title}
              </h1>
            </div>
            <div className="lg:pb-3">
              <p className="max-w-sm text-[15px] leading-[2] text-white/68">{subtitle}</p>
              <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-8">
                <a
                  href="#gallery"
                  className="inline-flex border border-white/35 px-7 py-3.5 text-[10px] uppercase tracking-[0.28em] transition hover:border-white hover:bg-white/5"
                >
                  {primaryCta}
                </a>
                <a
                  href="#reel"
                  className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/55 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-[10px]">
                    ▶
                  </span>
                  {secondaryCta}
                </a>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-20 flex w-full max-w-[88rem] items-end justify-between gap-6 border-t border-white/10 pt-8 text-[10px] uppercase tracking-[0.28em] text-white/40">
            <span>Scroll to explore</span>
            <span className="hidden sm:inline">Selected frames · 2026</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-theme-scaffold="hero" className="relative min-h-[96svh] overflow-hidden bg-[var(--color-background)]">
      <div className="mx-auto grid min-h-[96svh] max-w-[88rem] lg:grid-cols-[0.48fr_0.52fr]">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-10 sm:py-28 lg:px-14 lg:py-32">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--color-foreground)]/45">{eyebrow}</p>
          <h1 className="mt-8 max-w-[14ch] font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-10 max-w-md text-[15px] leading-[1.95] text-[var(--color-foreground)]/58">{subtitle}</p>
          <div className="mt-14 flex flex-wrap items-center gap-6">
            <a
              href="#gallery"
              className="inline-flex border border-[var(--color-foreground)]/25 px-7 py-3.5 text-[10px] uppercase tracking-[0.28em] transition hover:border-[var(--color-foreground)]"
            >
              {primaryCta}
            </a>
            <a
              href="#reel"
              className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-foreground)]/45 transition hover:text-[var(--color-foreground)]"
            >
              {secondaryCta}
            </a>
          </div>
        </div>
        <div className="relative min-h-[44svh] lg:min-h-[96svh]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1.6s] ease-out hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--color-foreground)]/[0.05]" />
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-[var(--color-background)] to-transparent lg:block" />
        </div>
      </div>
    </section>
  );
}
`,

  ThemeCreativeGallery: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

const DEFAULT_ITEMS = [
  { title: "Neon Drift", category: "Brand film" },
  { title: "Static Bloom", category: "Campaign" },
  { title: "Afterglow", category: "Identity" },
  { title: "Signal No. 7", category: "Launch" },
  { title: "Paper Sun", category: "Editorial" },
];

type ThemeCreativeGalleryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; category?: string }>;
};

export function ThemeCreativeGallery({
  eyebrow = "Gallery",
  title = "Selected frames",
  subtitle = "A horizontal filmstrip of recent launches — drag, scroll, and immerse.",
  items = DEFAULT_ITEMS,
}: ThemeCreativeGalleryProps) {
  return (
    <SectionShell id="gallery" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="gallery" className="-mx-6 sm:-mx-10 lg:-mx-14">
        <div className="flex gap-4 overflow-x-auto px-6 pb-2 pt-1 snap-x snap-mandatory scroll-px-6 sm:gap-5 sm:px-10 sm:scroll-px-10 lg:gap-6 lg:px-14 lg:scroll-px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => {
            const src = resolveSiteImage(
              GALLERY_IMAGES[index] || SECTION_IMAGES[index] || HERO_IMAGE,
              index,
            );
            const offset = index % 3 === 1 ? "lg:mt-16" : index % 3 === 2 ? "lg:mt-8" : "";
            return (
              <figure
                key={item.title}
                className={[
                  "group relative shrink-0 snap-start overflow-hidden bg-[var(--color-surface)]",
                  "w-[82vw] sm:w-[58vw] lg:w-[42vw]",
                  offset,
                ].join(" ")}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--color-foreground)]/[0.06]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <figcaption className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
                    <div>
                      {item.category ? (
                        <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/55">
                          {item.category}
                        </p>
                      ) : null}
                      <p className="mt-2 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.35rem,2.4vw,2rem)] font-semibold tracking-[-0.03em]">
                        {item.title}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                      0{index + 1}
                    </span>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-between px-6 sm:px-10 lg:px-14">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-foreground)]/40">
            Horizontal filmstrip
          </p>
          <a
            href="#cases"
            className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-accent,var(--color-primary))]"
          >
            View case studies →
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeCreativeCases: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

const DEFAULT_CASES = [
  {
    client: "Aperture",
    result: "+240% engagement",
    summary: "Global rebrand and launch film for a culture-first camera collective.",
    discipline: "Brand · Film",
  },
  {
    client: "Lumen",
    result: "Global launch",
    summary: "Identity system and campaign architecture for a climate-tech platform.",
    discipline: "Identity · Campaign",
  },
  {
    client: "North & Co.",
    result: "3× inbound leads",
    summary: "Portfolio site and narrative redesign for a boutique architecture studio.",
    discipline: "Web · Story",
  },
];

type ThemeCreativeCasesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cases?: Array<{ client: string; result: string; summary?: string; discipline?: string }>;
};

export function ThemeCreativeCases({
  eyebrow = "Cases",
  title = "Recent wins",
  subtitle = "Cinematic case rows — outcome-first storytelling with expressive asymmetry.",
  cases = DEFAULT_CASES,
}: ThemeCreativeCasesProps) {
  return (
    <SectionShell id="cases" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="divide-y divide-[var(--color-foreground)]/10">
        {cases.map((c, index) => {
          const src = resolveSiteImage(
            SECTION_IMAGES[index] || GALLERY_IMAGES[index] || HERO_IMAGE,
            index,
          );
          const reversed = index % 2 === 1;
          return (
            <article
              key={c.client}
              className={[
                "grid gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-10",
                reversed ? "lg:[direction:rtl]" : "",
              ].join(" ")}
            >
              <div className="relative overflow-hidden lg:col-span-7 lg:[direction:ltr]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={c.client}
                    className={[
                      "aspect-[16/11] w-full object-cover",
                      reversed ? "lg:translate-x-6" : "lg:-translate-x-4",
                    ].join(" ")}
                  />
                ) : (
                  <div className="aspect-[16/11] w-full bg-[var(--color-foreground)]/[0.05]" />
                )}
                <div
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-y-8 w-px bg-[var(--color-accent,var(--color-primary))]/60",
                    reversed ? "right-0 hidden lg:block" : "left-0 hidden lg:block",
                  ].join(" ")}
                />
              </div>
              <div className="lg:col-span-5 lg:[direction:ltr]">
                {c.discipline ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent,var(--color-primary))]">
                    {c.discipline}
                  </p>
                ) : null}
                <h3 className="mt-4 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
                  {c.client}
                </h3>
                {c.summary ? (
                  <p className="mt-5 max-w-md text-sm leading-[1.9] text-[var(--color-foreground)]/55">
                    {c.summary}
                  </p>
                ) : null}
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]">
                  {c.result}
                </p>
                <a
                  href="#contact"
                  className="mt-6 inline-flex text-[10px] uppercase tracking-[0.24em] text-[var(--color-foreground)]/45 transition hover:text-[var(--color-foreground)]"
                >
                  Read case study →
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  ThemeCreativeStory: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

const DEFAULT_ITEMS = [
  {
    title: "Vision",
    body: "We partner with brands ready to be seen — not optimized into sameness. Every engagement begins with a point of view, not a mood board.",
  },
  {
    title: "Process",
    body: "Strategy, design, and production under one roof. Fewer handoffs, sharper narratives, and launches that feel authored rather than assembled.",
  },
  {
    title: "Craft",
    body: "Typography, motion, and image direction treated as one language. The details are where audiences decide whether you are memorable.",
  },
];

type ThemeCreativeStoryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; body: string }>;
};

export function ThemeCreativeStory({
  eyebrow = "Story",
  title = "Behind the lens",
  subtitle = "Studio philosophy in an asymmetric editorial rhythm.",
  items = DEFAULT_ITEMS,
}: ThemeCreativeStoryProps) {
  const portrait = resolveSiteImage(SECTION_IMAGES[0] || GALLERY_IMAGES[1] || HERO_IMAGE, 0);
  const detail = resolveSiteImage(GALLERY_IMAGES[2] || SECTION_IMAGES[1] || HERO_IMAGE, 1);

  return (
    <SectionShell id="story" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-16 lg:grid-cols-[minmax(0,0.34fr)_1fr] lg:gap-20 xl:gap-28">
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portrait}
              alt=""
              className="aspect-[3/4] w-full object-cover lg:translate-x-4"
            />
          ) : (
            <div className="aspect-[3/4] w-full bg-[var(--color-foreground)]/[0.05] lg:translate-x-4" />
          )}
          {detail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={detail}
              alt=""
              className="aspect-[16/10] w-[88%] object-cover opacity-90 lg:-translate-x-2"
            />
          ) : null}
          <p className="max-w-[12rem] text-[10px] uppercase tracking-[0.3em] text-[var(--color-foreground)]/38">
            Est. 2016 · Global studio
          </p>
        </aside>

        <div className="space-y-16 lg:py-4">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={[
                "relative border-l border-[var(--color-foreground)]/10 pl-8 sm:pl-10",
                index === 1 ? "lg:ml-12" : index === 2 ? "lg:ml-6" : "",
              ].join(" ")}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--color-accent,var(--color-primary))]">
                0{index + 1}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                {item.title}
              </h3>
              <p className="mt-5 max-w-2xl text-sm leading-[1.95] text-[var(--color-foreground)]/55">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeCreativeCta: `import { SectionShell } from "@/components/ui/section-shell";

type ThemeCreativeCtaProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function ThemeCreativeCta({
  eyebrow = "Collaborate",
  title = "Start a project",
  subtitle = "Tell us about the launch, rebrand, or campaign you need to make unforgettable.",
  primaryCta = "Book a call",
  secondaryCta = "Download deck",
}: ThemeCreativeCtaProps) {
  return (
    <SectionShell id="cta" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="cta" className="relative overflow-hidden bg-[var(--color-foreground)] px-8 py-16 text-[var(--color-background)] sm:px-12 sm:py-20 lg:px-16 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_28%,transparent),transparent_65%)]"
        />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] opacity-60">{eyebrow}</p>
            <h3 className="mt-5 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
              {title}
            </h3>
            <p className="mt-5 max-w-lg text-sm leading-[1.9] opacity-75">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-end">
            <a
              href="#contact"
              className="inline-flex justify-center border border-current px-8 py-3.5 text-[10px] uppercase tracking-[0.28em] transition hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]"
            >
              {primaryCta}
            </a>
            <a
              href="#gallery"
              className="inline-flex justify-center px-2 py-3.5 text-[10px] uppercase tracking-[0.24em] opacity-55 transition hover:opacity-100"
            >
              {secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeCreativeFooter: `type ThemeCreativeFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeCreativeFooter({
  brandName = "Atelier",
  tagline = "Creative agency for brands that demand a point of view.",
  links = [
    { href: "#gallery", label: "Work" },
    { href: "#cases", label: "Cases" },
    { href: "#story", label: "Studio" },
    { href: "#contact", label: "Contact" },
  ],
}: ThemeCreativeFooterProps) {
  return (
    <footer data-theme-scaffold="footer" className="bg-black text-white">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-14 lg:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em]">{brandName}</p>
          <p className="mt-6 max-w-md text-sm leading-[1.95] text-white/52">{tagline}</p>
          <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-white/30">
            Available worldwide · Remote-first studio
          </p>
        </div>
        <div className="flex flex-col justify-between gap-10 lg:items-end lg:text-right">
          <nav className="flex flex-col gap-4 lg:items-end">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.5rem,2.5vw,2rem)] font-semibold tracking-[-0.03em] text-white/75 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/28">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
`,
};
