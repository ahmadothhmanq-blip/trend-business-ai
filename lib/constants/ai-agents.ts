import type { TypeDefinition } from "@/components/dashboard/builder-shared";
import {
  BarChart3, Globe2, Megaphone, Palette, PenLine, Rocket,
  Search, Smartphone, Video, Microscope, Settings2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Agent Types                                                        */
/* ------------------------------------------------------------------ */

export const AGENT_TYPES: TypeDefinition[] = [
  { id: "business-startup", label: "Business Startup Agent", icon: Rocket, description: "End-to-end startup planning: idea validation, business plan, branding, website" },
  { id: "marketing", label: "Marketing Agent", icon: Megaphone, description: "Campaign strategy, ad copy, funnel design, audience targeting" },
  { id: "content", label: "Content Agent", icon: PenLine, description: "Blog posts, articles, social media content, newsletters" },
  { id: "seo", label: "SEO Agent", icon: Search, description: "Keyword research, on-page optimization, competitor analysis, technical SEO" },
  { id: "website", label: "Website Agent", icon: Globe2, description: "Full website generation, landing pages, component architecture" },
  { id: "video-production", label: "Video Production Agent", icon: Video, description: "Storyboards, scripts, shot lists, production schedules" },
  { id: "research", label: "Research Agent", icon: Microscope, description: "Market research, competitor analysis, trend reports, data synthesis" },
  { id: "brand", label: "Brand Agent", icon: Palette, description: "Brand identity, logo concepts, color systems, brand guidelines" },
  { id: "social-media", label: "Social Media Agent", icon: Smartphone, description: "Content calendar, post generation, engagement strategy" },
  { id: "analytics", label: "Analytics Agent", icon: BarChart3, description: "Data analysis, KPI tracking, performance reports, insights" },
  { id: "custom", label: "Custom Agent", icon: Settings2, description: "Build your own agent with custom instructions and tools" },
];

/* ------------------------------------------------------------------ */
/*  Agent Categories                                                   */
/* ------------------------------------------------------------------ */

export const AGENT_CATEGORIES = [
  { id: "business", label: "Business", description: "Business strategy and planning" },
  { id: "marketing", label: "Marketing", description: "Marketing and advertising" },
  { id: "content", label: "Content", description: "Content creation and management" },
  { id: "design", label: "Design", description: "Visual design and branding" },
  { id: "development", label: "Development", description: "Web development and apps" },
  { id: "research", label: "Research", description: "Research and analysis" },
  { id: "automation", label: "Automation", description: "Task automation and workflows" },
  { id: "general", label: "General", description: "General-purpose agents" },
] as const;

/* ------------------------------------------------------------------ */
/*  Available Tools (services agents can call)                         */
/* ------------------------------------------------------------------ */

export const AGENT_TOOLS = [
  { id: "website-builder", label: "Website Builder", description: "Generate complete websites" },
  { id: "landing-page-builder", label: "Landing Page Builder", description: "Build landing pages" },
  { id: "web-app-builder", label: "Web App Builder", description: "Generate web applications" },
  { id: "logo-designer", label: "Logo Designer", description: "Create professional logos" },
  { id: "brand-identity", label: "Brand Identity", description: "Build brand identity systems" },
  { id: "image-generator", label: "Image Generator", description: "Generate visual assets" },
  { id: "video-studio", label: "Video Studio", description: "Create video content" },
  { id: "content-studio", label: "Content Studio", description: "Write articles and copy" },
  { id: "business-suite", label: "Business Suite", description: "Business analysis and planning" },
  { id: "seo-analyzer", label: "SEO Analyzer", description: "SEO analysis and optimization" },
  { id: "market-research", label: "Market Research", description: "Market and competitor analysis" },
  { id: "social-media", label: "Social Media", description: "Social media content planning" },
] as const;

/* ------------------------------------------------------------------ */
/*  Workflow Triggers                                                  */
/* ------------------------------------------------------------------ */

export const WORKFLOW_TRIGGERS = [
  { id: "manual", label: "Manual", description: "Run on demand" },
  { id: "schedule", label: "Scheduled", description: "Run on a cron schedule" },
  { id: "webhook", label: "Webhook", description: "Triggered by an HTTP call" },
  { id: "event", label: "Event", description: "Triggered by a platform event" },
  { id: "api", label: "API", description: "Triggered via the REST API" },
] as const;

/* ------------------------------------------------------------------ */
/*  Workflow Step Types                                                */
/* ------------------------------------------------------------------ */

export const WORKFLOW_STEP_TYPES = [
  { id: "agent", label: "Agent", description: "Run an AI agent" },
  { id: "condition", label: "Condition", description: "Branch based on a condition" },
  { id: "delay", label: "Delay", description: "Wait for a duration" },
  { id: "transform", label: "Transform", description: "Map or transform data" },
  { id: "notification", label: "Notification", description: "Send a notification" },
  { id: "service", label: "Service", description: "Call a Trend Business AI service" },
] as const;

/* ------------------------------------------------------------------ */
/*  Predefined Agent Templates                                         */
/* ------------------------------------------------------------------ */

export const AGENT_TEMPLATES = [
  {
    id: "business-startup-template",
    name: "Business Startup Agent",
    type: "business-startup",
    category: "business",
    description: "Complete business launch: validates idea, writes business plan, creates brand identity, generates website",
    tools: ["business-suite", "brand-identity", "logo-designer", "website-builder", "content-studio"],
    systemPrompt: "You are a business startup specialist. Help users launch new businesses by systematically analyzing their idea, creating a business plan, developing brand identity, and building a web presence.",
  },
  {
    id: "marketing-template",
    name: "Marketing Campaign Agent",
    type: "marketing",
    category: "marketing",
    description: "Plans and creates full marketing campaigns with copy, visuals, and analytics",
    tools: ["content-studio", "image-generator", "social-media", "seo-analyzer"],
    systemPrompt: "You are a marketing strategist. Create comprehensive marketing campaigns including strategy, ad copy, visual assets, social media plans, and performance tracking frameworks.",
  },
  {
    id: "content-template",
    name: "Content Creation Agent",
    type: "content",
    category: "content",
    description: "Produces blog posts, articles, social content, and newsletters on any topic",
    tools: ["content-studio", "seo-analyzer", "image-generator"],
    systemPrompt: "You are a professional content creator. Write engaging, SEO-optimized content across formats including blogs, articles, social media posts, and newsletters.",
  },
  {
    id: "seo-template",
    name: "SEO Optimization Agent",
    type: "seo",
    category: "marketing",
    description: "Performs keyword research, audits pages, and generates optimization recommendations",
    tools: ["content-studio", "seo-analyzer", "market-research"],
    systemPrompt: "You are an SEO expert. Perform comprehensive keyword research, content audits, technical SEO analysis, and provide actionable optimization recommendations.",
  },
  {
    id: "website-template",
    name: "Website Generation Agent",
    type: "website",
    category: "development",
    description: "Generates complete websites with pages, components, and deployment-ready code",
    tools: ["website-builder", "landing-page-builder", "image-generator", "content-studio"],
    systemPrompt: "You are a web development specialist. Design and generate complete, modern websites with responsive layouts, optimized content, and production-ready code.",
  },
  {
    id: "video-template",
    name: "Video Production Agent",
    type: "video-production",
    category: "content",
    description: "Creates storyboards, scripts, shot lists, and production schedules for video projects",
    tools: ["video-studio", "content-studio", "image-generator"],
    systemPrompt: "You are a video production specialist. Create detailed storyboards, compelling scripts, professional shot lists, and production schedules for any video project.",
  },
  {
    id: "research-template",
    name: "Research & Analysis Agent",
    type: "research",
    category: "research",
    description: "Conducts market research, competitor analysis, and produces detailed reports",
    tools: ["business-suite", "market-research", "content-studio"],
    systemPrompt: "You are a research analyst. Conduct thorough market research, competitor analysis, industry trend analysis, and produce comprehensive, data-driven reports.",
  },
  {
    id: "brand-template",
    name: "Brand Identity Agent",
    type: "brand",
    category: "design",
    description: "Builds complete brand identities with logos, colors, typography, and guidelines",
    tools: ["brand-identity", "logo-designer", "image-generator", "content-studio"],
    systemPrompt: "You are a brand strategist. Develop complete brand identities including brand story, visual identity, logo concepts, color systems, typography, and brand guidelines.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Prompt Library Categories                                          */
/* ------------------------------------------------------------------ */

export const PROMPT_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "business", label: "Business" },
  { id: "marketing", label: "Marketing" },
  { id: "content", label: "Content" },
  { id: "design", label: "Design" },
  { id: "development", label: "Development" },
  { id: "seo", label: "SEO" },
  { id: "research", label: "Research" },
  { id: "automation", label: "Automation" },
] as const;

/* ------------------------------------------------------------------ */
/*  Cron Presets                                                       */
/* ------------------------------------------------------------------ */

export const CRON_PRESETS = [
  { id: "0 9 * * 1", label: "Weekly (Mon 9am)" },
  { id: "0 9 * * *", label: "Daily (9am)" },
  { id: "0 9 * * 1-5", label: "Weekdays (9am)" },
  { id: "0 */6 * * *", label: "Every 6 hours" },
  { id: "0 */12 * * *", label: "Every 12 hours" },
  { id: "0 9 1 * *", label: "Monthly (1st, 9am)" },
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getAgentType(id: string) {
  return AGENT_TYPES.find((t) => t.id === id);
}

export function getAgentTypeLabel(id: string): string {
  return AGENT_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function getToolLabel(id: string): string {
  return AGENT_TOOLS.find((t) => t.id === id)?.label ?? id;
}
