/**
 * Per-workflow planning strategy. Ad beats are not forced onto cinematic/explainer/UGC.
 */

import type { VideoWorkflow } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { DirectorInput } from "@/lib/ai-core/video-production-platform/director/contracts";
import { MAX_DIRECTOR_SCENES, MIN_DIRECTOR_SCENES } from "@/lib/ai-core/video-production-platform/director/contracts";

export type WorkflowBeat = {
  purpose: string;
  description: string;
  required: boolean;
};

export type WorkflowStrategy = {
  workflow: VideoWorkflow;
  beats: WorkflowBeat[];
  pacing: "slow" | "measured" | "dynamic" | "fast";
  voiceBias: boolean;
  providerHint: "veo" | "runway" | "heygen" | "kling" | "auto";
  hintReason: string;
};

const AD_BEATS: WorkflowBeat[] = [
  { purpose: "hook", description: "Scroll-stopping opening in the first seconds.", required: true },
  { purpose: "problem_desire", description: "Name the problem or desire.", required: false },
  { purpose: "product_reveal", description: "Reveal the product only if product references exist.", required: false },
  { purpose: "benefits", description: "Concrete benefits, not slogans.", required: false },
  { purpose: "proof_emotion", description: "Proof or emotional payoff.", required: false },
  { purpose: "cta", description: "Clear call to action.", required: true },
];

export function workflowStrategy(workflow: VideoWorkflow): WorkflowStrategy {
  switch (workflow) {
    case "ad":
      return {
        workflow,
        beats: AD_BEATS,
        pacing: "fast",
        voiceBias: true,
        providerHint: "kling",
        hintReason: "ads need realistic product motion; Router still decides",
      };
    case "product":
      return {
        workflow,
        beats: [
          { purpose: "context", description: "Product in a professional setting.", required: true },
          { purpose: "detail", description: "Material, interface, or craft close-ups.", required: true },
          { purpose: "use", description: "Product in use without lifestyle clichés.", required: false },
          { purpose: "close", description: "Identity lockup / next step.", required: false },
        ],
        pacing: "measured",
        voiceBias: false,
        providerHint: "kling",
        hintReason: "product hero shots; Router still decides",
      };
    case "ugc":
      return {
        workflow,
        beats: [
          { purpose: "hook", description: "Presenter-led opening.", required: true },
          { purpose: "talk", description: "Direct-to-camera proof or walkthrough.", required: true },
          { purpose: "close", description: "Spoken next step.", required: false },
        ],
        pacing: "dynamic",
        voiceBias: true,
        providerHint: "heygen",
        hintReason: "UGC/presenter voice; Router still decides",
      };
    case "avatar":
      return {
        workflow,
        beats: [
          { purpose: "intro", description: "Avatar presenter introduction.", required: true },
          { purpose: "message", description: "Spoken core message with lip-sync intent.", required: true },
          { purpose: "close", description: "Presenter wrap.", required: false },
        ],
        pacing: "measured",
        voiceBias: true,
        providerHint: "heygen",
        hintReason: "avatar/lip-sync; Router still decides",
      };
    case "explainer":
      return {
        workflow,
        beats: [
          { purpose: "setup", description: "What this is and who it is for.", required: true },
          { purpose: "steps", description: "Clear sequential explanation.", required: true },
          { purpose: "summary", description: "Recap without a sales CTA unless provided.", required: false },
        ],
        pacing: "measured",
        voiceBias: true,
        providerHint: "kling",
        hintReason: "explainer visuals; Router still decides",
      };
    case "social":
      return {
        workflow,
        beats: [
          { purpose: "hook", description: "Immediate visual hook.", required: true },
          { purpose: "payload", description: "One idea, fast.", required: true },
          { purpose: "endcard", description: "Short closer.", required: false },
        ],
        pacing: "fast",
        voiceBias: false,
        providerHint: "runway",
        hintReason: "short-form motion; Router still decides",
      };
    case "brand":
      return {
        workflow,
        beats: [
          { purpose: "atmosphere", description: "Brand world without cliché office shots.", required: true },
          { purpose: "craft", description: "How the brand works or looks.", required: true },
          { purpose: "signature", description: "Brand lockup if a brand reference exists.", required: false },
        ],
        pacing: "slow",
        voiceBias: false,
        providerHint: "veo",
        hintReason: "cinematic brand tone; Router still decides",
      };
    case "campaign":
      return {
        workflow,
        beats: [
          { purpose: "hook", description: "Campaign thesis.", required: true },
          { purpose: "story", description: "One proof point.", required: true },
          { purpose: "close", description: "Campaign closer.", required: false },
        ],
        pacing: "dynamic",
        voiceBias: true,
        providerHint: "kling",
        hintReason: "campaign mix; Router still decides",
      };
    case "dubbing":
      return {
        workflow,
        beats: [
          { purpose: "voice", description: "Language/voice pass over existing visual intent.", required: true },
        ],
        pacing: "measured",
        voiceBias: true,
        providerHint: "heygen",
        hintReason: "voice-led; Router still decides",
      };
    case "cinematic":
    default:
      return {
        workflow: "cinematic",
        beats: [
          { purpose: "establish", description: "Wide establishing atmosphere.", required: true },
          { purpose: "develop", description: "Character or subject development.", required: true },
          { purpose: "turn", description: "Visual turn or reveal.", required: false },
          { purpose: "resolve", description: "Quiet resolution. No ad CTA unless provided.", required: false },
        ],
        pacing: "slow",
        voiceBias: false,
        providerHint: "veo",
        hintReason: "cinematic realism; Router still decides",
      };
  }
}

export function targetSceneCount(workflow: VideoWorkflow, durationSec: number): number {
  const strategy = workflowStrategy(workflow);
  const byDuration = Math.max(MIN_DIRECTOR_SCENES, Math.min(MAX_DIRECTOR_SCENES, Math.round(durationSec / 5)));
  const required = strategy.beats.filter((beat) => beat.required).length;
  return Math.max(required, Math.min(strategy.beats.length, byDuration, MAX_DIRECTOR_SCENES));
}

export function activeBeats(input: DirectorInput, workflow: VideoWorkflow, sceneCount: number) {
  const strategy = workflowStrategy(workflow);
  const beats = strategy.beats.filter((beat) => {
    if (beat.purpose === "product_reveal" && !(input.productIds?.length || input.products?.length)) {
      return false;
    }
    if (beat.purpose === "cta" && workflow === "ad") return true;
    if (beat.purpose === "cta" && !input.callToAction) return false;
    return true;
  });
  const required = beats.filter((beat) => beat.required);
  const optional = beats.filter((beat) => !beat.required);
  const chosen = new Set(required.map((beat) => beat.purpose));
  for (const beat of optional) {
    if (chosen.size >= sceneCount) break;
    chosen.add(beat.purpose);
  }
  return beats.filter((beat) => chosen.has(beat.purpose));
}

export function hintProviderForScene(params: {
  workflow: VideoWorkflow;
  purpose: string;
  cameraMove?: string;
  voiceRequired?: boolean;
  hasImageRef?: boolean;
}): { preferred: "veo" | "kling" | "runway" | "heygen" | "auto"; fallback: "kling" | "runway" | "heygen" | "external"; reason: string } {
  const strategy = workflowStrategy(params.workflow);
  const move = (params.cameraMove || "").toLowerCase();
  const motion = /dolly|orbit|crane|handheld|tracking|pan|tilt/.test(move);
  if (params.workflow === "avatar" || (params.workflow === "ugc" && params.voiceRequired)) {
    return { preferred: "heygen", fallback: "external", reason: "presenter/lip-sync hint" };
  }
  if (params.hasImageRef) {
    return { preferred: "kling", fallback: "runway", reason: "image-to-video capability hint" };
  }
  if (motion) {
    return { preferred: "runway", fallback: "kling", reason: "camera/motion hint" };
  }
  if (strategy.providerHint === "veo") {
    return { preferred: "veo", fallback: "kling", reason: strategy.hintReason };
  }
  if (strategy.providerHint === "heygen") {
    return { preferred: "heygen", fallback: "kling", reason: strategy.hintReason };
  }
  if (strategy.providerHint === "runway") {
    return { preferred: "runway", fallback: "kling", reason: strategy.hintReason };
  }
  return { preferred: "kling", fallback: "runway", reason: strategy.hintReason };
}
