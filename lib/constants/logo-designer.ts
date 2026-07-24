import {
  Crown,
  Diamond,
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

  labelKey?: string;

  descriptionKey?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultOptions: string[];
};

export const LOGO_STYLES: LogoStyleDefinition[] = [
  { id: "wordmark", labelKey: "constants.logoDesigner.options.wordmark", label: "Wordmark", description: "Typography-focused logo using the brand name", icon: Pen, defaultOptions: ["typography", "brand-name"] },
  { id: "lettermark", labelKey: "constants.logoDesigner.options.lettermark", label: "Lettermark", description: "Initials or monogram-based logo", icon: Hash, defaultOptions: ["monogram", "initials"] },
  { id: "brandmark", labelKey: "constants.logoDesigner.options.brandmark", label: "Brandmark", description: "Icon or symbol-only logo", icon: Shapes, defaultOptions: ["icon", "symbol"] },
  { id: "combination", labelKey: "constants.logoDesigner.options.combination", label: "Combination Mark", description: "Icon combined with text", icon: Sparkles, defaultOptions: ["icon", "text", "layout"] },
  { id: "emblem", labelKey: "constants.logoDesigner.options.emblem", label: "Emblem", description: "Text integrated into a badge or seal", icon: Crown, defaultOptions: ["badge", "seal", "crest"] },
  { id: "abstract", labelKey: "constants.logoDesigner.options.abstract", label: "Abstract", description: "Geometric or abstract shapes representing the brand", icon: Hexagon, defaultOptions: ["geometric", "abstract"] },
  { id: "mascot", labelKey: "constants.logoDesigner.options.mascot", label: "Mascot", description: "Character-based logo design", icon: Star, defaultOptions: ["character", "illustration"] },
  { id: "minimalist", labelKey: "constants.logoDesigner.options.minimalist", label: "Minimalist", description: "Clean, simple, and modern design", icon: Diamond, defaultOptions: ["clean", "simple"] },
  { id: "vintage", labelKey: "constants.logoDesigner.options.vintage", label: "Vintage", description: "Classic, retro-inspired design", icon: Gem, defaultOptions: ["retro", "classic", "ornamental"] },
  { id: "three-dimensional", labelKey: "constants.logoDesigner.options.three_dimensional", label: "3D / Gradient", description: "Depth, shadows, and gradient effects", icon: Mountain, defaultOptions: ["gradient", "depth", "shadow"] },
  { id: "dynamic", labelKey: "constants.logoDesigner.options.dynamic", label: "Dynamic", description: "Responsive logo that adapts across media", icon: Zap, defaultOptions: ["responsive", "adaptive"] },
  { id: "custom", labelKey: "constants.logoDesigner.options.custom", label: "Custom", description: "Describe your own style and direction", icon: Wand2, defaultOptions: [] },
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

export const LOGO_OPTION_LIST: { id: string; labelKey?: string; label: string }[] = [
  { id: "favicon", labelKey: "constants.logoDesigner.options.favicon", label: "Favicon" },
  { id: "social-avatar", labelKey: "constants.logoDesigner.options.social_avatar", label: "Social Avatar" },
  { id: "dark-version", labelKey: "constants.logoDesigner.options.dark_version", label: "Dark Version" },
  { id: "light-version", labelKey: "constants.logoDesigner.options.light_version", label: "Light Version" },
  { id: "horizontal", labelKey: "constants.logoDesigner.options.horizontal", label: "Horizontal Layout" },
  { id: "vertical", labelKey: "constants.logoDesigner.options.vertical", label: "Vertical Layout" },
  { id: "icon-only", labelKey: "constants.logoDesigner.options.icon_only", label: "Icon Only" },
  { id: "brand-guidelines", labelKey: "constants.logoDesigner.options.brand_guidelines", label: "Brand Guidelines" },
  { id: "business-card", labelKey: "constants.logoDesigner.options.business_card", label: "Business Card Mockup" },
  { id: "watermark", labelKey: "constants.logoDesigner.options.watermark", label: "Watermark Version" },
];

export function getLogoStyle(id: string) {
  return LOGO_STYLES.find((s) => s.id === id);
}

export function getLogoStyleLabel(id: string) {
  return getLogoStyle(id)?.label ?? id;
}
