"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { useEffect, useState } from "react";

const GALLERY_CAPTIONS = [
  "Candlelit main dining room",
  "Chef's counter with open flame",
  "Sommelier-led wine service",
  "Seasonal tasting course",
  "Hand-dived scallop composition",
  "Ember-roasted heritage duck",
  "Private dining alcove",
  "Pastry finale with smoked cream",
  "Barrel-aged cocktail program",
  "Garden terrace at dusk",
  "Open kitchen during service",
  "Tableside finishing ritual",
];

type RestaurantPremiumGalleryProps = {
  eyebrow?: string;
  title?: string;
};

export function RestaurantPremiumGallery({
  eyebrow = "Gallery",
  title = "Moments from the table",
}: RestaurantPremiumGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  return (
    <section
      id="gallery"
      data-v2-component="restaurant-premium-gallery"
      aria-labelledby="rp-gallery-title"
      className="rp-section bg-[var(--color-surface)]/20"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="rp-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rp-gallery-title" className="rp-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
            <div className="rp-copper-rule mt-6" />
          </div>
          <p className="rp-font-body text-sm text-[var(--color-muted)]">
            {GALLERY_CAPTIONS.length} photographs · Updated seasonally
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:gap-4">
          {GALLERY_CAPTIONS.map((caption, index) => {
            const spanTall = index % 5 === 0;
            return (
              <button
                key={`gallery-${index}`}
                type="button"
                className={[
                  "rp-card group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-copper)]",
                  spanTall ? "row-span-2 aspect-[3/4] md:col-span-1" : "aspect-square",
                ].join(" ")}
                onClick={() => setActiveIndex(index)}
                aria-label={`View photograph: ${caption}`}
              >
                <SlotImage
                  slot="gallery"
                  index={index}
                  alt={caption}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="rp-font-body absolute inset-x-0 bottom-0 p-3 text-start text-[0.625rem] uppercase tracking-[0.2em] text-white/90 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {caption}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-background)]/96 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="absolute end-6 top-6 rp-font-body text-sm uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] rp-focus-ring"
            onClick={() => setActiveIndex(null)}
            aria-label="Close preview"
          >
            Close
          </button>
          <figure className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <SlotImage
              slot="gallery"
              index={activeIndex}
              alt={GALLERY_CAPTIONS[activeIndex] ?? ""}
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />
            <figcaption className="rp-font-body mt-4 text-center text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {GALLERY_CAPTIONS[activeIndex]}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
