/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const CONTACT_GENERATORS = {
  "split-form-map": splitFormMap,
  "minimal-inline": minimalInline,
  "corporate-offices": corporateOffices,
  "enterprise-form": enterpriseForm,
  "luxury-inquiry": luxuryInquiry,
  "clinical-booking": clinicalBooking,
  "resort-reservation": resortReservation,
  "reservation-form": reservationForm,
  "admissions-form": admissionsForm,
  "wholesale-inquiry": wholesaleInquiry,
  "demo-request": demoRequest,
  "project-brief": projectBrief,
  "property-viewing": propertyViewing,
  "table-booking": tableBooking,
  "glass-form": glassForm,
  "terminal-contact": terminalContact,
  "secure-inquiry": secureInquiry,
  "rfq-form": rfqForm,
  "consultation-form": consultationForm,
  "wellness-booking": wellnessBooking,
};

export function generateContact(entry, layoutKey) {
  const fn = CONTACT_GENERATORS[layoutKey] ?? splitFormMap;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function contactHeader({ p, pkg, Pascal }) {
  return `"use client";

type ${Pascal}ContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function ${Pascal}Contact({
  eyebrow = "Contact",
  title = "Let's start a conversation",
  subtitle = "Tell us about your goals — our team responds within one business day.",
  email = "hello@example.com",
  phone = "+1 (555) 000-0000",
  address = "Global offices — remote-first",
  submitLabel = "Send message",
}: ${Pascal}ContactProps) {`;
}

function formFields({ p }) {
  return `
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Full name" aria-label="Full name" className="rounded-lg border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-3 text-sm" />
            <input type="email" placeholder="Work email" aria-label="Email" className="rounded-lg border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-3 text-sm" />
          </div>
          <textarea placeholder="How can we help?" aria-label="Message" rows={4} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-3 text-sm" />
          <button type="submit" className="${p}-btn-primary ${p}-focus-ring">{submitLabel}</button>
        </form>`;
}

function splitFormMap({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" aria-labelledby="${p}-contact-title" className="${p}-section-alt py-20 sm:py-28">
      <div className="mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <div>
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-contact-title" className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mt-4 text-[var(--color-muted)]">{subtitle}</p>
          <dl className="mt-8 space-y-3 text-sm">
            <div><dt className="text-[var(--color-muted)]">Email</dt><dd><a href={\`mailto:\${email}\`}>{email}</a></dd></div>
            <div><dt className="text-[var(--color-muted)]">Phone</dt><dd>{phone}</dd></div>
            <div><dt className="text-[var(--color-muted)]">Address</dt><dd>{address}</dd></div>
          </dl>
        </div>
        ${formFields({ p })}
      </div>
    </section>
  );
}
`;
}

function minimalInline({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="border-y border-[var(--border-default)] py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2 className="${p}-display text-5xl">{title}</h2>
        <p className="mt-4 text-[var(--color-muted)]">{subtitle}</p>
        <a href={\`mailto:\${email}\`} className="${p}-btn-volt mt-10 inline-flex text-lg">{email}</a>
      </div>
    </section>
  );
}
`;
}

function corporateOffices({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {["New York", "London", "Singapore"].map((city) => (
            <div key={city} className="${p}-card p-6">
              <h3 className="font-bold">{city}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{address}</p>
              <p className="mt-4 text-sm">{phone}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">${formFields({ p }).trim()}</div>
      </div>
    </section>
  );
}
`;
}

function enterpriseForm({ p, pkg, Pascal }) {
  return splitFormMap({ p, pkg, Pascal });
}

function luxuryInquiry({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="bg-[var(--color-primary)] py-20 text-center">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h2 className="${p}-headline-sm mt-4">{title}</h2>
        <p className="mt-4 text-[var(--color-muted)]">{subtitle}</p>
        ${formFields({ p })}
      </div>
    </section>
  );
}
`;
}

function clinicalBooking({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="py-16">
      <div className="mx-auto max-w-lg rounded-3xl bg-[var(--color-surface)] p-8 shadow-sm">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-8">${formFields({ p }).trim()}</div>
      </div>
    </section>
  );
}
`;
}

function resortReservation({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="${p}-section-glow py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--color-surface)]/80 p-8 backdrop-blur lg:p-12">
          <h2 className="${p}-headline-sm">{title}</h2>
          <form className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
            <input type="date" aria-label="Check-in" className="rounded-lg border px-3 py-2 text-sm" />
            <input type="date" aria-label="Check-out" className="rounded-lg border px-3 py-2 text-sm" />
            <input type="number" placeholder="Guests" aria-label="Guests" className="rounded-lg border px-3 py-2 text-sm" />
            <button type="submit" className="${p}-btn-primary">{submitLabel}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
`;
}

function reservationForm({ p, pkg, Pascal }) {
  return resortReservation({ p, pkg, Pascal });
}

function admissionsForm({ p, pkg, Pascal }) {
  return clinicalBooking({ p, pkg, Pascal }).replace(`Book a`, `Apply —`);
}

function wholesaleInquiry({ p, pkg, Pascal }) {
  return splitFormMap({ p, pkg, Pascal });
}

function demoRequest({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="${p}-section-glow py-20 sm:py-28">
      <div className="mx-auto grid max-w-[82rem] gap-10 px-5 lg:grid-cols-[1fr_1.2fr] sm:px-8">
        <div>
          <h2 className="${p}-headline-sm">{title}</h2>
          <p className="${p}-body mt-4">{subtitle}</p>
          <ul className="mt-6 space-y-2 text-sm">{["30-min live demo", "Solutions architect", "Custom ROI model"].map((x) => <li key={x}>✓ {x}</li>)}</ul>
        </div>
        ${formFields({ p })}
      </div>
    </section>
  );
}
`;
}

function projectBrief({ p, pkg, Pascal }) {
  return minimalInline({ p, pkg, Pascal });
}

function propertyViewing({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="py-16">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Preferred neighborhood" className="w-full rounded-lg border px-4 py-3 text-sm" aria-label="Neighborhood" />
          <input type="date" className="w-full rounded-lg border px-4 py-3 text-sm" aria-label="Viewing date" />
          <button type="submit" className="${p}-btn-primary w-full">{submitLabel}</button>
        </form>
      </div>
    </section>
  );
}
`;
}

function tableBooking({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="border-t-2 border-[var(--color-accent)]/30 py-20 sm:py-28">
      <div className="mx-auto max-w-md px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <form className="mt-8 space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input type="date" className="w-full rounded-lg border px-4 py-3 text-sm" aria-label="Date" />
          <select className="w-full rounded-lg border px-4 py-3 text-sm" aria-label="Party size"><option>2 guests</option><option>4 guests</option><option>6+ guests</option></select>
          <button type="submit" className="${p}-btn-primary w-full">{submitLabel}</button>
        </form>
      </div>
    </section>
  );
}
`;
}

function glassForm({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="relative py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-accent),transparent_60%)] opacity-15" aria-hidden />
      <div className="relative mx-auto max-w-lg ${p}-glass-card rounded-2xl border border-[var(--border-accent)] p-8 backdrop-blur">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="mt-6">${formFields({ p }).trim()}</div>
      </div>
    </section>
  );
}
`;
}

function terminalContact({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="bg-[#0a0f0a] py-12 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <p>$ contact --secure</p>
        <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
        <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="email@" className="w-full border border-[#00ff88]/30 bg-transparent px-3 py-2 text-[#00ff88]" aria-label="Email" />
          <textarea placeholder="message..." rows={3} className="w-full border border-[#00ff88]/30 bg-transparent px-3 py-2 text-[#00ff88]" aria-label="Message" />
          <button type="submit" className="text-white underline">[ {submitLabel} ]</button>
        </form>
      </div>
    </section>
  );
}
`;
}

function secureInquiry({ p, pkg, Pascal }) {
  return terminalContact({ p, pkg, Pascal });
}

function rfqForm({ p, pkg, Pascal }) {
  return `${contactHeader({ p, pkg, Pascal })}
  return (
    <section id="contact" data-v2-component="${pkg}-contact" className="py-16" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto max-w-2xl border-2 border-dashed border-[var(--color-accent)] p-8">
        <p className="${p}-font-mono text-xs text-[var(--color-accent)]">RFQ FORM</p>
        <h2 className="${p}-headline-sm mt-2">{title}</h2>
        ${formFields({ p })}
      </div>
    </section>
  );
}
`;
}

function consultationForm({ p, pkg, Pascal }) {
  return enterpriseForm({ p, pkg, Pascal });
}

function wellnessBooking({ p, pkg, Pascal }) {
  return clinicalBooking({ p, pkg, Pascal });
}
