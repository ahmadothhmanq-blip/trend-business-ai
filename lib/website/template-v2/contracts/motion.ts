export type TemplateV2MotionEntrance = {
  type: string;
  durationMs?: number;
  staggerMs?: number;
  intensity?: number;
};

export type TemplateV2MotionConfig = {
  preset: string;
  reducedMotion?: "instant" | "fade" | "inherit";
  entrances?: Record<string, TemplateV2MotionEntrance>;
  microInteractions?: Record<string, Record<string, string>>;
  imports?: string[];
};
