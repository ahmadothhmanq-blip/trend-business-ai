import { z } from "zod";

export const editorOverlaySchema = z.object({
  id: z.string().min(1),
  text: z.string().max(500),
  startSec: z.number().min(0),
  endSec: z.number().min(0),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
  fontSize: z.number().min(8).max(96),
  align: z.enum(["left", "center", "right"]),
  enabled: z.boolean(),
});

export const editorScenePatchSchema = z.object({
  prompt: z.string().trim().min(3).max(4000).optional(),
  duration: z.number().gt(0).max(600).optional(),
  camera: z
    .object({
      move: z.string().min(1).optional(),
      shotSize: z.string().optional(),
      lens: z.string().optional(),
      purpose: z.string().optional(),
      environment: z.string().optional(),
      lighting: z.string().optional(),
    })
    .optional(),
  visualStyle: z.string().trim().min(1).max(120).optional(),
  transition: z.string().trim().min(1).max(40).optional(),
  dialogue: z
    .object({
      speakerId: z.string().optional(),
      text: z.string().max(4000).optional(),
      language: z.string().min(2).max(12).optional(),
    })
    .optional(),
  voiceRequired: z.boolean().optional(),
  providerPreference: z.enum(["veo", "kling", "runway", "heygen", "auto"]).optional(),
  fallbackProvider: z.enum(["veo", "kling", "runway", "heygen", "external"]).nullable().optional(),
  characters: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
  references: z
    .array(
      z.object({
        kind: z.enum(["image", "video", "brand", "product"]),
        uri: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .optional(),
  editor: z
    .object({
      trimInSec: z.number().min(0).optional(),
      overlays: z.array(editorOverlaySchema).optional(),
      captionsEnabled: z.boolean().optional(),
      muteVoice: z.boolean().optional(),
      muteMusic: z.boolean().optional(),
      muteSfx: z.boolean().optional(),
      voiceLevel: z.number().min(0).max(2).optional(),
      musicLevel: z.number().min(0).max(2).optional(),
      sfxLevel: z.number().min(0).max(2).optional(),
    })
    .optional(),
  trim: z
    .object({
      edge: z.enum(["start", "end"]),
      seconds: z.number().gt(0).max(120),
    })
    .optional(),
});
