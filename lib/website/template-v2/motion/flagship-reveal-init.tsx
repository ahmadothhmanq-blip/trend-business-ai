"use client";

import { useFlagshipReveal } from "@/lib/website/template-v2/motion/use-flagship-reveal";

/** Mount once per page (typically in footer) to activate scroll reveals. */
export function FlagshipRevealInit() {
  useFlagshipReveal();
  return null;
}
