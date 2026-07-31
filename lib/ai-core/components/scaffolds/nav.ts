export const NAV_SCAFFOLDS: Record<string, string> = {
  SiteHeader: `"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

type SiteHeaderProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SiteHeader({
  brandName = "Brand",
  ctaLabel = "Get started",
  links = DEFAULT_LINKS,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-[var(--color-foreground)]/10 bg-[var(--color-background)]/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-[var(--color-background)]/70 backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[var(--container-max,72rem)] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.25rem] lg:px-8">
        <a href="/" className="text-sm font-semibold tracking-tight">{brandName}</a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--color-foreground)]/65 transition hover:text-[var(--color-foreground)]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="hidden rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--color-on-primary,white)] sm:inline-flex">
            {ctaLabel}
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-lg leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--color-foreground)]/10 bg-[var(--color-background)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="#contact" className="mt-2 rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--color-on-primary,white)]" onClick={() => setOpen(false)}>
              {ctaLabel}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
`,

  SiteHeaderTransparent: `"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#gallery", label: "Gallery" },
  { href: "#services", label: "Services" },
  { href: "#testimonials", label: "Stories" },
  { href: "#contact", label: "Contact" },
];

type SiteHeaderTransparentProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SiteHeaderTransparent({
  brandName = "Brand",
  ctaLabel = "Book now",
  links = DEFAULT_LINKS,
}: SiteHeaderTransparentProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={["fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "bg-[var(--color-background)]/90 shadow-sm backdrop-blur-xl" : "bg-transparent"].join(" ")}>
      <div className="mx-auto flex h-16 max-w-[var(--container-max,72rem)] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <a href="/" className={["text-sm font-semibold tracking-[0.08em] uppercase", scrolled ? "text-[var(--color-foreground)]" : "text-white"].join(" ")}>
          {brandName}
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={["text-sm transition", scrolled ? "text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)]" : "text-white/80 hover:text-white"].join(" ")}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#booking" className={["hidden rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex", scrolled ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)]" : "bg-white text-black"].join(" ")}>
            {ctaLabel}
          </a>
          <button type="button" aria-label="Menu" className={["inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden", scrolled ? "border-[var(--color-foreground)]/20 text-[var(--color-foreground)]" : "border-white/40 text-white"].join(" ")} onClick={() => setOpen((v) => !v)}>
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="bg-[var(--color-background)] px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
`,

  NavModern: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Product" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Customers" },
  { href: "#faq", label: "FAQ" },
];

type NavModernProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function NavModern({
  brandName = "Brand",
  ctaLabel = "Start free",
  links = DEFAULT_LINKS,
}: NavModernProps) {
  const [open, setOpen] = useState(false);
  const mark = brandName.slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-foreground)]/8 bg-[var(--color-background)]/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-[var(--container-max,72rem)] items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[10px] font-bold text-[var(--color-on-primary,white)]">{mark}</span>
          {brandName}
        </a>
        <nav className="hidden items-center gap-1 rounded-full border border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] p-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[var(--color-foreground)]/65 transition hover:bg-[var(--color-foreground)]/5 hover:text-[var(--color-foreground)]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="hidden text-xs font-medium text-[var(--color-foreground)]/60 sm:inline">Sign in</a>
          <a href="#pricing" className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-on-primary,white)] shadow-sm">
            {ctaLabel}
          </a>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-foreground)]/15 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--color-foreground)]/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm" onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
`,
  NavSidebar: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features", icon: "◆" },
  { href: "#case-studies", label: "Cases", icon: "◇" },
  { href: "#integrations", label: "Integrations", icon: "○" },
  { href: "#contact", label: "Contact", icon: "◎" },
];

type NavSidebarProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function NavSidebar({
  brandName = "Brand",
  ctaLabel = "Book demo",
  links = DEFAULT_LINKS.map(({ href, label }) => ({ href, label })),
}: NavSidebarProps) {
  const [open, setOpen] = useState(false);
  const mark = brandName.slice(0, 1).toUpperCase();

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-foreground)]/15 bg-[var(--color-background)]/90 backdrop-blur-xl lg:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "×" : "☰"}
      </button>
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[var(--color-foreground)]/8 px-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-[var(--color-on-primary,white)]">
            {mark}
          </span>
          <span className="text-sm font-semibold tracking-tight">{brandName}</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-foreground)]/70 transition hover:bg-[var(--color-foreground)]/5 hover:text-[var(--color-foreground)]"
            >
              <span className="text-[10px] text-[var(--color-accent,var(--color-primary))]">
                {DEFAULT_LINKS[i]?.icon || "•"}
              </span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="border-t border-[var(--color-foreground)]/8 p-4">
          <a
            href="#contact"
            className="flex w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary,white)] shadow-lg shadow-[var(--color-primary)]/20"
          >
            {ctaLabel}
          </a>
        </div>
      </aside>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
`,

  NavHamburger: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#story", label: "Story" },
  { href: "#features", label: "Features" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

type NavHamburgerProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function NavHamburger({
  brandName = "Brand",
  ctaLabel = "Subscribe",
  links = DEFAULT_LINKS,
}: NavHamburgerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="mx-auto flex h-16 max-w-[var(--container-max,80rem)] items-center justify-between px-5 sm:px-8">
          <a href="/" className="text-xs font-bold uppercase tracking-[0.32em] text-white">
            {brandName}
          </a>
          <button
            type="button"
            aria-label="Open menu"
            className="group flex flex-col items-end gap-1.5 p-2"
            onClick={() => setOpen(true)}
          >
            <span className="block h-px w-8 bg-white transition group-hover:w-10" />
            <span className="block h-px w-5 bg-white transition group-hover:w-10" />
          </button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-[70] flex bg-[var(--color-background)] text-[var(--color-foreground)]">
          <div className="flex flex-1 flex-col justify-between p-8 sm:p-12">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-foreground)]/45">
                Menu
              </p>
              <button
                type="button"
                aria-label="Close menu"
                className="text-3xl leading-none"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[0.95] tracking-[-0.03em] transition hover:text-[var(--color-primary)]"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="inline-flex max-w-xs items-center justify-center border border-[var(--color-foreground)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em]"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
`,

  NavCentered: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

type NavCenteredProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function NavCentered({
  brandName = "Brand",
  ctaLabel = "Get started",
  links = DEFAULT_LINKS,
}: NavCenteredProps) {
  const [open, setOpen] = useState(false);
  const left = links.slice(0, Math.ceil(links.length / 2));
  const right = links.slice(Math.ceil(links.length / 2));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-foreground)]/6 bg-[var(--color-background)]/80 backdrop-blur-xl">
      <div className="mx-auto hidden h-[4.5rem] max-w-[var(--container-max,68rem)] items-center justify-between px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <nav className="flex items-center justify-end gap-8">
          {left.map((l) => (
            <a key={l.href} href={l.href} className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground)]/55 transition hover:text-[var(--color-foreground)]">
              {l.label}
            </a>
          ))}
        </nav>
        <a href="/" className="px-6 text-center text-sm font-semibold tracking-[0.12em] uppercase">
          {brandName}
        </a>
        <nav className="flex items-center gap-8">
          {right.map((l) => (
            <a key={l.href} href={l.href} className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground)]/55 transition hover:text-[var(--color-foreground)]">
              {l.label}
            </a>
          ))}
          <a href="#contact" className="rounded-full border border-[var(--color-foreground)]/20 px-4 py-2 text-xs font-semibold">
            {ctaLabel}
          </a>
        </nav>
      </div>
      <div className="flex h-14 items-center justify-between px-4 lg:hidden">
        <a href="/" className="text-sm font-semibold">{brandName}</a>
        <button type="button" aria-label="Menu" className="text-xl" onClick={() => setOpen((v) => !v)}>
          {open ? "×" : "☰"}
        </button>
      </div>
      {open ? (
        <nav className="flex flex-col gap-3 border-t border-[var(--color-foreground)]/8 px-4 py-4 lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
`,
};
