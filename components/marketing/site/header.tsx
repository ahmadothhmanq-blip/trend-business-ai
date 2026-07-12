"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import {
  NAV_LINKS,
  NAV_SERVICES_DROPDOWN,
  NAV_SOLUTIONS_DROPDOWN,
} from "@/lib/constants/navigation";
import { OfficialLogo } from "@/components/marketing/official-logo";
import { SiteButton } from "@/components/marketing/site/button";
import { cn } from "@/lib/utils";

function Dropdown({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: readonly { label: string; href: string }[];
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-white/85 transition-colors hover:text-white xl:text-[14px]"
      >
        {label}
        <ChevronDown className="size-3.5 text-[#D4AF37]/90 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#111111]/98 py-2 shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-4 py-2.5 text-[13px] text-[#B5B5B5] hover:bg-[rgba(212,175,55,0.1)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Floating pill nav — reference height ~56px, gold hairline border. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-[14px]">
      <div className="mx-auto flex h-[52px] max-w-[1120px] items-center justify-between gap-3 rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(17,17,17,0.92)] px-3 shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_24px_rgba(212,175,55,0.06)] backdrop-blur-2xl sm:h-[56px] sm:px-5 lg:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Trend Business AI home"
          onClick={() => setOpen(false)}
        >
          <OfficialLogo compact size="sm" className="!size-7 sm:!size-[30px]" />
          <span className="hidden text-[13px] font-semibold tracking-[-0.02em] sm:inline xl:text-[14px]">
            <span className="text-white">Trend Business </span>
            <span className="text-[#D4AF37]">AI</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-6">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                {l.dropdown ? (
                  <Dropdown
                    label={l.label}
                    href={l.href}
                    items={
                      l.label === "Services"
                        ? NAV_SERVICES_DROPDOWN
                        : NAV_SOLUTIONS_DROPDOWN
                    }
                  />
                ) : (
                  <Link
                    href={l.href}
                    className="text-[13px] font-medium text-white/85 transition-colors hover:text-white xl:text-[14px]"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-white/80 transition-colors hover:text-white sm:inline xl:text-[14px]"
          >
            Sign In
          </Link>
          <div className="hidden sm:block">
            <SiteButton href="/signup" size="sm">
              Get Started <ArrowRight className="size-3.5" />
            </SiteButton>
          </div>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" strokeWidth={2.25} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto mt-2 max-w-[1120px] overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.18)] bg-[rgba(17,17,17,0.97)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="space-y-1 p-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-[15px] font-medium text-[#C7C7C7] hover:bg-white/[0.04] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 border-t border-white/10 px-1 pt-3 pb-1 sm:hidden">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-2xl px-3 py-3 text-[15px] font-medium text-[#C7C7C7]"
            >
              Sign In
            </Link>
            <SiteButton href="/signup" size="md" className="w-full">
              Get Started <ArrowRight className="size-3.5" />
            </SiteButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
