"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogoLarge, BrandLogoWatermark } from "@/components/ui/brand-logo";
import {
  REF_FOOTER_COMPANY,
  REF_FOOTER_RESOURCES,
  REF_FOOTER_SERVICES,
  REF_FOOTER_TAGLINE,
  REF_LEGAL,
} from "@/lib/constants/marketing-content";

export function RefFooter() {
  return (
    <footer id="contact" className="relative z-10 border-t border-[rgb(212_175_55/0.12)] bg-[#050505]">
      <BrandLogoWatermark className="pointer-events-none absolute bottom-0 right-0 size-[320px] opacity-[0.05] sm:size-[420px]" />

      <div className="landing-container relative py-14 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1.25fr] lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogoLarge />
            <p className="mt-5 max-w-[280px] text-[13px] leading-[1.65] text-[#B5B5B5]">
              {REF_FOOTER_TAGLINE}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#D4AF37] uppercase">Services</p>
            <ul className="mt-4 space-y-2.5">
              {REF_FOOTER_SERVICES.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-[#B5B5B5] hover:text-white">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#D4AF37] uppercase">Company</p>
            <ul className="mt-4 space-y-2.5">
              {REF_FOOTER_COMPANY.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-[#B5B5B5] hover:text-white">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#D4AF37] uppercase">Resources</p>
            <ul className="mt-4 space-y-2.5">
              {REF_FOOTER_RESOURCES.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[13px] text-[#B5B5B5] hover:text-white">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#D4AF37] uppercase">Get Started</p>
            <p className="mt-3 text-[13px] leading-relaxed text-[#B5B5B5]">
              Create a free beta account and start building your first business planning asset.
            </p>
            <Link
              href="/signup"
              className="btn-gold mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold text-[#050505]"
            >
              Start Free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-[rgb(212_175_55/0.12)] pt-7">
          <div className="flex flex-col items-center gap-4 text-[12px] text-[#B5B5B5] md:grid md:grid-cols-3 md:items-center">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} Trend Business AI. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-6">
              {REF_LEGAL.map((l) => (
                <Link key={l.label} href={l.href} className="hover:text-white">{l.label}</Link>
              ))}
            </nav>
            <span className="hidden md:block" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
