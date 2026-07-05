"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function RefButton({
  href,
  children,
  variant = "gold",
  size = "md",
  className,
  magnetic = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  magnetic?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 22 });
  const sy = useSpring(y, { stiffness: 300, damping: 22 });

  const sizes = {
    sm: "px-5 py-2 text-[13px]",
    md: "px-7 py-3 text-sm",
    lg: "px-8 py-3.5 text-[15px]",
  };

  return (
    <motion.span
      style={magnetic && !reduceMotion ? { x: sx, y: sy } : undefined}
      onMouseMove={
        magnetic && !reduceMotion
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              x.set((e.clientX - r.left - r.width / 2) * 0.08);
              y.set((e.clientY - r.top - r.height / 2) * 0.08);
            }
          : undefined
      }
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="inline-flex"
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
          sizes[size],
          variant === "gold"
            ? "btn-gold text-[#050505] shadow-[0_4px_20px_rgb(212_175_55/0.28)]"
            : "border border-white/20 bg-[#111111] text-white hover:border-[rgb(212_175_55/0.35)]",
          className,
        )}
      >
        {children}
      </Link>
    </motion.span>
  );
}
