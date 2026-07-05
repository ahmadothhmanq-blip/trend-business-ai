"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMousePosition } from "@/components/marketing/motion/mouse-provider";

export function RefBackground() {
  const mouse = useMousePosition();
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#050505]" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgb(212 175 55 / 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgb(212 175 55 / 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 55% at 50% 28%, black 15%, transparent 72%)",
        }}
      />
      <motion.div
        className="absolute left-[58%] top-[18%] h-[520px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.1)_0%,rgba(212,175,55,0.05)_40%,transparent_68%)]"
        style={{
          x: reduceMotion ? 0 : mouse.nx * -14,
          y: reduceMotion ? 0 : mouse.ny * -8,
        }}
      />
    </div>
  );
}
