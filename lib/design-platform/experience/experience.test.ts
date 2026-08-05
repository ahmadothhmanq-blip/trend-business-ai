import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBDP_BEHAVIOR_CATALOG,
  TBDP_BEHAVIOR_COUNT,
  TBDP_DEFAULT_EXPERIENCE,
  TBDP_FEEDBACK_COUNT,
  TBDP_INTERACTION_COUNT,
  TBDP_MOTION_COUNT,
  buildTbdpExperience,
  emitTbdpExperienceCss,
  feedbackDataAttributes,
  getMotionByCategory,
  getMotionPreset,
  isGpuSafeProperty,
  motionDataAttributes,
  motionPresetToAnimation,
  resolveDirectionExperience,
} from "@/lib/design-platform/experience";

describe("TBDP Phase 3 motion system", () => {
  it("defines 20 motion presets across all categories", () => {
    assert.equal(TBDP_MOTION_COUNT, 20);
    assert.ok(getMotionByCategory("modal").length >= 2);
    assert.ok(getMotionByCategory("hero").length >= 2);
    assert.ok(getMotionPreset("modal-enter"));
  });

  it("generates token-driven motion CSS with reduced-motion support", () => {
    const css = emitTbdpExperienceCss();
    assert.ok(css.includes("prefers-reduced-motion"));
    assert.ok(css.includes("--tbdp-color-border-focus"));
    assert.ok(!css.match(/#[0-9A-Fa-f]{6}/));
  });

  it("maps presets to GPU-safe animations", () => {
    const preset = getMotionPreset("modal-enter")!;
    const anim = motionPresetToAnimation(preset);
    assert.ok(anim.includes("ms"));
    assert.equal(isGpuSafeProperty("transform"), true);
    assert.equal(isGpuSafeProperty("width"), false);
  });
});

describe("TBDP Phase 3 interaction & feedback", () => {
  it("defines interaction behaviors for all domains", () => {
    assert.equal(TBDP_INTERACTION_COUNT, 28);
    const domains = new Set(TBDP_DEFAULT_EXPERIENCE.interaction.behaviors.map((b) => b.domain));
    assert.ok(domains.has("buttons"));
    assert.ok(domains.has("commerce"));
    assert.ok(domains.has("marketing"));
  });

  it("defines all 13 feedback states", () => {
    assert.equal(TBDP_FEEDBACK_COUNT, 13);
    assert.ok(TBDP_DEFAULT_EXPERIENCE.feedback.states.error);
    assert.ok(TBDP_DEFAULT_EXPERIENCE.feedback.states["ai-processing"]);
  });
});

describe("TBDP Phase 3 experience config", () => {
  it("builds configurable experience for reduced motion", () => {
    const xp = buildTbdpExperience({ prefersReducedMotion: true });
    assert.equal(xp.mode, "reduced");
    assert.equal(xp.motion.enabled, false);
    assert.equal(xp.accessibility.reducedMotion, true);
  });

  it("adapts direction for RTL", () => {
    const xp = buildTbdpExperience({ direction: "rtl" });
    const dir = resolveDirectionExperience("rtl");
    assert.equal(dir.drawerSide, "start");
    assert.equal(xp.direction, "rtl");
  });

  it("exposes data attribute helpers", () => {
    assert.equal(motionDataAttributes("modal-enter")["data-tbdp-xp-motion"], "modal-enter");
    assert.equal(feedbackDataAttributes("loading")["data-tbdp-xp-feedback"], "loading");
  });
});

describe("TBDP Phase 3 behavior catalog", () => {
  it("unifies all subsystem behaviors", () => {
    assert.ok(TBDP_BEHAVIOR_COUNT >= 60);
    const subsystems = new Set(TBDP_BEHAVIOR_CATALOG.map((b) => b.subsystem));
    assert.ok(subsystems.has("motion"));
    assert.ok(subsystems.has("performance"));
    assert.ok(subsystems.has("direction"));
  });
});

describe("TBDP Phase 3 isolation", () => {
  it("does not import website builder or template modules", async () => {
    const mod = await import("@/lib/design-platform/experience");
    const keys = Object.keys(mod);
    assert.ok(!keys.some((k) => k.includes("Theme")));
    assert.ok(!keys.some((k) => k.includes("WebsiteBuilder")));
  });
});
