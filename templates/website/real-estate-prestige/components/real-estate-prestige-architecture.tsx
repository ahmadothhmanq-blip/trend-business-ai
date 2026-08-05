"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

type RealEstatePrestigeArchitectureProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RealEstatePrestigeArchitecture({
  eyebrow = "Architecture",
  title = "Designed for permanence",
  subtitle = "We partner with the world's most respected architects — each residence a dialogue between material, light, and the landscape it inhabits.",
}: RealEstatePrestigeArchitectureProps) {
  const detail = resolveSlotImage("about", 5);
  const wide = resolveSlotImage("about", 6);

  return (
    <section
      id="architecture"
      data-v2-component="real-estate-prestige-architecture"
      aria-labelledby="rep-arch-title"
      className="rep-section"
    >
      <div className="px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5 lg:pt-8">
            <p className="rep-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rep-arch-title" className="rep-headline-sm">
              {title}
            </h2>
            <div className="rep-brass-rule my-6" />
            <p className="rep-body">{subtitle}</p>

            <ul className="rep-font-body mt-10 space-y-4 text-sm text-[var(--color-muted)]">
              <li className="flex gap-3 border-s-2 border-[var(--color-brass)] ps-4">
                Limestone, travertine, and aged brass — materials that deepen with time
              </li>
              <li className="flex gap-3 border-s-2 border-[var(--color-brass)] ps-4">
                Floor-to-ceiling glazing calibrated for natural light and privacy
              </li>
              <li className="flex gap-3 border-s-2 border-[var(--color-brass)] ps-4">
                Landscape integration by award-winning garden architects
              </li>
            </ul>
          </div>

          <div className="grid gap-4 lg:col-span-7">
            <figure className="rep-card overflow-hidden">
              {wide ? (
                <img src={wide} alt="Architectural exterior" className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="aspect-[16/10] w-full bg-[var(--color-stone)]" />
              )}
            </figure>
            <figure className="rep-card ms-auto w-4/5 overflow-hidden">
              {detail ? (
                <img src={detail} alt="Interior architectural detail" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="aspect-[4/3] w-full bg-[var(--color-stone)]" />
              )}
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
