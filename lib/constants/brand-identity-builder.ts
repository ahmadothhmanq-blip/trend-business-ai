import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Globe2,
  Heart,
  Megaphone,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type BrandTypeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultDeliverables: string[];
};

export const BRAND_TYPES: BrandTypeDefinition[] = [
  { id: "startup", label: "Startup", description: "New venture brand identity from scratch", icon: Rocket, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"] },
  { id: "corporate", label: "Corporate", description: "Professional enterprise brand system", icon: Building2, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "stationery", "presentation"] },
  { id: "ecommerce", label: "E-commerce", description: "Online store and product brand identity", icon: Store, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "social-kit"] },
  { id: "personal", label: "Personal Brand", description: "Individual professional identity", icon: Users, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"] },
  { id: "nonprofit", label: "Nonprofit", description: "Mission-driven organization branding", icon: Heart, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "storytelling"] },
  { id: "saas", label: "SaaS Product", description: "Software product brand identity", icon: Globe2, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "ui-kit", "voice-tone"] },
  { id: "agency", label: "Agency", description: "Creative or consulting agency branding", icon: Megaphone, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "presentation"] },
  { id: "luxury", label: "Luxury", description: "Premium and luxury brand positioning", icon: Award, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "stationery"] },
  { id: "education", label: "Education", description: "School, course, or EdTech branding", icon: BookOpen, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"] },
  { id: "healthcare", label: "Healthcare", description: "Medical or wellness brand identity", icon: ShieldCheck, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "stationery"] },
  { id: "restaurant", label: "Restaurant / F&B", description: "Food and beverage brand identity", icon: Briefcase, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "menu-design"] },
  { id: "rebrand", label: "Rebrand", description: "Refresh an existing brand identity", icon: Palette, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "migration-guide"] },
  { id: "custom", label: "Custom", description: "Describe your own brand type", icon: Wand2, defaultDeliverables: ["logo-guidelines", "color-palette", "typography"] },
];

export const BRAND_PERSONALITIES = [
  "Professional",
  "Friendly",
  "Bold",
  "Elegant",
  "Playful",
  "Minimal",
  "Authoritative",
  "Innovative",
  "Warm",
  "Edgy",
] as const;

export const BRAND_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Real Estate",
  "Food & Beverage",
  "Fashion & Beauty",
  "Sports & Fitness",
  "Travel & Hospitality",
  "Entertainment & Media",
  "Legal & Professional",
  "Construction & Engineering",
  "Automotive",
  "Agriculture",
  "Non-Profit",
  "SaaS & Software",
  "Consulting",
  "Retail",
  "Other",
] as const;

export const BRAND_DELIVERABLE_OPTIONS: { id: string; label: string; category: string }[] = [
  { id: "brand-strategy", label: "Brand Strategy", category: "Strategy" },
  { id: "brand-story", label: "Brand Story", category: "Strategy" },
  { id: "logo-guidelines", label: "Logo Usage Rules", category: "Visual" },
  { id: "color-palette", label: "Color System", category: "Visual" },
  { id: "typography", label: "Typography System", category: "Visual" },
  { id: "voice-tone", label: "Voice & Tone Guide", category: "Strategy" },
  { id: "social-kit", label: "Social Media Kit", category: "Assets" },
  { id: "business-card", label: "Business Card", category: "Assets" },
  { id: "letterhead", label: "Letterhead", category: "Assets" },
  { id: "email-signature", label: "Email Signature", category: "Assets" },
  { id: "stationery", label: "Stationery Suite", category: "Assets" },
  { id: "presentation", label: "Presentation Template", category: "Assets" },
  { id: "packaging", label: "Packaging Guidelines", category: "Visual" },
  { id: "ui-kit", label: "UI Component Kit", category: "Visual" },
  { id: "icon-set", label: "Icon Set", category: "Visual" },
  { id: "illustration-style", label: "Illustration Style", category: "Visual" },
  { id: "photography-style", label: "Photography Direction", category: "Visual" },
  { id: "email-template", label: "Email Template", category: "Assets" },
  { id: "storytelling", label: "Storytelling Framework", category: "Strategy" },
  { id: "menu-design", label: "Menu Design", category: "Assets" },
  { id: "migration-guide", label: "Migration Guide", category: "Strategy" },
];

export function getBrandType(id: string) {
  return BRAND_TYPES.find((t) => t.id === id);
}

export function getBrandTypeLabel(id: string) {
  return getBrandType(id)?.label ?? id;
}
