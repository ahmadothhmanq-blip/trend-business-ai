import {
  AlignLeft,
  BookOpen,
  CalendarDays,
  FileText,
  Globe,
  Hash,
  ImageIcon,
  LayoutTemplate,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  PenTool,
  Rocket,
  ScrollText,
  ShoppingBag,
  Target,
  Video,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CONTENT TOOLS                                                      */
/* ------------------------------------------------------------------ */

export type ContentToolDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultType: string;
  defaultOptions: string[];
};

export const CONTENT_TOOLS: ContentToolDefinition[] = [
  { id: "content-writer", label: "Content Writer", description: "General purpose AI content creation", icon: PenTool, defaultType: "blog-post", defaultOptions: ["seo", "readability"] },
  { id: "blog-writer", label: "Blog Writer", description: "Long-form blog posts with SEO", icon: BookOpen, defaultType: "blog-post", defaultOptions: ["seo", "headings", "meta"] },
  { id: "article-writer", label: "Article Writer", description: "Professional articles and essays", icon: FileText, defaultType: "article", defaultOptions: ["readability", "headings"] },
  { id: "social-writer", label: "Social Media Writer", description: "Posts for all social platforms", icon: MessageSquare, defaultType: "linkedin-post", defaultOptions: ["hashtags", "emoji"] },
  { id: "ad-copy", label: "Ad Copy Generator", description: "High-converting ad copy", icon: Megaphone, defaultType: "google-ad", defaultOptions: ["cta", "headlines"] },
  { id: "email-writer", label: "Email Writer", description: "Email campaigns and sequences", icon: Mail, defaultType: "email-campaign", defaultOptions: ["subject-line", "cta", "personalization"] },
  { id: "newsletter-builder", label: "Newsletter Builder", description: "Engaging newsletters", icon: Newspaper, defaultType: "newsletter", defaultOptions: ["sections", "cta"] },
  { id: "product-description", label: "Product Description", description: "Compelling product copy", icon: ShoppingBag, defaultType: "product-description", defaultOptions: ["benefits", "seo"] },
  { id: "landing-copy", label: "Landing Page Copy", description: "Conversion-focused page copy", icon: LayoutTemplate, defaultType: "landing-page", defaultOptions: ["hero", "cta", "social-proof", "seo"] },
  { id: "script-writer", label: "Script Writer", description: "Video, podcast, and presentation scripts", icon: ScrollText, defaultType: "youtube-script", defaultOptions: ["timestamps", "hooks"] },
  { id: "content-calendar", label: "Content Calendar", description: "Plan and schedule content", icon: CalendarDays, defaultType: "content-plan", defaultOptions: [] },
  { id: "campaign-planner", label: "Campaign Planner", description: "Multi-channel campaign strategy", icon: Rocket, defaultType: "marketing-plan", defaultOptions: ["channels", "timeline", "budget"] },
];

/* ------------------------------------------------------------------ */
/*  CONTENT TYPES                                                      */
/* ------------------------------------------------------------------ */

export type ContentTypeDefinition = {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: LucideIcon;
  tools: string[];
};

export const CONTENT_TYPES: ContentTypeDefinition[] = [
  { id: "blog-post", label: "Blog Post", description: "Long-form blog content with SEO", category: "Long-form", icon: BookOpen, tools: ["content-writer", "blog-writer"] },
  { id: "article", label: "Article", description: "Professional articles and essays", category: "Long-form", icon: FileText, tools: ["content-writer", "article-writer"] },
  { id: "seo-article", label: "SEO Article", description: "Search-optimized content", category: "Long-form", icon: Globe, tools: ["content-writer", "article-writer", "blog-writer"] },
  { id: "facebook-post", label: "Facebook Post", description: "Engaging Facebook content", category: "Social Media", icon: MessageSquare, tools: ["social-writer"] },
  { id: "instagram-post", label: "Instagram Post", description: "Visual-first captions with hashtags", category: "Social Media", icon: ImageIcon, tools: ["social-writer"] },
  { id: "linkedin-post", label: "LinkedIn Post", description: "Professional thought leadership", category: "Social Media", icon: AlignLeft, tools: ["social-writer"] },
  { id: "x-post", label: "X Post", description: "Short, punchy posts (280 chars)", category: "Social Media", icon: Hash, tools: ["social-writer"] },
  { id: "thread", label: "Thread", description: "Multi-post threaded content", category: "Social Media", icon: MessageSquare, tools: ["social-writer"] },
  { id: "tiktok-caption", label: "TikTok Caption", description: "Trendy, hook-driven captions", category: "Social Media", icon: Video, tools: ["social-writer"] },
  { id: "youtube-script", label: "YouTube Script", description: "Video scripts with timestamps", category: "Scripts", icon: Video, tools: ["script-writer"] },
  { id: "youtube-description", label: "YouTube Description", description: "SEO-optimized video descriptions", category: "Scripts", icon: FileText, tools: ["script-writer"] },
  { id: "email-campaign", label: "Email Campaign", description: "Email sequences with subject lines", category: "Email", icon: Mail, tools: ["email-writer"] },
  { id: "newsletter", label: "Newsletter", description: "Sectioned newsletter content", category: "Email", icon: Newspaper, tools: ["newsletter-builder"] },
  { id: "product-description", label: "Product Description", description: "Compelling product copy", category: "Commerce", icon: ShoppingBag, tools: ["product-description"] },
  { id: "sales-page", label: "Sales Page", description: "High-converting sales copy", category: "Commerce", icon: Target, tools: ["landing-copy"] },
  { id: "landing-page", label: "Landing Page Copy", description: "Conversion-focused page sections", category: "Commerce", icon: LayoutTemplate, tools: ["landing-copy"] },
  { id: "google-ad", label: "Google Ad", description: "Headlines and descriptions for Search", category: "Ads", icon: Megaphone, tools: ["ad-copy"] },
  { id: "meta-ad", label: "Meta Ad", description: "Facebook and Instagram ad copy", category: "Ads", icon: Megaphone, tools: ["ad-copy"] },
  { id: "headline", label: "Headlines", description: "Multiple headline variations", category: "Short-form", icon: AlignLeft, tools: ["content-writer", "ad-copy"] },
  { id: "cta", label: "Call-to-Action", description: "Action-driving CTA copy", category: "Short-form", icon: Target, tools: ["content-writer", "ad-copy", "landing-copy"] },
  { id: "business-report", label: "Business Report", description: "Professional business documents", category: "Business", icon: FileText, tools: ["content-writer"] },
  { id: "marketing-plan", label: "Marketing Plan", description: "Strategic marketing documents", category: "Business", icon: Rocket, tools: ["campaign-planner"] },
  { id: "content-plan", label: "Content Plan", description: "Content calendar and schedule", category: "Business", icon: CalendarDays, tools: ["content-calendar", "campaign-planner"] },
];

/* ------------------------------------------------------------------ */
/*  OPTIONS, TONES, AUDIENCES, etc.                                    */
/* ------------------------------------------------------------------ */

export const CONTENT_TONES = [
  "Professional", "Casual", "Friendly", "Formal", "Authoritative",
  "Inspirational", "Humorous", "Empathetic", "Persuasive", "Educational",
  "Conversational", "Bold", "Luxurious", "Minimalist", "Storytelling",
] as const;

/** Platform AI writing tones (Jasper / Copy.ai style) */
export const CONTENT_PLATFORM_TONES = [
  "Professional",
  "Casual",
  "Luxury",
  "Friendly",
  "Technical",
  "Marketing",
] as const;

export const CONTENT_PLATFORM_STYLES = [
  "Standard",
  "Academic",
  "Journalistic",
  "Technical",
  "Creative",
  "Copywriting",
  "SEO-Optimized",
  "Narrative",
] as const;

export const CONTENT_TEMPLATE_CATEGORIES = [
  "Blog",
  "Social Media",
  "Ads",
  "Email",
  "Product Description",
  "Landing Pages",
  "SEO Articles",
  "Business Documents",
] as const;

export const CONTENT_AUDIENCES = [
  "General", "Business Owners", "Entrepreneurs", "Startups", "Enterprise",
  "Marketers", "Developers", "Designers", "Students", "Executives",
  "Millennials", "Gen Z", "Parents", "Professionals", "Investors",
] as const;

export const CONTENT_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Arabic", "Chinese", "Japanese", "Korean", "Hindi", "Russian",
  "Dutch", "Swedish", "Turkish",
] as const;

export const WRITING_STYLES = [
  "Standard", "Academic", "Journalistic", "Technical", "Creative",
  "Copywriting", "SEO-Optimized", "Narrative", "Descriptive",
  "Listicle", "How-to Guide", "Case Study",
] as const;

export const CREATIVITY_LEVELS = [
  { id: "conservative", label: "Conservative", temp: 0.3 },
  { id: "balanced", label: "Balanced", temp: 0.6 },
  { id: "creative", label: "Creative", temp: 0.8 },
  { id: "experimental", label: "Experimental", temp: 1.0 },
] as const;

export const CONTENT_OPTION_LIST: { id: string; label: string; category: string }[] = [
  { id: "seo", label: "SEO Optimization", category: "SEO" },
  { id: "meta", label: "Meta Tags", category: "SEO" },
  { id: "headings", label: "Heading Structure", category: "SEO" },
  { id: "keywords", label: "Keyword Optimization", category: "SEO" },
  { id: "faq", label: "FAQ Section", category: "SEO" },
  { id: "schema", label: "Schema Suggestions", category: "SEO" },
  { id: "internal-links", label: "Internal Linking", category: "SEO" },
  { id: "readability", label: "Readability Analysis", category: "Quality" },
  { id: "grammar", label: "Grammar Review", category: "Quality" },
  { id: "cta", label: "Call-to-Action", category: "Content" },
  { id: "headlines", label: "Multiple Headlines", category: "Content" },
  { id: "subject-line", label: "Subject Lines", category: "Content" },
  { id: "personalization", label: "Personalization", category: "Content" },
  { id: "social-proof", label: "Social Proof", category: "Content" },
  { id: "hero", label: "Hero Section", category: "Content" },
  { id: "sections", label: "Sections", category: "Structure" },
  { id: "hashtags", label: "Hashtags", category: "Social" },
  { id: "emoji", label: "Emoji Usage", category: "Social" },
  { id: "timestamps", label: "Timestamps", category: "Scripts" },
  { id: "hooks", label: "Hooks", category: "Scripts" },
  { id: "benefits", label: "Benefits Focus", category: "Commerce" },
  { id: "channels", label: "Channel Strategy", category: "Planning" },
  { id: "timeline", label: "Timeline", category: "Planning" },
  { id: "budget", label: "Budget Planning", category: "Planning" },
];

export const CONTENT_CALENDAR_CATEGORIES = [
  "General", "Blog", "Social Media", "Email", "Advertising",
  "Product", "Campaign", "Event", "Holiday", "Seasonal",
] as const;

export const CONTENT_CALENDAR_STATUSES = [
  { id: "draft", label: "Draft", color: "bg-white/10 text-white/60" },
  { id: "scheduled", label: "Scheduled", color: "bg-blue-500/15 text-blue-400" },
  { id: "published", label: "Published", color: "bg-green-500/15 text-green-400" },
  { id: "archived", label: "Archived", color: "bg-white/5 text-white/30" },
] as const;

export const CONTENT_PLATFORMS = [
  "Website", "Blog", "Facebook", "Instagram", "LinkedIn", "X",
  "TikTok", "YouTube", "Email", "Newsletter", "Google Ads", "Meta Ads",
] as const;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

export function getContentTool(id: string) {
  return CONTENT_TOOLS.find((t) => t.id === id);
}

export function getContentToolLabel(id: string) {
  return getContentTool(id)?.label ?? id;
}

export function getContentType(id: string) {
  return CONTENT_TYPES.find((t) => t.id === id);
}

export function getContentTypeLabel(id: string) {
  return getContentType(id)?.label ?? id;
}

export function getContentTypesForTool(toolId: string) {
  return CONTENT_TYPES.filter((t) => t.tools.includes(toolId));
}

export function getCalendarStatusConfig(status: string) {
  return CONTENT_CALENDAR_STATUSES.find((s) => s.id === status);
}
