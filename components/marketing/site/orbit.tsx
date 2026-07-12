"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Dense glowing gold energy ring — reference hero artwork. */
export function SiteOrbit() {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const a = `oa-${uid}`;
  const b = `ob-${uid}`;
  const c = `oc-${uid}`;
  const g = `og-${uid}`;

  return (
    <div className="pointer-events-none absolute -inset-[28%] z-0" aria-hidden="true">
      <div className="pointer-events-none absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.35)_0%,rgba(212,175,55,0.14)_30%,transparent_65%)]" />
      <div className="absolute right-0 top-[2%] size-64 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.55)_0%,transparent_70%)] blur-3xl" />
      <div className="absolute bottom-0 left-[-4%] size-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.4)_0%,transparent_70%)] blur-3xl" />
      <div className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_140px_50px_rgba(212,175,55,0.16)]" />

      <motion.svg
        viewBox="0 0 640 640"
        className="absolute inset-0 size-full"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id={a} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <stop offset="18%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="48%" stopColor="#F1C44D" stopOpacity="1" />
            <stop offset="72%" stopColor="#D4AF37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={b} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F1C44D" stopOpacity="0" />
            <stop offset="35%" stopColor="#FFD700" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={c} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F1C44D" stopOpacity="0" />
          </linearGradient>
          <filter id={g} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="320" cy="320" rx="258" ry="238" fill="none" stroke={`url(#${a})`} strokeWidth="4.5" filter={`url(#${g})`} />
        <ellipse cx="320" cy="320" rx="258" ry="238" fill="none" stroke="#FFD700" strokeWidth="1.6" strokeDasharray="12 340" strokeLinecap="round" filter={`url(#${g})`} />
        <ellipse cx="320" cy="320" rx="220" ry="200" fill="none" stroke={`url(#${c})`} strokeWidth="1.8" opacity="0.6" filter={`url(#${g})`} />
        <path
          d="M 435 48 C 585 120, 615 305, 515 455 C 400 585, 175 565, 85 380 C 5 220, 145 48, 340 40"
          fill="none"
          stroke={`url(#${b})`}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
          filter={`url(#${g})`}
        />
        {[
          [570, 320, 4],
          [511, 480, 2.5],
          [343, 549, 3.5],
          [156, 493, 2.2],
          [70, 340, 4],
          [99, 170, 2.5],
          [250, 95, 3],
          [450, 110, 2.2],
          [540, 220, 2],
          [200, 520, 2.5],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#FFD700" opacity={r >= 3.5 ? 1 : 0.6} filter={`url(#${g})`} />
        ))}
      </motion.svg>
      <motion.svg
        viewBox="0 0 640 640"
        className="absolute inset-0 size-full"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id={`${c}-r`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#F1C44D" stopOpacity="0" />
          </linearGradient>
          <filter id={`${g}-r`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse
          cx="320"
          cy="320"
          rx="240"
          ry="218"
          fill="none"
          stroke={`url(#${c}-r)`}
          strokeWidth="1.2"
          opacity="0.5"
          filter={`url(#${g}-r)`}
          strokeDasharray="4 18"
        />
      </motion.svg>
    </div>
  );
}
