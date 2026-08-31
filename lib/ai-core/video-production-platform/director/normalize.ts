import { createHash, randomUUID } from "node:crypto";
import type {
  ProductionVideoProvider,
  SceneProviderPreference,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import {
  DIRECTOR_SPEC_VERSION,
  type DirectorAspectRatio,
  type DirectorAudioPlan,
  type DirectorInput,
  type DirectorPacing,
  type DirectorScene,
  type DirectorVideoPlan,
} from "@/lib/ai-core/video-production-platform/director/contracts";
import {
  activeBeats,
  hintProviderForScene,
  targetSceneCount,
  workflowStrategy,
} from "@/lib/ai-core/video-production-platform/director/workflows";

export type DirectorLlmDraft = {
  title?: string;
  objective?: string;
  narrative?: string;
  visualStyle?: string;
  pacing?: string;
  scenes?: Array<{
    purpose?: string;
    duration?: number;
    prompt?: string;
    cameraMove?: string;
    shotSize?: string;
    lens?: string;
    visualStyle?: string;
    environment?: string;
    lighting?: string;
    characterIds?: string[];
    productIds?: string[];
    dialogue?: string;
    musicCue?: string;
    sfx?: string[];
    transition?: string;
    voiceRequired?: boolean;
  }>;
  audio?: {
    narrationRequired?: boolean;
    speaker?: string;
    tone?: string;
    musicRequired?: boolean;
    musicMood?: string;
    sfxRequired?: boolean;
  };
};

const PACING: readonly DirectorPacing[] = ["slow", "measured", "dynamic", "fast"];

export function directorIdempotencyKey(projectId: string, input: DirectorInput): string {
  return createHash("sha256")
    .update(
      [
        DIRECTOR_SPEC_VERSION,
        projectId,
        input.prompt.trim(),
        input.workflow || "",
        String(input.duration ?? ""),
        input.aspectRatio || "",
        input.language || "",
        input.style || "",
        input.quality || "",
        String(input.budget ?? ""),
        input.objective || "",
        input.audience || "",
        input.brandId || "",
        [...(input.productIds || [])].sort().join(","),
        [...(input.characterIds || [])].sort().join(","),
        input.voicePreference || "",
        input.platform || "",
        input.callToAction || "",
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 32);
}

function allowedIds(input: DirectorInput) {
  return {
    characters: new Set([...(input.characterIds ?? []), ...(input.characters ?? []).map((row) => row.id)]),
    products: new Set([...(input.productIds ?? []), ...(input.products ?? []).map((row) => row.id)]),
  };
}

function catalogFromInput(input: DirectorInput, projectId: string) {
  const characters = [...(input.characters ?? [])].filter((row) => row.id);
  for (const id of input.characterIds ?? []) {
    if (!characters.some((row) => row.id === id)) {
      characters.push({ id, projectId, displayName: id });
    }
  }
  const products = [...(input.products ?? [])].filter((row) => row.id);
  for (const id of input.productIds ?? []) {
    if (!products.some((row) => row.id === id)) {
      products.push({ id, projectId, name: id });
    }
  }
  const brandReferences = [];
  if (input.brand) brandReferences.push({ ...input.brand, projectId });
  else if (input.brandId) {
    brandReferences.push({
      id: input.brandId,
      projectId,
      businessName: input.brandId,
      brandIdentityId: input.brandId,
    });
  }
  return { characters, products, brandReferences };
}

export function redistributeDurations(raw: number[], total: number): number[] {
  if (!raw.length) return [];
  const positive = raw.map((value) => (Number.isFinite(value) && value >= 1 ? value : 1));
  const sum = positive.reduce((acc, value) => acc + value, 0);
  const scaled = positive.map((value) => Math.max(1, Math.round((value / sum) * total * 10) / 10));
  const scaledSum = scaled.reduce((acc, value) => acc + value, 0);
  const delta = Math.round((total - scaledSum) * 10) / 10;
  scaled[scaled.length - 1] = Math.max(1, Math.round((scaled[scaled.length - 1]! + delta) * 10) / 10);
  return scaled;
}

function matchPurpose(raw: string | undefined, allowed: string[], index: number): string {
  const value = (raw || "").trim().toLowerCase().replace(/\s+/g, "_");
  if (allowed.includes(value)) return value;
  const found = allowed.find((purpose) => value.includes(purpose) || purpose.includes(value));
  return found || allowed[Math.min(index, allowed.length - 1)]!;
}

function sceneCountForPlan(workflow: DirectorVideoPlan["workflow"], duration: number): number {
  return targetSceneCount(workflow, duration);
}

export function normalizeDirectorPlan(params: {
  projectId: string;
  input: DirectorInput & {
    duration: number;
    aspectRatio: DirectorAspectRatio;
    language: string;
    workflow: DirectorVideoPlan["workflow"];
  };
  draft: DirectorLlmDraft;
  planId?: string;
}): DirectorVideoPlan {
  const { input, projectId } = params;
  const strategy = workflowStrategy(input.workflow);
  const draftScenes = Array.isArray(params.draft.scenes) ? params.draft.scenes : [];
  const count = sceneCountForPlan(input.workflow, input.duration);
  const beats = activeBeats(input, input.workflow, count);
  const slots = beats.length ? beats : activeBeats(input, input.workflow, Math.max(1, count));
  const allowed = allowedIds(input);
  const catalogs = catalogFromInput(input, projectId);

  const durations = redistributeDurations(
    slots.map((_, index) => Number(draftScenes[index]?.duration) || input.duration / slots.length),
    input.duration,
  );

  const hasImageRef = Boolean(
    input.products?.some((row) => row.visualReference || row.referenceUri) || input.brand?.logoUrl,
  );
  const visualStyle = (params.draft.visualStyle || input.style || "").trim();
  const purposes = slots.map((row) => row.purpose);

  const scenes: DirectorScene[] = slots.map((beat, index) => {
    const draft = draftScenes[index] || {};
    const purpose = matchPurpose(draft.purpose, purposes, index);
    const characterIds = (draft.characterIds || []).filter((id) => allowed.characters.has(id));
    const productIds = (draft.productIds || []).filter((id) => allowed.products.has(id));
    const visualProducts = catalogs.products.filter((row) =>
      /^https?:\/\//i.test(String(("visualReference" in row && row.visualReference) || row.referenceUri || "")),
    );
    if (!productIds.length && visualProducts.length) {
      productIds.push(visualProducts[index % visualProducts.length]!.id);
    } else if (
      (purpose === "product_reveal" || purpose === "detail" || purpose === "use") &&
      !productIds.length &&
      catalogs.products[0]
    ) {
      productIds.push(catalogs.products[0].id);
    }
    const voiceRequired =
      draft.voiceRequired === true ||
      Boolean(
        strategy.voiceBias &&
          (purpose === "talk" || purpose === "cta" || purpose === "intro" || purpose === "message" || purpose === "hook"),
      );
    const hint = hintProviderForScene({
      workflow: input.workflow,
      purpose,
      cameraMove: draft.cameraMove,
      voiceRequired,
      hasImageRef,
    });
    const dialogueText = typeof draft.dialogue === "string" ? draft.dialogue.trim() : "";
    const prompt = (draft.prompt || beat.description).trim();
    const environment = (draft.environment || "").trim() || "professional interior";
    const lighting = (draft.lighting || "").trim() || "controlled cinematic lighting";
    return {
      id: randomUUID(),
      projectId,
      order: index,
      duration: durations[index]!,
      prompt: prompt.length >= 3 ? prompt : `${beat.description} ${input.prompt}`.slice(0, 400),
      camera: {
        move: (draft.cameraMove || "static").trim() || "static",
        shotSize: (draft.shotSize || "medium").trim() || "medium",
        lens: draft.lens?.trim() || undefined,
        purpose,
        environment,
        lighting,
      },
      visualStyle: (draft.visualStyle || visualStyle).trim(),
      references: sceneReferences(input, productIds, characterIds),
      characters: characterIds,
      products: productIds,
      dialogue: {
        speakerId: characterIds[0],
        text: dialogueText,
        language: input.language,
      },
      audio: {
        musicCue: draft.musicCue?.trim() || undefined,
        sfx: Array.isArray(draft.sfx) ? draft.sfx.filter((item) => typeof item === "string") : [],
        voiceRequired,
      },
      transition: (draft.transition || (index === slots.length - 1 ? "fade" : "cut")).trim() || "cut",
      providerPreference: hint.preferred as SceneProviderPreference,
      fallbackProvider: hint.fallback as ProductionVideoProvider,
      status: "planned",
      qualityScore: null,
      purpose,
      environment,
      lighting,
      voiceRequired,
    };
  });

  const dialoguePerScene = scenes
    .filter((scene) => scene.dialogue.text.trim())
    .map((scene) => ({
      sceneOrder: scene.order,
      text: scene.dialogue.text,
      speakerId: scene.dialogue.speakerId,
    }));
  const narrationRequired =
    scenes.some((scene) => scene.voiceRequired) || params.draft.audio?.narrationRequired === true;
  const audioPlan: DirectorAudioPlan = {
    id: `audio-${params.planId || projectId}`,
    projectId,
    narrationRequired,
    speaker: input.voicePreference || params.draft.audio?.speaker,
    language: input.language,
    tone: params.draft.audio?.tone,
    musicRequired: params.draft.audio?.musicRequired === true,
    musicMood: params.draft.audio?.musicMood,
    sfxRequired:
      scenes.some((scene) => (scene.audio.sfx || []).length > 0) || params.draft.audio?.sfxRequired === true,
    dialoguePerScene,
    voiceScript: dialoguePerScene.map((row) => row.text).join("\n"),
    musicCue: scenes.find((scene) => scene.audio.musicCue)?.audio.musicCue,
    sfx: scenes.flatMap((scene) => scene.audio.sfx || []),
  };

  const pacing: DirectorPacing = PACING.includes(params.draft.pacing as DirectorPacing)
    ? (params.draft.pacing as DirectorPacing)
    : strategy.pacing;

  return {
    id: params.planId || randomUUID(),
    projectId,
    title: params.draft.title?.trim() || undefined,
    workflow: input.workflow,
    objective: (params.draft.objective || input.objective || "").trim(),
    audience: input.audience,
    narrative: (params.draft.narrative || "").trim(),
    totalDuration: input.duration,
    aspectRatio: input.aspectRatio,
    language: input.language,
    visualStyle,
    pacing,
    qualityTier: input.quality,
    budget: input.budget,
    scenes,
    characters: catalogs.characters,
    products: catalogs.products,
    brandReferences: catalogs.brandReferences,
    audioPlan,
    outputVariants: [{ aspectRatio: input.aspectRatio, supported: true }],
    providerHints: scenes.map((scene) => {
      const hint = hintProviderForScene({
        workflow: input.workflow,
        purpose: scene.purpose,
        cameraMove: scene.camera.move,
        voiceRequired: scene.voiceRequired,
        hasImageRef,
      });
      return {
        sceneOrder: scene.order,
        preferredProvider: scene.providerPreference,
        fallbackProvider: scene.fallbackProvider,
        reason: hint.reason,
      };
    }),
    callToAction: input.callToAction,
    createdAt: new Date().toISOString(),
  };
}

function sceneReferences(
  input: DirectorInput,
  productIds: string[],
  characterIds: string[],
): DirectorScene["references"] {
  const refs: DirectorScene["references"] = [];
  if (input.brandId) {
    refs.push({ kind: "brand", uri: `brand:${input.brandId}`, role: "brand" });
  }
  for (const id of productIds) {
    const product = input.products?.find((row) => row.id === id);
    refs.push({
      kind: "product",
      uri: product?.visualReference || product?.referenceUri || `product:${id}`,
      role: "product",
    });
  }
  for (const id of characterIds) {
    refs.push({ kind: "image", uri: `character:${id}`, role: "character" });
  }
  return refs;
}
