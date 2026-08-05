"use client";

type MedicalPremiumAppointmentBandProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  phone?: string;
};

export function MedicalPremiumAppointmentBand({
  title = "Same-week appointments available",
  subtitle = "Speak with a care coordinator — most consultations scheduled within 48 hours.",
  primaryCta = "Book now",
  phone = "+1 (800) 555-0199",
}: MedicalPremiumAppointmentBandProps) {
  return (
    <section
      id="appointments"
      data-v2-component="medical-premium-appointment-band"
      aria-labelledby="mp-appointment-title"
      className="border-y border-[var(--border-healing)] bg-[var(--color-surface)] py-8"
    >
      <div className="mx-auto flex max-w-[76rem] flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-start gap-5">
          <span
            className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--border-healing)] bg-[var(--color-pearl)] text-2xl text-[var(--color-healing)] sm:flex"
            aria-hidden
          >
            ✦
          </span>
          <div>
            <p className="mp-eyebrow mb-2">Appointments</p>
            <h2 id="mp-appointment-title" className="mp-font-display text-xl text-[var(--color-primary)] sm:text-2xl">
              {title}
            </h2>
            <p className="mp-font-body mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="mp-font-body text-sm font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline mp-focus-ring"
          >
            {phone}
          </a>
          <a href="#contact" className="mp-btn-primary text-sm">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
