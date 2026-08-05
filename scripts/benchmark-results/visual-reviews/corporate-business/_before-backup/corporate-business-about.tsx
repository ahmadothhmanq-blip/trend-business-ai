"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function CorporateBusinessAbout({
  eyebrow = "About Meridian",
  title = "Trusted leadership for complex organizations",
  subtitle = "Four decades of board-level counsel",
  body = "For over twenty years we have partnered with global enterprises to deliver strategy, transformation, and measurable outcomes — with integrity at the center of every engagement.",
  imageUrl,
  highlights = [
    "Fortune 500 advisory experience across financial services and industrials",
    "Offices across North America, Europe, and MENA with local partner coverage",
    "ISO-certified governance frameworks and independent ethics review",
  ],
  primaryCta = "Speak with an advisor",
}: Props) {
  return (
    <section
      id="about"
      data-v2-component="corporate-business-about"
      aria-labelledby="cb-about-title"
      className="cb-section"
    >
      <div className="cb-container">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="relative lg:col-span-6">
            <div
              className="absolute -start-4 -top-4 h-24 w-24 border border-[var(--border-accent)]/50"
              aria-hidden
            />
            <div className="cb-hero-frame relative aspect-[4/5] max-w-md">
              <SlotImage
                slot="about"
                index={0}
                preferred={imageUrl}
                alt="Meridian Advisory leadership team"
                className="h-full w-full object-cover object-center saturate-[0.9]"
                loading="lazy"
              />
            </div>
            <div className="cb-card-glass absolute -bottom-6 -end-4 max-w-[14rem] px-5 py-4 sm:-end-8">
              <p className="cb-metric text-3xl">40yr</p>
              <p className="cb-metric-label mt-1">Combined partner tenure</p>
            </div>
          </div>

          <div className="lg:col-span-6 lg:ps-8">
            <p className="cb-eyebrow mb-6">{eyebrow}</p>
            <p className="cb-font-body mb-4 text-sm text-[var(--color-signal)]">{subtitle}</p>
            <h2 id="cb-about-title" className="cb-headline-sm max-w-[16ch]">
              {title}
            </h2>
            <div className="cb-accent-line mt-8" aria-hidden />
            <p className="cb-prose mt-8">{body}</p>

            <ul className="mt-10 space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex gap-4">
                  <span
                    className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_12%,transparent)] text-[0.625rem] text-[var(--color-signal)]"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="cb-font-body text-sm leading-relaxed text-[var(--color-foreground)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <a href="#contact" className="cb-btn-primary cb-focus-ring mt-12 inline-flex">
              {primaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
