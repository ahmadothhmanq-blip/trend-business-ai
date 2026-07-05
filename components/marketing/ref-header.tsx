"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { RefButton } from "@/components/marketing/ui/ref-button";

const CHEVRON = new Set(["Services", "How It Works"]);

export function RefHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto grid h-14 max-w-[1200px] grid-cols-2 items-center border-b border-[rgb(212_175_55/0.12)] bg-[rgb(5_5_5/0.92)] px-5 backdrop-blur-[20px] lg:h-[68px] lg:grid-cols-[1fr_auto_1fr] lg:rounded-full lg:border lg:border-[rgb(212_175_55/0.22)] lg:px-6 lg:shadow-[0_8px_32px_rgb(0_0_0/0.4)]">
        <Link href="/" className="justify-self-start" aria-label="Trend Business AI home">
          <BrandLogo size="sm" variant="nav" />
        </Link>

        <nav aria-label="Main" className="hidden justify-self-center lg:block">
          <ul className="flex items-center gap-9">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#B5B5B5] transition-colors hover:text-white"
                >
                  {l.label}
                  {CHEVRON.has(l.label) && (
                    <ChevronDown className="size-3 text-[#D4AF37]/70" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center justify-self-end gap-5 lg:flex">
          <Link href="/login" className="text-[13px] font-medium text-[#B5B5B5] hover:text-white">
            Sign In
          </Link>
          <RefButton href="/signup" size="sm" magnetic>
            Get Started <ArrowRight className="size-3.5" aria-hidden="true" />
          </RefButton>
        </div>

        <button
          type="button"
          className="justify-self-end rounded-full p-1.5 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-6 text-[#D4AF37]" /> : <Menu className="size-6 text-[#D4AF37]" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-[1200px] rounded-[16px] border border-[rgb(212_175_55/0.22)] bg-[rgb(17_17_17/0.95)] p-4 shadow-[0_16px_48px_rgb(0_0_0/0.5)] backdrop-blur-[20px] lg:hidden"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block py-2.5 text-sm text-[#B5B5B5]" onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2 border-t border-[rgb(212_175_55/0.12)] pt-3">
              <Link href="/login" className="py-2 text-center text-sm text-[#B5B5B5]" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <RefButton href="/signup" className="justify-center">Get Started</RefButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
