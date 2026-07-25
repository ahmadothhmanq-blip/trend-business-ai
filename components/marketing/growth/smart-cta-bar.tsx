"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useScopedT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";

type SmartCtaProps = {
  className?: string;
};

const VARIANTS = [
  { id: "a" as const, href: "/signup", key: "variantA" },
  { id: "b" as const, href: "/pricing", key: "variantB" },
];

/**
 * Smart CTA — sticky bar with sticky A/B assignment in localStorage + event tracking.
 */
export function SmartCtaBar({ className }: SmartCtaProps) {
  const t = useScopedT("marketing.growth.smartCta");
  const [variantId, setVariantId] = useState<(typeof VARIANTS)[number]["id"]>("a");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = "tba_smart_cta_variant";
    let assigned = localStorage.getItem(key) as (typeof VARIANTS)[number]["id"] | null;
    if (assigned !== "a" && assigned !== "b") {
      assigned = Math.random() < 0.5 ? "a" : "b";
      localStorage.setItem(key, assigned);
    }
    setVariantId(assigned);

    void fetch("/api/growth/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "cta_impression",
        eventCategory: "experiment",
        pagePath: window.location.pathname,
        metadata: { variant: assigned },
      }),
    });

    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const variant = useMemo(
    () => VARIANTS.find((item) => item.id === variantId) ?? VARIANTS[0],
    [variantId],
  );

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] border-t border-[rgba(212,175,55,0.2)] bg-[#0B0B0B]/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">
            {t(`${variant.key}.eyebrow`)}
          </p>
          <p className="text-sm font-medium text-white sm:text-base">
            {t(`${variant.key}.title`)}
          </p>
        </div>
        <Link
          href={variant.href}
          onClick={() => {
            void fetch("/api/growth/events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                eventName: "cta_click",
                eventCategory: "conversion",
                pagePath: window.location.pathname,
                metadata: { variant: variant.id },
              }),
            });
          }}
          className="inline-flex rounded-full bg-[linear-gradient(180deg,#FFD700,#D4AF37)] px-5 py-2.5 text-sm font-semibold text-[#111111] hover:brightness-110"
        >
          {t(`${variant.key}.cta`)}
        </Link>
      </div>
    </div>
  );
}
