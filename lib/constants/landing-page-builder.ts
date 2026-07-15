import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarDays,
  GraduationCap,
  Laptop,
  LayoutGrid,
  Megaphone,
  Palette,
  Rocket,
  ShoppingBag,
  Smartphone,
  Target,
  UtensilsCrossed,
  Video,
  Wrench,
} from "lucide-react";

export type LandingPageTypeDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultSections: string[];
};

export const LANDING_PAGE_TYPES: LandingPageTypeDefinition[] = [
  {
    id: "saas",
    label: "SaaS",
    description: "Software product with features, pricing tiers, and free trial CTA",
    icon: Rocket,
    defaultSections: ["hero", "features", "how-it-works", "pricing", "testimonials", "faq", "cta", "footer"],
  },
  {
    id: "startup",
    label: "Startup",
    description: "Early-stage company with vision, team, and investor CTA",
    icon: Target,
    defaultSections: ["hero", "problem", "solution", "features", "team", "traction", "cta", "footer"],
  },
  {
    id: "product",
    label: "Product",
    description: "Physical or digital product showcase with benefits and purchase CTA",
    icon: ShoppingBag,
    defaultSections: ["hero", "benefits", "features", "gallery", "testimonials", "pricing", "cta", "footer"],
  },
  {
    id: "mobile-app",
    label: "Mobile App",
    description: "App download page with screenshots, features, and store links",
    icon: Smartphone,
    defaultSections: ["hero", "screenshots", "features", "how-it-works", "testimonials", "download", "faq", "footer"],
  },
  {
    id: "agency",
    label: "Agency",
    description: "Creative or digital agency with services, portfolio, and contact",
    icon: Palette,
    defaultSections: ["hero", "services", "portfolio", "process", "team", "testimonials", "contact", "footer"],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Personal or professional portfolio with work showcase and contact",
    icon: LayoutGrid,
    defaultSections: ["hero", "about", "skills", "projects", "testimonials", "contact", "footer"],
  },
  {
    id: "event",
    label: "Event",
    description: "Conference or event with speakers, schedule, and registration",
    icon: CalendarDays,
    defaultSections: ["hero", "speakers", "schedule", "venue", "sponsors", "tickets", "faq", "footer"],
  },
  {
    id: "webinar",
    label: "Webinar",
    description: "Online webinar registration with speakers, topics, and countdown",
    icon: Video,
    defaultSections: ["hero", "speakers", "topics", "benefits", "countdown", "register", "faq", "footer"],
  },
  {
    id: "course",
    label: "Course",
    description: "Online course with curriculum, instructor bio, and enrollment CTA",
    icon: GraduationCap,
    defaultSections: ["hero", "curriculum", "instructor", "testimonials", "pricing", "faq", "enroll", "footer"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    description: "Restaurant with menu highlights, ambiance, and reservation CTA",
    icon: UtensilsCrossed,
    defaultSections: ["hero", "menu", "about", "gallery", "reviews", "reservation", "location", "footer"],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    description: "Property listing or real estate agent with listings and contact",
    icon: Building2,
    defaultSections: ["hero", "featured", "search", "stats", "testimonials", "agent", "contact", "footer"],
  },
  {
    id: "ecommerce-product",
    label: "E-commerce Product",
    description: "Single product launch page with reviews, specs, and buy button",
    icon: Laptop,
    defaultSections: ["hero", "product-details", "specs", "reviews", "gallery", "pricing", "cta", "footer"],
  },
  {
    id: "lead-generation",
    label: "Lead Generation",
    description: "Lead capture page with offer, social proof, and opt-in form",
    icon: Megaphone,
    defaultSections: ["hero", "benefits", "social-proof", "offer", "form", "testimonials", "guarantee", "footer"],
  },
  {
    id: "custom",
    label: "Custom Landing Page",
    description: "Build any custom landing page with your own sections",
    icon: Wrench,
    defaultSections: ["hero", "features", "cta", "footer"],
  },
];

export const LP_LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Arabic", "Chinese", "Japanese",
] as const;

export const LP_DESIGN_STYLES = [
  "Modern", "Minimal", "Bold", "Elegant", "Playful", "Corporate",
] as const;

export const LP_COLOR_STYLES = [
  "Dark Minimal", "Light Professional", "Black & Gold (Premium)",
  "Bold Contrast", "Soft Neutral", "Ocean Blue", "Sunset Gradient",
] as const;

export const LP_SECTION_OPTIONS = [
  { id: "hero", label: "Hero" },
  { id: "features", label: "Features" },
  { id: "benefits", label: "Benefits" },
  { id: "how-it-works", label: "How It Works" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Call to Action" },
  { id: "contact", label: "Contact Form" },
  { id: "gallery", label: "Gallery" },
  { id: "team", label: "Team" },
  { id: "stats", label: "Stats / Metrics" },
  { id: "social-proof", label: "Social Proof" },
  { id: "countdown", label: "Countdown Timer" },
  { id: "video", label: "Video Embed" },
  { id: "newsletter", label: "Newsletter Signup" },
  { id: "footer", label: "Footer" },
] as const;

export function getLandingPageType(id: string): LandingPageTypeDefinition | undefined {
  return LANDING_PAGE_TYPES.find((t) => t.id === id);
}

export function getLandingPageTypeLabel(id: string): string {
  return LANDING_PAGE_TYPES.find((t) => t.id === id)?.label ?? id;
}
