"use client";

import { SlotImage, resolveSlotImageStrict } from "@/lib/website/template-v2/slots";
import { FlagshipSectionHeader } from "@/lib/website/template-v2/flagship/section-header";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type FlagshipTestimonial = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  imageUrl?: string | null;
  rating?: number;
};

export type FlagshipTestimonialsProps = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FlagshipTestimonial[];
};

function StarRating({ count, className }: { count: number; className?: string }) {
  return (
    <span className={className} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

export function FlagshipTestimonialsSection({
  ui,
  componentId,
  id,
  eyebrow,
  title,
  subtitle,
  items,
}: FlagshipTestimonialsProps) {
  if (!items?.length) return null;
  const sectionId = id ?? "testimonials";

  return (
    <section
      id={sectionId}
      data-v2-component={componentId}
      aria-labelledby={`${sectionId}-title`}
      className={`${ui.section} df-section-alt bg-[var(--color-surface)]`}
    >
      <div className={ui.container}>
        <FlagshipSectionHeader ui={ui} id={sectionId} eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item, index) => {
            const featured = index === 1 && items.length >= 3;
            const avatar = resolveSlotImageStrict("testimonials", index, item.imageUrl);
            return (
              <figure
                key={`${item.name}-${index}`}
                className={[
                  ui.card,
                  "relative flex flex-col p-7 sm:p-8",
                  featured ? "df-card-featured md:-translate-y-1 lg:col-span-1" : "",
                ].join(" ")}
              >
                <span className="df-quote-mark absolute end-6 top-4 select-none" aria-hidden>
                  &ldquo;
                </span>
                {item.rating ? (
                  <StarRating count={item.rating} className={`${ui.fontBody} df-star text-sm`} />
                ) : null}
                <blockquote className={`${ui.body} relative z-[1] mt-4 flex-1 text-base leading-relaxed`}>
                  {item.quote}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-[var(--border-default,rgba(0,0,0,0.08))] pt-5">
                  {avatar ? (
                    <SlotImage
                      slot="testimonials"
                      index={index}
                      preferred={item.imageUrl}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--color-surface)]"
                      containerClassName="h-11 w-11 rounded-full ring-2 ring-[var(--color-surface)]"
                      width={44}
                      height={44}
                    />
                  ) : (
                    <span
                      className={`${ui.fontBody} flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-sm font-semibold text-[var(--color-primary)] ring-2 ring-[var(--color-surface)]`}
                      aria-hidden
                    >
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className={`${ui.fontBody} text-sm font-semibold text-[var(--color-foreground)]`}>
                      {item.name}
                    </p>
                    <p className={`${ui.fontBody} text-xs text-[var(--color-muted)]`}>
                      {item.role}
                      {item.company ? ` · ${item.company}` : ""}
                    </p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
