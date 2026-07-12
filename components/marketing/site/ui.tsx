"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteButton } from "@/components/marketing/site/button";

export function SiteEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,175,55,0.45)] bg-[rgba(212,175,55,0.1)] px-3.5 py-1.5 text-[12px] font-medium text-[#D4AF37] sm:text-[13px]",
        className,
      )}
    >
      <span aria-hidden="true">✦</span>
      {children}
    </p>
  );
}

export function SiteLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
      {children}
    </p>
  );
}

export function SiteH1({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h1
      id={id}
      className={cn(
        "text-[clamp(2.35rem,5.5vw,3.85rem)] font-bold leading-[1.05] tracking-[-0.04em] text-white",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function SiteH2({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "text-[clamp(1.875rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.035em] text-white",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SiteBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[15px] leading-[1.75] text-[#B5B5B5] sm:text-[16px]", className)}>
      {children}
    </p>
  );
}

export function SiteCard({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = cn(
    "relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all duration-300",
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#D4AF37]/55 before:to-transparent",
    href && "hover:border-[rgba(212,175,55,0.42)] hover:shadow-[0_28px_90px_rgba(212,175,55,0.12)]",
    className,
  );
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <div className={classes}>{children}</div>;
}

export function SitePageHero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="landing-container pt-[96px] pb-12 sm:pt-[104px] lg:pb-14 lg:pt-[112px]">
      <div className="mx-auto max-w-3xl text-center">
        <SiteEyebrow>{eyebrow}</SiteEyebrow>
        <SiteH1 className="mt-5">{title}</SiteH1>
        <SiteBody className="mx-auto mt-5 max-w-2xl">{description}</SiteBody>
        {(primary || secondary) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primary && (
              <SiteButton href={primary.href} size="lg">
                {primary.label} <ArrowRight className="size-4" />
              </SiteButton>
            )}
            {secondary && (
              <SiteButton href={secondary.href} variant="dark" size="lg">
                {secondary.label}
              </SiteButton>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteSectionHead({
  label,
  title,
  description,
  align = "center",
  id,
}: {
  label: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  id?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <SiteLabel>{label}</SiteLabel>
      <SiteH2 id={id} className="mt-4">
        {title}
      </SiteH2>
      {description && (
        <SiteBody className={cn("mt-4", align === "center" ? "mx-auto max-w-2xl" : "max-w-xl")}>
          {description}
        </SiteBody>
      )}
    </div>
  );
}

export function SiteChecks({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[14px] leading-[1.65] text-[#C7C7C7]">
          <Check className="mt-0.5 size-4 shrink-0 text-[#D4AF37]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SiteCtaBand({
  title,
  description,
  primaryHref = "/signup",
  primaryLabel = "Start Free",
  secondaryHref = "/#solutions",
  secondaryLabel = "Browse AI Solutions",
}: {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-t border-[rgba(212,175,55,0.12)]">
      <div className="landing-container py-16 lg:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.28)] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.22),transparent_55%),linear-gradient(160deg,#141414,#080808)] px-6 py-14 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45),0_0_80px_rgba(212,175,55,0.08)] sm:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F4D56A]/80 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-0 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.15),transparent_70%)] blur-2xl" />
          <SiteLabel>Get started</SiteLabel>
          <SiteH2 className="mx-auto mt-4 max-w-3xl">{title}</SiteH2>
          <SiteBody className="mx-auto mt-4 max-w-xl">{description}</SiteBody>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SiteButton href={primaryHref} size="lg">
              {primaryLabel} <ArrowRight className="size-4" />
            </SiteButton>
            <SiteButton href={secondaryHref} variant="dark" size="lg">
              {secondaryLabel}
            </SiteButton>
          </div>
        </div>
      </div>
    </section>
  );
}
