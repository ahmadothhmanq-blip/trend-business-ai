import { getGlsGenerationLanguageValues } from "@/lib/language-platform/generation/options";
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
  labelKey: string;
  descriptionKey: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultType: string;
  defaultOptions: string[];
};

export const CONTENT_TOOLS: ContentToolDefinition[] = [
  { id: "content-writer", labelKey: "contentStudio.tools.contentWriter.label", descriptionKey: "contentStudio.tools.contentWriter.description", label: "Content Writer", description: "General purpose AI content creation", icon: PenTool, defaultType: "blog-post", defaultOptions: ["seo", "readability"] },
  { id: "blog-writer", labelKey: "contentStudio.tools.blogWriter.label", descriptionKey: "contentStudio.tools.blogWriter.description", label: "Blog Writer", description: "Long-form blog posts with SEO", icon: BookOpen, defaultType: "blog-post", defaultOptions: ["seo", "headings", "meta"] },
  { id: "article-writer", labelKey: "contentStudio.tools.articleWriter.label", descriptionKey: "contentStudio.tools.articleWriter.description", label: "Article Writer", description: "Professional articles and essays", icon: FileText, defaultType: "article", defaultOptions: ["readability", "headings"] },
  { id: "social-writer", labelKey: "contentStudio.tools.socialWriter.label", descriptionKey: "contentStudio.tools.socialWriter.description", label: "Social Media Writer", description: "Posts for all social platforms", icon: MessageSquare, defaultType: "linkedin-post", defaultOptions: ["hashtags", "emoji"] },
  { id: "ad-copy", labelKey: "contentStudio.tools.adCopy.label", descriptionKey: "contentStudio.tools.adCopy.description", label: "Ad Copy Generator", description: "High-converting ad copy", icon: Megaphone, defaultType: "google-ad", defaultOptions: ["cta", "headlines"] },
  { id: "email-writer", labelKey: "contentStudio.tools.emailWriter.label", descriptionKey: "contentStudio.tools.emailWriter.description", label: "Email Writer", description: "Email campaigns and sequences", icon: Mail, defaultType: "email-campaign", defaultOptions: ["subject-line", "cta", "personalization"] },
  { id: "newsletter-builder", labelKey: "contentStudio.tools.newsletterBuilder.label", descriptionKey: "contentStudio.tools.newsletterBuilder.description", label: "Newsletter Builder", description: "Engaging newsletters", icon: Newspaper, defaultType: "newsletter", defaultOptions: ["sections", "cta"] },
  { id: "product-description", labelKey: "contentStudio.tools.productDescription.label", descriptionKey: "contentStudio.tools.productDescription.description", label: "Product Description", description: "Compelling product copy", icon: ShoppingBag, defaultType: "product-description", defaultOptions: ["benefits", "seo"] },
  { id: "landing-copy", labelKey: "contentStudio.tools.landingCopy.label", descriptionKey: "contentStudio.tools.landingCopy.description", label: "Landing Page Copy", description: "Conversion-focused page copy", icon: LayoutTemplate, defaultType: "landing-page", defaultOptions: ["hero", "cta", "social-proof", "seo"] },
  { id: "script-writer", labelKey: "contentStudio.tools.scriptWriter.label", descriptionKey: "contentStudio.tools.scriptWriter.description", label: "Script Writer", description: "Video, podcast, and presentation scripts", icon: ScrollText, defaultType: "youtube-script", defaultOptions: ["timestamps", "hooks"] },
  { id: "content-calendar", labelKey: "contentStudio.tools.contentCalendar.label", descriptionKey: "contentStudio.tools.contentCalendar.description", label: "Content Calendar", description: "Plan and schedule content", icon: CalendarDays, defaultType: "content-plan", defaultOptions: [] },
  { id: "campaign-planner", labelKey: "contentStudio.tools.campaignPlanner.label", descriptionKey: "contentStudio.tools.campaignPlanner.description", label: "Campaign Planner", description: "Multi-channel campaign strategy", icon: Rocket, defaultType: "marketing-plan", defaultOptions: ["channels", "timeline", "budget"] },
];

/* ------------------------------------------------------------------ */
/*  CONTENT TYPES                                                      */
/* ------------------------------------------------------------------ */

export type ContentTypeDefinition = {
  id: string;
  labelKey: string;
  descriptionKey: string;
  label: string;
  description: string;
  category: string;
  categoryKey?: string;
  icon: LucideIcon;
  tools: string[];
};

export const CONTENT_TYPES: ContentTypeDefinition[] = [
  { id: "blog-post", labelKey: "constants.contentStudio.types.blog_post.label", descriptionKey: "constants.contentStudio.types.blog_post.description", label: "Blog Post", description: "Long-form blog content with SEO", category: "Long-form", categoryKey: "constants.contentStudio.templateCategories.long_form", icon: BookOpen, tools: ["content-writer", "blog-writer"] },
  { id: "article", labelKey: "constants.contentStudio.types.article.label", descriptionKey: "constants.contentStudio.types.article.description", label: "Article", description: "Professional articles and essays", category: "Long-form", categoryKey: "constants.contentStudio.templateCategories.long_form", icon: FileText, tools: ["content-writer", "article-writer"] },
  { id: "seo-article", labelKey: "constants.contentStudio.types.seo_article.label", descriptionKey: "constants.contentStudio.types.seo_article.description", label: "SEO Article", description: "Search-optimized content", category: "Long-form", categoryKey: "constants.contentStudio.templateCategories.long_form", icon: Globe, tools: ["content-writer", "article-writer", "blog-writer"] },
  { id: "facebook-post", labelKey: "constants.contentStudio.types.facebook_post.label", descriptionKey: "constants.contentStudio.types.facebook_post.description", label: "Facebook Post", description: "Engaging Facebook content", category: "Social Media", categoryKey: "constants.contentStudio.templateCategories.social_media", icon: MessageSquare, tools: ["social-writer"] },
  { id: "instagram-post", labelKey: "constants.contentStudio.types.instagram_post.label", descriptionKey: "constants.contentStudio.types.instagram_post.description", label: "Instagram Post", description: "Visual-first captions with hashtags", category: "Social Media", categoryKey: "constants.contentStudio.templateCategories.social_media", icon: ImageIcon, tools: ["social-writer"] },
  { id: "linkedin-post", labelKey: "constants.contentStudio.types.linkedin_post.label", descriptionKey: "constants.contentStudio.types.linkedin_post.description", label: "LinkedIn Post", description: "Professional thought leadership", category: "Social Media", categoryKey: "constants.contentStudio.templateCategories.social_media", icon: AlignLeft, tools: ["social-writer"] },
  { id: "x-post", labelKey: "constants.contentStudio.types.x_post.label", descriptionKey: "constants.contentStudio.types.x_post.description", label: "X Post", description: "Short, punchy posts (280 chars)", category: "Social Media", categoryKey: "constants.contentStudio.templateCategories.social_media", icon: Hash, tools: ["social-writer"] },
  { id: "thread", labelKey: "constants.contentStudio.types.thread.label", descriptionKey: "constants.contentStudio.types.thread.description", label: "Thread", description: "Multi-post threaded content", category: "Social Media", categoryKey: "constants.contentStudio.templateCategories.social_media", icon: MessageSquare, tools: ["social-writer"] },
  { id: "tiktok-caption", labelKey: "constants.contentStudio.types.tiktok_caption.label", descriptionKey: "constants.contentStudio.types.tiktok_caption.description", label: "TikTok Caption", description: "Trendy, hook-driven captions", category: "Social Media", categoryKey: "constants.contentStudio.templateCategories.social_media", icon: Video, tools: ["social-writer"] },
  { id: "youtube-script", labelKey: "constants.contentStudio.types.youtube_script.label", descriptionKey: "constants.contentStudio.types.youtube_script.description", label: "YouTube Script", description: "Video scripts with timestamps", category: "Scripts", categoryKey: "constants.contentStudio.templateCategories.scripts", icon: Video, tools: ["script-writer"] },
  { id: "youtube-description", labelKey: "constants.contentStudio.types.youtube_description.label", descriptionKey: "constants.contentStudio.types.youtube_description.description", label: "YouTube Description", description: "SEO-optimized video descriptions", category: "Scripts", categoryKey: "constants.contentStudio.templateCategories.scripts", icon: FileText, tools: ["script-writer"] },
  { id: "email-campaign", labelKey: "constants.contentStudio.types.email_campaign.label", descriptionKey: "constants.contentStudio.types.email_campaign.description", label: "Email Campaign", description: "Email sequences with subject lines", category: "Email", categoryKey: "constants.contentStudio.templateCategories.email", icon: Mail, tools: ["email-writer"] },
  { id: "newsletter", labelKey: "constants.contentStudio.types.newsletter.label", descriptionKey: "constants.contentStudio.types.newsletter.description", label: "Newsletter", description: "Sectioned newsletter content", category: "Email", categoryKey: "constants.contentStudio.templateCategories.email", icon: Newspaper, tools: ["newsletter-builder"] },
  { id: "product-description", labelKey: "constants.contentStudio.types.product_description.label", descriptionKey: "constants.contentStudio.types.product_description.description", label: "Product Description", description: "Compelling product copy", category: "Commerce", categoryKey: "constants.contentStudio.templateCategories.commerce", icon: ShoppingBag, tools: ["product-description"] },
  { id: "sales-page", labelKey: "constants.contentStudio.types.sales_page.label", descriptionKey: "constants.contentStudio.types.sales_page.description", label: "Sales Page", description: "High-converting sales copy", category: "Commerce", categoryKey: "constants.contentStudio.templateCategories.commerce", icon: Target, tools: ["landing-copy"] },
  { id: "landing-page", labelKey: "constants.contentStudio.types.landing_page.label", descriptionKey: "constants.contentStudio.types.landing_page.description", label: "Landing Page Copy", description: "Conversion-focused page sections", category: "Commerce", categoryKey: "constants.contentStudio.templateCategories.commerce", icon: LayoutTemplate, tools: ["landing-copy"] },
  { id: "google-ad", labelKey: "constants.contentStudio.types.google_ad.label", descriptionKey: "constants.contentStudio.types.google_ad.description", label: "Google Ad", description: "Headlines and descriptions for Search", category: "Ads", categoryKey: "constants.contentStudio.templateCategories.ads", icon: Megaphone, tools: ["ad-copy"] },
  { id: "meta-ad", labelKey: "constants.contentStudio.types.meta_ad.label", descriptionKey: "constants.contentStudio.types.meta_ad.description", label: "Meta Ad", description: "Facebook and Instagram ad copy", category: "Ads", categoryKey: "constants.contentStudio.templateCategories.ads", icon: Megaphone, tools: ["ad-copy"] },
  { id: "headline", labelKey: "constants.contentStudio.types.headline.label", descriptionKey: "constants.contentStudio.types.headline.description", label: "Headlines", description: "Multiple headline variations", category: "Short-form", categoryKey: "constants.contentStudio.templateCategories.short_form", icon: AlignLeft, tools: ["content-writer", "ad-copy"] },
  { id: "cta", labelKey: "constants.contentStudio.types.cta.label", descriptionKey: "constants.contentStudio.types.cta.description", label: "Call-to-Action", description: "Action-driving CTA copy", category: "Short-form", categoryKey: "constants.contentStudio.templateCategories.short_form", icon: Target, tools: ["content-writer", "ad-copy", "landing-copy"] },
  { id: "business-report", labelKey: "constants.contentStudio.types.business_report.label", descriptionKey: "constants.contentStudio.types.business_report.description", label: "Business Report", description: "Professional business documents", category: "Business", categoryKey: "constants.contentStudio.templateCategories.business", icon: FileText, tools: ["content-writer"] },
  { id: "marketing-plan", labelKey: "constants.contentStudio.types.marketing_plan.label", descriptionKey: "constants.contentStudio.types.marketing_plan.description", label: "Marketing Plan", description: "Strategic marketing documents", category: "Business", categoryKey: "constants.contentStudio.templateCategories.business", icon: Rocket, tools: ["campaign-planner"] },
  { id: "content-plan", labelKey: "constants.contentStudio.types.content_plan.label", descriptionKey: "constants.contentStudio.types.content_plan.description", label: "Content Plan", description: "Content calendar and schedule", category: "Business", categoryKey: "constants.contentStudio.templateCategories.business", icon: CalendarDays, tools: ["content-calendar", "campaign-planner"] },
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

export const CONTENT_LANGUAGES = getGlsGenerationLanguageValues(
  "content-studio",
) as readonly string[];

export const WRITING_STYLES = [
  "Standard", "Academic", "Journalistic", "Technical", "Creative",
  "Copywriting", "SEO-Optimized", "Narrative", "Descriptive",
  "Listicle", "How-to Guide", "Case Study",
] as const;

export const CREATIVITY_LEVELS = [
  { id: "conservative", labelKey: "constants.contentStudio.creativityLevels.conservative", label: "Conservative", temp: 0.3 },
  { id: "balanced", labelKey: "constants.contentStudio.creativityLevels.balanced", label: "Balanced", temp: 0.6 },
  { id: "creative", labelKey: "constants.contentStudio.creativityLevels.creative", label: "Creative", temp: 0.8 },
  { id: "experimental", labelKey: "constants.contentStudio.creativityLevels.experimental", label: "Experimental", temp: 1.0 },
] as const;

export const CONTENT_OPTION_LIST: { id: string; labelKey: string; label: string; category: string }[] = [
  { id: "seo", labelKey: "constants.contentStudio.options.seo", label: "SEO Optimization", category: "SEO" },
  { id: "meta", labelKey: "constants.contentStudio.options.meta", label: "Meta Tags", category: "SEO" },
  { id: "headings", labelKey: "constants.contentStudio.options.headings", label: "Heading Structure", category: "SEO" },
  { id: "keywords", labelKey: "constants.contentStudio.options.keywords", label: "Keyword Optimization", category: "SEO" },
  { id: "faq", labelKey: "constants.contentStudio.options.faq", label: "FAQ Section", category: "SEO" },
  { id: "schema", labelKey: "constants.contentStudio.options.schema", label: "Schema Suggestions", category: "SEO" },
  { id: "internal-links", labelKey: "constants.contentStudio.options.internal_links", label: "Internal Linking", category: "SEO" },
  { id: "readability", labelKey: "constants.contentStudio.options.readability", label: "Readability Analysis", category: "Quality" },
  { id: "grammar", labelKey: "constants.contentStudio.options.grammar", label: "Grammar Review", category: "Quality" },
  { id: "cta", labelKey: "constants.contentStudio.options.cta", label: "Call-to-Action", category: "Content" },
  { id: "headlines", labelKey: "constants.contentStudio.options.headlines", label: "Multiple Headlines", category: "Content" },
  { id: "subject-line", labelKey: "constants.contentStudio.options.subject_line", label: "Subject Lines", category: "Content" },
  { id: "personalization", labelKey: "constants.contentStudio.options.personalization", label: "Personalization", category: "Content" },
  { id: "social-proof", labelKey: "constants.contentStudio.options.social_proof", label: "Social Proof", category: "Content" },
  { id: "hero", labelKey: "constants.contentStudio.options.hero", label: "Hero Section", category: "Content" },
  { id: "sections", labelKey: "constants.contentStudio.options.sections", label: "Sections", category: "Structure" },
  { id: "hashtags", labelKey: "constants.contentStudio.options.hashtags", label: "Hashtags", category: "Social" },
  { id: "emoji", labelKey: "constants.contentStudio.options.emoji", label: "Emoji Usage", category: "Social" },
  { id: "timestamps", labelKey: "constants.contentStudio.options.timestamps", label: "Timestamps", category: "Scripts" },
  { id: "hooks", labelKey: "constants.contentStudio.options.hooks", label: "Hooks", category: "Scripts" },
  { id: "benefits", labelKey: "constants.contentStudio.options.benefits", label: "Benefits Focus", category: "Commerce" },
  { id: "channels", labelKey: "constants.contentStudio.options.channels", label: "Channel Strategy", category: "Planning" },
  { id: "timeline", labelKey: "constants.contentStudio.options.timeline", label: "Timeline", category: "Planning" },
  { id: "budget", labelKey: "constants.contentStudio.options.budget", label: "Budget Planning", category: "Planning" },
];

export const CONTENT_CALENDAR_CATEGORIES = [
  "General", "Blog", "Social Media", "Email", "Advertising",
  "Product", "Campaign", "Event", "Holiday", "Seasonal",
] as const;

export const CONTENT_CALENDAR_STATUSES = [
  { id: "draft", labelKey: "constants.contentStudio.calendarStatuses.draft", label: "Draft", color: "bg-white/10 text-white/60" },
  { id: "scheduled", labelKey: "constants.contentStudio.calendarStatuses.scheduled", label: "Scheduled", color: "bg-blue-500/15 text-blue-400" },
  { id: "published", labelKey: "constants.contentStudio.calendarStatuses.published", label: "Published", color: "bg-green-500/15 text-green-400" },
  { id: "archived", labelKey: "constants.contentStudio.calendarStatuses.archived", label: "Archived", color: "bg-white/5 text-white/30" },
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

export function getContentToolLabel(id: string, t?: (key: string) => string) {
  const tool = getContentTool(id);
  if (!tool) return id;
  if (t && tool.labelKey) {
    const translated = t(tool.labelKey);
    if (translated !== tool.labelKey) return translated;
  }
  return tool.label;
}

export function getContentType(id: string) {
  return CONTENT_TYPES.find((t) => t.id === id);
}

export function getContentTypeLabel(id: string, t?: (key: string) => string) {
  const type = getContentType(id);
  if (!type) return id;
  if (t && type.labelKey) {
    const translated = t(type.labelKey);
    if (translated !== type.labelKey) return translated;
  }
  return type.label;
}

export function getContentTypesForTool(toolId: string) {
  return CONTENT_TYPES.filter((t) => t.tools.includes(toolId));
}

export function getCalendarStatusConfig(status: string) {
  return CONTENT_CALENDAR_STATUSES.find((s) => s.id === status);
}
