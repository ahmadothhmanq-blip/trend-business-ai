"use client";

import { useState } from "react";
import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const GALLERY_COUNT = 6;

type RestaurantSignatureGalleryProps = {
  eyebrow?: string;
  title?: string;
};

export function RestaurantSignatureGallery({
  eyebrow = "Gallery",
  title = "Moments from the table",
}: RestaurantSignatureGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const images = Array.from({ length: GALLERY_COUNT }, (_, i) =>
    resolveSlotImage("about", i + 7),
  );

  return (
    <section
      id="gallery"
      data-v2-component="restaurant-signature-gallery"
      aria-labelledby="rs-gallery-title"
      className="rs-section bg-[var(--color-surface)]/20"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="rs-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rs-gallery-title" className="rs-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
          </div>
          <p className="rs-font-body text-sm text-[var(--color-muted)]">
            {GALLERY_COUNT} photographs · Updated seasonally
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:gap-4">
          {images.map((src, index) => (
            <button
              key={index}
              type="button"
              className="group relative aspect-square overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-copper)]"
              onClick={() => setActiveIndex(index)}
              aria-label={`View photograph ${index + 1}`}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(${135 + index * 20}deg, var(--color-surface), var(--color-primary))`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-[var(--color-background)]/0 transition-colors group-hover:bg-[var(--color-background)]/20" />
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-background)]/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setActiveIndex(null)}
          onKeyDown={(e) => e.key === "Escape" && setActiveIndex(null)}
        >
          <button
            type="button"
            className="absolute end-6 top-6 rs-font-body text-sm uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-copper)]"
            onClick={() => setActiveIndex(null)}
            aria-label="Close preview"
          >
            Close
          </button>
          {images[activeIndex] && (
            <img
              src={images[activeIndex]!}
              alt={`Gallery photograph ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </section>
  );
}
