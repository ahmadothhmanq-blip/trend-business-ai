"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type RealEstatePremiumArchitectureProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RealEstatePremiumArchitecture({
  eyebrow = "Architecture",
  title = "Designed for permanence",
  subtitle = "We partner with the world's most respected architects — each residence a dialogue between material, light, and the landscape it inhabits.",
}: RealEstatePremiumArchitectureProps) {
  return (
    <section
      id="architecture"
      data-v2-component="real-estate-premium-architecture"
      aria-labelledby="rep-architecture-title"
      className="rep-section bg-[var(--color-surface)]"
    >
      <div className="px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <figure className="group rep-card overflow-hidden">
              <SlotImage
                slot="gallery"
                index={5}
                alt="Interior architectural detail with natural light"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.03]"
              />
            </figure>
          </div>

          <div className="order-1 lg:order-2">
            <p className="rep-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rep-architecture-title" className="rep-headline-sm">
              {title}
            </h2>
            <div className="rep-brass-rule-lg my-7" />
            <p className="rep-body max-w-lg">{subtitle}</p>

            <blockquote className="mt-10 border-s-2 border-[var(--color-brass)] ps-6">
              <p className="rep-font-display text-2xl italic leading-snug text-[var(--color-foreground)]">
                &ldquo;Architecture is the learned game of forms assembled in light.&rdquo;
              </p>
              <footer className="rep-font-body mt-4 text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                — Le Corbusier
              </footer>
            </blockquote>

            <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-[var(--border-subtle)] pt-8">
              <div>
                <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Architects represented
                </dt>
                <dd className="rep-font-display mt-2 text-3xl text-[var(--color-foreground)]">24</dd>
              </div>
              <div>
                <dt className="rep-font-body text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Landmark properties
                </dt>
                <dd className="rep-font-display mt-2 text-3xl text-[var(--color-brass)]">18</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
