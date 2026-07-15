import {
  Crown,
  Diamond,
  Flame,
  Gem,
  Hash,
  Hexagon,
  Mountain,
  Pen,
  Shapes,
  Sparkles,
  Star,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type LogoStyleDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultOptions: string[];
};

export const LOGO_STYLES: LogoStyleDefinition[] = [
  { id: "wordmark", label: "Wordmark", description: "Typography-focused logo using the brand name", icon: Pen, defaultOptions: ["typography", "brand-name"] },
  { id: "lettermark", label: "Lettermark", description: "Initials or monogram-based logo", icon: Hash, defaultOptions: ["monogram", "initials"] },
  { id: "brandmark", label: "Brandmark", description: "Icon or symbol-only logo", icon: Shapes, defaultOptions: ["icon", "symbol"] },
  { id: "combination", label: "Combination Mark", description: "Icon combined with text", icon: Sparkles, defaultOptions: ["icon", "text", "layout"] },
  { id: "emblem", label: "Emblem", description: "Text integrated into a badge or seal", icon: Crown, defaultOptions: ["badge", "seal", "crest"] },
  { id: "abstract", label: "Abstract", description: "Geometric or abstract shapes representing the brand", icon: Hexagon, defaultOptions: ["geometric", "abstract"] },
  { id: "mascot", label: "Mascot", description: "Character-based logo design", icon: Star, defaultOptions: ["character", "illustration"] },
  { id: "minimalist", label: "Minimalist", description: "Clean, simple, and modern design", icon: Diamond, defaultOptions: ["clean", "simple"] },
  { id: "vintage", label: "Vintage", description: "Classic, retro-inspired design", icon: Gem, defaultOptions: ["retro", "classic", "ornamental"] },
  { id: "three-dimensional", label: "3D / Gradient", description: "Depth, shadows, and gradient effects", icon: Mountain, defaultOptions: ["gradient", "depth", "shadow"] },
  { id: "dynamic", label: "Dynamic", description: "Responsive logo that adapts across media", icon: Zap, defaultOptions: ["responsive", "adaptive"] },
  { id: "custom", label: "Custom", description: "Describe your own style and direction", icon: Wand2, defaultOptions: [] },
];

export const LOGO_COLOR_PALETTES = [
  "Auto",
  "Monochrome",
  "Black & Gold",
  "Blue Gradient",
  "Green Nature",
  "Red Bold",
  "Purple Luxury",
  "Earth Tones",
  "Pastel Soft",
  "Neon Vibrant",
  "Custom",
] as const;

export const LOGO_ICON_STYLES = [
  "Abstract",
  "Geometric",
  "Organic",
  "Line Art",
  "Filled",
  "Outlined",
  "Flat",
  "Isometric",
  "Hand-drawn",
  "Pixel",
] as const;

export const LOGO_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Real Estate",
  "Food & Beverage",
  "Fashion",
  "Sports & Fitness",
  "Travel & Tourism",
  "Entertainment",
  "Legal",
  "Construction",
  "Automotive",
  "Agriculture",
  "Non-Profit",
  "Media",
  "Consulting",
  "SaaS",
  "Other",
] as const;

export const LOGO_TYPOGRAPHY_OPTIONS = [
  "Sans-serif Modern",
  "Serif Classic",
  "Display Bold",
  "Handwritten",
  "Slab Serif",
  "Monospace",
  "Geometric",
  "Rounded",
  "Condensed",
  "Auto",
] as const;

export const LOGO_BRAND_PERSONALITIES = [
  "Professional",
  "Friendly",
  "Bold",
  "Elegant",
  "Playful",
  "Innovative",
  "Trustworthy",
  "Luxurious",
  "Minimalist",
  "Energetic",
] as const;

export const LOGO_OPTION_LIST: { id: string; label: string }[] = [
  { id: "favicon", label: "Favicon" },
  { id: "social-avatar", label: "Social Avatar" },
  { id: "dark-version", label: "Dark Version" },
  { id: "light-version", label: "Light Version" },
  { id: "horizontal", label: "Horizontal Layout" },
  { id: "vertical", label: "Vertical Layout" },
  { id: "icon-only", label: "Icon Only" },
  { id: "brand-guidelines", label: "Brand Guidelines" },
  { id: "business-card", label: "Business Card Mockup" },
  { id: "watermark", label: "Watermark Version" },
];

export function getLogoStyle(id: string) {
  return LOGO_STYLES.find((s) => s.id === id);
}

export function getLogoStyleLabel(id: string) {
  return getLogoStyle(id)?.label ?? id;
}
