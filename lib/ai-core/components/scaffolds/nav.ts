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
};
