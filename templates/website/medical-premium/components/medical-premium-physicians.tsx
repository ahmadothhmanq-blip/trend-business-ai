"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const PHYSICIANS = [
  {
    name: "Dr. Elena Vasquez",
    specialty: "Chief of Cardiology",
    credentials: "MD, FACC · Harvard Medical",
    imageIndex: 1,
  },
  {
    name: "Dr. James Okonkwo",
    specialty: "Director of Oncology",
    credentials: "MD, PhD · Johns Hopkins",
    imageIndex: 2,
  },
  {
    name: "Dr. Sarah Lindqvist",
    specialty: "Head of Neurology",
    credentials: "MD, FAAN · Karolinska Institute",
    imageIndex: 3,
  },
];

type MedicalPremiumPhysiciansProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function MedicalPremiumPhysicians({
  eyebrow = "Our physicians",
  title = "Leaders in their fields",
  subtitle = "Board-certified specialists trained at the world's foremost medical institutions.",
}: MedicalPremiumPhysiciansProps) {
  return (
    <section
      id="physicians"
      data-v2-component="medical-premium-physicians"
      aria-labelledby="mp-physicians-title"
      className="mp-section px-5 sm:px-8"
    >
      <header className="mx-auto mb-14 flex max-w-[76rem] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="mp-eyebrow mb-4">{eyebrow}</p>
          <div className="mp-sage-rule mb-5" aria-hidden />
          <h2 id="mp-physicians-title" className="mp-headline-sm">
            {title}
          </h2>
          <p className="mp-body text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>
        </div>
        <a href="#appointments" className="mp-btn-secondary mp-focus-ring shrink-0 self-start lg:self-auto">
          View all physicians
        </a>
      </header>

      <div className="mx-auto grid max-w-[76rem] gap-8 md:grid-cols-3">
        {PHYSICIANS.map((doc, index) => (
          <article
            key={doc.name}
            className="mp-card group overflow-hidden motion-safe:animate-[mp-scale-in_0.55s_ease_both]"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <figure className="relative overflow-hidden">
              <SlotImage
                slot="team"
                index={doc.imageIndex}
                alt={doc.name}
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/80 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-full p-6 transition-transform duration-400 group-hover:translate-y-0">
                <p className="mp-font-body text-xs text-white/80">{doc.credentials}</p>
              </figcaption>
            </figure>
            <div className="border-t border-[var(--border-subtle)] p-6">
              <h3 className="mp-font-display text-xl text-[var(--color-foreground)]">{doc.name}</h3>
              <p className="mp-font-body mt-1 text-sm font-medium text-[var(--color-healing)]">
                {doc.specialty}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
