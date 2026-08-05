"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const FEATURES = [
  { title: "Private suites", description: "Spa-inspired recovery rooms with natural light and garden views." },
  { title: "Diagnostic imaging", description: "3T MRI, PET-CT, and digital pathology on-site." },
  { title: "Integrative wellness", description: "Nutrition, physiotherapy, and mindfulness programs." },
];

type MedicalPremiumWellnessProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string }>;
};

export function MedicalPremiumWellness({
  eyebrow = "Facilities",
  title = "Healing environments",
  subtitle = "Spaces designed to reduce anxiety and support recovery — because environment is part of medicine.",
  items = FEATURES,
}: MedicalPremiumWellnessProps) {
  return (
    <section
      id="wellness"
      data-v2-component="medical-premium-wellness"
      aria-labelledby="mp-wellness-title"
      className="mp-section px-5 sm:px-8"
    >
      <div className="mx-auto max-w-[76rem]">
        <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-0">
          <figure className="relative z-10 lg:-me-12">
            <div className="mp-card overflow-hidden p-2">
              <SlotImage
                slot="about"
                index={1}
                alt="Wellness facility interior"
                className="aspect-[5/4] w-full rounded-[calc(var(--radius-lg)-4px)] object-cover"
              />
            </div>
            <div
              className="absolute -bottom-6 -start-6 hidden rounded-[var(--radius-md)] border border-[var(--border-healing)] bg-[var(--color-pearl)] px-5 py-4 shadow-[var(--shadow-card)] lg:block"
              aria-hidden
            >
              <p className="mp-stat-value text-[var(--color-healing)]">12</p>
              <p className="mp-font-body text-xs uppercase tracking-wider text-muted-foreground">
                Private recovery suites
              </p>
            </div>
          </figure>

          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-8 sm:p-10 lg:ps-20 lg:pt-14">
            <p className="mp-eyebrow mb-4">{eyebrow}</p>
            <div className="mp-sage-rule mb-5" aria-hidden />
            <h2 id="mp-wellness-title" className="mp-headline-sm">
              {title}
            </h2>
            <p className="mp-body text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>
            <ul className="mt-10 space-y-6">
              {items.map((item, index) => (
                <li
                  key={item.title}
                  className="flex gap-4 border-b border-[var(--border-subtle)] pb-6 last:border-0 last:pb-0 motion-safe:animate-[mp-gentle-rise_0.55s_ease_both]"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <span
                    className="mp-font-body flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-pearl)] text-xs font-bold text-[var(--color-primary)]"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="mp-font-display text-lg text-[var(--color-foreground)]">{item.title}</h3>
                    <p className="mp-font-body mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
