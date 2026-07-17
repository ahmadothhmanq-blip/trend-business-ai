import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  videoAnalyzePrompt,
  videoPlanPrompt,
  videoScenePrompt,
  videoScriptPrompt,
  videoThumbnailPrompt,
} from "@/lib/ai/prompts/video-studio";
import {
  videoAnalysisSchema,
  videoPlanSchema,
  videoSceneOutputSchema,
  videoThumbnailSchema,
} from "@/plugins/video-studio/schemas";
import type {
  VideoAnalysis,
  VideoPlanResult,
  VideoOutput,
  VideoPluginInput,
} from "@/plugins/video-studio/types";
import { sanitizeSvgContent } from "@/lib/ai/sanitize";
import type { GenerationContext, ValidationResult, ExportResult } from "@/lib/ai/types";

async function analyzeVideo(
  input: VideoPluginInput,
  ctx: GenerationContext,
): Promise<VideoAnalysis> {
  ctx.progress.emit("Analyzing video concept...");
  const analysis = await ctx.provider.generateJson<VideoAnalysis>({
    prompt: videoAnalyzePrompt(input),
    schema: videoAnalysisSchema,
  });
  return {
    ...analysis,
    title: analysis.title || "Untitled Video",
    concept: analysis.concept || input.prompt,
    videoType: analysis.videoType || input.videoType,
    style: analysis.style || input.style,
    mood: analysis.mood || input.mood,
    targetAudience: analysis.targetAudience || "General",
    keyMessages: analysis.keyMessages?.length ? analysis.keyMessages : ["Key message"],
    visualTheme: analysis.visualTheme || input.style,
    pacing: analysis.pacing || "Medium",
  };
}

async function planVideo(
  input: VideoPluginInput,
  analysis: VideoAnalysis,
  ctx: GenerationContext,
): Promise<VideoPlanResult> {
  ctx.progress.emit("Planning scenes and storyboard...");
  const plan = await ctx.provider.generateJson<VideoPlanResult>({
    prompt: videoPlanPrompt(input, analysis),
    schema: videoPlanSchema,
  });
  return {
    scenes: plan.scenes?.length
      ? plan.scenes
      : [{ id: "scene-1", name: "Main Scene", description: analysis.concept, duration: input.duration, visualDirection: "", cameraMove: input.cameraMove, mood: analysis.mood, transition: "cut" }],
    colorPalette: plan.colorPalette?.length ? plan.colorPalette : ["#D4AF37", "#1A1A1A", "#FFFFFF"],
    musicDirection: plan.musicDirection || "Ambient",
    pacing: plan.pacing || analysis.pacing,
    totalDuration: plan.totalDuration || input.duration,
    narrativeArc: plan.narrativeArc || "Linear",
  };
}

async function generateVideo(
  input: VideoPluginInput,
  analysis: VideoAnalysis,
  plan: VideoPlanResult,
  ctx: GenerationContext,
): Promise<VideoOutput> {
  const scenes: VideoOutput["scenes"] = [];
  const totalScenes = plan.scenes.length;

  for (let i = 0; i < totalScenes; i++) {
    const scene = plan.scenes[i];
    ctx.progress.emit(`Creating scene ${i + 1}/${totalScenes}: "${scene.name}"...`);
    try {
      const result = await ctx.provider.generateJson<{
        narration: string;
        musicDirection: string;
        sfxNotes: string;
        svgStoryboard: string;
        visualPrompt: string;
      }>({
        prompt: videoScenePrompt(analysis, scene, i, totalScenes, input.aspectRatio),
        schema: videoSceneOutputSchema,
      });
      scenes.push({
        id: scene.id,
        name: scene.name,
        description: scene.description,
        duration: scene.duration,
        visualPrompt: result.visualPrompt || "",
        cameraMove: scene.cameraMove,
        mood: scene.mood,
        narration: result.narration || "",
        musicDirection: result.musicDirection || "",
        sfxNotes: result.sfxNotes || "",
        transition: scene.transition,
        svgStoryboard: sanitizeSvgContent(result.svgStoryboard),
      });
    } catch {
      scenes.push({
        id: scene.id, name: scene.name, description: scene.description,
        duration: scene.duration, visualPrompt: "", cameraMove: scene.cameraMove,
        mood: scene.mood, narration: "", musicDirection: "", sfxNotes: "",
        transition: scene.transition, svgStoryboard: "",
      });
    }
  }

  let script = "";
  if (input.options.includes("script") || input.options.includes("voiceover")) {
    ctx.progress.emit("Writing video script...");
    try {
      script = ctx.provider.generateText
        ? await ctx.provider.generateText({ prompt: videoScriptPrompt(analysis, plan.scenes) })
        : "";
    } catch { /* fallback */ }
  }

  const voiceoverScript = input.options.includes("voiceover")
    ? scenes.map((s, i) => `[Scene ${i + 1} — ${s.name}]\n${s.narration}`).filter((s) => s.includes("\n") && !s.endsWith("\n")).join("\n\n")
    : "";

  const musicSuggestions = [
    { name: "Main Theme", genre: plan.musicDirection, mood: analysis.mood, bpm: "120" },
    { name: "Ambient Underscore", genre: "Ambient", mood: "Subtle", bpm: "80" },
  ];

  const subtitles: { timestamp: string; text: string }[] = [];
  if (input.options.includes("subtitles")) {
    let elapsed = 0;
    for (const scene of scenes) {
      if (scene.narration) {
        const dur = parseInt(scene.duration) || 5;
        subtitles.push({ timestamp: `${elapsed}s`, text: scene.narration });
        elapsed += dur;
      }
    }
  }

  let thumbnailSvg = "";
  if (input.options.includes("thumbnail")) {
    ctx.progress.emit("Generating thumbnail...");
    try {
      const result = await ctx.provider.generateJson<{ svgCode: string }>({
        prompt: videoThumbnailPrompt(analysis, input.aspectRatio),
        schema: videoThumbnailSchema,
      });
      thumbnailSvg = sanitizeSvgContent(result.svgCode);
    } catch { /* fallback */ }
  }

  const files: { path: string; content: string; language: string }[] = [];

  scenes.forEach((s) => {
    if (s.svgStoryboard) {
      files.push({ path: `storyboard/${s.id}.svg`, content: s.svgStoryboard, language: "svg" });
    }
  });

  if (script) files.push({ path: "script.md", content: script, language: "markdown" });
  if (voiceoverScript) files.push({ path: "voiceover-script.md", content: voiceoverScript, language: "markdown" });
  if (thumbnailSvg) files.push({ path: "thumbnail.svg", content: thumbnailSvg, language: "svg" });

  const promptsDoc = scenes.map((s, i) =>
    `## Scene ${i + 1}: ${s.name}\n\n**Visual Prompt:**\n\`\`\`\n${s.visualPrompt}\n\`\`\`\n\n**Camera:** ${s.cameraMove}\n**Duration:** ${s.duration}\n**Transition:** ${s.transition}`,
  ).join("\n\n---\n\n");
  files.push({ path: "video-prompts.md", content: `# ${analysis.title} — Video Prompts\n\n${promptsDoc}`, language: "markdown" });

  const specDoc = [
    `# Video Specification: ${analysis.title}`,
    `\n## Concept\n${analysis.concept}`,
    `\n## Details`,
    `- Type: ${analysis.videoType}`,
    `- Style: ${analysis.style}`,
    `- Mood: ${analysis.mood}`,
    `- Duration: ${plan.totalDuration}`,
    `- Pacing: ${plan.pacing}`,
    `- Scenes: ${scenes.length}`,
    `- Narrative Arc: ${plan.narrativeArc}`,
    `\n## Color Palette\n${plan.colorPalette.map((c) => `- \`${c}\``).join("\n")}`,
    `\n## Music Direction\n${plan.musicDirection}`,
  ].join("\n");
  files.push({ path: "video-spec.md", content: specDoc, language: "markdown" });

  return {
    title: analysis.title,
    description: `${analysis.style} ${analysis.videoType} — ${analysis.mood}, ${plan.totalDuration}`,
    videoType: input.videoType,
    style: analysis.style,
    scenes,
    script,
    voiceoverScript,
    musicSuggestions,
    subtitles,
    thumbnailSvg,
    colorGrade: analysis.mood,
    files,
  };
}

async function validateVideo(output: VideoOutput, ctx: GenerationContext): Promise<ValidationResult> {
  ctx.progress.emit("Validating video project...");
  const issues: string[] = [];
  if (!output.title) issues.push("Missing title");
  if (!output.scenes.length) issues.push("No scenes generated");
  return { valid: issues.length === 0, issues, reason: issues.length > 0 ? issues.join("; ") : undefined };
}

async function exportVideo(output: VideoOutput, ctx: GenerationContext): Promise<ExportResult> {
  ctx.progress.emit("Preparing export...");
  return {
    format: "json",
    data: { title: output.title, scenes: output.scenes.length, files: output.files.length },
    filename: `${output.title.replace(/\s+/g, "-").toLowerCase()}-video.json`,
  };
}

export const videoStudioPlugin: AIPlugin<VideoPluginInput, VideoAnalysis, VideoPlanResult, VideoOutput> = {
  id: "video-studio",
  name: "Video Studio",
  preferredProvider: getActiveProvider(),
  analyze: analyzeVideo,
  plan: planVideo,
  generate: generateVideo,
  validate: validateVideo,
  export: exportVideo,
};

export * from "@/plugins/video-studio/types";
