/**
 * Automotive industry premium scaffolds — showroom-grade vehicle UI.
 * Injected into generated projects via Professional Components Library.
 */

import { heroImageImport } from "@/lib/ai-core/components/scaffolds/shared";

const img = heroImageImport();

const VEHICLE_DATA = `const DEFAULT_VEHICLES = [
  {
    slug: "aurora-gt",
    name: "Aurora GT",
    trim: "Signature",
    year: 2026,
    price: 89400,
    body: "Coupe",
    powertrain: "Twin-turbo V6",
    horsepower: 450,
    range: "Highway 28 mpg",
    seats: 4,
    highlight: "Grand touring presence with precision handling.",
  },
  {
    slug: "nocturne-suv",
    name: "Nocturne SUV",
    trim: "Platinum",
    year: 2026,
    price: 78600,
    body: "SUV",
    powertrain: "Hybrid AWD",
    horsepower: 380,
    range: "EV range 42 mi",
    seats: 5,
    highlight: "Quiet cabin. Commanding stance. Everyday luxury.",
  },
  {
    slug: "velocity-ev",
    name: "Velocity EV",
    trim: "Performance",
    year: 2026,
    price: 96900,
    body: "Sedan",
    powertrain: "Dual motor EV",
    horsepower: 520,
    range: "312 mi estimated",
    seats: 5,
    highlight: "Instant torque with a sculpted silhouette.",
  },
  {
    slug: "atelier-convertible",
    name: "Atelier Convertible",
    trim: "Heritage",
    year: 2025,
    price: 112500,
    body: "Convertible",
    powertrain: "V8",
    horsepower: 495,
    range: "Highway 24 mpg",
    seats: 2,
    highlight: "Open-air craftsmanship for evening drives.",
  },
];`;

export const AUTOMOTIVE_SCAFFOLDS: Record<string, string> = {
  VehicleShowcase: `"use client";

import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

${VEHICLE_DATA}

type Vehicle = (typeof DEFAULT_VEHICLES)[number];

type VehicleShowcaseProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  vehicles?: Vehicle[];
};

export function VehicleShowcase({
  eyebrow = "Collection",
  title = "Luxury vehicles, staged to convert",
  subtitle = "Flagship models with cinematic photography, clear trims, and decisive next steps.",
  vehicles = DEFAULT_VEHICLES,
}: VehicleShowcaseProps) {
  return (
    <SectionShell id="vehicles" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 xl:gap-8">
        {vehicles.slice(0, 4).map((v, i) => {
          const src = resolveSiteImage(PRODUCT_IMAGE || GALLERY_IMAGES[i] || SECTION_IMAGES[i] || HERO_IMAGE, i);
          return (
            <Motion
              key={v.slug}
              delayMs={i * 70}
              as="article"
              className="group overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] shadow-[var(--shadow-sm,0_8px_24px_rgba(0,0,0,0.05))]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-background)]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={v.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <div className="h-full w-full bg-gradient-hero opacity-55" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">{v.year} · {v.trim}</p>
                  <h3 className="mt-1 font-[family-name:var(--font-heading,inherit)] text-2xl font-semibold tracking-tight">{v.name}</h3>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm leading-relaxed text-[var(--color-foreground)]/65">{v.highlight}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--color-foreground)]/45">{v.body} · {v.powertrain}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight">From \${v.price.toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <a href={\`/models/\${v.slug}\`} className="inline-flex items-center justify-center rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-on-primary,white)]">
                    View details
                  </a>
                  <a href="#appointment" className="text-xs font-semibold text-[var(--color-primary)]">Book a test drive →</a>
                </div>
              </div>
            </Motion>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  VehicleDetail: `"use client";

import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

${VEHICLE_DATA}

type VehicleDetailProps = {
  slug?: string;
  eyebrow?: string;
};

export function VehicleDetail({
  slug = "aurora-gt",
  eyebrow = "Model detail",
}: VehicleDetailProps) {
  const vehicle = DEFAULT_VEHICLES.find((v) => v.slug === slug) || DEFAULT_VEHICLES[0]!;
  const hero = resolveSiteImage(PRODUCT_IMAGE || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const gallery = [0, 1, 2, 3].map((i) =>
    resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i + 1),
  );
  const specs = [
    { label: "Body", value: vehicle.body },
    { label: "Powertrain", value: vehicle.powertrain },
    { label: "Horsepower", value: String(vehicle.horsepower) },
    { label: "Range / efficiency", value: vehicle.range },
    { label: "Seating", value: String(vehicle.seats) },
    { label: "Trim", value: vehicle.trim },
  ];

  return (
    <SectionShell id="vehicle-detail" eyebrow={eyebrow} title={vehicle.name} subtitle={vehicle.highlight} className="!pt-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <Motion variant="slow-reveal" className="space-y-4">
          <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-xl,1.25rem)] bg-[var(--color-surface)]">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero} alt={vehicle.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-hero opacity-50" />
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg,1rem)] bg-[var(--color-surface)]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={\`\${vehicle.name} detail \${i + 1}\`} className="h-full w-full object-cover" />
                ) : null}
              </div>
            ))}
          </div>
        </Motion>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground)]/45">{vehicle.year} · {vehicle.trim}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight">\${vehicle.price.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[var(--color-foreground)]/55">MSRP starting · taxes & fees excluded</p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {specs.map((s) => (
              <div key={s.label} className="rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">{s.label}</dt>
                <dd className="mt-1 text-sm font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#appointment" className="inline-flex rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">
              Book test drive
            </a>
            <a href="#finance" className="inline-flex rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 px-5 py-3 text-sm font-semibold">
              Estimate finance
            </a>
            <a href="/inventory" className="inline-flex px-2 py-3 text-sm font-semibold text-[var(--color-primary)]">
              See inventory →
            </a>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  InventoryGrid: `"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

${VEHICLE_DATA}

type InventoryGridProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function InventoryGrid({
  eyebrow = "Inventory",
  title = "Browse available stock",
  subtitle = "Filter by body style and budget — every card is inquiry-ready.",
}: InventoryGridProps) {
  const [body, setBody] = useState("All");
  const [maxPrice, setMaxPrice] = useState(120000);
  const bodies = ["All", ...Array.from(new Set(DEFAULT_VEHICLES.map((v) => v.body)))];

  const filtered = useMemo(
    () =>
      DEFAULT_VEHICLES.filter(
        (v) => (body === "All" || v.body === body) && v.price <= maxPrice,
      ),
    [body, maxPrice],
  );

  return (
    <SectionShell id="inventory" eyebrow={eyebrow} title={title} subtitle={subtitle} tone="muted">
      <div className="mb-10 flex flex-col gap-4 rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-background)] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <div className="flex flex-wrap gap-2">
          {bodies.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBody(b)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition",
                body === b
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)]"
                  : "border border-[var(--color-foreground)]/12 text-[var(--color-foreground)]/70 hover:border-[var(--color-foreground)]/25",
              ].join(" ")}
            >
              {b}
            </button>
          ))}
        </div>
        <label className="block min-w-[200px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">
          Max price · \${maxPrice.toLocaleString()}
          <input
            type="range"
            min={60000}
            max={120000}
            step={2500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--color-primary)]"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {filtered.map((v, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || PRODUCT_IMAGE || GALLERY_IMAGES[i] || HERO_IMAGE, i);
          return (
            <Motion key={v.slug} delayMs={i * 60} as="article" className="overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-background)]">
              <div className="aspect-[16/10] overflow-hidden bg-[var(--color-surface)]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={v.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-hero opacity-40" />
                )}
              </div>
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground)]/45">{v.body} · {v.year}</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{v.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-foreground)]/60">{v.trim} · {v.powertrain}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="font-semibold">\${v.price.toLocaleString()}</p>
                  <a href={\`/models/\${v.slug}\`} className="text-sm font-semibold text-[var(--color-primary)]">Details →</a>
                </div>
              </div>
            </Motion>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-foreground)]/55">No vehicles match these filters. Adjust body style or price.</p>
      ) : null}
    </SectionShell>
  );
}
`,

  FinanceCalculator: `"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

type FinanceCalculatorProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  defaultPrice?: number;
};

export function FinanceCalculator({
  eyebrow = "Finance",
  title = "Estimate your monthly payment",
  subtitle = "A transparent calculator for showroom conversations — adjust price, down payment, term, and rate.",
  defaultPrice = 89400,
}: FinanceCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice);
  const [down, setDown] = useState(9000);
  const [term, setTerm] = useState(60);
  const [apr, setApr] = useState(4.9);

  const monthly = useMemo(() => {
    const principal = Math.max(price - down, 0);
    const r = apr / 100 / 12;
    if (r === 0) return principal / term;
    const factor = Math.pow(1 + r, term);
    return (principal * r * factor) / (factor - 1);
  }, [price, down, term, apr]);

  return (
    <SectionShell id="finance" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <Motion className="grid gap-8 overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 p-6 sm:p-8">
          {[
            { label: "Vehicle price", value: price, set: setPrice, min: 25000, max: 160000, step: 500, prefix: "$" },
            { label: "Down payment", value: down, set: setDown, min: 0, max: 60000, step: 500, prefix: "$" },
            { label: "Term (months)", value: term, set: setTerm, min: 24, max: 84, step: 12, prefix: "" },
            { label: "APR %", value: apr, set: setApr, min: 0, max: 12, step: 0.1, prefix: "" },
          ].map((field) => (
            <label key={field.label} className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">
              {field.label} · {field.prefix}{field.value.toLocaleString()}
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(e) => field.set(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-primary)]"
              />
            </label>
          ))}
        </div>
        <div className="flex flex-col justify-center bg-[var(--color-foreground)] px-6 py-10 text-[var(--color-background)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-background)]/55">Estimated payment</p>
          <p className="mt-3 font-[family-name:var(--font-heading,inherit)] text-5xl font-semibold tracking-tight">
            \${Math.round(monthly).toLocaleString()}
            <span className="text-lg font-medium opacity-60">/mo</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-background)]/70">
            Illustrative only. Final terms depend on credit, incentives, and taxes. Talk to a finance specialist to lock a quote.
          </p>
          <a href="#appointment" className="mt-8 inline-flex w-fit rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">
            Speak with finance
          </a>
        </div>
      </Motion>
    </SectionShell>
  );
}
`,

  AppointmentCalendar: `"use client";

import { useMemo, useState } from "react";
import { SectionShell } from "@/components/ui/section-shell";

const SLOTS = ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"];
const MODELS = ["Aurora GT", "Nocturne SUV", "Velocity EV", "Atelier Convertible"];

type AppointmentCalendarProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

function buildDays(count = 14) {
  const start = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i + 1);
    return d;
  });
}

export function AppointmentCalendar({
  eyebrow = "Test drive",
  title = "Book an appointment",
  subtitle = "Choose a day, time, and model — our concierge will confirm within a few hours.",
}: AppointmentCalendarProps) {
  const days = useMemo(() => buildDays(14), []);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState(SLOTS[2]!);
  const [model, setModel] = useState(MODELS[0]!);
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const selected = days[dayIdx]!;

  return (
    <SectionShell id="appointment" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {sent ? (
        <div className="rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/8 p-8 text-center">
          <p className="text-lg font-semibold">Appointment requested</p>
          <p className="mt-2 text-sm text-[var(--color-foreground)]/65">
            {selected.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} · {slot} · {model}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">Select a day</p>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d, i) => (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setDayIdx(i)}
                  className={[
                    "rounded-[var(--radius-lg,1rem)] border px-2 py-3 text-center transition",
                    dayIdx === i
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-foreground)]/10 hover:border-[var(--color-foreground)]/25",
                  ].join(" ")}
                >
                  <span className="block text-[10px] uppercase tracking-wide text-[var(--color-foreground)]/45">
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{d.getDate()}</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">Time</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold",
                    slot === s
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)]"
                      : "border border-[var(--color-foreground)]/12 text-[var(--color-foreground)]/70",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <form
            className="rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">
              Model
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-2 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
              >
                {MODELS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">
              Your name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
              />
            </label>
            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">
              Phone or email
              <input
                required
                className="mt-2 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]"
            >
              Request appointment
            </button>
          </form>
        </div>
      )}
    </SectionShell>
  );
}
`,

  BranchesMap: `"use client";

import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

const BRANCHES = [
  {
    name: "Downtown Flagship",
    address: "1200 Grand Avenue",
    city: "Los Angeles, CA",
    hours: "Mon–Sat 9:00–19:00 · Sun 11:00–17:00",
    phone: "+1 (310) 555-0142",
    note: "Full inventory · Concierge delivery",
  },
  {
    name: "Coastal Showroom",
    address: "88 Harbor Drive",
    city: "San Diego, CA",
    hours: "Tue–Sat 10:00–18:00",
    phone: "+1 (619) 555-0198",
    note: "Test drives · EV specialists",
  },
  {
    name: "Service Center North",
    address: "450 Industrial Way",
    city: "Burbank, CA",
    hours: "Mon–Fri 7:30–18:00",
    phone: "+1 (818) 555-0177",
    note: "Express service · Loaner fleet",
  },
];

type BranchesMapProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function BranchesMap({
  eyebrow = "Locations",
  title = "Visit a branch",
  subtitle = "Showrooms and service centers with clear hours, directions, and specialist support.",
}: BranchesMapProps) {
  return (
    <SectionShell id="branches" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <div className="space-y-4">
          {BRANCHES.map((b, i) => (
            <Motion
              key={b.name}
              delayMs={i * 70}
              as="article"
              className="rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-5 sm:p-6"
            >
              <p className="text-lg font-semibold tracking-tight">{b.name}</p>
              <p className="mt-2 text-sm text-[var(--color-foreground)]/65">{b.address}<br />{b.city}</p>
              <p className="mt-3 text-sm text-[var(--color-foreground)]/75">{b.hours}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-foreground)]/45">{b.note}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={\`tel:\${b.phone.replace(/\\D/g, "")}\`} className="text-sm font-semibold text-[var(--color-primary)]">{b.phone}</a>
                <a href="#appointment" className="text-sm font-semibold text-[var(--color-foreground)]/70">Book visit →</a>
              </div>
            </Motion>
          ))}
        </div>
        <Motion className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-hero opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground)]/50">Map preview</p>
            <p className="mt-3 max-w-xs font-[family-name:var(--font-heading,inherit)] text-2xl font-semibold tracking-tight">
              Three campuses. One ownership standard.
            </p>
            <p className="mt-3 max-w-sm text-sm text-[var(--color-foreground)]/60">
              Connect Google Maps embed in production — this layout keeps the branch story premium without empty placeholders.
            </p>
          </div>
        </Motion>
      </div>
    </SectionShell>
  );
}
`,

  VehicleComparison: `"use client";

import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

const COLUMNS = ["Aurora GT", "Nocturne SUV", "Velocity EV"];
const ROWS = [
  { label: "Starting MSRP", values: ["$89,400", "$78,600", "$96,900"] },
  { label: "Powertrain", values: ["Twin-turbo V6", "Hybrid AWD", "Dual motor EV"] },
  { label: "Horsepower", values: ["450 hp", "380 hp", "520 hp"] },
  { label: "Seating", values: ["4", "5", "5"] },
  { label: "Drive character", values: ["Grand tourer", "Quiet luxury", "Instant torque"] },
  { label: "Ideal for", values: ["Weekend escapes", "Family + status", "Performance EV"] },
];

type VehicleComparisonProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function VehicleComparison({
  eyebrow = "Compare",
  title = "Find the right model",
  subtitle = "A decisive comparison table — scannable specs without dealer-site clutter.",
}: VehicleComparisonProps) {
  return (
    <SectionShell id="compare" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <Motion className="overflow-x-auto rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10">
        <table className="min-w-[640px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--color-surface)]">
              <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45 sm:px-6">Spec</th>
              {COLUMNS.map((c) => (
                <th key={c} className="px-4 py-4 font-[family-name:var(--font-heading,inherit)] text-base font-semibold tracking-tight sm:px-6">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? "bg-[var(--color-background)]" : "bg-[var(--color-surface)]/60"}
              >
                <th className="px-4 py-4 text-left font-semibold sm:px-6">{row.label}</th>
                {row.values.map((v) => (
                  <td key={v} className="px-4 py-4 text-[var(--color-foreground)]/75 sm:px-6">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Motion>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="#appointment" className="inline-flex rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary,white)]">
          Book a comparison drive
        </a>
        <a href="#finance" className="inline-flex rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 px-4 py-2.5 text-sm font-semibold">
          Compare payments
        </a>
      </div>
    </SectionShell>
  );
}
`,

  TestimonialsSlider: `"use client";

import { useState } from "react";
import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const DEFAULT_QUOTES = [
  {
    quote: "The showroom experience felt cinematic — and the test drive confirmed every claim on the page.",
    name: "Marcus Ellison",
    role: "Aurora GT owner",
  },
  {
    quote: "Finance was transparent, delivery was on time, and service still treats us like day one.",
    name: "Priya & Aaron Cole",
    role: "Nocturne SUV owners",
  },
  {
    quote: "Finally an automotive site that looks as premium as the vehicles. Booking took two minutes.",
    name: "Helena Voss",
    role: "Velocity EV owner",
  },
];

type TestimonialsSliderProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; name: string; role?: string }>;
  quotes?: Array<{ quote: string; name: string; role?: string }>;
};

export function TestimonialsSlider({
  eyebrow = "Owners",
  title = "Stories from the driver's seat",
  subtitle = "A premium slider — one voice at a time, with photography that feels editorial.",
  items,
  quotes,
}: TestimonialsSliderProps) {
  const list = items?.length ? items : quotes?.length ? quotes : DEFAULT_QUOTES;
  const [index, setIndex] = useState(0);
  const current = list[index]!;
  const portrait = resolveSiteImage(TESTIMONIAL_IMAGES[index] || GALLERY_IMAGES[index] || HERO_IMAGE, index);

  return (
    <SectionShell id="testimonials" eyebrow={eyebrow} title={title} subtitle={subtitle} tone="muted">
      <Motion className="grid overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-background)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[240px] bg-[var(--color-surface)] lg:min-h-full">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portrait} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-hero opacity-45" />
          )}
        </div>
        <div className="flex flex-col justify-between p-7 sm:p-10">
          <blockquote>
            <p className="font-[family-name:var(--font-heading,inherit)] text-2xl leading-relaxed tracking-tight sm:text-3xl">
              “{current.quote}”
            </p>
            <footer className="mt-8">
              <p className="text-sm font-semibold">{current.name}</p>
              <p className="mt-1 text-xs text-[var(--color-foreground)]/50">{current.role || "Owner"}</p>
            </footer>
          </blockquote>
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-foreground)]/15 text-lg"
              onClick={() => setIndex((i) => (i - 1 + list.length) % list.length)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-foreground)]/15 text-lg"
              onClick={() => setIndex((i) => (i + 1) % list.length)}
            >
              →
            </button>
            <div className="ml-2 flex gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={\`Go to testimonial \${i + 1}\`}
                  onClick={() => setIndex(i)}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-foreground)]/25",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </Motion>
    </SectionShell>
  );
}
`,
};
