"use client";

const OFFICES = [
  { city: "New York", address: "450 Park Avenue, 28th Floor", phone: "+1 (212) 555-0140" },
  { city: "London", address: "1 Canada Square, Canary Wharf", phone: "+44 20 7946 0958" },
  { city: "Singapore", address: "8 Marina View, Asia Square", phone: "+65 6123 4567" },
];

export function FinancePremiumContact() {
  return (
    <section id="contact" data-v2-component="finance-premium-contact" aria-labelledby="fn-contact-title" className="df-reveal border-t border-[var(--border-default)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="fn-eyebrow">Advisory inquiry</p>
          <h2 id="fn-contact-title" className="fn-headline-sm mt-2">Speak with a partner</h2>
          <p className="fn-body mt-4 text-[var(--color-muted)]">Confidential consultations — we respond within one business day.</p>
        </header>
        <div className="df-reveal-stagger grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="df-reveal-stagger grid gap-4 sm:grid-cols-1">
            {OFFICES.map((office) => (
              <div key={office.city} className="fn-card p-6">
                <h3 className="fn-font-display text-lg font-semibold">{office.city}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{office.address}</p>
                <p className="mt-3 text-sm font-medium">{office.phone}</p>
              </div>
            ))}
          </div>
          <form className="fn-card space-y-4 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
            <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Full name" aria-label="Full name" className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm" />
              <input type="email" placeholder="Work email" aria-label="Email" className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm" />
            </div>
            <select aria-label="Inquiry type" className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-muted)]">
              <option>Private wealth</option>
              <option>Institutional mandate</option>
              <option>Family office</option>
            </select>
            <textarea placeholder="Tell us about your goals and assets under advisement" aria-label="Message" rows={4} className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-background)] px-4 py-3 text-sm" />
            <button type="submit" className="fn-btn-primary fn-focus-ring">Request consultation</button>
          </form>
        </div>
      </div>
    </section>
  );
}
