"use client";

import { motion, useReducedMotion } from "framer-motion";
import { REF_STATS } from "@/lib/constants/marketing-content";
import { useScopedT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";

const STAT_KEYS = [
  "projectsCompleted",
  "countriesServed",
  "successRate",
  "aiSupport",
] as const;

/** Reference statistics row — large gold metrics, white labels, thin dividers. */
export function SiteStats() {
  const t = useScopedT("marketing.stats");
  const tCommon = useScopedT("marketing.common");
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={tCommon("platformStatistics")}
      className="relative z-10 border-y border-[rgba(212,175,55,0.14)] bg-[#0A0A0A]"
    >
      <div className="landing-container py-10 sm:py-12 lg:py-[52px]">
        <motion.dl
          className="grid grid-cols-2 lg:grid-cols-4"
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {REF_STATS.map((s, i) => (
            <div
              key={STAT_KEYS[i]}
              className={cn(
                "px-3 py-4 text-center sm:px-5 sm:py-2",
                i % 2 === 1 && "border-l border-[rgba(212,175,55,0.14)]",
                i >= 2 && "border-t border-[rgba(212,175,55,0.14)] lg:border-t-0",
                i > 0 && "lg:border-l lg:border-[rgba(212,175,55,0.16)]",
              )}
            >
              <dt className="text-[clamp(2rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.03em] text-[#D4AF37]">
                {s.value}
              </dt>
              <dd className="mt-2.5 text-[12px] font-medium text-white sm:mt-3 sm:text-[13px]">
                {t(STAT_KEYS[i])}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
