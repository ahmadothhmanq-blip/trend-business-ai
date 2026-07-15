import type { ImagePluginInput, ImageAnalysis, ImageConcept } from "@/plugins/image-generator/types";
import { sanitizePromptInput } from "@/lib/ai/sanitize";

function getImageTypeContext(type: string): string {
  const ctx: Record<string, string> = {
    "product-photo": "E-commerce product photography. Clean, professional, usually on white or gradient backgrounds. Focus on the product details, lighting, and shadows. Think commercial catalog quality.",
    "social-media": "Social media content (Instagram, LinkedIn, Twitter/X). Eye-catching, scroll-stopping. Consider platform dimensions, text overlay areas, and brand consistency.",
    "hero-banner": "Website hero section. Wide format, atmospheric, with clear space for headline text. Creates immediate visual impact and communicates brand message.",
    "ad-creative": "Digital advertising creative. Attention-grabbing with clear CTA area. Must communicate value proposition quickly. Consider ad platform requirements.",
    illustration: "Custom illustration or artwork. Can range from simple flat illustrations to complex detailed artwork. Should match brand style and communicate a specific concept.",
    infographic: "Data visualization and information design. Clear hierarchy, readable layout, data-focused with brand colors. Think structured, organized, professional.",
    "brand-asset": "Brand design elements — patterns, textures, icons, decorative elements. Typically seamless/tileable. Must align with brand identity system.",
    presentation: "Presentation slide backgrounds and visual elements. Clean, professional, wide format (16:9). Support readability of text overlaid on top.",
    thumbnail: "Video/blog thumbnails. Attention-grabbing, bold, with text overlay space. Must be recognizable at small sizes. High contrast and clear subject.",
    landscape: "Environmental/scenic composition. Atmospheric, immersive, cinematic quality. Focus on lighting, depth, and mood. Can be realistic or stylized.",
    portrait: "Character portraits or avatars. Centered composition, clear facial features, consistent style. Professional quality with attention to expression and personality.",
    "concept-art": "Creative concept visualization. Exploratory, mood-driven, artistic. Used for ideation, mood boards, and creative direction. Can be rough or polished.",
    custom: "Custom image type — follow the user's specific description.",
  };
  return ctx[type] || ctx.custom;
}

export function imageAnalyzePrompt(input: ImagePluginInput): string {
  return `You are a professional creative director and image art director. Analyze this image generation brief.

Prompt: ${input.prompt}
Image Type: ${input.imageType}
Style: ${input.style}
Aspect Ratio: ${input.aspectRatio}
Mood: ${input.mood}
Negative Prompt: ${input.negativePrompt || "None"}
Options: ${input.options.join(", ") || "Standard"}
Brand Colors: ${input.brandColors.length > 0 ? input.brandColors.join(", ") : "Auto"}
Batch Size: ${input.batchCount}

Context: ${getImageTypeContext(input.imageType)}

Produce a JSON object with:
- subject: the main subject of the image
- imageType: the category
- style: the artistic style to apply
- mood: the emotional atmosphere
- colorDirection: recommended color approach
- compositionNotes: composition and layout recommendations
- targetUse: where this image will be used
- technicalRequirements: array of technical specs (resolution, format, etc.)

Return ONLY valid JSON.`;
}

export function imagePlanPrompt(input: ImagePluginInput, analysis: ImageAnalysis): string {
  return `You are an expert image concept artist. Plan ${input.batchCount} image concept variations.

Subject: ${analysis.subject}
Type: ${analysis.imageType}
Style: ${analysis.style}
Mood: ${analysis.mood}
Color Direction: ${analysis.colorDirection}
Composition: ${analysis.compositionNotes}
Target Use: ${analysis.targetUse}
Technical: ${analysis.technicalRequirements.join(", ")}
User Prompt: ${input.prompt}
Negative: ${input.negativePrompt || "None"}

Create a JSON object with:
- concepts: array of ${Math.min(input.batchCount, 4)} concept variations, each with:
  - name: concept name (e.g. "Primary", "Alternative A", "Minimal Version")
  - description: detailed visual description (what exactly appears in the image)
  - compositionNotes: layout, framing, camera angle
  - colorPalette: array of 3-5 hex color strings to use
  - lightingDirection: lighting setup description
- colorDirection: overall color approach
- moodBoard: array of 3-5 mood/reference keywords
- outputFormats: recommended output formats (array of strings like "png", "svg", "jpg")
- compositionApproach: overall composition strategy

Return ONLY valid JSON.`;
}

export function imageConceptPrompt(
  input: ImagePluginInput,
  analysis: ImageAnalysis,
  concept: ImageConcept,
): string {
  const aspectDimensions: Record<string, string> = {
    "1:1": "400 400",
    "4:3": "400 300",
    "3:4": "300 400",
    "16:9": "640 360",
    "9:16": "360 640",
    "3:2": "450 300",
    "2:3": "300 450",
  };
  const dims = aspectDimensions[input.aspectRatio] || "400 400";
  const [w, h] = dims.split(" ");

  return `You are a world-class SVG artist and concept designer. Create a detailed SVG illustration for this image concept.

Concept: ${concept.name}
Description: ${concept.description}
Composition: ${concept.compositionNotes}
Colors: ${concept.colorPalette.join(", ")}
Lighting: ${concept.lightingDirection}
Style: ${analysis.style}
Mood: ${analysis.mood}
Subject: ${analysis.subject}

SVG REQUIREMENTS:
- Use viewBox="0 0 ${w} ${h}" for ${input.aspectRatio} aspect ratio.
- Use the specified color palette (${concept.colorPalette.join(", ")}).
- Create a professional, detailed illustration — not a placeholder.
- Use shapes, paths, gradients, and patterns for visual richness.
- For text elements, use generic fonts (Arial, Helvetica, sans-serif).
- No external images, links, or scripts.
- No <image>, <foreignObject>, or external <use> references.
- Center the composition within the viewBox.
- Apply the ${analysis.style} visual style.
- Create depth with layering and overlapping elements.

Also create an optimized image generation prompt for external AI tools (Midjourney, DALL-E, Stable Diffusion).

Return a JSON object with:
- name: "${concept.name}"
- description: what the concept shows
- prompt: optimized text-to-image prompt (detailed, comma-separated descriptors)
- negativePrompt: what to exclude
- aspectRatio: "${input.aspectRatio}"
- style: "${analysis.style}"
- svgConcept: complete SVG markup as a string

Return ONLY valid JSON.`;
}

export function imagePromptLibraryPrompt(
  analysis: ImageAnalysis,
  input: ImagePluginInput,
): string {
  return `You are an expert prompt engineer for AI image generation tools (Midjourney, DALL-E, Stable Diffusion, FLUX).

Based on this image brief, create a library of optimized prompts for generating this image with different AI tools.

Subject: ${analysis.subject}
Style: ${analysis.style}
Mood: ${analysis.mood}
Type: ${analysis.imageType}
User Description: ${input.prompt}
Negative: ${input.negativePrompt || "None"}
Aspect Ratio: ${input.aspectRatio}

Create a JSON object with a "prompts" array containing 4 prompt variations:
1. "Midjourney Optimized" — using Midjourney syntax (--ar, --v, --style)
2. "DALL-E / GPT Optimized" — natural language, detailed description
3. "Stable Diffusion Optimized" — weighted tokens, quality tags, model-specific syntax
4. "Universal" — works well across all platforms

Each entry should have:
- name: the prompt name
- prompt: the full prompt text
- negativePrompt: what to exclude
- style: the style tag

Return ONLY valid JSON with a "prompts" array.`;
}
