"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type EcommercePremiumBrandStoryProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function EcommercePremiumBrandStory({
  eyebrow = "Our atelier",
  title = "Commerce with conscience and craft",
  body = "We partner directly with independent makers — no middlemen, no mass production. Every piece is photographed in natural light, described with material provenance, and shipped with care that honors the object and the hands that made it.",
  imageUrl,
  highlights = [
    "Direct relationships with 48+ artisan studios",
    "Carbon-neutral packaging on every order",
    "30-day returns with concierge support",
  ],
  primaryCta = "Meet our makers",
}: EcommercePremiumBrandStoryProps) {
  return (
    <section
      id="about"
      data-v2-component="ecommerce-premium-brand-story"
      aria-labelledby="ec-story-title"
      className="ec-section ec-section-alt bg-[var(--color-linen,#F3EFE8)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="ec-editorial-frame overflow-hidden motion-safe:animate-[ec-gentle-rise_0.9s_ease_both]">
            <SlotImage
              slot="about"
              index={0}
              preferred={imageUrl}
              alt="Artisan studio — maker at work on handcrafted objects"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
          <div>
            <p className="ec-eyebrow mb-4">{eyebrow}</p>
            <h2 id="ec-story-title" className="ec-headline-sm">
              {title}
            </h2>
            <div className="ec-gold-rule mt-5" aria-hidden />
            <p className="ec-body mt-6">{body}</p>
            <ul className="mt-9 space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-px w-4 shrink-0 bg-[var(--color-champagne)]"
                    aria-hidden
                  />
                  <span className="ec-font-body text-sm text-[var(--color-foreground)]">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/about" className="ec-btn-primary ec-focus-ring mt-10 inline-flex">
              {primaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
