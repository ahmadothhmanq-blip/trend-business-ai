import type { VideoPluginInput, VideoAnalysis, VideoScenePlan } from "@/plugins/video-studio/types";

function getVideoTypeContext(type: string): string {
  const ctx: Record<string, string> = {
    "text-to-video": "Convert a text description into a video concept with scenes, visuals, and motion direction.",
    "image-to-video": "Animate a still image — add camera motion, parallax, particle effects, and ambient movement.",
    storyboard: "Multi-scene narrative video with story arc, scene transitions, and pacing.",
    "product-demo": "Product showcase — close-ups, feature highlights, use-case scenarios, call-to-action.",
    "social-video": "Short-form social content — scroll-stopping hook, fast pacing, bold text, platform-optimized.",
    explainer: "Educational content — clear structure, step-by-step, supporting visuals, professional narration.",
    "ad-video": "Commercial/advertisement — emotional hook, value proposition, CTA, brand integration.",
    "brand-video": "Brand storytelling — mission, values, culture, emotional connection, cinematic quality.",
    trailer: "Promotional teaser — dramatic pacing, reveal structure, suspense, impact moments.",
    "presentation-video": "Animated presentation — slide transitions, data visualization, professional tone.",
    custom: "Custom video type — follow the user's description.",
  };
  return ctx[type] || ctx.custom;
}

export function videoAnalyzePrompt(input: VideoPluginInput): string {
  return `You are an award-winning video director and creative strategist. Analyze this video production brief.

Prompt: ${input.prompt}
Video Type: ${input.videoType}
Style: ${input.style}
Aspect Ratio: ${input.aspectRatio}
Duration: ${input.duration}
Mood: ${input.mood}
Camera: ${input.cameraMove}
Scene Count: ${input.sceneCount}
Options: ${input.options.join(", ") || "Standard"}

Context: ${getVideoTypeContext(input.videoType)}

Produce a JSON object with:
- title: video title (concise, compelling)
- concept: creative concept description (2-3 sentences)
- videoType: the video category
- style: the visual style
- mood: the emotional atmosphere
- targetAudience: who this video is for
- keyMessages: array of 2-4 key messages to communicate
- visualTheme: description of the visual theme
- pacing: pacing description (fast, medium, slow, dynamic)

Return ONLY valid JSON.`;
}

export function videoPlanPrompt(input: VideoPluginInput, analysis: VideoAnalysis): string {
  return `You are an expert video director. Plan a ${input.sceneCount}-scene video production.

Title: ${analysis.title}
Concept: ${analysis.concept}
Style: ${analysis.style}
Mood: ${analysis.mood}
Duration: ${input.duration}
Aspect Ratio: ${input.aspectRatio}
Pacing: ${analysis.pacing}
Visual Theme: ${analysis.visualTheme}
Key Messages: ${analysis.keyMessages.join(", ")}
Camera Default: ${input.cameraMove}

Create a JSON object with:
- scenes: array of ${input.sceneCount} scenes, each with:
  - id: scene ID (e.g. "scene-1")
  - name: scene name
  - description: what happens visually in this scene
  - duration: scene duration (e.g. "3s", "5s")
  - visualDirection: detailed visual description
  - cameraMove: camera movement for this scene
  - mood: scene mood
  - transition: transition to next scene ("cut", "dissolve", "fade", "wipe", "zoom")
- colorPalette: array of 4-6 hex color strings
- musicDirection: music style recommendation
- pacing: overall pacing description
- totalDuration: total video duration
- narrativeArc: the story structure (e.g. "hook → problem → solution → CTA")

Return ONLY valid JSON.`;
}

export function videoScenePrompt(
  analysis: VideoAnalysis,
  scene: VideoScenePlan,
  sceneIndex: number,
  totalScenes: number,
  aspectRatio: string,
): string {
  const dims: Record<string, string> = {
    "16:9": "640 360",
    "9:16": "360 640",
    "1:1": "400 400",
    "4:5": "360 450",
    "21:9": "756 324",
  };
  const [w, h] = (dims[aspectRatio] || "640 360").split(" ");

  return `You are a professional storyboard artist and video director. Create a detailed storyboard frame and production notes for scene ${sceneIndex + 1} of ${totalScenes}.

Scene: ${scene.name}
Description: ${scene.description}
Duration: ${scene.duration}
Visual Direction: ${scene.visualDirection}
Camera: ${scene.cameraMove}
Mood: ${scene.mood}
Transition: ${scene.transition}
Video Style: ${analysis.style}
Overall Mood: ${analysis.mood}

Create a JSON object with:
- narration: voice-over narration text for this scene (or "" if none)
- musicDirection: music cue for this scene
- sfxNotes: sound effects description (or "" if none)
- svgStoryboard: SVG storyboard frame (viewBox="0 0 ${w} ${h}"). Create a visual composition showing the scene layout, subject placement, and camera framing. Use shapes, text labels, and arrows to indicate motion. Include the scene's color palette. Use generic fonts. No external references.
- visualPrompt: optimized text-to-video prompt for AI video generators (Runway, Kling, etc.) — detailed, comma-separated descriptors

Return ONLY valid JSON.`;
}

export function videoScriptPrompt(analysis: VideoAnalysis, scenes: VideoScenePlan[]): string {
  const sceneList = scenes.map((s, i) => `Scene ${i + 1}: ${s.name} — ${s.description} (${s.duration})`).join("\n");
  return `Write a professional video script for "${analysis.title}".

Concept: ${analysis.concept}
Mood: ${analysis.mood}
Target Audience: ${analysis.targetAudience}
Key Messages: ${analysis.keyMessages.join(", ")}
Pacing: ${analysis.pacing}

Scenes:
${sceneList}

Write the script with:
- Scene headings
- Visual directions in [brackets]
- Narration/dialogue in regular text
- Music/SFX cues in (parentheses)

Write 200-500 words. Professional, engaging. Return plain text — no JSON wrapper.`;
}

export function videoThumbnailPrompt(analysis: VideoAnalysis, aspectRatio: string): string {
  const dims: Record<string, string> = { "16:9": "640 360", "9:16": "360 640", "1:1": "400 400", "4:5": "360 450", "21:9": "756 324" };
  const [w, h] = (dims[aspectRatio] || "640 360").split(" ");

  return `Create a compelling video thumbnail SVG for "${analysis.title}".

Style: ${analysis.style}
Mood: ${analysis.mood}
Visual Theme: ${analysis.visualTheme}

Requirements:
- viewBox="0 0 ${w} ${h}"
- Bold, attention-grabbing composition
- Include the video title as text
- Use vibrant colors and high contrast
- Add a play button indicator
- Generic fonts only (Arial, Helvetica, sans-serif)
- No external references

Return a JSON object with:
- svgCode: the complete SVG markup

Return ONLY valid JSON.`;
}
