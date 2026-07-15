"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const PARTICLES = [
  { t: "8%", l: "12%", s: 2, o: 0.55 },
  { t: "14%", l: "78%", s: 1.5, o: 0.4 },
  { t: "22%", l: "34%", s: 2.5, o: 0.5 },
  { t: "28%", l: "88%", s: 1.5, o: 0.35 },
  { t: "36%", l: "6%", s: 2, o: 0.45 },
  { t: "42%", l: "62%", s: 1.5, o: 0.4 },
  { t: "48%", l: "24%", s: 2, o: 0.3 },
  { t: "55%", l: "92%", s: 2.5, o: 0.5 },
  { t: "62%", l: "48%", s: 1.5, o: 0.35 },
  { t: "70%", l: "16%", s: 2, o: 0.4 },
  { t: "18%", l: "52%", s: 1.5, o: 0.45 },
  { t: "32%", l: "70%", s: 2, o: 0.3 },
] as const;

/**
 * Ambient background with local mouse parallax.
 * Mouse state stays here (rAF-throttled) so marketing chrome does not re-render.
 */
export function SiteBackground() {
  const reduce = useReducedMotion();
  const [mouse, setMouse] = useState({ nx: 0, ny: 0 });
  const pending = useRef<{ nx: number; ny: number } | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) return;

    const flush = () => {
      raf.current = null;
      if (pending.current) {
        setMouse(pending.current);
        pending.current = null;
      }
    };

    const onMove = (e: MouseEvent) => {
      pending.current = {
        nx: (e.clientX / window.innerWidth) * 2 - 1,
        ny: (e.clientY / window.innerHeight) * 2 - 1,
      };
      if (raf.current == null) {
        raf.current = window.requestAnimationFrame(flush);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
    };
  }, [reduce]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#050505]" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "68px 68px",
          maskImage:
            "radial-gradient(ellipse 85% 55% at 50% 15%, black 8%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute left-1/2 top-[6%] h-[640px] w-[860px] -translate-x-[35%] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.18)_0%,rgba(212,175,55,0.08)_38%,transparent_68%)]"
        style={{
          x: reduce ? 0 : mouse.nx * -20,
          y: reduce ? 0 : mouse.ny * -12,
        }}
      />
      <div className="absolute left-[55%] top-[8%] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.12)_0%,transparent_70%)] blur-2xl" />
      <div className="absolute -bottom-[15%] -left-[8%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08),transparent_70%)]" />
      <div className="absolute -right-[10%] top-[42%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.05),transparent_70%)]" />
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#FFD700]"
          style={{
            top: p.t,
            left: p.l,
            width: p.s,
            height: p.s,
            opacity: p.o,
            boxShadow: `0 0 ${p.s * 4}px rgba(255,215,0,0.8)`,
          }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -6 - (i % 3) * 2, 0],
                  opacity: [p.o * 0.6, p.o, p.o * 0.6],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: 4 + (i % 4),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }
          }
        />
      ))}
    </div>
  );
}
