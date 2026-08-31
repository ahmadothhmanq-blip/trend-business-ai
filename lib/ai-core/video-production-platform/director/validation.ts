import { VIDEO_WORKFLOWS } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { assertValidScene } from "@/lib/ai-core/video-production-platform/domain/validation";
import { DirectorError } from "@/lib/ai-core/video-production-platform/director/errors";
import {
  DIRECTOR_ASPECT_RATIOS,
  DIRECTOR_PACING,
  DIRECTOR_QUALITY_TIERS,
  DURATION_TOLERANCE_SEC,
  MAX_DIRECTOR_SCENES,
  MAX_PLAN_DURATION_SEC,
  MIN_DIRECTOR_SCENES,
  MIN_PLAN_DURATION_SEC,
  MIN_SCENE_DURATION_SEC,
  type DirectorAspectRatio,
  type DirectorInput,
  type DirectorVideoPlan,
} from "@/lib/ai-core/video-production-platform/director/contracts";
import { workflowStrategy } from "@/lib/ai-core/video-production-platform/director/workflows";

export function isDirectorAspectRatio(value: string): value is DirectorAspectRatio {
  return (DIRECTOR_ASPECT_RATIOS as readonly string[]).includes(value);
}

export function assertDirectorInput(input: DirectorInput): asserts input is DirectorInput & {
  duration: number;
  aspectRatio: DirectorAspectRatio;
  language: string;
  workflow: DirectorVideoPlan["workflow"];
} {
  if (!input.prompt?.trim() || input.prompt.trim().length < 5) {
    throw new DirectorError("Director prompt is required.", "invalid_input");
  }
  if (input.duration == null || !Number.isFinite(input.duration)) {
    throw new DirectorError("Director duration is required and must not be assumed.", "invalid_input");
  }
  if (input.duration < MIN_PLAN_DURATION_SEC || input.duration > MAX_PLAN_DURATION_SEC) {
    throw new DirectorError(
      `Director duration must be ${MIN_PLAN_DURATION_SEC}–${MAX_PLAN_DURATION_SEC} seconds.`,
      "invalid_input",
    );
  }
  if (!input.aspectRatio?.trim()) {
    throw new DirectorError("Director aspectRatio is required and must not be assumed.", "invalid_input");
  }
  if (!isDirectorAspectRatio(input.aspectRatio)) {
    throw new DirectorError(
      `Unsupported aspect ratio "${input.aspectRatio}". Supported: ${DIRECTOR_ASPECT_RATIOS.join(", ")}.`,
      "invalid_input",
    );
  }
  if (!input.language?.trim()) {
    throw new DirectorError("Director language is required and must not be assumed.", "invalid_input");
  }
  if (!input.workflow || !(VIDEO_WORKFLOWS as readonly string[]).includes(input.workflow)) {
    throw new DirectorError("Director workflow is required and must be a known VideoWorkflow.", "invalid_input");
  }
  if (input.quality && !(DIRECTOR_QUALITY_TIERS as readonly string[]).includes(input.quality)) {
    throw new DirectorError("Director quality is invalid.", "invalid_input");
  }
  if (input.budget != null && (!(input.budget > 0) || !Number.isFinite(input.budget))) {
    throw new DirectorError("Director budget must be a positive credit amount when provided.", "invalid_input");
  }
}

export function assertDirectorPlan(plan: DirectorVideoPlan, input: DirectorInput): void {
  if (!plan.objective?.trim()) {
    throw new DirectorError("VideoPlan.objective is required.", "invalid_plan");
  }
  if (!plan.narrative?.trim()) {
    throw new DirectorError("VideoPlan.narrative is required.", "invalid_plan");
  }
  if (!plan.visualStyle?.trim()) {
    throw new DirectorError("VideoPlan.visualStyle is required.", "invalid_plan");
  }
  if (!(DIRECTOR_PACING as readonly string[]).includes(plan.pacing)) {
    throw new DirectorError("VideoPlan.pacing is invalid.", "invalid_plan");
  }
  if (!isDirectorAspectRatio(plan.aspectRatio)) {
    throw new DirectorError("VideoPlan.aspectRatio is unsupported.", "invalid_plan");
  }
  if (plan.aspectRatio !== input.aspectRatio) {
    throw new DirectorError("VideoPlan.aspectRatio must match the requested aspect ratio.", "invalid_plan");
  }
  if (plan.language !== input.language) {
    throw new DirectorError("VideoPlan.language must match the requested language.", "invalid_plan");
  }
  if (input.quality && plan.qualityTier && plan.qualityTier !== input.quality) {
    throw new DirectorError("VideoPlan.qualityTier must match the requested quality.", "invalid_plan");
  }
  if (!input.quality && plan.qualityTier) {
    throw new DirectorError("VideoPlan must not invent a qualityTier that was not requested.", "invalid_plan");
  }
  if (input.audience == null && plan.audience) {
    throw new DirectorError("VideoPlan must not invent an audience that was not provided.", "invalid_plan");
  }
  if (input.budget == null && plan.budget != null) {
    throw new DirectorError("VideoPlan must not invent a budget that was not provided.", "invalid_plan");
  }
  if (input.budget != null && plan.budget !== input.budget) {
    throw new DirectorError("VideoPlan.budget must match the requested budget.", "invalid_plan");
  }
  if (input.callToAction == null && plan.callToAction) {
    throw new DirectorError("VideoPlan must not invent a CTA that was not provided.", "invalid_plan");
  }
  if (plan.scenes.length < MIN_DIRECTOR_SCENES || plan.scenes.length > MAX_DIRECTOR_SCENES) {
    throw new DirectorError("VideoPlan scene count is outside Director limits.", "invalid_plan");
  }

  const orders = plan.scenes.map((scene) => scene.order);
  const expected = plan.scenes.map((_, index) => index);
  if (orders.join(",") !== expected.join(",")) {
    throw new DirectorError("Scene order must be a contiguous 0-based sequence.", "invalid_plan");
  }

  const durationSum = plan.scenes.reduce((sum, scene) => sum + scene.duration, 0);
  if (Math.abs(durationSum - plan.totalDuration) > DURATION_TOLERANCE_SEC) {
    throw new DirectorError(
      `Scene durations sum to ${durationSum}s but totalDuration is ${plan.totalDuration}s.`,
      "invalid_plan",
    );
  }
  if (Math.abs(plan.totalDuration - input.duration!) > DURATION_TOLERANCE_SEC) {
    throw new DirectorError("VideoPlan.totalDuration must match the requested duration.", "invalid_plan");
  }

  const allowedCharacterIds = new Set([
    ...(input.characterIds ?? []),
    ...(input.characters ?? []).map((row) => row.id),
  ]);
  const allowedProductIds = new Set([
    ...(input.productIds ?? []),
    ...(input.products ?? []).map((row) => row.id),
  ]);
  const allowedBrandIds = new Set(
    [input.brandId, input.brand?.id, input.brand?.brandIdentityId].filter(Boolean) as string[],
  );

  for (const scene of plan.scenes) {
    if (!(scene.duration >= MIN_SCENE_DURATION_SEC)) {
      throw new DirectorError(`Scene ${scene.order} duration is too short.`, "invalid_plan");
    }
    if (!scene.purpose?.trim() || !scene.environment?.trim() || !scene.lighting?.trim()) {
      throw new DirectorError(`Scene ${scene.order} is missing purpose/environment/lighting.`, "invalid_plan");
    }
    if (!scene.camera.shotSize?.trim()) {
      throw new DirectorError(`Scene ${scene.order} is missing camera.shotSize.`, "invalid_plan");
    }
    if (scene.voiceRequired && !scene.dialogue.text.trim() && plan.audioPlan.narrationRequired === false) {
      throw new DirectorError(`Scene ${scene.order} requires voice but has no dialogue and narration is off.`, "invalid_plan");
    }
    for (const id of scene.characters) {
      if (!allowedCharacterIds.has(id)) {
        throw new DirectorError(`Scene ${scene.order} references unknown character ${id}.`, "invalid_plan");
      }
    }
    for (const id of scene.products) {
      if (!allowedProductIds.has(id)) {
        throw new DirectorError(`Scene ${scene.order} references unknown product ${id}.`, "invalid_plan");
      }
    }
    try {
      assertValidScene(scene);
    } catch (error) {
      throw new DirectorError(
        error instanceof Error ? error.message : `Scene ${scene.order} failed domain validation.`,
        "invalid_plan",
      );
    }
  }

  if (plan.characters.some((row) => !allowedCharacterIds.has(row.id))) {
    throw new DirectorError("VideoPlan characters must come from provided references.", "invalid_plan");
  }
  if (plan.products.some((row) => !allowedProductIds.has(row.id))) {
    throw new DirectorError("VideoPlan products must come from provided references.", "invalid_plan");
  }
  if (plan.brandReferences.some((row) => !allowedBrandIds.has(row.id) && !allowedBrandIds.has(row.brandIdentityId || ""))) {
    throw new DirectorError("VideoPlan brand references must come from provided references.", "invalid_plan");
  }
  if (!allowedCharacterIds.size && plan.characters.length) {
    throw new DirectorError("VideoPlan must not invent characters.", "invalid_plan");
  }
  if (!allowedProductIds.size && plan.products.length) {
    throw new DirectorError("VideoPlan must not invent products.", "invalid_plan");
  }
  if (!allowedBrandIds.size && plan.brandReferences.length) {
    throw new DirectorError("VideoPlan must not invent brand references.", "invalid_plan");
  }

  if (plan.outputVariants.length !== 1 || plan.outputVariants[0]?.aspectRatio !== plan.aspectRatio) {
    throw new DirectorError("Director may only plan the requested supported aspect ratio.", "invalid_plan");
  }
  if (!plan.outputVariants[0]?.supported) {
    throw new DirectorError("Requested aspect ratio must be marked supported.", "invalid_plan");
  }

  const audio = plan.audioPlan;
  if (!audio.language?.trim() || audio.language !== plan.language) {
    throw new DirectorError("AudioPlan.language must match the plan language.", "invalid_plan");
  }
  if (audio.narrationRequired && !audio.voiceScript.trim() && !audio.dialoguePerScene.some((row) => row.text.trim())) {
    throw new DirectorError("AudioPlan requires narration text when narrationRequired is true.", "invalid_plan");
  }

  const strategy = workflowStrategy(plan.workflow);
  if (plan.workflow === "ad") {
    const purposes = new Set(plan.scenes.map((scene) => scene.purpose));
    if (!purposes.has("hook") || !purposes.has("cta")) {
      throw new DirectorError("Ad workflow requires hook and CTA scenes.", "invalid_plan");
    }
  }
  if (plan.workflow === "product" && allowedProductIds.size) {
    if (!plan.scenes.some((scene) => scene.products.length > 0)) {
      throw new DirectorError("Product workflow must attach product references to at least one scene.", "invalid_plan");
    }
  }
  if ((plan.workflow === "ugc" || plan.workflow === "avatar") && !plan.scenes.some((scene) => scene.voiceRequired)) {
    throw new DirectorError("UGC/avatar workflow requires at least one scene with voice.", "invalid_plan");
  }
  const requiredPurposes = strategy.beats.filter((beat) => beat.required).map((beat) => beat.purpose);
  for (const purpose of requiredPurposes) {
    if (purpose === "product_reveal" && !allowedProductIds.size) continue;
    if (!plan.scenes.some((scene) => scene.purpose === purpose || scene.purpose.startsWith(purpose))) {
      throw new DirectorError(`Workflow ${plan.workflow} is missing required scene purpose "${purpose}".`, "invalid_plan");
    }
  }
}
