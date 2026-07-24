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
  Store,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type BrandTypeDefinition = {
  id: string;

  labelKey?: string;

  descriptionKey?: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultDeliverables: string[];
};

export const BRAND_TYPES: BrandTypeDefinition[] = [
  { id: "startup", labelKey: "constants.brandIdentity.options.startup", label: "Startup", description: "New venture brand identity from scratch", icon: Rocket, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"] },
  { id: "corporate", labelKey: "constants.brandIdentity.options.corporate", label: "Corporate", description: "Professional enterprise brand system", icon: Building2, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "stationery", "presentation"] },
  { id: "ecommerce", labelKey: "constants.brandIdentity.options.ecommerce", label: "E-commerce", description: "Online store and product brand identity", icon: Store, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "social-kit"] },
  { id: "personal", labelKey: "constants.brandIdentity.options.personal", label: "Personal Brand", description: "Individual professional identity", icon: Users, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"] },
  { id: "nonprofit", labelKey: "constants.brandIdentity.options.nonprofit", label: "Nonprofit", description: "Mission-driven organization branding", icon: Heart, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "storytelling"] },
  { id: "saas", labelKey: "constants.brandIdentity.options.saas", label: "SaaS Product", description: "Software product brand identity", icon: Globe2, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "ui-kit", "voice-tone"] },
  { id: "agency", labelKey: "constants.brandIdentity.options.agency", label: "Agency", description: "Creative or consulting agency branding", icon: Megaphone, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "presentation"] },
  { id: "luxury", labelKey: "constants.brandIdentity.options.luxury", label: "Luxury", description: "Premium and luxury brand positioning", icon: Award, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "stationery"] },
  { id: "education", labelKey: "constants.brandIdentity.options.education", label: "Education", description: "School, course, or EdTech branding", icon: BookOpen, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"] },
  { id: "healthcare", labelKey: "constants.brandIdentity.options.healthcare", label: "Healthcare", description: "Medical or wellness brand identity", icon: ShieldCheck, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "stationery"] },
  { id: "restaurant", labelKey: "constants.brandIdentity.options.restaurant", label: "Restaurant / F&B", description: "Food and beverage brand identity", icon: Briefcase, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "menu-design"] },
  { id: "rebrand", labelKey: "constants.brandIdentity.options.rebrand", label: "Rebrand", description: "Refresh an existing brand identity", icon: Palette, defaultDeliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "migration-guide"] },
  { id: "custom", labelKey: "constants.brandIdentity.options.custom", label: "Custom", description: "Describe your own brand type", icon: Wand2, defaultDeliverables: ["logo-guidelines", "color-palette", "typography"] },
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

export const BRAND_DELIVERABLE_OPTIONS: { id: string; labelKey?: string; label: string; category: string }[] = [
  { id: "brand-strategy", labelKey: "constants.brandIdentity.options.brand_strategy", label: "Brand Strategy", category: "Strategy" },
  { id: "brand-story", labelKey: "constants.brandIdentity.options.brand_story", label: "Brand Story", category: "Strategy" },
  { id: "logo-guidelines", labelKey: "constants.brandIdentity.options.logo_guidelines", label: "Logo Usage Rules", category: "Visual" },
  { id: "color-palette", labelKey: "constants.brandIdentity.options.color_palette", label: "Color System", category: "Visual" },
  { id: "typography", labelKey: "constants.brandIdentity.options.typography", label: "Typography System", category: "Visual" },
  { id: "voice-tone", labelKey: "constants.brandIdentity.options.voice_tone", label: "Voice & Tone Guide", category: "Strategy" },
  { id: "social-kit", labelKey: "constants.brandIdentity.options.social_kit", label: "Social Media Kit", category: "Assets" },
  { id: "business-card", labelKey: "constants.brandIdentity.options.business_card", label: "Business Card", category: "Assets" },
  { id: "letterhead", labelKey: "constants.brandIdentity.options.letterhead", label: "Letterhead", category: "Assets" },
  { id: "email-signature", labelKey: "constants.brandIdentity.options.email_signature", label: "Email Signature", category: "Assets" },
  { id: "stationery", labelKey: "constants.brandIdentity.options.stationery", label: "Stationery Suite", category: "Assets" },
  { id: "presentation", labelKey: "constants.brandIdentity.options.presentation", label: "Presentation Template", category: "Assets" },
  { id: "packaging", labelKey: "constants.brandIdentity.options.packaging", label: "Packaging Guidelines", category: "Visual" },
  { id: "ui-kit", labelKey: "constants.brandIdentity.options.ui_kit", label: "UI Component Kit", category: "Visual" },
  { id: "icon-set", labelKey: "constants.brandIdentity.options.icon_set", label: "Icon Set", category: "Visual" },
  { id: "illustration-style", labelKey: "constants.brandIdentity.options.illustration_style", label: "Illustration Style", category: "Visual" },
  { id: "photography-style", labelKey: "constants.brandIdentity.options.photography_style", label: "Photography Direction", category: "Visual" },
  { id: "email-template", labelKey: "constants.brandIdentity.options.email_template", label: "Email Template", category: "Assets" },
  { id: "storytelling", labelKey: "constants.brandIdentity.options.storytelling", label: "Storytelling Framework", category: "Strategy" },
  { id: "menu-design", labelKey: "constants.brandIdentity.options.menu_design", label: "Menu Design", category: "Assets" },
  { id: "migration-guide", labelKey: "constants.brandIdentity.options.migration_guide", label: "Migration Guide", category: "Strategy" },
];

export function getBrandType(id: string) {
  return BRAND_TYPES.find((t) => t.id === id);
}

export function getBrandTypeLabel(id: string) {
  return getBrandType(id)?.label ?? id;
}
