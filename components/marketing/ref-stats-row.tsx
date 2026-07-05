"use client";

import { motion, useReducedMotion } from "framer-motion";
import { REF_STATS } from "@/lib/constants/marketing-content";

export function RefStatsRow() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Platform statistics" className="relative z-10 border-t border-[rgb(212_175_55/0.12)]">
      <div className="landing-container py-9 lg:py-10">
        <motion.dl
          className="grid grid-cols-2 gap-x-8 gap-y-7 lg:grid-cols-4 lg:gap-6"
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {REF_STATS.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <dt className="text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-none text-[#D4AF37]">
                {s.value}
              </dt>
              <dd className="mt-2 text-[13px] text-white/70">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
