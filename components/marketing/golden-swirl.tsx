"use client";

import { motion, useReducedMotion } from "framer-motion";

export function GoldenSwirl() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute -inset-10 flex items-center justify-center sm:-inset-14" aria-hidden="true">
      <motion.div
        className="absolute right-[-8%] top-[10%] size-[130%]"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 520 520" className="size-full" fill="none">
          <defs>
            <linearGradient id="tb-swirl-a" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
              <stop offset="40%" stopColor="#F1C44D" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
            <filter id="tb-swirl-blur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <ellipse
            cx="280"
            cy="260"
            rx="220"
            ry="200"
            stroke="url(#tb-swirl-a)"
            strokeWidth="2"
            opacity="0.55"
            filter="url(#tb-swirl-blur)"
          />
          <path
            d="M 320 50 C 460 100, 480 240, 380 360 C 280 460, 100 420, 70 260 C 45 110, 180 40, 320 50"
            stroke="url(#tb-swirl-a)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#tb-swirl-blur)"
          />
          <path
            d="M 360 90 C 470 150, 450 280, 330 380"
            stroke="#FFD700"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
            filter="url(#tb-swirl-blur)"
          />
        </svg>
      </motion.div>
      <div className="absolute size-[75%] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.12)_0%,rgba(212,175,55,0.06)_35%,transparent_72%)]" />
      <div className="absolute right-[5%] top-[20%] size-32 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.18)_0%,transparent_70%)] blur-xl" />
    </div>
  );
}
