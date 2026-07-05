"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileText, Globe, Lightbulb, LineChart, type LucideIcon } from "lucide-react";
import { REF_SERVICES } from "@/lib/constants/marketing-content";

const SERVICE_ICONS: LucideIcon[] = [Lightbulb, LineChart, FileText, Globe];

export function RefServices() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="relative z-10 scroll-mt-28 border-t border-[rgb(212_175_55/0.12)]"
      aria-labelledby="services-title"
    >
      <div className="landing-container py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
            Services
          </p>
          <h2
            id="services-title"
            className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-bold tracking-[-0.03em] text-white"
          >
            Everything in the MVP is built around business planning.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-[#B5B5B5]">
            Focus on the work that matters before launch: ideas, research,
            reports, and a practical website plan.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REF_SERVICES.map((service, index) => {
            const Icon = SERVICE_ICONS[index] ?? Lightbulb;

            return (
              <motion.article
                key={service.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-[18px] border border-[rgb(212_175_55/0.16)] bg-[#111111]/78 p-5 shadow-[0_18px_60px_rgb(0_0_0/0.24)] backdrop-blur-xl transition-all duration-300 hover:border-[rgb(212_175_55/0.34)] hover:shadow-[0_18px_60px_rgb(212_175_55/0.09)]"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-5 flex size-11 items-center justify-center rounded-[14px] border border-[rgb(212_175_55/0.2)] bg-[rgb(212_175_55/0.08)] text-[#D4AF37]">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#D4AF37]/80 uppercase">
                  {service.eyebrow}
                </p>
                <h3 className="mt-2 text-lg font-bold tracking-[-0.01em] text-white">
                  {service.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-[#B5B5B5]">
                  {service.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
