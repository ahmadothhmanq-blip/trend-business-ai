"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "@/lib/i18n/client";

const HERO =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80";
const CHEF =
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1600&q=80";
const GALLERY_SRC = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
];

export function MaisonNocturneSite() {
  const { t } = useTranslation();
  const mk = (key: string) => t(`marketing.maisonNocturne.${key}`);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0.35]);
  const [reserved, setReserved] = useState(false);

  const gallery = useMemo(
    () => GALLERY_SRC.map((src, i) => ({ src, alt: mk(`gallery.${i}.alt`) })),
    [t],
  );

  const tastingMenu = useMemo(
    () => [0, 1, 2, 3, 4, 5].map((i) => ({
      name: mk(`menu.tasting.${i}.name`),
      note: mk(`menu.tasting.${i}.note`),
    })),
    [t],
  );

  const aLaCarte = useMemo(
    () => [0, 1, 2, 3].map((i) => ({
      name: mk(`menu.aLaCarte.${i}.name`),
      price: mk(`menu.aLaCarte.${i}.price`),
      note: mk(`menu.aLaCarte.${i}.note`),
    })),
    [t],
  );

  const testimonials = useMemo(
    () => [0, 1, 2].map((i) => ({
      quote: mk(`testimonials.${i}.quote`),
      name: mk(`testimonials.${i}.name`),
      role: mk(`testimonials.${i}.role`),
    })),
    [t],
  );

  const locations = useMemo(
    () => (["paris", "dubai"] as const).map((key) => ({
      city: mk(`locations.${key}.city`),
      address: mk(`locations.${key}.address`),
      hours: mk(`locations.${key}.hours`),
      phone: mk(`locations.${key}.phone`),
    })),
    [t],
  );

  function onReserve(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReserved(true);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--mn-line)] bg-[rgba(7,7,6,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <a href="#top" className="mn-display text-lg tracking-[0.12em] sm:text-xl">
            {mk("brandName")}
          </a>
          <nav className="hidden items-center gap-8 text-[12px] font-medium tracking-[0.14em] text-[var(--mn-muted)] uppercase md:flex">
            <a href="#menu" className="transition hover:text-[var(--mn-ink)]">{mk("nav.menu")}</a>
            <a href="#chef" className="transition hover:text-[var(--mn-ink)]">{mk("nav.chef")}</a>
            <a href="#gallery" className="transition hover:text-[var(--mn-ink)]">{mk("nav.gallery")}</a>
            <a href="#locations" className="transition hover:text-[var(--mn-ink)]">{mk("nav.locations")}</a>
          </nav>
          <a
            href="#reservations"
            className="rounded-full border border-[var(--mn-gold)]/50 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-[var(--mn-gold)] uppercase transition hover:bg-[var(--mn-gold)] hover:text-[#070706]"
          >
            {mk("nav.reserve")}
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative min-h-[100svh] overflow-hidden">
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO} alt={mk("heroImageAlt")} className="mn-reveal h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--mn-bg)] via-[rgba(7,7,6,0.55)] to-[rgba(7,7,6,0.35)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(7,7,6,0.65)_100%)]" />
          </motion.div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 sm:px-8 sm:pb-28"
          >
            <p className="mn-eyebrow mn-fade-up">{mk("hero.eyebrow")}</p>
            <h1
              className="mn-display mn-fade-up mt-5 max-w-4xl text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.92] font-medium"
              style={{ animationDelay: "120ms" }}
            >
              {mk("brandName")}
            </h1>
            <div className="mn-line-draw mt-7 h-px w-28 bg-[var(--mn-gold)]" aria-hidden />
            <p
              className="mn-fade-up mt-7 max-w-md text-[15px] leading-relaxed font-light text-[var(--mn-ink)]/80 sm:text-base"
              style={{ animationDelay: "220ms" }}
            >
              {mk("hero.tagline")}
            </p>
            <div className="mn-fade-up mt-10 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
              <a
                href="#reservations"
                className="inline-flex items-center rounded-full bg-[var(--mn-gold)] px-7 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-[#070706] uppercase transition hover:bg-[var(--mn-ink)]"
              >
                {mk("hero.reserveTable")}
              </a>
              <a
                href="#menu"
                className="inline-flex items-center rounded-full border border-[var(--mn-ink)]/25 px-7 py-3.5 text-[12px] font-medium tracking-[0.16em] text-[var(--mn-ink)] uppercase transition hover:border-[var(--mn-gold)] hover:text-[var(--mn-gold)]"
              >
                {mk("hero.viewMenu")}
              </a>
            </div>
          </motion.div>
        </section>

        <section id="menu" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="mn-eyebrow">{mk("menu.eyebrow")}</p>
          <h2 className="mn-display mt-4 text-4xl font-medium sm:text-5xl">{mk("menu.title")}</h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--mn-muted)]">{mk("menu.description")}</p>

          <div className="mt-16 grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="mn-display text-2xl text-[var(--mn-gold)]">{mk("menu.tastingTitle")}</h3>
              <p className="mt-2 text-sm text-[var(--mn-muted)]">{mk("menu.tastingPrice")}</p>
              <ul className="mt-10 space-y-8">
                {tastingMenu.map((item) => (
                  <li key={item.name} className="border-b border-[var(--mn-line)] pb-6">
                    <p className="mn-display text-xl font-medium">{item.name}</p>
                    <p className="mt-2 text-sm text-[var(--mn-muted)]">{item.note}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mn-display text-2xl text-[var(--mn-gold)]">{mk("menu.aLaCarteTitle")}</h3>
              <p className="mt-2 text-sm text-[var(--mn-muted)]">{mk("menu.aLaCarteSubtitle")}</p>
              <ul className="mt-10 space-y-8">
                {aLaCarte.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-6 border-b border-[var(--mn-line)] pb-6">
                    <div>
                      <p className="mn-display text-xl font-medium">{item.name}</p>
                      <p className="mt-2 text-sm text-[var(--mn-muted)]">{item.note}</p>
                    </div>
                    <span className="shrink-0 text-sm tracking-wide text-[var(--mn-gold)]">€{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="chef" className="border-y border-[var(--mn-line)] bg-[var(--mn-surface)]">
          <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2">
            <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CHEF} alt={mk("chef.imageAlt")} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--mn-surface)]/40 lg:bg-gradient-to-l" />
            </div>
            <div className="flex flex-col justify-center px-5 py-20 sm:px-10 lg:px-14 lg:py-28">
              <p className="mn-eyebrow">{mk("chef.eyebrow")}</p>
              <h2 className="mn-display mt-4 text-4xl font-medium sm:text-5xl">{mk("chef.name")}</h2>
              <p className="mt-8 text-[15px] leading-[1.8] text-[var(--mn-muted)] sm:text-base">{mk("chef.bio1")}</p>
              <p className="mt-6 text-[15px] leading-[1.8] text-[var(--mn-muted)] sm:text-base">{mk("chef.bio2")}</p>
              <p className="mn-display mt-10 text-lg italic text-[var(--mn-gold)]">“{mk("chef.quote")}”</p>
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="mn-eyebrow">{mk("gallery.eyebrow")}</p>
          <h2 className="mn-display mt-4 text-4xl font-medium sm:text-5xl">{mk("gallery.title")}</h2>
          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {gallery.map((shot, i) => (
              <figure
                key={shot.src}
                className={`group relative overflow-hidden bg-[var(--mn-surface)] ${
                  i === 0 || i === 3 ? "aspect-[3/4] md:row-span-1" : "aspect-[4/3]"
                } ${i === 0 ? "md:col-span-1" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot.src} alt={shot.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-[12px] text-white/80 opacity-0 transition group-hover:opacity-100">
                  {shot.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--mn-line)] bg-[var(--mn-surface)] py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="mn-eyebrow">{mk("testimonials.eyebrow")}</p>
            <h2 className="mn-display mt-4 text-4xl font-medium sm:text-5xl">{mk("testimonials.title")}</h2>
            <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
              {testimonials.map((item) => (
                <blockquote key={item.name} className="border-t border-[var(--mn-gold)]/35 pt-8">
                  <p className="mn-display text-xl leading-relaxed font-normal text-[var(--mn-ink)]/90 sm:text-[1.35rem]">“{item.quote}”</p>
                  <footer className="mt-8">
                    <p className="text-sm font-medium tracking-wide">{item.name}</p>
                    <p className="mt-1 text-xs tracking-[0.12em] text-[var(--mn-muted)] uppercase">{item.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="locations" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="mn-eyebrow">{mk("locations.eyebrow")}</p>
          <h2 className="mn-display mt-4 text-4xl font-medium sm:text-5xl">{mk("locations.title")}</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {locations.map((loc) => (
              <article key={loc.city} className="relative overflow-hidden border border-[var(--mn-line)] bg-[var(--mn-surface)] p-8 sm:p-10">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "linear-gradient(135deg, var(--mn-gold), transparent 55%)" }}
                />
                <p className="mn-display relative text-3xl text-[var(--mn-gold)]">{loc.city}</p>
                <p className="relative mt-6 text-[15px] leading-relaxed text-[var(--mn-muted)]">{loc.address}</p>
                <p className="relative mt-3 text-sm text-[var(--mn-ink)]/80">{loc.hours}</p>
                <a
                  href={`tel:${loc.phone.replace(/\s/g, "")}`}
                  className="relative mt-8 inline-block text-sm tracking-wide text-[var(--mn-gold)] transition hover:text-[var(--mn-ink)]"
                >
                  {loc.phone}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="reservations" className="border-t border-[var(--mn-line)] bg-[var(--mn-surface)]">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div>
              <p className="mn-eyebrow">{mk("reservations.eyebrow")}</p>
              <h2 className="mn-display mt-4 text-4xl font-medium sm:text-5xl">{mk("reservations.title")}</h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--mn-muted)]">{mk("reservations.description")}</p>
              <ul className="mt-10 space-y-3 text-sm text-[var(--mn-muted)]">
                <li>{mk("reservations.dressCode")}</li>
                <li>{mk("reservations.dietary")}</li>
                <li>{mk("reservations.children")}</li>
              </ul>
            </div>

            <div className="border border-[var(--mn-line)] bg-[var(--mn-bg)] p-6 sm:p-8">
              {reserved ? (
                <div className="flex min-h-[320px] flex-col justify-center text-center">
                  <p className="mn-eyebrow">{mk("reservations.confirmedEyebrow")}</p>
                  <p className="mn-display mt-4 text-3xl">{mk("reservations.confirmedTitle")}</p>
                  <p className="mt-4 text-sm text-[var(--mn-muted)]">{mk("reservations.confirmedDescription")}</p>
                </div>
              ) : (
                <form onSubmit={onReserve} className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[11px] tracking-[0.16em] text-[var(--mn-muted)] uppercase sm:col-span-1">
                    {mk("reservations.name")}
                    <input required name="name" className="mt-2 w-full border border-[var(--mn-line)] bg-transparent px-3 py-3 text-sm text-[var(--mn-ink)] outline-none focus:border-[var(--mn-gold)]" />
                  </label>
                  <label className="block text-[11px] tracking-[0.16em] text-[var(--mn-muted)] uppercase">
                    {mk("reservations.email")}
                    <input required type="email" name="email" className="mt-2 w-full border border-[var(--mn-line)] bg-transparent px-3 py-3 text-sm text-[var(--mn-ink)] outline-none focus:border-[var(--mn-gold)]" />
                  </label>
                  <label className="block text-[11px] tracking-[0.16em] text-[var(--mn-muted)] uppercase">
                    {mk("reservations.date")}
                    <input required type="date" name="date" className="mt-2 w-full border border-[var(--mn-line)] bg-transparent px-3 py-3 text-sm text-[var(--mn-ink)] outline-none focus:border-[var(--mn-gold)] [color-scheme:dark]" />
                  </label>
                  <label className="block text-[11px] tracking-[0.16em] text-[var(--mn-muted)] uppercase">
                    {mk("reservations.guests")}
                    <input required type="number" min={1} max={8} defaultValue={2} name="guests" className="mt-2 w-full border border-[var(--mn-line)] bg-transparent px-3 py-3 text-sm text-[var(--mn-ink)] outline-none focus:border-[var(--mn-gold)]" />
                  </label>
                  <label className="block text-[11px] tracking-[0.16em] text-[var(--mn-muted)] uppercase sm:col-span-2">
                    {mk("reservations.location")}
                    <select name="location" className="mt-2 w-full border border-[var(--mn-line)] bg-[var(--mn-bg)] px-3 py-3 text-sm text-[var(--mn-ink)] outline-none focus:border-[var(--mn-gold)]">
                      <option>{mk("reservations.paris")}</option>
                      <option>{mk("reservations.dubai")}</option>
                    </select>
                  </label>
                  <label className="block text-[11px] tracking-[0.16em] text-[var(--mn-muted)] uppercase sm:col-span-2">
                    {mk("reservations.notes")}
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder={mk("reservations.notesPlaceholder")}
                      className="mt-2 w-full border border-[var(--mn-line)] bg-transparent px-3 py-3 text-sm text-[var(--mn-ink)] outline-none placeholder:text-[var(--mn-muted)]/50 focus:border-[var(--mn-gold)]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="sm:col-span-2 mt-2 inline-flex items-center justify-center rounded-full bg-[var(--mn-gold)] px-6 py-3.5 text-[12px] font-semibold tracking-[0.18em] text-[#070706] uppercase transition hover:bg-[var(--mn-ink)]"
                  >
                    {mk("reservations.submit")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--mn-line)] py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
          <p className="mn-display text-xl tracking-[0.08em]">{mk("brandName")}</p>
          <p className="text-xs tracking-[0.14em] text-[var(--mn-muted)] uppercase">{mk("footer.tagline")}</p>
        </div>
      </footer>
    </>
  );
}
