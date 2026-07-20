import {
  Camera,
  Clapperboard,
  Film,
  ImagePlay,
  Megaphone,
  Monitor,
  Palette,
  PlayCircle,
  Presentation,
  Video,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type VideoTypeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultOptions: string[];
};

export const VIDEO_TYPES: VideoTypeDefinition[] = [
  { id: "text-to-video", label: "Text to Video", description: "Generate video from a text description", icon: PlayCircle, defaultOptions: ["script", "subtitles"] },
  { id: "image-to-video", label: "Image to Video", description: "Animate a still image into video", icon: ImagePlay, defaultOptions: ["camera-motion", "smooth"] },
  { id: "storyboard", label: "Storyboard Video", description: "Multi-scene video from a storyboard", icon: Film, defaultOptions: ["script", "transitions", "subtitles"] },
  { id: "product-demo", label: "Product Demo", description: "Product showcase and demonstration", icon: Monitor, defaultOptions: ["script", "voiceover", "subtitles"] },
  { id: "social-video", label: "Social Media Video", description: "Short-form content for social platforms", icon: Megaphone, defaultOptions: ["subtitles", "branded"] },
  { id: "explainer", label: "Explainer Video", description: "Educational or how-to content", icon: Presentation, defaultOptions: ["script", "voiceover", "subtitles"] },
  { id: "ad-video", label: "Ad / Commercial", description: "Advertising and promotional video", icon: Camera, defaultOptions: ["script", "music", "cta"] },
  { id: "brand-video", label: "Brand Video", description: "Brand storytelling and identity", icon: Palette, defaultOptions: ["script", "voiceover", "music", "branded"] },
  { id: "trailer", label: "Trailer / Teaser", description: "Short promotional trailer", icon: Clapperboard, defaultOptions: ["music", "transitions", "dramatic"] },
  { id: "presentation-video", label: "Presentation Video", description: "Animated presentation slides", icon: Video, defaultOptions: ["script", "subtitles", "transitions"] },
  { id: "custom", label: "Custom", description: "Define your own video type", icon: Wand2, defaultOptions: [] },
];

export const VIDEO_STYLES = [
  "Cinematic",
  "Documentary",
  "Animation",
  "Motion Graphics",
  "Minimalist",
  "Corporate",
  "Dramatic",
  "Vintage / Retro",
  "Neon / Cyberpunk",
  "Nature / Organic",
  "Flat Design",
  "3D Render",
  "Watercolor",
  "Sketch / Hand-drawn",
] as const;

export const VIDEO_ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 — Landscape (YouTube, TV)" },
  { id: "9:16", label: "9:16 — Portrait (Reels, TikTok, Shorts)" },
  { id: "1:1", label: "1:1 — Square (Instagram)" },
  { id: "4:5", label: "4:5 — Vertical (Feed)" },
  { id: "21:9", label: "21:9 — Ultrawide (Cinematic)" },
] as const;

export const VIDEO_DURATIONS = [
  { id: "5s", label: "5 seconds — Ultra short" },
  { id: "10s", label: "10 seconds — Hook" },
  { id: "15s", label: "15 seconds — Short / social" },
  { id: "30s", label: "30 seconds — Social / ads" },
  { id: "60s", label: "60 seconds — Marketing" },
  { id: "90s", label: "90 seconds — Explainer" },
  { id: "120s", label: "2 minutes — Presentation" },
  { id: "180s", label: "3 minutes — Training" },
  { id: "300s", label: "5 minutes — Long video" },
  { id: "600s", label: "10 minutes — Extended long-form" },
] as const;

export const VIDEO_CAMERA_MOVES = [
  "Static",
  "Pan Left",
  "Pan Right",
  "Tilt Up",
  "Tilt Down",
  "Zoom In",
  "Zoom Out",
  "Dolly Forward",
  "Dolly Back",
  "Orbit",
  "Crane Up",
  "Crane Down",
  "Tracking Shot",
  "Handheld",
] as const;

export const VIDEO_MOODS = [
  "Professional",
  "Inspirational",
  "Energetic",
  "Calm",
  "Dramatic",
  "Playful",
  "Luxurious",
  "Dark / Moody",
  "Warm",
  "Cool / Tech",
] as const;

export const VIDEO_OPTION_LIST: { id: string; label: string; category: string }[] = [
  { id: "script", label: "AI Script", category: "Content" },
  { id: "voiceover", label: "Voice-over Script", category: "Audio" },
  { id: "music", label: "Music Suggestion", category: "Audio" },
  { id: "sfx", label: "Sound Effects", category: "Audio" },
  { id: "subtitles", label: "Subtitles", category: "Content" },
  { id: "transitions", label: "Transitions", category: "Visual" },
  { id: "camera-motion", label: "Camera Motion", category: "Visual" },
  { id: "branded", label: "Brand Consistency", category: "Brand" },
  { id: "cta", label: "Call-to-Action", category: "Content" },
  { id: "thumbnail", label: "Thumbnail", category: "Output" },
  { id: "smooth", label: "Smooth Motion", category: "Visual" },
  { id: "dramatic", label: "Dramatic Effects", category: "Visual" },
  { id: "color-grade", label: "Color Grading", category: "Visual" },
  { id: "slow-motion", label: "Slow Motion", category: "Visual" },
];

export const VIDEO_EXPORT_PRESETS = [
  { id: "1080p", label: "1080p Full HD", resolution: "1920×1080" },
  { id: "2k", label: "2K QHD", resolution: "2560×1440" },
  { id: "4k", label: "4K Ultra HD", resolution: "3840×2160" },
] as const;

export function getVideoType(id: string) {
  return VIDEO_TYPES.find((t) => t.id === id);
}

export function getVideoTypeLabel(id: string) {
  return getVideoType(id)?.label ?? id;
}
