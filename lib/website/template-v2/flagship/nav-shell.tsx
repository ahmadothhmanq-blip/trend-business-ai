"use client";

import { useEffect, useState } from "react";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type PackageNavVariant =
  | "corporate"
  | "saas"
  | "education"
  | "finance"
  | "restaurant"
  | "hotel";

export type PackageNavShellProps = {
  variant: PackageNavVariant;
  ui: FlagshipUi;
  componentId: string;
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
  ctaHref?: string;
};

function useNavChrome() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#top");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return { scrolled, open, setOpen, activeHash };
}

export function PackageNavShell({
  variant,
  ui,
  componentId,
  brandName,
  ctaLabel,
  links,
  ctaHref,
}: PackageNavShellProps) {
  const { scrolled, open, setOpen, activeHash } = useNavChrome();
  if (!links?.length) return null;
  const resolvedCtaHref = ctaHref ?? "#contact";
  const mobileId = `${componentId}-mobile`;

  if (variant === "corporate") {
    return (
      <header
        data-v2-component={componentId}
        className={[
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--color-background)_94%,transparent)] shadow-[0_1px_0_rgba(8,14,24,0.04),0_8px_32px_rgba(8,14,24,0.04)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className={`${ui.container} flex h-[4.5rem] items-center justify-between gap-8 lg:h-[5rem]`}>
          <a href="#top" className={`${ui.fontDisplay} group flex items-center gap-3.5 text-[1.125rem] font-medium tracking-tight text-[var(--color-foreground)] ${ui.focusRing}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-accent)] bg-[var(--color-ink)] text-sm font-medium text-[var(--color-signal)] transition group-hover:border-[var(--color-signal)]" aria-hidden>
              {brandName?.charAt(0) ?? "B"}
            </span>
            <span className="hidden sm:inline">{brandName}</span>
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-11 lg:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} data-active={activeHash === link.href ? "true" : undefined} className={`cb-nav-link ${ui.focusRing}`}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href={resolvedCtaHref} className={`${ui.btnPrimary} hidden sm:inline-flex`}>{ctaLabel}</a>
            <button type="button" aria-expanded={open} aria-controls={mobileId} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden ${ui.focusRing}`}>
              <span className="sr-only">Menu</span>
              <span aria-hidden className="flex flex-col gap-1.5">
                <span className={`block h-px w-5 bg-current transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block h-px w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
                <span className={`block h-px w-5 bg-current transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
        {open ? (
          <nav id={mobileId} aria-label="Mobile" className="border-t border-[var(--border-subtle)] bg-[var(--color-surface)] px-6 py-8 lg:hidden">
            <ul className="flex flex-col gap-5">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setOpen(false)} className={`${ui.fontDisplay} block py-1 text-2xl font-medium text-[var(--color-foreground)]`}>{link.label}</a>
                </li>
              ))}
              <li className="border-t border-[var(--border-subtle)] pt-6">
                <a href={resolvedCtaHref} onClick={() => setOpen(false)} className={`${ui.btnPrimary} w-full`}>{ctaLabel}</a>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>
    );
  }

  if (variant === "saas") {
    return (
      <header data-v2-component={componentId} className={["sticky top-0 z-50 border-b transition-all duration-300", scrolled ? "border-[var(--border-default)] bg-[var(--color-surface)]/90 shadow-[var(--shadow-card)] backdrop-blur-xl" : "border-transparent bg-[var(--color-background)]/80 backdrop-blur-md"].join(" ")}>
        <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[4.25rem]">
          <a href="#top" className={`${ui.fontDisplay} flex items-center gap-2.5 text-base font-bold tracking-tight text-[var(--color-foreground)] ${ui.focusRing} rounded-sm`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-xs font-bold text-white" aria-hidden>
              {brandName?.charAt(0) ?? "N"}
            </span>
            {brandName}
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className={`${ui.fontBody} text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)] ${ui.focusRing} rounded-sm`}>{link.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={resolvedCtaHref} className={`${ui.btnPrimary} hidden sm:inline-flex`}>{ctaLabel}</a>
            <button type="button" aria-expanded={open} aria-controls={mobileId} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className={`inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden ${ui.focusRing}`}>
              <span className="sr-only">Menu</span>
              <span aria-hidden className="flex flex-col gap-1">
                <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
        {open ? (
          <nav id={mobileId} aria-label="Mobile" className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden">
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}><a href={link.href} onClick={() => setOpen(false)} className={`${ui.fontBody} block py-1 text-sm font-medium text-[var(--color-foreground)]`}>{link.label}</a></li>
              ))}
              <li className="pt-2"><a href={resolvedCtaHref} onClick={() => setOpen(false)} className={`${ui.btnPrimary} w-full`}>{ctaLabel}</a></li>
            </ul>
          </nav>
        ) : null}
      </header>
    );
  }

  if (variant === "education") {
    return (
      <header data-v2-component={componentId} className={["sticky top-0 z-50 border-b-4 transition-all duration-300", scrolled ? "border-[var(--color-signal)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-card)] backdrop-blur-xl" : "border-transparent bg-[var(--color-background)]/90 backdrop-blur-sm"].join(" ")}>
        <div className="mx-auto flex h-[4.25rem] max-w-[82rem] items-center justify-between gap-6 px-5 sm:px-8">
          <a href="#top" className={`${ui.fontDisplay} flex items-center gap-3 text-base font-semibold tracking-tight ${ui.focusRing}`}>
            <span className="flex h-9 w-9 items-center justify-center border-2 border-[var(--color-signal)] text-xs font-bold text-[var(--color-signal)]" aria-hidden>Ed</span>
            <span>{brandName}</span>
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
            {links.map((link, i) => (
              <a key={link.href} href={link.href} className={`${ui.fontBody} text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] transition hover:text-[var(--color-foreground)] ${ui.focusRing}`}>
                <span className="text-[var(--color-signal)]/70">{String(i + 1).padStart(2, "0")}</span> {link.label}
              </a>
            ))}
          </nav>
          <a href={resolvedCtaHref} className={`${ui.btnPrimary} hidden sm:inline-flex`}>{ctaLabel}</a>
        </div>
      </header>
    );
  }

  if (variant === "finance") {
    return (
      <header data-v2-component={componentId} className={["sticky top-0 z-50 transition-all duration-300", scrolled ? "border-b border-[var(--border-accent)] bg-[var(--color-ink)] text-[var(--color-background)] shadow-lg" : "border-b border-transparent bg-[var(--color-background)]"].join(" ")}>
        <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between gap-6 px-5 sm:px-8">
          <a href="#top" className={`${ui.fontDisplay} text-sm font-semibold uppercase tracking-[0.22em] ${ui.focusRing}`}>{brandName}</a>
          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className={`fn-font-mono text-[0.6875rem] uppercase tracking-[0.2em] opacity-70 transition hover:opacity-100 ${ui.focusRing}`}>{link.label}</a>
            ))}
          </nav>
          <a href={resolvedCtaHref} className={`${ui.btnPrimary} hidden sm:inline-flex`}>{ctaLabel}</a>
        </div>
        {scrolled ? <div className="fn-gold-rule mx-auto max-w-[82rem] opacity-40" aria-hidden /> : null}
      </header>
    );
  }

  const hospitalityCta = variant === "restaurant" ? "#reservation" : "#reservation";
  const accentHover = variant === "restaurant" ? "hover:text-[var(--color-copper)]" : "hover:text-[var(--color-azure)]";
  const accentOutline = variant === "restaurant" ? "focus-visible:outline-[var(--color-copper)]" : "focus-visible:outline-[var(--color-azure)]";

  return (
    <header data-v2-component={componentId} className={["fixed inset-x-0 top-0 z-[60] transition-all duration-500", scrolled ? "border-b border-[var(--border-subtle)] bg-[var(--color-background)]/92 backdrop-blur-xl" : "border-b border-transparent bg-transparent"].join(" ")}>
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <a href="#top" className={`${ui.fontDisplay} text-lg tracking-[0.06em] text-[var(--color-foreground)] transition ${accentHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${accentOutline}`}>
          {brandName}
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={`${ui.fontBody} text-[0.625rem] font-medium uppercase tracking-[0.32em] text-[var(--color-muted)] transition ${accentHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${accentOutline}`}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={hospitalityCta} className={`${ui.btnPrimary} hidden sm:inline-flex`}>{ctaLabel}</a>
          <button type="button" aria-expanded={open} aria-controls={mobileId} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className={`inline-flex h-11 w-11 items-center justify-center border border-[var(--border-subtle)] text-[var(--color-foreground)] lg:hidden ${ui.focusRing}`}>
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id={mobileId} aria-label="Mobile" className="border-t border-[var(--border-subtle)] bg-[var(--color-background)]/98 px-5 py-6 lg:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}><a href={link.href} onClick={() => setOpen(false)} className={`${ui.fontBody} block text-sm uppercase tracking-[0.28em] text-[var(--color-foreground)]/80`}>{link.label}</a></li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
