import {
  Camera,
  Clapperboard,
  Eye,
  Flame,
  Frame,
  Layers,
  Monitor,
  Mountain,
  Palette,
  PenTool,
  Sparkles,
  Sun,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type ImageTypeDefinition = {
  id: string;

  labelKey?: string;

  descriptionKey?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultOptions: string[];
};

export const IMAGE_TYPES: ImageTypeDefinition[] = [
  { id: "product-photo", labelKey: "constants.imageGenerator.options.product_photo", label: "Product Photo", description: "E-commerce and product imagery concepts", icon: Camera, defaultOptions: ["high-res", "white-bg"] },
  { id: "social-media", labelKey: "constants.imageGenerator.options.social_media", label: "Social Media", description: "Posts, stories, and cover images", icon: Monitor, defaultOptions: ["branded", "text-overlay"] },
  { id: "hero-banner", labelKey: "constants.imageGenerator.options.hero_banner", label: "Hero Banner", description: "Website hero and landing page banners", icon: Layers, defaultOptions: ["wide-format", "text-space"] },
  { id: "ad-creative", labelKey: "constants.imageGenerator.options.ad_creative", label: "Ad Creative", description: "Advertising and campaign visuals", icon: Flame, defaultOptions: ["cta-space", "branded"] },
  { id: "illustration", labelKey: "constants.imageGenerator.options.illustration", label: "Illustration", description: "Custom illustrations and artwork", icon: PenTool, defaultOptions: ["vector-style", "brand-colors"] },
  { id: "infographic", labelKey: "constants.imageGenerator.options.infographic", label: "Infographic", description: "Data visualization and information design", icon: Frame, defaultOptions: ["data-driven", "branded"] },
  { id: "brand-asset", labelKey: "constants.imageGenerator.options.brand_asset", label: "Brand Asset", description: "Patterns, textures, and brand elements", icon: Palette, defaultOptions: ["seamless", "brand-colors"] },
  { id: "presentation", labelKey: "constants.imageGenerator.options.presentation", label: "Presentation", description: "Slide backgrounds and visual elements", icon: Clapperboard, defaultOptions: ["wide-format", "clean"] },
  { id: "thumbnail", labelKey: "constants.imageGenerator.options.thumbnail", label: "Thumbnail", description: "YouTube, blog, and video thumbnails", icon: Eye, defaultOptions: ["attention-grabbing", "text-overlay"] },
  { id: "landscape", labelKey: "constants.imageGenerator.options.landscape", label: "Landscape / Scene", description: "Environmental and scenic compositions", icon: Mountain, defaultOptions: ["high-res", "atmospheric"] },
  { id: "portrait", labelKey: "constants.imageGenerator.options.portrait", label: "Portrait / Avatar", description: "Character portraits and avatars", icon: Sun, defaultOptions: ["centered", "high-detail"] },
  { id: "concept-art", labelKey: "constants.imageGenerator.options.concept_art", label: "Concept Art", description: "Creative concepts and mood boards", icon: Sparkles, defaultOptions: ["artistic", "mood-driven"] },
  { id: "custom", labelKey: "constants.imageGenerator.options.custom", label: "Custom", description: "Describe your own image type", icon: Wand2, defaultOptions: [] },
];

export const IMAGE_STYLES = [
  "Photorealistic",
  "Flat Design",
  "3D Render",
  "Watercolor",
  "Minimalist",
  "Cinematic",
  "Pop Art",
  "Line Art",
  "Isometric",
  "Pixel Art",
  "Oil Painting",
  "Sketch",
  "Cyberpunk",
  "Vintage",
] as const;

export const IMAGE_ASPECT_RATIOS = [
  "1:1",
  "4:3",
  "3:4",
  "16:9",
  "9:16",
  "3:2",
  "2:3",
] as const;

export const IMAGE_MOODS = [
  "Professional",
  "Cheerful",
  "Dark & Moody",
  "Warm",
  "Cool",
  "Energetic",
  "Serene",
  "Dramatic",
  "Luxurious",
  "Playful",
] as const;

export const IMAGE_NEGATIVE_PRESETS: { id: string; labelKey?: string; label: string; terms: string }[] = [
  { id: "no-text", labelKey: "constants.imageGenerator.options.no_text", label: "No Text", terms: "text, words, letters, watermark, signature" },
  { id: "no-people", labelKey: "constants.imageGenerator.options.no_people", label: "No People", terms: "people, person, human, face, hands" },
  { id: "no-blur", labelKey: "constants.imageGenerator.options.no_blur", label: "No Blur", terms: "blurry, out of focus, bokeh, motion blur" },
  { id: "no-noise", labelKey: "constants.imageGenerator.options.no_noise", label: "No Noise", terms: "grainy, noisy, artifacts, compression" },
  { id: "no-borders", labelKey: "constants.imageGenerator.options.no_borders", label: "No Borders", terms: "border, frame, vignette, edge" },
  { id: "no-violence", labelKey: "constants.imageGenerator.options.no_violence", label: "Safe Content", terms: "violence, gore, weapons, disturbing" },
];

export const IMAGE_OPTION_LIST: { id: string; labelKey?: string; label: string; category: string }[] = [
  { id: "high-res", labelKey: "constants.imageGenerator.options.high_res", label: "High Resolution", category: "Quality" },
  { id: "white-bg", labelKey: "constants.imageGenerator.options.white_bg", label: "White Background", category: "Background" },
  { id: "transparent-bg", labelKey: "constants.imageGenerator.options.transparent_bg", label: "Transparent Background", category: "Background" },
  { id: "text-overlay", labelKey: "constants.imageGenerator.options.text_overlay", label: "Text Overlay Space", category: "Layout" },
  { id: "branded", labelKey: "constants.imageGenerator.options.branded", label: "Brand Colors", category: "Brand" },
  { id: "cta-space", labelKey: "constants.imageGenerator.options.cta_space", label: "CTA Space", category: "Layout" },
  { id: "wide-format", labelKey: "constants.imageGenerator.options.wide_format", label: "Wide Format", category: "Layout" },
  { id: "vector-style", labelKey: "constants.imageGenerator.options.vector_style", label: "Vector Style", category: "Style" },
  { id: "brand-colors", labelKey: "constants.imageGenerator.options.brand_colors", label: "Brand Color Palette", category: "Brand" },
  { id: "mood-driven", labelKey: "constants.imageGenerator.options.mood_driven", label: "Mood-driven", category: "Style" },
  { id: "variations", labelKey: "constants.imageGenerator.options.variations", label: "Multiple Variations", category: "Output" },
  { id: "seamless", labelKey: "constants.imageGenerator.options.seamless", label: "Seamless/Tileable", category: "Style" },
  { id: "atmospheric", labelKey: "constants.imageGenerator.options.atmospheric", label: "Atmospheric", category: "Style" },
  { id: "centered", labelKey: "constants.imageGenerator.options.centered", label: "Centered Composition", category: "Layout" },
  { id: "high-detail", labelKey: "constants.imageGenerator.options.high_detail", label: "High Detail", category: "Quality" },
  { id: "artistic", labelKey: "constants.imageGenerator.options.artistic", label: "Artistic", category: "Style" },
  { id: "clean", labelKey: "constants.imageGenerator.options.clean", label: "Clean/Minimal", category: "Style" },
  { id: "attention-grabbing", labelKey: "constants.imageGenerator.options.attention_grabbing", label: "Attention Grabbing", category: "Style" },
  { id: "data-driven", labelKey: "constants.imageGenerator.options.data_driven", label: "Data-Driven", category: "Layout" },
  { id: "text-space", labelKey: "constants.imageGenerator.options.text_space", label: "Text Space", category: "Layout" },
];

export function getImageType(id: string) {
  return IMAGE_TYPES.find((t) => t.id === id);
}

export function getImageTypeLabel(id: string) {
  return getImageType(id)?.label ?? id;
}
