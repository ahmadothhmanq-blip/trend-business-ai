"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const HIGHLIGHTS = [
  { label: "Artisan makers", value: "48+" },
  { label: "Limited editions", value: "Weekly" },
  { label: "Concierge delivery", value: "48h" },
];

type EcommercePremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function EcommercePremiumHero({
  title = "Objects of lasting value, curated with intention",
  subtitle = "Editorial product discovery for discerning collectors — limited-run pieces, artisan craftsmanship, and seamless checkout.",
  eyebrow = "Atelier Commerce · SS26",
  primaryCta = "Shop collection",
  secondaryCta = "Our story",
  imageUrl,
}: EcommercePremiumHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="ecommerce-premium-hero"
      aria-labelledby="ec-hero-title"
      className="ec-section relative overflow-hidden bg-[var(--color-background)] py-0 lg:py-0"
    >
      <div className="ec-grain absolute inset-0 pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid min-h-[88svh] items-end gap-10 pb-16 pt-28 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-32">
          <div className="max-w-xl motion-safe:animate-[ec-editorial-reveal_1s_cubic-bezier(0.22,1,0.36,1)_0.1s_both]">
            <p className="ec-eyebrow mb-5">{eyebrow}</p>
            <h1 id="ec-hero-title" className="ec-headline">
              <span className="italic text-[var(--color-champagne,#C9A962)]">Objects</span>{" "}
              of lasting value
            </h1>
            <div className="ec-gold-rule my-7 motion-safe:animate-[ec-gold-draw_0.8s_cubic-bezier(0.22,1,0.36,1)_0.4s_both]" />
            <p className="ec-body max-w-lg">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#shop" className="ec-btn-primary ec-focus-ring">
                {primaryCta}
              </a>
              <a href="#about" className="ec-btn-secondary ec-focus-ring">
                {secondaryCta}
              </a>
            </div>
            <dl className="mt-12 grid gap-6 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item.label}>
                  <dt className="ec-font-body text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {item.label}
                  </dt>
                  <dd className="ec-font-display mt-1.5 text-xl text-[var(--color-foreground)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative motion-safe:animate-[ec-gentle-rise_1s_cubic-bezier(0.22,1,0.36,1)_0.3s_both]">
            <div className="ec-editorial-frame overflow-hidden">
              <SlotImage
                slot="hero"
                index={0}
                preferred={imageUrl}
                alt="Editorial product photography — curated luxury objects on ivory linen backdrop"
                className="aspect-[4/5] w-full object-cover motion-safe:animate-[ec-image-zoom_1.4s_ease-out_both]"
                priority
              />
            </div>
            <div className="ec-editorial-accent absolute -bottom-8 -start-6 hidden w-[44%] overflow-hidden sm:block lg:-start-10">
              <SlotImage
                slot="products"
                index={1}
                alt="Handcrafted ceramic vessel — limited edition"
                className="aspect-square w-full object-cover transition duration-700 hover:scale-105"
              />
              <div className="border-t border-[var(--border-subtle)] px-4 py-3.5">
                <p className="ec-font-display text-sm">Ceramic vessel No. 12</p>
                <p className="ec-font-body mt-0.5 text-xs text-[var(--color-muted)]">
                  Limited · Ships in 48h
                </p>
              </div>
            </div>
            <span
              className="ec-font-body absolute -end-2 top-8 hidden origin-center rotate-90 text-[0.5625rem] uppercase tracking-[0.34em] text-[var(--color-muted)] lg:block"
              aria-hidden
            >
              Curated · SS26
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
