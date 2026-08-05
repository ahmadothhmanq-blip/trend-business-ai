/** Global experience performance mode. */
export type TbdpExperienceMode = "default" | "reduced" | "performance";

/** Text / motion direction. */
export type TbdpExperienceDirection = "ltr" | "rtl";

/** Primary input modality for responsive experience. */
export type TbdpInputModality = "mouse" | "touch" | "keyboard" | "hybrid";

/** Viewport experience tier. */
export type TbdpViewportTier =
  | "mobile"
  | "tablet"
  | "laptop"
  | "desktop"
  | "ultra-wide"
  | "foldable";

/** Motion transition category. */
export type TbdpMotionCategory =
  | "page"
  | "section"
  | "hero"
  | "card"
  | "grid"
  | "modal"
  | "drawer"
  | "toast"
  | "tooltip"
  | "scroll-reveal"
  | "scroll-parallax"
  | "stagger"
  | "hover"
  | "focus"
  | "success"
  | "error";

/** Interaction domain. */
export type TbdpInteractionDomain =
  | "buttons"
  | "forms"
  | "cards"
  | "navigation"
  | "dialogs"
  | "dropdowns"
  | "tables"
  | "dashboard"
  | "marketing"
  | "commerce";

/** Feedback experience state. */
export type TbdpFeedbackState =
  | "loading"
  | "skeleton"
  | "progress"
  | "success"
  | "warning"
  | "error"
  | "empty"
  | "offline"
  | "retry"
  | "saving"
  | "autosave"
  | "ai-processing"
  | "streaming";

export type TbdpMotionPreset = {
  id: string;
  category: TbdpMotionCategory;
  durationMs: number;
  easing: string;
  delayMs?: number;
  staggerMs?: number;
  reducedFallback: "fade" | "none" | "instant";
  gpuSafe: boolean;
};

export type TbdpInteractionBehavior = {
  id: string;
  domain: TbdpInteractionDomain;
  trigger: string;
  response: string;
  durationMs: number;
  feedbackState?: TbdpFeedbackState;
};

export type TbdpExperienceConfig = {
  meta: {
    phase: string;
    version: string;
    generatedAt: string;
  };
  mode: TbdpExperienceMode;
  direction: TbdpExperienceDirection;
  viewport: TbdpViewportTier;
  inputModality: TbdpInputModality;
  motion: {
    enabled: boolean;
    presets: Record<string, TbdpMotionPreset>;
  };
  interaction: {
    behaviors: TbdpInteractionBehavior[];
  };
  feedback: {
    states: Record<TbdpFeedbackState, { ariaLive: string; motionId: string }>;
  };
  accessibility: {
    reducedMotion: boolean;
    focusVisible: boolean;
    minTouchTarget: string;
    keyboardNav: boolean;
  };
  performance: {
    maxConcurrentAnimations: number;
    preferTransformOpacity: boolean;
    lazyInteractions: boolean;
  };
};
