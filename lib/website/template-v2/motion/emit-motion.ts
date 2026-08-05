import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";

export const V2_MOTION_PATH = "components/ui/motion.tsx";

export function buildV2MotionSource(motion: TemplateV2MotionConfig): string {
  const entranceEntries = Object.entries(motion.entrances ?? {});
  const entranceTypes = entranceEntries
    .map(([key, cfg]) => `  ${JSON.stringify(key)}: ${JSON.stringify(cfg.type)},`)
    .join("\n");
  const defaultDuration =
    motion.entrances?.section?.durationMs ??
    motion.entrances?.hero?.durationMs ??
    500;

  return `"use client";

import type { ReactNode } from "react";

type MotionProps = {
  children: ReactNode;
  className?: string;
  entrance?: string;
  delayMs?: number;
};

const PRESET = ${JSON.stringify(motion.preset)};
const REDUCED_MOTION = ${JSON.stringify(motion.reducedMotion ?? "fade")};
const DEFAULT_DURATION = ${defaultDuration};

const ENTRANCE_TYPES: Record<string, string> = {
${entranceTypes}
};

export function Motion({ children, className = "", entrance, delayMs = 0 }: MotionProps) {
  const motionType = entrance ? ENTRANCE_TYPES[entrance] ?? "fade-in" : "fade-in";
  const duration = DEFAULT_DURATION;

  return (
    <div
      className={["v2-motion", className].filter(Boolean).join(" ")}
      data-v2-motion={PRESET}
      data-entrance={motionType}
      style={{
        animation: \`\${motionType} \${duration}ms cubic-bezier(0.22, 1, 0.36, 1) both\`,
        animationDelay: \`\${delayMs}ms\`,
      }}
    >
      {children}
    </div>
  );
}
`;
}
